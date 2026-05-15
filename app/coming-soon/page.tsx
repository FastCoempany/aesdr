"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * Coming-soon page.
 *
 * The bypass secret used to live as `const BYPASS_CODE = "741407"` in this
 * client component — visible to anyone who opened DevTools and grep'd the
 * JS bundle. That value now lives only in the server-side env var
 * `COMING_SOON_BYPASS_CODE` and is verified at:
 *
 *   POST /api/coming-soon-bypass   — for the keyboard + mascot-click flows
 *   proxy.ts                       — for `?bypass=<code>` URL hits
 *
 * This page no longer knows the code. It just collects user input (keyboard
 * buffer or prompt) and POSTs it to the API. Rate limiting (10/hr per IP)
 * lives in the API route. The cookie itself is now httpOnly — set by the
 * server response, no longer readable from `document.cookie`.
 *
 * Because the cookie is httpOnly, "do I already have bypass?" can't be
 * checked from client JS. proxy.ts handles that case: anyone with the
 * cookie already gets routed to `/` and never reaches this page when
 * COMING_SOON=true. Direct visits to /coming-soon while holding the
 * cookie still work (the page renders; user can ignore it or refresh).
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

export default function ComingSoonPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  const completeBypass = useCallback(
    async (code: string) => {
      const ok = await submitBypass(code);
      if (ok) {
        setVisible(false);
        router.replace("/");
      }
      // Silent failure on bad code — keeps the gate opaque to passersby.
    },
    [router],
  );

  // Mechanism 1: keyboard shortcut. Buffer digits, then submit once 700ms
  // after the user stops typing. Submitting on every keystroke would burn
  // through the API's per-IP rate limit (10/hr) on the prefix attempts
  // before the full code lands — a single mistype could lock the user out
  // for an hour. Debounce keeps us to one POST per typing burst.
  useEffect(() => {
    let buf = "";
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    let submitTimer: ReturnType<typeof setTimeout> | null = null;

    function handleKey(e: KeyboardEvent) {
      if (e.key.length !== 1 || !/[0-9]/.test(e.key)) return;
      buf = (buf + e.key).slice(-KEYBOARD_BUFFER_LIMIT);

      if (resetTimer) clearTimeout(resetTimer);
      if (submitTimer) clearTimeout(submitTimer);

      // Hard reset of the buffer if the user pauses much longer (1500ms) —
      // no stale prefixes lingering between attempts.
      resetTimer = setTimeout(() => {
        buf = "";
      }, 1500);

      // Submit once after a short typing pause. Captures the buffer at the
      // moment the timer fires, not the moment it was scheduled, so it
      // always sees the most-recent input.
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

  if (!visible) return null;

  function handleGhost() {
    const code = prompt("");
    if (code) completeBypass(code);
  }

  return (
    <main
      style={{
        background: "var(--cream, #FAF7F2)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Mascot + logo container */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Doctrine pose — canon. Kept as <img> (not <Mascot>) so the
            absolute-positioned bypass button below can stay anchored to
            the same DOM container with predictable positioning. */}
        <div
          style={{
            position: "relative",
            width: "clamp(300px, 55vw, 560px)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot/leponeus-doctrine.png"
            alt=""
            draggable={false}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              userSelect: "none",
            }}
          />

          {/* The entire mascot is the bypass button. Tap anywhere on it,
              enter the code in the prompt. The code is verified server-side. */}
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
        </div>

        {/* Iris shimmer AESDR logo — stacked on the mascot's foot */}
        <h1
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(72px, 16vw, 180px)",
            fontWeight: 900,
            fontStyle: "italic",
            background: "var(--iris)",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "iris 4s linear infinite",
            letterSpacing: "-0.02em",
            marginTop: "-100px",
            marginBottom: 0,
            lineHeight: 1,
            position: "relative",
            zIndex: 2,
            userSelect: "none",
            textAlign: "center",
          }}
        >
          AESDR
        </h1>

        {/* Tagline in iris shimmer */}
        <p
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(16px, 2.8vw, 28px)",
            fontWeight: 600,
            fontStyle: "italic",
            background: "var(--iris)",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "iris 4s linear infinite",
            letterSpacing: "0.02em",
            marginTop: 12,
            textAlign: "center",
            userSelect: "none",
          }}
        >
          AEs &amp; SDRs Rule This World
        </p>
      </div>
    </main>
  );
}
