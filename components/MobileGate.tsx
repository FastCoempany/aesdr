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
        background: "var(--bg-main, #020617)",
        color: "var(--text-main, #F8FAFC)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        overflow: "auto",
      }}
    >
      <style>{`
        @keyframes mgIris {
          from { background-position: 0% 50%; }
          to { background-position: 200% 50%; }
        }
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
            fontFamily: "var(--mono, 'Space Mono', monospace)",
            fontSize: "10px",
            letterSpacing: ".3em",
            textTransform: "uppercase",
            marginBottom: "24px",
            background:
              "var(--iris, linear-gradient(90deg, #FF006E 0%, #FF6B00 17%, #F59E0B 34%, #10B981 51%, #38BDF8 68%, #8B5CF6 85%, #FF006E 100%))",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "mgIris 3s linear infinite",
          }}
        >
          AESDR / Desktop Required
        </p>

        <h1
          id="mobile-gate-headline"
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(28px, 7vw, 36px)",
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 1.1,
            letterSpacing: ".01em",
            marginBottom: "20px",
            color: "var(--text-main, #F8FAFC)",
          }}
        >
          This course is built for desktop.
        </h1>

        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: "16px",
            lineHeight: 1.6,
            color: "var(--text-muted, #94A3B8)",
            marginBottom: "32px",
          }}
        >
          The lessons, tools, and artifacts need the real estate. Open{" "}
          <span
            style={{
              fontWeight: 600,
              color: "var(--text-main, #F8FAFC)",
            }}
          >
            AESDR.com
          </span>{" "}
          on your laptop to continue.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "14px 28px",
            fontFamily: "var(--mono, 'Space Mono', monospace)",
            fontSize: "11px",
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "var(--text-main, #F8FAFC)",
            textDecoration: "none",
            border: "1px solid var(--line, rgba(255,255,255,0.2))",
            borderRadius: "2px",
            transition: "border-color .2s, background .2s",
          }}
        >
          Return to homepage
        </Link>
      </div>
    </div>
  );
}
