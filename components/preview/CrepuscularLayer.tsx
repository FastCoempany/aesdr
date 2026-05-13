"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * CrepuscularLayer — sunrise idea #2. The biology of dawn.
 *
 * No horizon line. The page is divided vertically by warmth: the TOP
 * holds dawn (warm amber/gold), the BOTTOM holds dusk (cool sage).
 * Cream sits between as the neutral working tone where the copy
 * lives.
 *
 *  - Grass tufts at the feet of every section (silhouetted dry grass)
 *  - Hare ears popping up between grass tufts — alert posture
 *  - Cypress silhouettes at major section breaks
 *  - Long predator shadows stretched across the page from the right
 *    side (low-angle morning light, coming from off-page sun)
 *  - One mono archival biology tag per section
 *  - A small sun-disc anchor in the upper hero region (not the focal
 *    point — the WARMTH is)
 *
 * Tone: this is when the animal is awake. The biology of the field
 * at the threshold of day.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.46,
  standard: 0.78,
  heavy: 1.0,
};

const FALLBACK_HEIGHT = 5200;

const BIO_TAGS = [
  "DAY 01 · 0612h · BREATH HELD",
  "DAY 01 · 0648h · ALERT POSTURE · 12s",
  "DAY 01 · 0724h · FORM ABANDONED",
  "DAY 01 · 0801h · WIND NW · 6kts",
  "DAY 01 · 0844h · FLIGHT TRIGGER · 4.2m",
  "DAY 01 · 0922h · SHELL HELD · 0.6s",
];

