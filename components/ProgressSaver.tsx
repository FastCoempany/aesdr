"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { saveProgressLocally } from "@/utils/progress/local-storage";
import { TIMING } from "@/lib/config";

interface ProgressSaverProps {
  lessonId: string;
  isAuthenticated: boolean;
  /** Saved state_data from Supabase, sent to iframe for cross-device restoration */
  savedStateData?: Record<string, unknown>;
  /**
   * The unit currently rendered in the iframe. The lesson HTML is
   * unit-agnostic (it never sets state_data.unit), so the parent stamps it —
   * otherwise the merge_lesson_progress RPC defaults every unit's save to
   * `_units["1"]` and units 2 & 3 overwrite unit 1's slot (P0-7).
   */
  unitId?: string;
  /** Total units in this lesson. Used to decide unit-to-unit navigation. */
  unitCount?: number;
  /** The unitId to advance to when this unit's terminal CTA fires (P0-7). */
  nextUnitId?: string | null;
}

/**
 * Invisible component that listens for `aesdr:progress` custom events
 * dispatched by the lesson iframe via postMessage, then persists progress
 * to Supabase (if authenticated) and localStorage (always).
 *
 * Also handles:
 * - `aesdr:complete`  → marks lesson as completed in Supabase
 * - `aesdr:navigate`  → redirects parent to a given href (e.g. /dashboard)
 * - Sends `aesdr:restore` to iframe on load with saved state from Supabase
 *
 * Visible feedback: shows a small editorial "Saved" toast for ~1.6s after
 * each successful server save (auth users only — unauth users don't have
 * a server save to confirm). The toast addresses the audit finding
 * "if a buyer closes the tab mid-lesson, do they know they can come back?"
 * by giving the persistence a felt, visible moment.
 */
