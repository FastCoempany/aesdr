"use client";

/**
 * The bottom-of-landing timer. A semi-transparent iris-shimmer bar fixed to the
 * bottom of the viewport (does NOT obstruct the page) that counts down, then
 * *directs* the prospect to the kit. A "Stop timer" control lets them keep
 * reading the landing — stopping is itself a strong engagement signal, which
 * the flow tracks.
 */
import { useEffect, useRef, useState } from "react";

export default function IrisTimer({
  seconds = 30,
  onComplete,
  onStop,
}: {
  seconds?: number;
  onComplete: () => void;
  onStop?: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const [stopped, setStopped] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    if (stopped) return;
    if (remaining <= 0) {
      if (!doneRef.current) {
        doneRef.current = true;
        onComplete();
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, stopped, onComplete]);

  if (stopped) return null;

  const pct = Math.max(0, Math.min(100, (remaining / seconds) * 100));

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 60,
        background: "rgba(250,247,242,0.92)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid var(--light, #E8E4DF)",
        boxShadow: "0 -8px 30px rgba(26,26,26,0.08)",
      }}
    >
      {/* iris shimmer progress line */}
      <div
        style={{
          height: 3,
          width: `${pct}%`,
          background:
            "var(--iris, linear-gradient(90deg,#8B1A1A,#b45,#8B5CF6))",
          transition: "width 1s linear",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: "14px 20px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 15,
            color: "var(--ink, #1A1A1A)",
          }}
        >
          Taking you to the AESDR affiliate kit in{" "}
          <strong style={{ fontVariantNumeric: "tabular-nums" }}>
            {remaining}s
          </strong>
          .
        </span>
        <button
          type="button"
          onClick={() => {
            setStopped(true);
            onStop?.();
          }}
          style={{
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".14em",
            fontSize: 12,
            color: "var(--crimson, #8B1A1A)",
            background: "transparent",
            border: "1px solid var(--crimson, #8B1A1A)",
            borderRadius: 2,
            padding: "8px 18px",
            cursor: "pointer",
          }}
        >
          Stop timer — I&rsquo;m still reading
        </button>
      </div>
    </div>
  );
}
