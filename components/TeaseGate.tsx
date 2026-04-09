"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const COOKIE_NAME = "aesdr_gate";
const CODE = process.env.NEXT_PUBLIC_BYPASS_CODE ?? null;

function hasCookie() {
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
}

function hasBypassCookie() {
  return document.cookie.split(";").some((c) => c.trim().startsWith("aesdr_bypass="));
}

function hasAuthSession() {
  // Supabase auth cookies start with sb- and contain auth-token
  return document.cookie.split(";").some((c) => c.trim().match(/^sb-.*-auth-token/));
}

function setCookie() {
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=31536000; SameSite=Lax`;
}

export default function TeaseGate({ children }: { children: React.ReactNode }) {
  const [gated, setGated] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (hasCookie() || hasBypassCookie() || hasAuthSession()) {
      setGated(false);
    }
    setLoaded(true);
  }, []);

  function handleGhost() {
    const code = prompt("");
    if (CODE && code === CODE) {
      setCookie();
      setGated(false);
    }
  }

  // Always render children so they exist in server HTML.
  // Gate overlay sits on top and hides content until unlocked.
  return (
    <>
      {/* Page content — always rendered (SSR-safe) */}
      <div style={loaded && !gated ? undefined : { visibility: "hidden", position: "fixed", inset: 0 }}>
        {children}
      </div>

      {/* Gate overlay — shown until cookie or code entry */}
      {(!loaded || gated) && (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(0.4rem, 1.6vw, 1.15rem)",
        background:
          "radial-gradient(circle at 50% 12%, rgba(255,255,255,0.06), transparent 20%), " +
          "radial-gradient(circle at 16% 18%, rgba(255,0,110,0.16), transparent 24%), " +
          "radial-gradient(circle at 84% 20%, rgba(56,189,248,0.12), transparent 20%), " +
          "radial-gradient(circle at 50% 72%, rgba(245,158,11,0.08), transparent 28%), " +
          "linear-gradient(180deg, #040714 0%, #09101d 42%, #040610 100%)",
        overflow: "hidden",
      }}
    >
      {/* Atmosphere */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.06), transparent 18%), " +
            "radial-gradient(circle at 50% 84%, rgba(16,185,129,0.14), transparent 20%)",
          filter: "blur(32px)",
          pointerEvents: "none",
        }}
      />

      {/* Spotlight */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "5%",
          left: "50%",
          width: "min(74vw, 54rem)",
          height: "min(72vh, 46rem)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0.03) 42%, transparent 78%), " +
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.22), transparent 60%)",
          clipPath: "polygon(34% 0, 66% 0, 88% 100%, 12% 100%)",
          filter: "blur(28px)",
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />

      {/* Ghost button — visible enough */}
      <button
        onClick={handleGhost}
        style={{
          position: "absolute",
          top: "1.4rem",
          right: "1.8rem",
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(255,255,255,0.06)",
          cursor: "pointer",
          padding: 0,
          zIndex: 10,
          animation: "ghostPulse 4s ease-in-out infinite",
        }}
      />

      {/* Brand */}
      <div
        style={{
          position: "absolute",
          top: "1.4rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: "linear-gradient(90deg, #FF006E 0%, #FF6B00 17%, #F59E0B 34%, #10B981 51%, #38BDF8 68%, #8B5CF6 85%, #FF006E 100%)",
            backgroundSize: "200% 100%",
            color: "transparent",
            fontFamily: "var(--cond)",
            fontSize: "0.92rem",
            fontWeight: 800,
            letterSpacing: "0.38em",
            textTransform: "uppercase" as const,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "iris 4.5s linear infinite",
          }}
        >
          AESDR
        </span>
      </div>

      {/* Bunny */}
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "min(72vw, 34rem)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        {/* Bunny aura */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "10% 12% 10%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 34%, rgba(255,255,255,0.16), transparent 26%), " +
              "radial-gradient(circle at 50% 64%, rgba(245,158,11,0.2), transparent 22%), " +
              "radial-gradient(circle at 36% 52%, rgba(255,0,110,0.12), transparent 28%), " +
              "radial-gradient(circle at 64% 48%, rgba(56,189,248,0.12), transparent 28%)",
            filter: "blur(26px)",
            transform: "scale(1.08)",
            pointerEvents: "none",
          }}
        />
        <Image
          alt="Ceramic humanoid bunny holding a mask"
          height={1024}
          priority
          src="/ceramic-bunny-mask-cutout.png"
          width={858}
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "auto",
            maxHeight: "72vh",
            objectFit: "contain",
            filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.48)) drop-shadow(0 6px 18px rgba(245,158,11,0.1))",
          }}
        />
      </div>

      {/* Slogan */}
      <h1
        style={{
          margin: 0,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <span
          data-text="AEs & SDRs rule this world"
          style={{
            position: "relative",
            display: "inline-block",
            maxWidth: "13ch",
            background: "linear-gradient(90deg, #FF006E 0%, #FF6B00 17%, #F59E0B 34%, #10B981 51%, #38BDF8 68%, #8B5CF6 85%, #FF006E 100%)",
            backgroundSize: "200% 100%",
            color: "transparent",
            fontFamily: "var(--cond)",
            fontSize: "clamp(2.1rem, 5.2vw, 5rem)",
            fontWeight: 800,
            letterSpacing: "0.05em",
            lineHeight: 0.95,
            textTransform: "uppercase" as const,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "iris 5s linear infinite",
            filter: "drop-shadow(0 0 18px rgba(255,255,255,0.08))",
          }}
        >
          AEs &amp; SDRs rule this world
        </span>
      </h1>
    </div>
      )}
    </>
  );
}
