"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { saveProgressLocally } from "@/utils/progress/local-storage";
import { TIMING } from "@/lib/config";

interface ProgressSaverProps {
  lessonId: string;
  isAuthenticated: boolean;
  /** Saved state_data from Supabase, sent to iframe for cross-device restoration */
  savedStateData?: Record<string, unknown>;
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
}: ProgressSaverProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failCountRef = useRef(0);
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
      // Always save to localStorage immediately
      saveProgressLocally(lessonId, {
        last_screen: screen,
        state_data: stateData,
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
            body: JSON.stringify({ lessonId, lastScreen: screen, stateData }),
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
    [lessonId, isAuthenticated, flashSaved]
  );

  useEffect(() => {
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
        save(screen, stateData);
      }

      if (type === "aesdr:complete") {
        if (isAuthenticated) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          fetch("/api/progress/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonId }),
            signal: controller.signal,
          })
            .then(() => clearTimeout(timeoutId))
            .catch(() => clearTimeout(timeoutId));
          saveProgressLocally(lessonId, { is_completed: true });
        }
      }

      if (type === "aesdr:navigate") {
        const href = event.data?.href;
        if (typeof href === "string" && href.startsWith("/")) {
          setNavigating(true);
          setTimeout(() => { window.location.href = href; }, 300);
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedHideRef.current) clearTimeout(savedHideRef.current);
    };
  }, [save, lessonId, isAuthenticated]);

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
