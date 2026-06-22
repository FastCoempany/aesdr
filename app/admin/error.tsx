"use client";

/**
 * Admin error boundary (R5-EE-3). Roughly a dozen admin server actions and
 * page queries can throw — without this, a failure full-page-crashes with raw
 * Postgres text. This catches it inside the admin chrome and offers a retry
 * (`reset`) plus a way back to the dashboard. Editorial palette (cream / ink /
 * crimson), per CLAUDE.md — no retired dark surface.
 */
import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the console for the operator; Sentry already wraps the app.
    console.error("[admin] route error:", error);
  }, [error]);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E8E4DF",
        borderLeft: "3px solid #8B1A1A",
        padding: "32px 36px",
        maxWidth: 620,
      }}
    >
      <p
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: ".3em",
          textTransform: "uppercase",
          color: "#8B1A1A",
          marginBottom: 8,
        }}
      >
        Something broke
      </p>
      <h1
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 32,
          fontWeight: 900,
          fontStyle: "italic",
          lineHeight: 1.1,
          color: "#1A1A1A",
          marginBottom: 16,
        }}
      >
        This panel couldn&rsquo;t load.
      </h1>
      <p
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 16,
          lineHeight: 1.6,
          color: "#6B6B6B",
          marginBottom: 24,
        }}
      >
        A query or action hit an error. Nothing was changed by the failed
        request. Try again, and if it keeps happening, check the logs.
      </p>

      {error?.digest && (
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            color: "#6B6B6B",
            marginBottom: 24,
          }}
        >
          Reference: {error.digest}
        </p>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            color: "#fff",
            background: "#8B1A1A",
            border: "none",
            padding: "12px 24px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <Link
          href="/admin"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            color: "#1A1A1A",
            background: "transparent",
            border: "1px solid #1A1A1A",
            padding: "11px 24px",
            textDecoration: "none",
          }}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
