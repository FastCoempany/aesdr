"use client";

/**
 * Floating bottom-right countdown card. Leponeus + a circular iris-shimmer
 * progress ring + the seconds-remaining number + a "stop timer" control.
 * Eye-catching but stays out of the content column.
 */
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const RING_SIZE = 96;
const STROKE = 6;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

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

  // 1.0 = full ring, 0.0 = empty
  const progress = Math.max(0, Math.min(1, remaining / seconds));
  const dashOffset = CIRC * (1 - progress);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Heading to the AESDR affiliate kit in ${remaining} seconds`}
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 60,
        background: "var(--cream, #FAF7F2)",
        color: "var(--ink, #1A1A1A)",
        border: "1px solid var(--ink, #1A1A1A)",
        borderRadius: 6,
        boxShadow: "0 18px 40px rgba(26,26,26,0.22), 0 0 0 4px rgba(139,26,26,0.06)",
        padding: "14px 16px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        width: 220,
        animation: "kit-timer-pop 360ms ease-out",
      }}
    >
      <style>{`
        @keyframes kit-timer-pop {
          0%   { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        @keyframes kit-timer-pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
        .kit-timer-ring-wrap { animation: kit-timer-pulse 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .kit-timer-ring-wrap { animation: none; }
        }
      `}</style>

      <p
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".18em",
          fontSize: 11,
          color: "var(--crimson, #8B1A1A)",
          margin: 0,
        }}
      >
        Heading to the kit
      </p>

      <div
        className="kit-timer-ring-wrap"
        style={{
          position: "relative",
          width: RING_SIZE,
          height: RING_SIZE,
        }}
      >
        {/* Leponeus inside the ring */}
        <div
          style={{
            position: "absolute",
            inset: STROKE + 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: "50%",
          }}
        >
          <Image
            src="/mascot/leponeus-sprint.png"
            alt=""
            width={RING_SIZE - (STROKE + 4) * 2}
            height={RING_SIZE - (STROKE + 4) * 2}
            aria-hidden
          />
        </div>

        {/* Iris-gradient progress ring */}
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          style={{ display: "block", transform: "rotate(-90deg)" }}
          aria-hidden
        >
          <defs>
            <linearGradient id="kit-timer-iris" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8B1A1A" />
              <stop offset="60%" stopColor="#b4455d" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--light, #E8E4DF)"
            strokeWidth={STROKE}
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="url(#kit-timer-iris)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>

        {/* Number, bottom-right inset */}
        <div
          style={{
            position: "absolute",
            right: -4,
            bottom: -4,
            background: "var(--ink, #1A1A1A)",
            color: "#FAF7F2",
            fontFamily: "var(--mono, 'Space Mono', monospace)",
            fontSize: 13,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 10,
            minWidth: 32,
            textAlign: "center",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {remaining}s
        </div>
      </div>

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
          fontSize: 11,
          color: "var(--ink, #1A1A1A)",
          background: "transparent",
          border: "1px solid var(--ink, #1A1A1A)",
          borderRadius: 2,
          padding: "6px 12px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Stop — still reading
      </button>
    </div>
  );
}
