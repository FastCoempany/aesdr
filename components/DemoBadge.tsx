"use client";

import { useEffect, useState } from "react";

import { DEMO_COOKIE } from "@/lib/demo-mode";

/**
 * DemoBadge — small mono pill rendered bottom-left whenever the demo
 * cookie is set, so anyone reviewing a session knows the page state
 * isn't real. Hidden via `?hideBadge=1` for recording sessions where
 * the badge would otherwise appear on camera.
 *
 * Client-only — reads the cookie via document.cookie. The cookie is
 * intentionally set with httpOnly: false in proxy.ts so this can read it.
 */
export function DemoBadge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function read() {
      const hasCookie = document.cookie
        .split(";")
        .some((c) => c.trim().startsWith(`${DEMO_COOKIE}=1`));
      const hideBadge = new URLSearchParams(window.location.search).get("hideBadge") === "1";
      setShow(hasCookie && !hideBadge);
    }
    read();
    // Re-check on visibility change (covers tab focus after cookie set in another tab)
    const onVis = () => read();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: 12,
        left: 12,
        zIndex: 9999,
        fontFamily: "var(--mono, 'Space Mono', monospace)",
        fontSize: 9,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "rgba(139, 26, 26, 0.85)",
        background: "rgba(250, 247, 242, 0.92)",
        backdropFilter: "blur(4px)",
        padding: "6px 10px",
        border: "1px solid rgba(139, 26, 26, 0.32)",
        pointerEvents: "none",
      }}
    >
      Demo · synthetic state · not a real session
    </div>
  );
}
