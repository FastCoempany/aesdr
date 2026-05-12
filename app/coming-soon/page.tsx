"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const BYPASS_COOKIE = "aesdr_cs_bypass";
const BYPASS_CODE = "741407";

function hasBypass() {
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${BYPASS_COOKIE}=`));
}

function setBypass() {
  document.cookie = `${BYPASS_COOKIE}=1; path=/; SameSite=Lax`;
}

export default function ComingSoonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(true);

  const completeBypass = useCallback(() => {
    setBypass();
    setVisible(false);
    router.replace("/");
  }, [router]);

  // Mechanism 1: existing cookie skips the gate entirely.
  useEffect(() => {
    queueMicrotask(() => {
      if (hasBypass()) {
        setVisible(false);
        router.replace("/");
      }
    });
  }, [router]);

  // Mechanism 2: URL bypass — visit /coming-soon?bypass=741407 to set the
  // cookie without any clicking. Bookmarkable. Backwards-compatible with
  // mechanism 1. Wrapped in queueMicrotask to satisfy the no-setState-in-effect
  // lint rule and match mechanism 1's pattern.
  useEffect(() => {
    if (searchParams?.get("bypass") === BYPASS_CODE) {
      queueMicrotask(() => completeBypass());
    }
  }, [searchParams, completeBypass]);

  // Mechanism 3: keyboard shortcut. Anywhere on the page, type the 6-digit
  // code (741407) and the cookie sets. No mouse / no prompt needed.
  useEffect(() => {
    let buf = "";
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    function handleKey(e: KeyboardEvent) {
      // Only digits matter; ignore modifiers and special keys.
      if (e.key.length !== 1 || !/[0-9]/.test(e.key)) return;
      buf = (buf + e.key).slice(-BYPASS_CODE.length);

      // Reset the buffer if the user pauses for a second.
      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        buf = "";
      }, 1500);

      if (buf === BYPASS_CODE) {
        if (resetTimer) clearTimeout(resetTimer);
        completeBypass();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [completeBypass]);

  if (!visible) return null;

  function handleGhost() {
    const code = prompt("");
    if (code === BYPASS_CODE) {
      completeBypass();
    }
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

          {/* Mechanism 4 (the foolproof click target): the entire mascot is
              the bypass button. Tap ANYWHERE on the mascot, type 741407,
              done. No more "where exactly is the eye" guessing. */}
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
