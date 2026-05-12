"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * GlassLayer — Thicket descendant. Stained-glass cathedral.
 *
 * The five Thicket motifs (shell hex, bramble, hare-ears, predator-eyes,
 * watch-points) re-expressed as the language of a cathedral window:
 *
 *  - Shell hexes        leaded jewel-tone glass panes (deep olive,
 *                       warm amber, pale slate, crimson)
 *  - Bramble corners    heavy black lead came interleaving
 *  - Hare ears          mid-tone smoked-glass slivers in negative space
 *  - Predator eyes      bright garnet jewels at edges
 *  - Watch-points       gothic spire silhouettes
 *
 * Lead came lines (1.5–2.5px ink) dominate the layout. The colour does
 * not "decorate" — each pane is a deliberate placement, like a real
 * window. Sacred, weighty, reverent. The opposite of light atmospheric.
 *
 * Sandbox-local hues (NOT brand tokens):
 *   olive  #3D4A2D
 *   amber  #A47A28
 *   slate  #4A5670
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.45,
  standard: 0.78,
  heavy: 1.0,
};

const FALLBACK_HEIGHT = 5200;

function seededJitter(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hexPoints(cx: number, cy: number, r: number, rot = 0) {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rot;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
}

const JEWELS = ["#3D4A2D", "#A47A28", "#4A5670", "#8B1A1A"] as const;

export function GlassLayer() {
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
    const rng = seededJitter(1301);

    // Large leaded shell hexes — one per ~700px scroll band, alternating gutter
    type Pane = { cx: number; cy: number; r: number; tint: string };
    const panes: Pane[] = [];
    const rows = Math.ceil(pageH / 720);
    for (let i = 0; i < rows; i++) {
      panes.push({
        cx: i % 2 === 0 ? 260 : 1180,
        cy: 280 + i * 720,
        r: 170 + rng() * 30,
        tint: JEWELS[i % JEWELS.length],
      });
    }

    // Hare-ear smoked panels in negative space between sections
    type Ear = { x: number; y: number; flip: boolean };
    const ears: Ear[] = [];
    [0.18, 0.34, 0.50, 0.66, 0.82].forEach((p, i) => {
      ears.push({
        x: i % 2 === 0 ? 720 : 540,
        y: pageH * p,
        flip: i % 2 === 1,
      });
    });

    // Garnet predator-eye jewels at edges
    type Eye = { x: number; y: number };
    const eyes: Eye[] = [];
    for (let i = 0; i < 10; i++) {
      eyes.push({
        x: i % 2 === 0 ? 22 + rng() * 12 : 1418 - rng() * 12,
        y: 280 + rng() * (pageH - 560),
      });
    }

    // Gothic spires at major section transitions
    type Spire = { x: number; y: number };
    const spires: Spire[] = [];
    [0.22, 0.54, 0.86].forEach((p) => {
      spires.push({ x: 1280 + rng() * 60, y: pageH * p });
    });

    return { panes, ears, eyes, spires };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Glass" value={intensity} onChange={setIntensity} />

      {/* ─── L1: faint warm tonal wash that hints at cathedral interior ─── */}
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
          opacity: op * 0.32,
          mixBlendMode: "multiply",
          background: `
            radial-gradient(ellipse at 50% 10%, rgba(164,122,40,0.20), transparent 50%),
            radial-gradient(ellipse at 50% 90%, rgba(74,86,112,0.16), transparent 55%)
          `,
          transition: "opacity 320ms",
        }}
      />

      {/* ─── L2: jewel-pane fills (NOT multiplied — saturated colour) ─── */}
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
          zIndex: 4,
          opacity: op * 0.78,
          transition: "opacity 320ms",
        }}
      >
        {/* Shell-hex jewel panes — each hex is divided into 7 sub-panes (centre + 6 triangles), filled with a related tint */}
        {layout.panes.map((p, i) => {
          const base = p.tint;
          return (
            <g key={i}>
              {/* 6 triangular outer panes */}
              {Array.from({ length: 6 }).map((_, k) => {
                const a1 = (k / 6) * Math.PI * 2 - Math.PI / 2;
                const a2 = ((k + 1) / 6) * Math.PI * 2 - Math.PI / 2;
                const x1 = p.cx + Math.cos(a1) * p.r;
                const y1 = p.cy + Math.sin(a1) * p.r;
                const x2 = p.cx + Math.cos(a2) * p.r;
                const y2 = p.cy + Math.sin(a2) * p.r;
                // Alternate hue across the 6 outer panes
                const alt = JEWELS[(i + k) % JEWELS.length];
                return (
                  <polygon
                    key={k}
                    points={`${p.cx},${p.cy} ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`}
                    fill={alt}
                    opacity="0.72"
                  />
                );
              })}
              {/* Centre hex pane */}
              <polygon points={hexPoints(p.cx, p.cy, p.r * 0.32)} fill={base} opacity="0.95" />
              {/* Inner concentric pane */}
              <polygon points={hexPoints(p.cx, p.cy, p.r * 0.55)} fill="none" />
              {/* Eye in centre of every other pane — bright crimson dot */}
              {i % 2 === 0 && <circle cx={p.cx} cy={p.cy} r="3" fill="#8B1A1A" />}
            </g>
          );
        })}

        {/* Hare-ear smoked panels in negative space */}
        {layout.ears.map((e, i) => (
          <g key={i} transform={`translate(${e.x} ${e.y}) ${e.flip ? "scale(-1 1)" : ""}`}>
            <path
              d="M -4 -52 Q -8 -76 -2 -96 Q 4 -76 0 -52 Z"
              fill="#4A5670"
              opacity="0.55"
            />
            <path
              d="M 10 -54 Q 14 -78 18 -98 Q 22 -78 14 -54 Z"
              fill="#3D4A2D"
              opacity="0.55"
            />
          </g>
        ))}

        {/* Predator-eye garnet jewels */}
        {layout.eyes.map((e, i) => (
          <g key={i} transform={`translate(${e.x} ${e.y})`}>
            <circle cx="0" cy="0" r="4" fill="#8B1A1A" />
            <circle cx="-1" cy="-1" r="1.2" fill="#FAF7F2" opacity="0.85" />
            <circle cx="8" cy="0" r="4" fill="#8B1A1A" />
            <circle cx="7" cy="-1" r="1.2" fill="#FAF7F2" opacity="0.85" />
          </g>
        ))}

        {/* Gothic spire silhouettes at section anchors */}
        {layout.spires.map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y})`}>
            {/* Solid amber-glass spire shape */}
            <path
              d="M -16 0 L -16 -40 Q -16 -70 0 -88 Q 16 -70 16 -40 L 16 0 Z"
              fill="#A47A28"
              opacity="0.7"
            />
            {/* Pointed apex */}
            <path d="M -10 -88 L 0 -110 L 10 -88 Z" fill="#A47A28" opacity="0.85" />
            {/* Tiny window in spire */}
            <path d="M -4 -50 Q -4 -60 0 -64 Q 4 -60 4 -50 Z" fill="#4A5670" opacity="0.85" />
          </g>
        ))}
      </svg>

      {/* ─── L3: heavy lead came lines on top ─── */}
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
          mixBlendMode: "multiply",
          transition: "opacity 320ms",
        }}
      >
        {/* Shell-hex lead came: heavy outline + inner partition lines */}
        {layout.panes.map((p, i) => (
          <g key={i} stroke="#1A1A1A" fill="none" strokeLinejoin="miter">
            {/* Outer thick came */}
            <polygon points={hexPoints(p.cx, p.cy, p.r)} strokeWidth="2.8" />
            {/* 6 partition lines from centre to vertices */}
            {Array.from({ length: 6 }).map((_, k) => {
              const a = (k / 6) * Math.PI * 2 - Math.PI / 2;
              return (
                <line
                  key={k}
                  x1={p.cx}
                  y1={p.cy}
                  x2={p.cx + Math.cos(a) * p.r}
                  y2={p.cy + Math.sin(a) * p.r}
                  strokeWidth="1.4"
                />
              );
            })}
            {/* Inner centre hex came */}
            <polygon points={hexPoints(p.cx, p.cy, p.r * 0.32)} strokeWidth="1.8" />
            {/* Inner concentric came */}
            <polygon points={hexPoints(p.cx, p.cy, p.r * 0.55)} strokeWidth="0.9" opacity="0.7" />
          </g>
        ))}

        {/* Heavy lead bramble in 4 corners — thick interleaving black */}
        {[
          { x: 30, y: 90, flip: 1 },
          { x: 1410, y: 90, flip: -1 },
          { x: 30, y: pageH - 200, flip: 1 },
          { x: 1410, y: pageH - 200, flip: -1 },
        ].map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.flip} 1)`} stroke="#1A1A1A" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 0 0 L 30 30 L 8 50 L 50 60 L 16 80 L 60 100 L 24 120" />
            <path d="M 12 4 L 40 22 L 18 42 L 50 56" />
            <path d="M 24 0 L 46 18 L 22 36 L 56 50" />
            <path d="M -4 16 L 32 30 L 8 50" strokeWidth="1.6" />
          </g>
        ))}

        {/* Section divider strips made of small leaded glass diamonds */}
        {[0.26, 0.52, 0.78].map((p, idx) => {
          const y = pageH * p;
          return (
            <g key={`div${idx}`} stroke="#1A1A1A" strokeWidth="1.4" fill="none">
              {Array.from({ length: 12 }).map((_, j) => {
                const x = 120 + j * 110;
                return (
                  <g key={j}>
                    <path
                      d={`M ${x} ${y - 10} L ${x + 12} ${y} L ${x} ${y + 10} L ${x - 12} ${y} Z`}
                      fill={JEWELS[(j + idx) % JEWELS.length]}
                      fillOpacity="0.55"
                    />
                  </g>
                );
              })}
              {/* Continuous lead line through midline */}
              <line x1="100" y1={y} x2="1340" y2={y} strokeWidth="1.6" />
            </g>
          );
        })}

        {/* Header cartouche */}
        <g transform="translate(72 124)" opacity="0.88">
          <text x="0" y="0" fontFamily="Playfair Display, Georgia, serif" fontWeight="700" fontSize="22" fill="#1A1A1A">
            LEPONEUS — Cathedra
          </text>
          <text x="0" y="20" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.26em" fill="#6B6B6B">
            FENESTRA · XII · LEAD &amp; GLASS
          </text>
          <line x1="0" y1="30" x2="320" y2="30" stroke="#1A1A1A" strokeWidth="0.8" />
        </g>

        {/* Footer axiom */}
        <g transform={`translate(72 ${pageH - 64})`} opacity="0.78">
          <text x="0" y="0" fontFamily="'Space Mono', monospace" fontSize="10" letterSpacing="0.26em" fill="#1A1A1A" fontWeight="700">
            LIGHT THROUGH LEAD
          </text>
          <text x="0" y="14" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill="#6B6B6B">
            the field is sacred · the training is the vow
          </text>
        </g>
      </svg>
    </>
  );
}
