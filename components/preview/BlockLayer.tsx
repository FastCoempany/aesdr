"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * BlockLayer — Thicket descendant. Woodblock print.
 *
 * Posada / Munakata / Soviet-poster vocabulary: bold solid ink shapes,
 * no halftones, no gradients, no contour lines. Two colours only —
 * ink and crimson. Carved negative space inside heavy positive forms.
 *
 *  - Shell hexes        solid black tiles with carved-out negative
 *                       scute partitions (cream cuts through ink)
 *  - Bramble corners    thick chisel-cut strokes — broad ink wedges
 *                       (not hairlines)
 *  - Hare ears          fully filled solid silhouettes between sections
 *  - Predator eyes      solid ink rectangles at edges with crimson
 *                       pupils, not line work
 *  - Watch-points       chunky tower silhouettes, solid ink
 *
 * Aesthetic: chiseled, civic, propagandistic in its certainty. The
 * field is not safe AND the page declares it loudly.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.48,
  standard: 0.80,
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

export function BlockLayer() {
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
    const rng = seededJitter(1597);

    type Block = { cx: number; cy: number; r: number };
    const blocks: Block[] = [];
    const rows = Math.ceil(pageH / 720);
    for (let i = 0; i < rows; i++) {
      blocks.push({
        cx: i % 2 === 0 ? 240 : 1200,
        cy: 280 + i * 720,
        r: 140 + rng() * 20,
      });
    }

    type Ear = { x: number; y: number; flip: boolean };
    const ears: Ear[] = [];
    [0.20, 0.40, 0.62, 0.84].forEach((p, i) => {
      ears.push({ x: i % 2 === 0 ? 720 : 540, y: pageH * p, flip: i % 2 === 1 });
    });

    type Eye = { x: number; y: number };
    const eyes: Eye[] = [];
    for (let i = 0; i < 10; i++) {
      eyes.push({
        x: i % 2 === 0 ? 16 : 1424,
        y: 240 + rng() * (pageH - 480),
      });
    }

    const towers = [
      { x: 1320, y: pageH * 0.20 },
      { x: 1320, y: pageH * 0.52 },
      { x: 1320, y: pageH * 0.84 },
    ];

    return { blocks, ears, eyes, towers };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Block" value={intensity} onChange={setIntensity} />

      {/* Ink layer — solid blocks, no halftone */}
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
          opacity: op * 0.92,
          mixBlendMode: "multiply",
          transition: "opacity 320ms",
        }}
      >
        {/* Heavy solid-ink shell hexes with cream "carved out" partitions */}
        {layout.blocks.map((b, i) => (
          <g key={i}>
            {/* Solid ink hex */}
            <polygon points={hexPoints(b.cx, b.cy, b.r)} fill="#1A1A1A" />
            {/* Carved-out cream partitions — 6 spokes */}
            {Array.from({ length: 6 }).map((_, k) => {
              const a = (k / 6) * Math.PI * 2 - Math.PI / 2;
              return (
                <line
                  key={k}
                  x1={b.cx}
                  y1={b.cy}
                  x2={b.cx + Math.cos(a) * b.r}
                  y2={b.cy + Math.sin(a) * b.r}
                  stroke="#FAF7F2"
                  strokeWidth="4"
                />
              );
            })}
            {/* Inner carved hex */}
            <polygon points={hexPoints(b.cx, b.cy, b.r * 0.42)} fill="#FAF7F2" />
            {/* Inner solid eye */}
            <polygon points={hexPoints(b.cx, b.cy, b.r * 0.20)} fill="#1A1A1A" />
            {/* Carved-out radiating slash marks at outer edge */}
            {Array.from({ length: 12 }).map((_, k) => {
              const a = ((k + 0.5) / 12) * Math.PI * 2 - Math.PI / 2;
              const x1 = b.cx + Math.cos(a) * b.r * 0.62;
              const y1 = b.cy + Math.sin(a) * b.r * 0.62;
              const x2 = b.cx + Math.cos(a) * b.r * 0.95;
              const y2 = b.cy + Math.sin(a) * b.r * 0.95;
              return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FAF7F2" strokeWidth="2.5" />;
            })}
          </g>
        ))}

        {/* Thick chisel-cut bramble in all 4 corners */}
        {[
          { x: 0, y: 80, sx: 1 },
          { x: 1440, y: 80, sx: -1 },
          { x: 0, y: pageH - 240, sx: 1 },
          { x: 1440, y: pageH - 240, sx: -1 },
        ].map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.sx} 1)`} fill="#1A1A1A">
            {/* Heavy chisel wedges */}
            <path d="M 0 0 L 80 50 L 30 60 L 110 90 L 40 100 Z" />
            <path d="M 10 30 L 70 70 L 90 60 L 60 90 L 100 110 L 30 120 Z" />
            <path d="M 50 0 L 110 30 L 80 50 L 130 70 L 90 80 Z" />
            {/* Standalone thorns */}
            <path d="M 0 80 L 24 70 L 8 88 Z" />
            <path d="M 120 100 L 140 92 L 128 110 Z" />
            <path d="M 60 130 L 84 122 L 70 142 Z" />
          </g>
        ))}

        {/* Solid hare-ear silhouettes between sections */}
        {layout.ears.map((e, i) => (
          <g key={i} transform={`translate(${e.x} ${e.y}) ${e.flip ? "scale(-1 1)" : ""}`} fill="#1A1A1A">
            <path d="M -4 -52 Q -10 -86 -2 -106 Q 4 -86 0 -52 Z" />
            <path d="M 10 -54 Q 14 -88 22 -108 Q 26 -88 14 -54 Z" />
          </g>
        ))}

        {/* Chunky watchtower silhouettes */}
        {layout.towers.map((t, i) => (
          <g key={i} transform={`translate(${t.x} ${t.y})`} fill="#1A1A1A">
            {/* Base */}
            <rect x="-22" y="0" width="44" height="14" />
            {/* Column */}
            <rect x="-10" y="-40" width="20" height="40" />
            {/* Crow's nest */}
            <rect x="-16" y="-58" width="32" height="18" />
            {/* Roof */}
            <path d="M -18 -58 L 0 -76 L 18 -58 Z" />
            {/* Window cut-out */}
            <rect x="-4" y="-52" width="8" height="8" fill="#FAF7F2" />
          </g>
        ))}

        {/* Heavy section dividers — solid black bars with crimson punctuation */}
        {[0.24, 0.48, 0.72].map((p, idx) => {
          const y = pageH * p;
          return (
            <g key={`div${idx}`}>
              <rect x="80" y={y - 3} width="1280" height="6" fill="#1A1A1A" />
              {/* Carved cream notch in the middle */}
              <rect x="700" y={y - 3} width="40" height="6" fill="#FAF7F2" />
            </g>
          );
        })}

        {/* Header block — bold slab */}
        <g transform="translate(72 100)">
          <rect x="-12" y="-26" width="420" height="56" fill="#1A1A1A" />
          <text
            x="0"
            y="0"
            fontFamily="Playfair Display, Georgia, serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="28"
            fill="#FAF7F2"
          >
            LEPONEUS
          </text>
          <text
            x="0"
            y="20"
            fontFamily="'Space Mono', monospace"
            fontSize="9"
            letterSpacing="0.30em"
            fill="#FAF7F2"
            opacity="0.85"
          >
            THE FIELD IS NOT SAFE
          </text>
        </g>
      </svg>

      {/* Crimson punctuation layer — small, definitive */}
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
          zIndex: 6,
          opacity: op,
          transition: "opacity 320ms",
        }}
      >
        {/* Predator-eye blocks — solid rectangles with crimson pupils */}
        {layout.eyes.map((e, i) => (
          <g key={i} transform={`translate(${e.x} ${e.y})`}>
            <rect x="-8" y="-4" width="16" height="8" fill="#1A1A1A" />
            <rect x="-2" y="-2" width="4" height="4" fill="#8B1A1A" />
          </g>
        ))}

        {/* Stamped crimson axiom at each divider */}
        {[0.24, 0.48, 0.72].map((p, i) => {
          const y = pageH * p;
          const text = ["WATCH", "MOVE", "ENDURE"][i];
          return (
            <g key={i} transform={`translate(720 ${y})`}>
              <rect x="-36" y="-12" width="72" height="24" fill="#8B1A1A" />
              <text
                x="0"
                y="4"
                fontFamily="'Space Mono', monospace"
                fontWeight="700"
                fontSize="12"
                letterSpacing="0.34em"
                fill="#FAF7F2"
                textAnchor="middle"
              >
                {text}
              </text>
            </g>
          );
        })}

        {/* Footer block stamp */}
        <g transform={`translate(72 ${pageH - 80})`}>
          <rect x="-12" y="-22" width="320" height="44" fill="#8B1A1A" />
          <text
            x="0"
            y="0"
            fontFamily="'Space Mono', monospace"
            fontWeight="700"
            fontSize="13"
            letterSpacing="0.28em"
            fill="#FAF7F2"
          >
            CARVED FOR PRESSURE
          </text>
          <text
            x="0"
            y="14"
            fontFamily="'Space Mono', monospace"
            fontSize="8"
            letterSpacing="0.22em"
            fill="#FAF7F2"
            opacity="0.82"
          >
            training is the cut · the cut is the lesson
          </text>
        </g>
      </svg>
    </>
  );
}
