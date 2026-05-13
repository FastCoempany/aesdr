"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * HorizonLayer — sunrise idea #1. Single frozen editorial moment.
 *
 * ONE strong horizontal line cuts the page near the end of the hero
 * region. Above: a soft amber-to-cream sky gradient with a single
 * sun-disc anchored upper-right, low. Below: cool cream "water"
 * holding the vertical reflection-line directly under the sun. A
 * march of silhouetted pilings crosses the horizon. Branch
 * silhouettes reach in from upper-left and upper-right corners.
 *
 * After scroll passes the horizon, the rest of the page reads as
 * cream + a quiet row of fence-post tick marks at each section
 * divider — the pilings continuing through the field. A few hare-ear
 * silhouettes peek up at section transitions, alert.
 *
 * Tone: one held breath at first light. 80% negative cream space.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.46,
  standard: 0.78,
  heavy: 1.0,
};

const FALLBACK_HEIGHT = 5200;

const HORIZON_Y = 720; // page-Y of the main horizon line (end of hero region)
const SUN_X = 1140;
const SUN_Y_REL = -120; // sun sits this far above the horizon

function seededJitter(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function HorizonLayer() {
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [pageH, setPageH] = useState(FALLBACK_HEIGHT);

  useEffect(() => {
    function measure() {
      queueMicrotask(() => setPageH(Math.max(document.documentElement.scrollHeight, FALLBACK_HEIGHT)));
    }
    measure();
    window.addEventListener("resize", measure);
    const t = setInterval(measure, 800);
    return () => {
      window.removeEventListener("resize", measure);
      clearInterval(t);
    };
  }, []);

  const op = OP[intensity];

  const layout = useMemo(() => {
    const rng = seededJitter(2417);

    // Pilings along the horizon — irregular spacing, irregular heights
    const horizonPilings: { x: number; h: number }[] = [];
    let x = 60;
    while (x < 1380) {
      horizonPilings.push({ x, h: 14 + rng() * 22 });
      x += 28 + rng() * 38;
    }

    // Fence-post tick rows below the main horizon — one row at each section divider
    const fenceRows = [0.20, 0.34, 0.48, 0.62, 0.76, 0.90].map((p) => pageH * p);

    // Hare ears peek above horizon at occasional spots
    const earsAtHorizon: { x: number; flip: boolean }[] = [
      { x: 380, flip: false },
      { x: 820, flip: true },
      { x: 1240, flip: false },
    ];

    // Hare ears peeking above section dividers further down
    const earsBelow: { x: number; y: number; flip: boolean }[] = fenceRows
      .slice(1, 5)
      .map((y, i) => ({ x: i % 2 === 0 ? 460 : 980, y, flip: i % 2 === 1 }));

    return { horizonPilings, fenceRows, earsAtHorizon, earsBelow };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Horizon" value={intensity} onChange={setIntensity} />

      {/* L1: sky gradient — only fills the band from top of page to HORIZON_Y */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: HORIZON_Y,
          pointerEvents: "none",
          zIndex: 3,
          opacity: op,
          mixBlendMode: "multiply",
          background: `linear-gradient(180deg,
            rgba(244,178,98,0.40) 0%,
            rgba(232,156,72,0.32) 28%,
            rgba(220,140,80,0.22) 60%,
            rgba(232,200,140,0.10) 88%,
            rgba(250,247,242,0) 100%
          )`,
          transition: "opacity 320ms",
        }}
      />

      {/* L2: faint reflection band below the horizon — subtle warm shimmer */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: HORIZON_Y,
          left: 0,
          width: "100%",
          height: 280,
          pointerEvents: "none",
          zIndex: 3,
          opacity: op * 0.5,
          mixBlendMode: "multiply",
          background: `linear-gradient(180deg,
            rgba(232,168,96,0.16) 0%,
            rgba(232,168,96,0.06) 50%,
            rgba(250,247,242,0) 100%
          )`,
          transition: "opacity 320ms",
        }}
      />

      {/* L3: SVG — sun disc, reflection streak, pilings, branches, hare ears */}
      <svg
        aria-hidden="true"
        viewBox={`0 0 1440 ${pageH}`}
        preserveAspectRatio="xMidYMin slice"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: pageH,
          pointerEvents: "none",
          zIndex: 5,
          opacity: op,
          transition: "opacity 320ms",
        }}
      >
        <defs>
          <radialGradient id="horizon-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FAF7F2" stopOpacity="0.98" />
            <stop offset="30%" stopColor="#F4C268" stopOpacity="0.92" />
            <stop offset="62%" stopColor="#D88040" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#D88040" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="horizon-reflection" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F4C268" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#D88040" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#D88040" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* The horizon line itself — a single confident ink stroke */}
        <line
          x1="0"
          y1={HORIZON_Y}
          x2="1440"
          y2={HORIZON_Y}
          stroke="#1A1A1A"
          strokeWidth="1.4"
          opacity="0.55"
        />

        {/* Sun-disc atmosphere glow */}
        <circle cx={SUN_X} cy={HORIZON_Y + SUN_Y_REL} r="160" fill="url(#horizon-sun)" />
        {/* Sun-disc body — bright cream */}
        <circle cx={SUN_X} cy={HORIZON_Y + SUN_Y_REL} r="38" fill="#FAF7F2" />
        <circle cx={SUN_X} cy={HORIZON_Y + SUN_Y_REL} r="38" fill="none" stroke="#1A1A1A" strokeWidth="0.5" opacity="0.55" />

        {/* Vertical reflection streak directly below the sun */}
        <rect
          x={SUN_X - 4}
          y={HORIZON_Y}
          width="8"
          height="240"
          fill="url(#horizon-reflection)"
        />
        <rect
          x={SUN_X - 14}
          y={HORIZON_Y}
          width="28"
          height="180"
          fill="url(#horizon-reflection)"
          opacity="0.45"
        />

        {/* Pilings on the horizon — black silhouettes rising above the ink horizon-line */}
        <g fill="#1A1A1A">
          {layout.horizonPilings.map((p, i) => (
            <rect key={i} x={p.x - 1.6} y={HORIZON_Y - p.h} width="3.2" height={p.h + 2} />
          ))}
        </g>

        {/* Hare-ears peeking up above the horizon — alert */}
        {layout.earsAtHorizon.map((e, i) => (
          <g key={`hh${i}`} transform={`translate(${e.x} ${HORIZON_Y}) ${e.flip ? "scale(-1 1)" : ""}`} fill="#1A1A1A">
            <path d="M -2 0 Q -6 -16 -1 -28 Q 2 -16 1 0 Z" />
            <path d="M 6 0 Q 9 -18 13 -30 Q 16 -18 11 0 Z" />
          </g>
        ))}

        {/* Branch silhouettes reaching in from upper-left and upper-right */}
        <g fill="#1A1A1A" opacity="0.78">
          {/* Upper-left */}
          <path d="M 0 60 Q 80 30 200 60 Q 280 80 360 70 L 360 76 Q 280 86 200 74 Q 80 50 0 80 Z" />
          {Array.from({ length: 18 }).map((_, i) => {
            const x = 40 + i * 18;
            const y = 60 + Math.sin(i * 0.7) * 12;
            const angle = -55 + (i % 3) * 25;
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${angle})`}>
                <path d="M 0 0 q 2 -12 5 -22 q 1 -4 -1 -0 q -2 8 -4 18 z" />
              </g>
            );
          })}
          {/* Upper-right (mirrored) */}
          <g transform="translate(1440 0) scale(-1 1)">
            <path d="M 0 100 Q 80 70 200 100 Q 280 120 360 110 L 360 116 Q 280 126 200 114 Q 80 90 0 120 Z" />
            {Array.from({ length: 16 }).map((_, i) => {
              const x = 40 + i * 20;
              const y = 100 + Math.sin(i * 0.8) * 10;
              const angle = -55 + (i % 3) * 25;
              return (
                <g key={i} transform={`translate(${x} ${y}) rotate(${angle})`}>
                  <path d="M 0 0 q 2 -10 4 -18 q 1 -3 -1 0 q -2 6 -3 14 z" />
                </g>
              );
            })}
          </g>
        </g>

        {/* Fence-post tick rows at each section divider below horizon */}
        {layout.fenceRows.map((y, idx) => (
          <g key={`fence${idx}`} fill="#1A1A1A" opacity="0.55">
            {Array.from({ length: 28 }).map((_, j) => {
              const x = 80 + j * 48;
              const h = 8 + ((j + idx) % 3) * 3;
              return <rect key={j} x={x - 1.4} y={y - h} width="2.8" height={h} />;
            })}
            {/* horizon-tick line at fence level (very faint) */}
            <line x1="60" y1={y} x2="1380" y2={y} stroke="#1A1A1A" strokeWidth="0.4" opacity="0.55" />
          </g>
        ))}

        {/* Hare ears at lower section transitions */}
        {layout.earsBelow.map((e, i) => (
          <g key={`eb${i}`} transform={`translate(${e.x} ${e.y}) ${e.flip ? "scale(-1 1)" : ""}`} fill="#1A1A1A" opacity="0.7">
            <path d="M -2 0 Q -6 -14 -1 -26 Q 2 -14 1 0 Z" />
            <path d="M 6 0 Q 9 -16 12 -28 Q 16 -16 11 0 Z" />
          </g>
        ))}

        {/* Top-left header cartouche */}
        <g transform="translate(72 124)" opacity="0.88">
          <text x="0" y="0" fontFamily="Playfair Display, Georgia, serif" fontStyle="italic" fontWeight="700" fontSize="22" fill="#1A1A1A">
            One Held Breath
          </text>
          <text x="0" y="20" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.26em" fill="#6B6B6B">
            0612h · HORIZON · FIRST LIGHT
          </text>
        </g>
      </svg>
    </>
  );
}
