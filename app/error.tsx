"use client";

/**
 * Default error boundary. Catches any uncaught error in a route segment.
 * Editorial palette + canon `recovery` pose (the "we get back up" pose,
 * deliberately not `fall` — error pages should signal recovery, not defeat).
 *
 * Surfaces error.message + error.digest so the founder (or anyone watching
 * Vercel logs) can correlate the page error to the underlying exception.
 */

import Link from "next/link";

import { Mascot } from "@/components/brand/Mascot";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      style={{
        background: "var(--cream)",
        color: "var(--ink)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      {/* Recovery pose — canon */}
      <div
        style={{
          position: "relative",
          width: "clamp(220px, 36vw, 360px)",
          marginBottom: 32,
          filter: "saturate(1.1)",
        }}
      >
        <Mascot
          pose="recovery"
          size={360}
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      <p
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--crimson)",
          marginBottom: 16,
        }}
      >
        Error · The turtle stopped
      </p>

      <h1
        style={{
          fontFamily: "var(--display)",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: "clamp(36px, 5vw, 56px)",
          lineHeight: 1.1,
          color: "var(--ink)",
          margin: "0 0 16px",
        }}
      >
        Something went wrong.
      </h1>

      <p
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 17,
          lineHeight: 1.7,
          color: "var(--muted)",
          marginBottom: 28,
          maxWidth: 520,
        }}
      >
        An unexpected error occurred while rendering this page. Try again, or
        reach <a href="mailto:hello@aesdr.com" style={{ color: "var(--crimson)", textDecoration: "underline" }}>hello@aesdr.com</a> if it persists.
      </p>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            display: "inline-block",
            fontFamily: "var(--cond)",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#fff",
            background: "var(--crimson)",
            border: 0,
            padding: "14px 26px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            display: "inline-block",
            fontFamily: "var(--cond)",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink)",
            background: "transparent",
            border: "1px solid var(--ink)",
            padding: "13px 26px",
            textDecoration: "none",
          }}
        >
          Back to home
        </Link>
      </div>

      {/* Diagnostic — collapsible, only useful info that doesn't leak secrets */}
      {(error.message || error.digest) && (
        <details
          style={{
            maxWidth: 640,
            width: "100%",
            textAlign: "left",
            background: "rgba(139, 26, 26, 0.04)",
            border: "1px solid var(--light)",
            padding: "14px 18px",
          }}
        >
          <summary
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
              cursor: "pointer",
              listStyle: "none",
            }}
          >
            Diagnostic
          </summary>
          {error.message && (
            <pre
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--ink)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: "12px 0 8px",
                lineHeight: 1.5,
              }}
            >
              {error.message}
            </pre>
          )}
          {error.digest && (
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: "var(--muted)",
                margin: 0,
                letterSpacing: "0.06em",
              }}
            >
              digest: {error.digest}
            </p>
          )}
        </details>
      )}
    </main>
  );
}