function seededJitter(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function CrepuscularLayer() {
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
    const rng = seededJitter(2789);

    // Section anchors — habitat punctuation
    const sectionYs = [0.12, 0.26, 0.40, 0.54, 0.68, 0.82, 0.94].map((p) => pageH * p);

    // Grass tufts along the bottom edge of every section
    type GrassRow = { y: number; xs: number[] };
    const grassRows: GrassRow[] = sectionYs.map((y) => {
      const xs: number[] = [];
      let x = 40;
      while (x < 1400) {
        xs.push(x);
        x += 22 + rng() * 28;
      }
      return { y, xs };
    });

    // Hare ears popping above grass at occasional anchors
    type Ears = { x: number; y: number; flip: boolean; tilt: number };
    const ears: Ears[] = [];
    [0.18, 0.34, 0.50, 0.66, 0.80].forEach((p, i) => {
      ears.push({
        x: i % 2 === 0 ? 380 : 1020,
        y: pageH * p,
        flip: i % 2 === 1,
        tilt: i % 2 === 0 ? -6 : 8,
      });
    });

    // Cypress silhouettes at major section breaks (sparse, 3 total)
    type Cypress = { x: number; y: number; h: number };
    const cypress: Cypress[] = [
      { x: 200, y: pageH * 0.26, h: 220 },
      { x: 1240, y: pageH * 0.54, h: 260 },
      { x: 320, y: pageH * 0.82, h: 240 },
    ];

    // Long predator shadows from the right side — silhouettes with stretched cast shadow
    type Shadow = { y: number };
    const shadows: Shadow[] = [
      { y: pageH * 0.20 },
      { y: pageH * 0.46 },
      { y: pageH * 0.72 },
    ];

    return { sectionYs, grassRows, ears, cypress, shadows };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Crepuscular" value={intensity} onChange={setIntensity} />

      {/* L1: full-page vertical warmth gradient — warm top, cool bottom, cream middle */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: pageH,
          pointerEvents: "none",
          zIndex: 3,
          opacity: op,
          mixBlendMode: "multiply",
          background: `linear-gradient(180deg,
            rgba(232,156,72,0.36) 0%,
            rgba(232,168,96,0.28) 14%,
            rgba(232,200,140,0.14) 28%,
            rgba(250,247,242,0) 44%,
            rgba(250,247,242,0) 64%,
            rgba(140,160,128,0.16) 80%,
            rgba(108,128,104,0.28) 94%,
            rgba(80,100,80,0.40) 100%
          )`,
          transition: "opacity 320ms",
        }}
      />

      {/* L2: SVG habitat */}
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
          <radialGradient id="crep-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FAF7F2" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#F4C268" stopOpacity="0.78" />
            <stop offset="70%" stopColor="#D88040" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#D88040" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sun-disc anchor in hero region (small, off-center) */}
        <circle cx="1260" cy="280" r="110" fill="url(#crep-sun)" />
        <circle cx="1260" cy="280" r="22" fill="#FAF7F2" opacity="0.95" />
        <circle cx="1260" cy="280" r="22" fill="none" stroke="#1A1A1A" strokeWidth="0.4" opacity="0.55" />

        {/* Long predator shadows from right side — silhouette + stretched shadow */}
        {layout.shadows.map((s, i) => (
          <g key={`sh${i}`} transform={`translate(0 ${s.y})`}>
            {/* Stretched cast shadow — long thin trapezoid from off-page right */}
            <path
              d={`M 1440 -2 L 1440 2 L 200 8 L 200 -8 Z`}
              fill="#1A1A1A"
              opacity="0.18"
            />
            {/* Silhouette source at right edge */}
            <g transform="translate(1416 0)" fill="#1A1A1A" opacity="0.7">
              {i === 0 && <path d="M 0 -10 Q 4 -22 14 -20 L 20 -26 L 24 -18 L 36 -12 L 36 4 L 0 4 Z" />}
              {i === 1 && <path d="M 0 0 L 24 -6 L 22 0 L 24 4 Z" />}
              {i === 2 && <path d="M 0 4 Q 12 -2 24 0 L 30 -2 L 32 4 L 0 4 Z" />}
            </g>
          </g>
        ))}

        {/* Cypress silhouettes at major section breaks */}
        {layout.cypress.map((c, i) => (
          <g key={`cy${i}`} transform={`translate(${c.x} ${c.y})`} fill="#1A1A1A" opacity="0.78">
            <path d={`M 0 0 q -10 ${-c.h * 0.5} 0 ${-c.h} q 10 ${c.h * 0.5} 0 ${c.h} z`} />
            <rect x="-2" y="0" width="4" height="14" />
          </g>
        ))}

        {/* Grass tufts at section feet */}
        {layout.grassRows.map((row, idx) => (
          <g key={`grass${idx}`} stroke="#1A1A1A" strokeWidth="0.7" fill="none" opacity="0.85">
            {row.xs.map((x, j) => (
              <g key={j} transform={`translate(${x} ${row.y})`}>
                <path d="M 0 0 q -2 -14 -1 -22" />
                <path d="M 3 0 q 1 -10 2 -16" />
                <path d="M -3 0 q -1 -12 -3 -20" />
                <path d="M 6 0 q 3 -9 5 -14" />
                <path d="M -6 0 q -3 -11 -6 -16" />
              </g>
            ))}
            {/* Ground line */}
            <line x1="0" y1={row.y + 1} x2="1440" y2={row.y + 1} stroke="#1A1A1A" strokeWidth="0.4" opacity="0.45" />
          </g>
        ))}

        {/* Hare ears popping above grass — alert */}
        {layout.ears.map((e, i) => (
          <g
            key={`ear${i}`}
            transform={`translate(${e.x} ${e.y}) ${e.flip ? "scale(-1 1)" : ""} rotate(${e.tilt})`}
            fill="#1A1A1A"
          >
            <path d="M -2 0 Q -7 -22 -2 -42 Q 3 -22 1 0 Z" />
            <path d="M 9 0 Q 13 -24 18 -46 Q 22 -24 14 0 Z" />
            {/* Head suggestion just visible */}
            <ellipse cx="6" cy="4" rx="10" ry="3" opacity="0.6" />
          </g>
        ))}

        {/* Biology tags — one per section, mono, sparse */}
        {layout.sectionYs.slice(0, BIO_TAGS.length).map((y, i) => (
          <g key={`tag${i}`} transform={`translate(${i % 2 === 0 ? 1380 : 60} ${y - 14})`} opacity="0.72">
            <text
              x="0"
              y="0"
              fontFamily="'Space Mono', monospace"
              fontSize="9"
              letterSpacing="0.24em"
              fill="#1A1A1A"
              textAnchor={i % 2 === 0 ? "end" : "start"}
            >
              {BIO_TAGS[i]}
            </text>
          </g>
        ))}

        {/* Header cartouche — biology log entry */}
        <g transform="translate(72 124)" opacity="0.88">
          <text x="0" y="0" fontFamily="Playfair Display, Georgia, serif" fontStyle="italic" fontWeight="700" fontSize="22" fill="#1A1A1A">
            Crepuscular Field
          </text>
          <text x="0" y="20" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.26em" fill="#6B6B6B">
            DAWN — LOG XII · LIVE OBSERVATION
          </text>
          <line x1="0" y1="30" x2="320" y2="30" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.55" />
        </g>

        {/* Footer entry */}
        <g transform={`translate(72 ${pageH - 60})`} opacity="0.78">
          <text x="0" y="0" fontFamily="'Space Mono', monospace" fontWeight="700" fontSize="10" letterSpacing="0.26em" fill="#1A1A1A">
            THE ANIMAL IS AWAKE
          </text>
          <text x="0" y="14" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill="#6B6B6B">
            log resumes at dusk · field temperature falling
          </text>
        </g>
      </svg>
    </>
  );
}
