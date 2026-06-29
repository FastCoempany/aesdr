"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

/**
 * AUDIT (final pass, HIGH): the artifact pages render a static "not yet
 * staged" empty state when getCachedArtifact returns null and NOTHING ever
 * calls the GET /api/artifacts?type= backfill — so if end-of-course generation
 * failed (it is best-effort and swallows errors), a finished buyer is stranded
 * on the empty state forever with no retry.
 *
 * This island replaces that dead empty state: on mount it hits the backfill
 * endpoint (which generates-on-empty, rate-limited 3/hr), and on success calls
 * router.refresh() so the server component re-reads the now-populated cache and
 * renders the real artifact. On failure it shows an in-voice retry.
 */
type Props = {
  type: "playbill" | "redline" | "diagnostic";
  /** Display noun, e.g. "Playbill" / "Redline". */
  noun: string;
  eyebrow: string;
  title: string;
  accent: string;
  /** Server-rendered mascot, passed through so this client island keeps it. */
  mascot: ReactNode;
};

export default function ArtifactBackfill({
  type,
  noun,
  eyebrow,
  title,
  accent,
  mascot,
}: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<"working" | "failed">("working");
  const started = useRef(false);

  async function attempt() {
    setPhase("working");
    try {
      const res = await fetch(`/api/artifacts?type=${type}`, { cache: "no-store" });
      if (res.ok) {
        // Cache is populated now — re-run the server component to render it.
        router.refresh();
        return;
      }
    } catch {
      /* network error → fall through to the retry state */
    }
    setPhase("failed");
  }

  useEffect(() => {
    if (started.current) return; // one auto-attempt per mount
    started.current = true;
    void attempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const working = phase === "working";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FAF7F2",
        color: "#1A1A1A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 5%",
        fontFamily: "'Source Serif 4', Georgia, serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "520px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          {mascot}
        </div>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "10px",
            letterSpacing: ".3em",
            textTransform: "uppercase",
            color: accent,
            marginBottom: "16px",
          }}
        >
          {working ? "Composing" : eyebrow}
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}
        >
          {working ? `Composing your ${noun}…` : title}
        </h1>
        <p
          style={{
            fontSize: "16px",
            fontStyle: "italic",
            color: "#6B6B6B",
            lineHeight: 1.6,
            marginBottom: "28px",
          }}
        >
          {working
            ? `We're staging your ${noun} from everything you did across the twelve lessons. This can take up to a minute — the page turns on its own.`
            : `That took longer than expected. Your ${noun} is still being prepared — give it a moment, then try again.`}
        </p>
        {!working && (
          <button
            type="button"
            onClick={() => void attempt()}
            style={{
              display: "inline-block",
              padding: "14px 32px",
              background: accent,
              color: "#FAF7F2",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              marginRight: 14,
            }}
          >
            Try again
          </button>
        )}
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            padding: "14px 32px",
            background: working ? "#1A1A1A" : "transparent",
            color: working ? "#FAF7F2" : "#6B6B6B",
            textDecoration: working ? "none" : "underline",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "13px",
            fontWeight: 800,
            letterSpacing: ".22em",
            textTransform: "uppercase",
          }}
        >
          Back to the dashboard
        </Link>
      </div>
    </main>
  );
}
