"use client";

import { useEffect, useCallback } from "react";
import { submitBypassAction } from "./actions";

/**
 * Coming-soon interactive overlay — keyboard + click bypass mechanisms.
 *
 * Lives separately from the page so the parent can stay server-rendered.
 * If this component fails to hydrate (CSP, network, extension, anything),
 * the page's mascot + wordmark are still on screen — the user just can't
 * bypass via keyboard or click, and falls back to the URL `?bypass=<code>`
 * mechanism handled at the edge by proxy.ts (zero JS required).
 *
 * Submits to the `submitBypassAction` server action — NOT a fetch to the
 * API route. The action sets the cookie and redirects in a single server
 * response, eliminating the cookie/navigation race that the fetch-based
 * approach was vulnerable to.
 */

const KEYBOARD_BUFFER_LIMIT = 8;

export default function ComingSoonInteractive() {
  const completeBypass = useCallback(async (code: string) => {
    // Server action: on success, the action's `redirect("/")` causes the
    // Next.js runtime to navigate the browser automatically. On failure
    // (bad code, rate-limited, env var unset), the action returns void
    // and we stay on /coming-soon — no manual navigation needed either way.
    await submitBypassAction(code);
  }, []);

  // Keyboard buffer with debounced submit. Submitting on every digit would
  // burn the 10/hr rate limit on prefix attempts — one mistype could lock
  // the user out for an hour. One typing burst → one submission.
  useEffect(() => {
    let buf = "";
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    let submitTimer: ReturnType<typeof setTimeout> | null = null;

    function handleKey(e: KeyboardEvent) {
      if (e.key.length !== 1 || !/[0-9]/.test(e.key)) return;
      buf = (buf + e.key).slice(-KEYBOARD_BUFFER_LIMIT);

      if (resetTimer) clearTimeout(resetTimer);
      if (submitTimer) clearTimeout(submitTimer);

      resetTimer = setTimeout(() => {
        buf = "";
      }, 1500);

      submitTimer = setTimeout(() => {
        if (buf.length >= 4) {
          const attempt = buf;
          buf = "";
          completeBypass(attempt);
        }
      }, 700);
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (resetTimer) clearTimeout(resetTimer);
      if (submitTimer) clearTimeout(submitTimer);
    };
  }, [completeBypass]);

  function handleGhost() {
    const code = prompt("");
    if (code) completeBypass(code);
  }

  return (
    <button
      onClick={handleGhost}
      aria-hidden="true"
      tabIndex={-1}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "transparent",
        border: "none",
        cursor: "default",
        zIndex: 10,
        outline: "none",
        padding: 0,
      }}
    />
  );
}