export default function ProgressSaver({
  lessonId,
  isAuthenticated,
  savedStateData,
  unitId,
  unitCount,
  nextUnitId,
}: ProgressSaverProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failCountRef = useRef(0);
  // True between an aesdr:complete and the final-screen progress flush (P0-7).
  const completePendingRef = useRef(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const restoredRef = useRef(false);

  const flashSaved = useCallback(() => {
    setShowSaved(true);
    if (savedHideRef.current) clearTimeout(savedHideRef.current);
    savedHideRef.current = setTimeout(() => setShowSaved(false), 1600);
  }, []);

  const save = useCallback(
    (screen: number, stateData: Record<string, unknown>) => {
      // Stamp the current unit + screen into the state so the
      // merge_lesson_progress RPC files it under the right _units[unitId]
      // slot (the iframe is unit-agnostic) and the completion endpoint has
      // per-unit screen evidence (P0-7 / decision #10).
      const stamped: Record<string, unknown> = {
        ...stateData,
        ...(unitId ? { unit: unitId } : {}),
        _screen: screen,
      };

      // Always save to localStorage immediately
      saveProgressLocally(lessonId, {
        last_screen: screen,
        state_data: stamped,
      });

      // Debounce the server save to avoid spamming on rapid navigation
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (isAuthenticated) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonId, lastScreen: screen, stateData: stamped }),
            signal: controller.signal,
          }).then((res) => {
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(String(res.status));
            failCountRef.current = 0;
            flashSaved();
          }).catch(() => {
            clearTimeout(timeoutId);
            failCountRef.current += 1;
            if (failCountRef.current >= TIMING.progress.maxServerFailures) {
              setSessionExpired(true);
            }
          });
        }
      }, TIMING.progress.debounceMs);
    },
    [lessonId, isAuthenticated, flashSaved, unitId]
  );

  useEffect(() => {
    // P0-7 / decision #10: the completion endpoint requires server-side
    // evidence that the unit's final screen was reached. The lesson engine
    // fires aesdr:complete *then* aesdr:progress (final screen) in the same
    // tick, and our normal save is debounced 1.5s — so a naive complete POST
    // can race ahead of the evidence. We flag the pending completion, then on
    // the immediately-following final-screen progress event we flush it to the
    // server synchronously *before* firing the completion POST.
    const fireComplete = () => {
      if (!isAuthenticated) return;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, unitId, unitCount }),
        signal: controller.signal,
      })
        .then(() => clearTimeout(timeoutId))
        .catch(() => clearTimeout(timeoutId));
      // Only the *whole-lesson* completion flips the local is_completed flag;
      // an intermediate unit completion does not.
      if (!nextUnitId) {
        saveProgressLocally(lessonId, { is_completed: true });
      }
    };

    const flushSave = (screen: number, stateData: Record<string, unknown>) => {
      const stamped: Record<string, unknown> = {
        ...stateData,
        ...(unitId ? { unit: unitId } : {}),
        _screen: screen,
      };
      saveProgressLocally(lessonId, { last_screen: screen, state_data: stamped });
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!isAuthenticated) return Promise.resolve();
      return fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, lastScreen: screen, stateData: stamped }),
      })
        .then(() => undefined)
        .catch(() => undefined);
    };

    function handleMessage(event: MessageEvent) {
      // Only accept messages from our own origin (iframe security)
      if (event.origin !== window.location.origin) return;

      const { type } = event.data ?? {};

      if (type === "aesdr:progress") {
        const raw = event.data;
        const screen = typeof raw?.screen === "number" ? raw.screen : null;
        const stateData =
          raw?.stateData && typeof raw.stateData === "object" && !Array.isArray(raw.stateData)
            ? (raw.stateData as Record<string, unknown>)
            : null;

        if (screen === null || !stateData) return;
        failCountRef.current = 0;

        // If a completion is pending, flush this (final-screen) progress to the
        // server first so the evidence is in place, then fire completion.
        if (completePendingRef.current) {
          completePendingRef.current = false;
          flushSave(screen, stateData).then(fireComplete);
        } else {
          save(screen, stateData);
        }
      }

      if (type === "aesdr:complete") {
        // Defer the actual POST to the accompanying final-screen progress
        // event (see above). If no progress event follows within a short
        // window (e.g. the learner resumed directly onto the completion
        // screen, where init() re-fires complete without a fresh save), fire
        // it anyway — the server falls back to the row's last_screen.
        completePendingRef.current = true;
        setTimeout(() => {
          if (completePendingRef.current) {
            completePendingRef.current = false;
            fireComplete();
          }
        }, 800);
      }

      if (type === "aesdr:navigate") {
        const href = event.data?.href;
        // R3-SEC-5: only same-origin absolute paths. `startsWith("/")` alone
        // lets "//evil.com" through (protocol-relative) — also reject "//".
        const isSafePath =
          typeof href === "string" &&
          href.startsWith("/") &&
          !href.startsWith("//");

        // P0-7: the lesson HTML's terminal CTA always targets /dashboard. If
        // there's a next unit in this lesson, advance to it instead so units 2
        // & 3 are actually reached. The final unit keeps the original target.
        if (isSafePath && href === "/dashboard" && nextUnitId) {
          setNavigating(true);
          setTimeout(() => {
            window.location.href = `/course/${lessonId}?unit=${nextUnitId}`;
          }, 300);
          return;
        }

        if (isSafePath) {
          setNavigating(true);
          setTimeout(() => { window.location.href = href as string; }, 300);
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedHideRef.current) clearTimeout(savedHideRef.current);
    };
  }, [save, lessonId, isAuthenticated, unitId, unitCount, nextUnitId]);

  // Send saved state to iframe for cross-device restoration
  useEffect(() => {
    if (restoredRef.current || !savedStateData) return;
    // Wait for iframe to load, then send state
    const timer = setTimeout(() => {
      const iframe = document.querySelector("iframe");
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: "aesdr:restore", stateData: savedStateData },
          window.location.origin
        );
        restoredRef.current = true;
      }
    }, TIMING.iframeRestoreDelayMs);
    return () => clearTimeout(timer);
  }, [savedStateData]);

  if (navigating) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          zIndex: 99999,
          animation: "fadeIn 300ms ease-out forwards",
        }}
      >
        <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
      </div>
    );
  }

  if (sessionExpired) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10000,
          background: "#fff",
          border: "1px solid var(--ink)",
          borderLeft: "3px solid var(--crimson)",
          padding: "14px 22px",
          display: "flex",
          alignItems: "center",
          gap: "18px",
          maxWidth: "440px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: "13px",
            color: "var(--ink)",
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          Your login timed out, but this device kept your spot. Log back in to pick up where you stopped.
        </p>
        <a
          href="/login"
          style={{
            fontFamily: "var(--cond)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            color: "var(--crimson)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Re-login →
        </a>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9980,
        pointerEvents: "none",
        opacity: showSaved ? 1 : 0,
        transform: showSaved ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 180ms ease-out, transform 180ms ease-out",
      }}
    >
      <div
        style={{
          background: "var(--cream)",
          border: "1px solid var(--ink)",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--crimson)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--cond)",
            fontSize: 11,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "var(--ink)",
          }}
        >
          Saved
        </span>
      </div>
    </div>
  );
}
