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
 *
 * The generation is one opaque ~minute-long fetch — the backend streams no
 * progress — so the working state shows an eased "prep meter" that decelerates
 * toward a 94% ceiling and only snaps to 100% once the artifact actually
 * exists. It is a reassurance curve to keep the finisher on the page (not a
 * leave-and-get-notified flow, by design), never a claim of real percent-done.
 */
type ArtifactType = "playbill" | "redline" | "diagnostic";

type Props = {
  type: ArtifactType;
  /** Display noun, e.g. "Playbill" / "Redline". */
  noun: string;
  eyebrow: string;
  title: string;
  accent: string;
  /** Server-rendered mascot, passed through so this client island keeps it. */
  mascot: ReactNode;
};

/**
 * In-voice staged status lines under the meter — cosmetic, tied to the eased
 * percent so the wait reads as real work in the artifact's own register
 * (editorial for Redline, theatrical for Playbill).
 */
const STAGE_LINES: Record<ArtifactType, string[]> = {
  redline: [
    "Gathering your twelve chapters…",
    "Reading your gate responses…",
    "Cross-checking your claims against your scores…",
    "Marking the redlines in the margins…",
    "Setting the type…",
    "Binding the manuscript…",
  ],
  playbill: [
    "Assembling the programme…",
    "Seating the critics…",
    "Pulling the box-office numbers…",
    "Printing the opening-night notices…",
    "Calling places…",
    "Raising the curtain…",
  ],
  diagnostic: [
    "Gathering every exercise you took…",
    "Tallying each category…",
    "Scoring it the honest way…",
    "Finding your strongest and weakest lines…",
    "Squaring the numbers…",
    "Writing your read…",
  ],
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
  const [pct, setPct] = useState(4);
  const started = useRef(false);

  async function attempt() {
    setPhase("working");
    setPct((p) => (p > 8 ? p : 8)); // resume, don't visually reset, on retry
    try {
      const res = await fetch(`/api/artifacts?type=${type}`, { cache: "no-store" });
      if (res.ok) {
        // The artifact exists now — fill the bar, then re-run the server
        // component to render it (short beat so 100% is actually seen).
        setPct(100);
        setTimeout(() => router.refresh(), 650);
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

  // Eased approach to a 94% ceiling while the opaque fetch is in flight.
  // Functional updater + fixed dep so the interval is created once per
  // working session, not re-armed on every tick. attempt() overrides to 100
  // on success; a completed bar just holds there until router.refresh() swaps
  // in the real view.
  useEffect(() => {
    if (!working) return;
    const id = setInterval(() => {
      setPct((p) => {
        if (p >= 94) return p;
        const step = Math.max(0.35, (94 - p) * 0.04);
        return Math.min(94, p + step);
      });
    }, 360);
    return () => clearInterval(id);
  }, [working]);

  const lines = STAGE_LINES[type];
  const stageIdx = Math.min(lines.length - 1, Math.floor((pct / 100) * lines.length));
  const stageLine = pct >= 100 ? `Your ${noun} is ready.` : lines[stageIdx];
  const shownPct = Math.round(pct);

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
      <div style={{ textAlign: "center", maxWidth: "520px", width: "100%" }}>
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
            ? `We're staging your ${noun} from everything you did across the twelve lessons. This can take up to a minute — the page turns on its own, so you can stay right here.`
            : `That took longer than expected. Your ${noun} is still being prepared — give it a moment, then try again.`}
        </p>

        {working && (
          <div style={{ margin: "0 auto 30px", maxWidth: 400 }}>
            <div
              role="progressbar"
              aria-valuenow={shownPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Composing your ${noun}`}
              style={{
                position: "relative",
                height: 8,
                background: "rgba(26,26,26,0.10)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: `${shownPct}%`,
                  background: accent,
                  borderRadius: 999,
                  transition: "width .36s linear",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
                marginTop: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: 14,
                  color: "#6B6B6B",
                  textAlign: "left",
                }}
              >
                {stageLine}
              </span>
              <span
                aria-live="polite"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  color: accent,
                  flexShrink: 0,
                }}
              >
                {shownPct}%
              </span>
            </div>
          </div>
        )}

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
