"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { markLessonComplete, saveLessonProgress } from "@/app/actions/progress";
import { saveProgressLocally } from "@/utils/progress/local-storage";

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
 */
export default function ProgressSaver({
  lessonId,
  isAuthenticated,
  savedStateData,
}: ProgressSaverProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failCountRef = useRef(0);
  const [sessionExpired, setSessionExpired] = useState(false);
  const restoredRef = useRef(false);

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
          saveLessonProgress(lessonId, screen, stateData).catch(() => {
            failCountRef.current += 1;
            // After 3 consecutive server failures, assume session expired
            if (failCountRef.current >= 3) {
              setSessionExpired(true);
            }
          });
        }
      }, 1500);
    },
    [lessonId, isAuthenticated]
  );

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only accept messages from our own origin (iframe security)
      if (event.origin !== window.location.origin) return;

      const { type } = event.data ?? {};

      if (type === "aesdr:progress") {
        const { screen, stateData } = event.data as {
          screen: number;
          stateData: Record<string, unknown>;
        };
        failCountRef.current = 0;
        save(screen, stateData ?? {});
      }

      if (type === "aesdr:complete") {
        if (isAuthenticated) {
          markLessonComplete(lessonId).catch(() => {});
          saveProgressLocally(lessonId, { is_completed: true });
        }
      }

      if (type === "aesdr:navigate") {
        const href = event.data?.href;
        if (typeof href === "string" && href.startsWith("/")) {
          window.location.href = href;
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (debounceRef.current) clearTimeout(debounceRef.current);
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
    }, 1500);
    return () => clearTimeout(timer);
  }, [savedStateData]);

  if (sessionExpired) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10000,
          background: "rgba(0,0,0,0.9)",
          border: "1px solid var(--theme)",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          maxWidth: "420px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: ".06em",
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          Session expired. Your progress is saved locally.
        </p>
        <a
          href="/login"
          style={{
            fontFamily: "var(--cond)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--theme)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Re-login
        </a>
      </div>
    );
  }

  return null;
}
