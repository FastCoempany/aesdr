"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// R4-LEG-2: a cookie-consent banner. Analytics (PostHog) stay off until the
// visitor accepts — see hasAnalyticsConsent() in lib/analytics.ts. Shown to
// everyone (opt-in is the GDPR default and also covers US/CCPA). The choice is
// stored in localStorage so it persists and the banner doesn't nag.
const CONSENT_KEY = "aesdr_analytics_consent";

export default function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let decided = true;
    try {
      const v = window.localStorage.getItem(CONSENT_KEY);
      decided = v === "granted" || v === "denied";
    } catch {
      // localStorage blocked (private mode) — don't show, don't crash.
      return;
    }
    if (decided) return;
    // Defer out of the synchronous effect body (avoids a cascading re-render).
    const id = window.requestAnimationFrame(() => setShow(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  function decide(value: "granted" | "denied") {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* ignore */
    }
    setShow(false);
    // On accept, the next tracked event / route change starts analytics
    // (lib/analytics re-checks consent on every call). On decline, nothing loads.
    if (value === "granted") {
      // Tell the non-self-gating trackers (Vercel Analytics + Reddit Pixel via
      // ConsentedTrackers) to mount now, without waiting for a reload.
      window.dispatchEvent(new Event("aesdr:consent-granted"));
    }
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 90,
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 16,
        padding: "16px 20px",
        background: "var(--cream, #FAF7F2)",
        color: "var(--ink, #1A1A1A)",
        border: "1px solid var(--light, #E8E4DF)",
        borderLeft: "3px solid var(--crimson, #8B1A1A)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      }}
    >
      <p
        style={{
          margin: 0,
          flex: "1 1 320px",
          fontFamily: "var(--serif, Georgia, serif)",
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        We use cookies for analytics to understand how AESDR is used and make it
        better. You decide.{" "}
        <Link href="/privacy" style={{ color: "var(--crimson, #8B1A1A)", textDecoration: "underline" }}>
          Privacy Policy
        </Link>
        .
      </p>
      <div style={{ display: "flex", gap: 10, flex: "0 0 auto" }}>
        <button
          type="button"
          onClick={() => decide("denied")}
          style={{
            fontFamily: "var(--cond, sans-serif)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            padding: "10px 18px",
            background: "transparent",
            color: "var(--ink, #1A1A1A)",
            border: "1px solid var(--light, #E8E4DF)",
            cursor: "pointer",
          }}
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => decide("granted")}
          style={{
            fontFamily: "var(--cond, sans-serif)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            padding: "10px 18px",
            background: "var(--crimson, #8B1A1A)",
            color: "#fff",
            border: "1px solid var(--crimson, #8B1A1A)",
            cursor: "pointer",
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
