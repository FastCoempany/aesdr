"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Paths that are ALLOWED on mobile (revenue + auth + legal).
 * Anything not matching these is GATED on mobile.
 *
 * Match rule: exact equality OR `path.startsWith(allowed + "/")`.
 * Example: `/account/change-password` matches `/account/change-password`.
 * `/account` does NOT match — it gets gated.
 */
const ALLOWED_EXACT = new Set<string>([
  "/",
  "/mobile",
  "/login",
  "/signup",
  "/success",
  "/terms",
  "/privacy",
  "/refund-policy",
  "/contact",
  "/about",
  "/account/change-password",
  "/account/reset-password",
]);

const ALLOWED_PREFIXES = [
  "/api/",
  "/auth/",
  "/account/change-password/",
  "/account/reset-password/",
  "/purchase",
];

function isAllowedOnMobile(pathname: string | null): boolean {
  if (!pathname) return true;
  if (ALLOWED_EXACT.has(pathname)) return true;
  for (const prefix of ALLOWED_PREFIXES) {
    if (pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}

/**
 * MobileGate — hard gate that blocks coursework on mobile/small screens.
 *
 * AE/SDR course lessons, interactive tools, dashboard, and artifacts are
 * designed for desktop. On viewports <= 767px AND on a gated route we render
 * a fullscreen interstitial OVER the page content and do NOT render children
 * at all (hard gate, no "proceed anyway").
 *
 * Mobile users can still hit the landing page, pricing/checkout, login, and
 * legal pages so we don't block revenue or auth flows.
 *
 * The gate is client-side (viewport-dependent) and uses mount-time detection
 * via `window.matchMedia`. Until mount we render children to avoid SSR flash
 * mismatches; after mount the gate flips in if the viewport is small AND the
 * current path is in the gated set.
 */
export default function MobileGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mql.matches);
    // Defer initial state transitions so React doesn't flag them as cascading.
    queueMicrotask(() => {
      setMounted(true);
      update();
    });
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const gated = !isAllowedOnMobile(pathname);

  // Before mount: render children (SSR fallback). matchMedia only works on the client.
  if (!mounted || !isMobile || !gated) {
    return <>{children}</>;
  }

  // Conditional rendering — children are NOT in the tree on mobile.
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-gate-headline"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        background: "var(--cream, #FAF7F2)",
        color: "var(--ink, #1A1A1A)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        overflow: "auto",
      }}
    >
      <style>{`
        @keyframes mgFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          textAlign: "center",
          animation: "mgFade 500ms ease-out forwards",
        }}
      >
        <p
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(13px, 3vw, 16px)",
            fontWeight: 600,
            fontStyle: "italic",
            letterSpacing: ".05em",
            marginBottom: "20px",
            background: "var(--iris)",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "iris 4s linear infinite",
          }}
        >
          Desktop Required
        </p>

        <h1
          id="mobile-gate-headline"
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(32px, 8vw, 44px)",
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            marginBottom: "20px",
            color: "var(--ink, #1A1A1A)",
          }}
        >
          This course is built for desktop.
        </h1>

        <p
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(15px, 3.5vw, 17px)",
            lineHeight: 1.6,
            color: "var(--ink, #1A1A1A)",
            marginBottom: "36px",
            opacity: 0.75,
          }}
        >
          The lessons, tools, and artifacts need the real estate. Open{" "}
          <span style={{ fontWeight: 700, opacity: 1 }}>AESDR.com</span> on your
          laptop to continue.
        </p>

        <Link
          href="/mobile"
          style={{
            display: "inline-block",
            padding: "14px 32px",
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontSize: "14px",
            fontStyle: "italic",
            letterSpacing: ".02em",
            color: "var(--cream, #FAF7F2)",
            background: "var(--ink, #1A1A1A)",
            textDecoration: "none",
            border: "none",
            borderRadius: "999px",
            transition: "opacity .2s",
          }}
        >
          Return to homepage
        </Link>
      </div>
    </div>
  );
}
