"use client";

import { useEffect, useCallback } from "react";

/**
 * Coming-soon interactive overlay — the keyboard + click bypass mechanisms.
 *
 * Lives in a separate client component so the parent page can stay server-
 * rendered. If this component fails to hydrate (CSP block, network blip,
 * extension interference, anything), the page's mascot + wordmark are
 * still on the screen — the user just can't bypass via keyboard or click
 * (they'd fall back to URL-param `?bypass=<code>`, which is handled at
 * the edge by proxy.ts and doesn't need JS at all).
 *
 * Renders only an invisible click overlay positioned absolutely over the
 * parent's mascot. No visible UI of its own.
 */

const KEYBOARD_BUFFER_LIMIT = 8;

async function submitBypass(code: string): Promise<boolean> {
  try {
    const res = await fetch("/api/coming-soon-bypass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function ComingSoonInteractive() {
  const completeBypass = useCallback(async (code: string) => {
    const ok = await submitBypass(code);
    if (ok) {
      window.location.href = "/";
    }
    // Silent failure on bad code — keeps the gate opaque.
  }, []);

  // Keyboard buffer with debounced submit. POSTing on every digit would burn
  // the 10/hr rate limit on prefix attempts; one typing burst → one POST.
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
