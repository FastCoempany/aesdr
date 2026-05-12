"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * MosaicLayer — Thicket descendant. Mediterranean stone mosaic.
 *
 * Roman / Byzantine / Pompeii floor-mosaic vocabulary: tessellated
 * polygons, visible mortar gaps, broken tesserae, terracotta + gold
 * + ink on cream substrate.
 *
 *  - Shell hexes        large hexagonal tile fields, internally
 *                       fractured into ~30 small tesserae each, with
 *                       mortar gaps showing cream through
 *  - Bramble corners    "broken tile" rubble — irregular polygon
 *                       shards in mixed hues
 *  - Hare ears          silhouettes assembled from tessera-cluster fills
 *  - Predator eyes      gold + black tessera glinting at edges
 *  - Watch-points       mosaic-tower silhouettes constructed from
 *                       small tile fragments
 *
 * Sandbox-local hues (NOT brand tokens):
 *   terracotta  #A04020
 *   gold        #8B6914
 *   warm bone   #E8DCC4
 *
 * Aesthetic: ancient, walked-on, durable. The page is a floor that
 * has been pressed into for centuries.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.50,
  standard: 0.82,
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

const TILE_HUES = [
  "#A04020", // terracotta
  "#8B6914", // aged gold
  "#1A1A1A", // ink
  "#E8DCC4", // warm bone
  "#8B1A1A", // crimson
  "#6B6B6B", // muted
] as const;

function buildTesserae(cx: number, cy: number, r: number, rng: () => number) {
  // 6 outer triangles, each sub-divided into 5 tesserae
  const tiles: Array<{ pts: string; hue: string }> = [];
  for (let k = 0; k < 6; k++) {
    const a1 = (k / 6) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((k + 1) / 6) * Math.PI * 2 - Math.PI / 2;
    // 3 rings inside this triangle
    for (let ring = 0; ring < 3; ring++) {
      const inner = ring / 3;
      const outer = (ring + 1) / 3;
      // Each ring split into 2 quads angularly
      for (let q = 0; q < 2; q++) {
        const ang1 = a1 + (a2 - a1) * (q / 2);
        const ang2 = a1 + (a2 - a1) * ((q + 1) / 2);
        const jitter = () => 1 - rng() * 0.06;
        const p1x = cx + Math.cos(ang1) * r * inner * jitter();
        const p1y = cy + Math.sin(ang1) * r * inner * jitter();
        const p2x = cx + Math.cos(ang2) * r * inner * jitter();
        const p2y = cy + Math.sin(ang2) * r * inner * jitter();
        const p3x = cx + Math.cos(ang2) * r * outer * jitter();
        const p3y = cy + Math.sin(ang2) * r * outer * jitter();
        const p4x = cx + Math.cos(ang1) * r * outer * jitter();
        const p4y = cy + Math.sin(ang1) * r * outer * jitter();
        if (inner === 0) {
          tiles.push({
            pts: `${cx.toFixed(1)},${cy.toFixed(1)} ${p3x.toFixed(1)},${p3y.toFixed(1)} ${p4x.toFixed(1)},${p4y.toFixed(1)}`,
            hue: TILE_HUES[(k + q + ring) % TILE_HUES.length],
          });
        } else {
          tiles.push({
            pts: `${p1x.toFixed(1)},${p1y.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)} ${p3x.toFixed(1)},${p3y.toFixed(1)} ${p4x.toFixed(1)},${p4y.toFixed(1)}`,
            hue: TILE_HUES[(k * 7 + ring * 3 + q) % TILE_HUES.length],
          });
        }
      }
    }
  }
  return tiles;
}

export function MosaicLayer() {
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
    const rng = seededJitter(2003);

    type Field = { cx: number; cy: number; r: number; tesserae: Array<{ pts: string; hue: string }> };
    const fields: Field[] = [];
    const rows = Math.ceil(pageH / 720);
    for (let i = 0; i < rows; i++) {
      const cx = i % 2 === 0 ? 260 : 1180;
      const cy = 280 + i * 720;
      const r = 160;
      fields.push({ cx, cy, r, tesserae: buildTesserae(cx, cy, r, rng) });
    }

    // Broken-tile rubble in 4 corners — irregular small polygon shards
    type Shard = { pts: string; hue: string };
    function corner(ox: number, oy: number, flip: number): Shard[] {
      const out: Shard[] = [];
      for (let i = 0; i < 22; i++) {
        const x = ox + flip * (10 + rng() * 100);
        const y = oy + 10 + rng() * 140;
        const s = 6 + rng() * 14;
        const pts: string[] = [];
        const sides = 3 + Math.floor(rng() * 3);
        for (let k = 0; k < sides; k++) {
          const a = (k / sides) * Math.PI * 2 + rng() * 0.5;
          const rr = s * (0.6 + rng() * 0.5);
          pts.push(`${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`);
        }
        out.push({ pts: pts.join(" "), hue: TILE_HUES[Math.floor(rng() * TILE_HUES.length)] });
      }
      return out;
    }
    const rubble: Shard[] = [
      ...corner(20, 80, 1),
      ...corner(1420, 80, -1),
      ...corner(20, pageH - 240, 1),
      ...corner(1420, pageH - 240, -1),
    ];

    // Hare-ear silhouettes as tessera clusters between sections
    type Ear = { x: number; y: number; flip: boolean };
    const ears: Ear[] = [];
    [0.20, 0.42, 0.66, 0.86].forEach((p, i) => {
      ears.push({ x: i % 2 === 0 ? 720 : 540, y: pageH * p, flip: i % 2 === 1 });
    });

    type Eye = { x: number; y: number };
    const eyes: Eye[] = [];
    for (let i = 0; i < 12; i++) {
      eyes.push({
        x: i % 2 === 0 ? 18 + rng() * 14 : 1422 - rng() * 14,
        y: 260 + rng() * (pageH - 520),
      });
    }

    const watchTowers = [
      { x: 1290, y: pageH * 0.22 },
      { x: 1290, y: pageH * 0.54 },
      { x: 1290, y: pageH * 0.86 },
    ];

    return { fields, rubble, ears, eyes, watchTowers };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Mosaic" value={intensity} onChange={setIntensity} />

      {/* L1: very faint terracotta base wash + warm-bone substrate */}
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
          opacity: op * 0.20,
          mixBlendMode: "multiply",
          background: `
            radial-gradient(ellipse at 30% 30%, rgba(160,64,32,0.10), transparent 55%),
            radial-gradient(ellipse at 70% 70%, rgba(139,105,20,0.10), transparent 55%)
          `,
          transition: "opacity 320ms",
        }}
      />

      {/* L2: tessera fills (NOT multiplied — saturated stone colour) */}
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
          opacity: op * 0.92,
          transition: "opacity 320ms",
        }}
      >
        {/* Shell-hex fields: each composed of small tesserae */}
        {layout.fields.map((f, i) => (
          <g key={i}>
            {f.tesserae.map((t, j) => (
              <polygon
                key={j}
                points={t.pts}
                fill={t.hue}
                stroke="#FAF7F2"
                strokeWidth="1.4"
                strokeLinejoin="miter"
              />
            ))}
            {/* Central "iris" — single dark tessera */}
            <circle cx={f.cx} cy={f.cy} r="6" fill="#1A1A1A" />
            <circle cx={f.cx} cy={f.cy} r="2" fill="#8B6914" />
          </g>
        ))}

        {/* Broken-tile rubble in corners — small irregular shards */}
        {layout.rubble.map((r, i) => (
          <polygon
            key={i}
            points={r.pts}
            fill={r.hue}
            stroke="#FAF7F2"
            strokeWidth="1.2"
            opacity="0.92"
          />
        ))}

        {/* Hare-ear silhouettes — assembled from small tessera clusters */}
        {layout.ears.map((e, i) => (
          <g key={i} transform={`translate(${e.x} ${e.y}) ${e.flip ? "scale(-1 1)" : ""}`}>
            {/* Ear 1 — 6 stacked tesserae */}
            {Array.from({ length: 6 }).map((_, k) => {
              const ty = -56 - k * 8;
              return (
                <polygon
                  key={k}
                  points={`-6,${ty} 0,${ty - 4} 6,${ty} 0,${ty + 4}`}
                  fill={TILE_HUES[k % TILE_HUES.length]}
                  stroke="#FAF7F2"
                  strokeWidth="1"
                />
              );
            })}
            {/* Ear 2 */}
            {Array.from({ length: 6 }).map((_, k) => {
              const ty = -58 - k * 8;
              return (
                <polygon
                  key={k}
                  points={`12,${ty} 18,${ty - 4} 24,${ty} 18,${ty + 4}`}
                  fill={TILE_HUES[(k + 2) % TILE_HUES.length]}
                  stroke="#FAF7F2"
                  strokeWidth="1"
                />
              );
            })}
          </g>
        ))}

        {/* Mosaic watchtowers — assembled from rectangular tesserae */}
        {layout.watchTowers.map((t, i) => (
          <g key={i} transform={`translate(${t.x} ${t.y})`}>
            {/* 5-row tower of small tile rectangles */}
            {Array.from({ length: 5 }).map((_, row) => (
              <g key={row} transform={`translate(0 ${-row * 14})`}>
                {Array.from({ length: 3 }).map((_, col) => (
                  <rect
                    key={col}
                    x={-12 + col * 8}
                    y="-10"
                    width="7"
                    height="12"
                    fill={TILE_HUES[(row + col) % TILE_HUES.length]}
                    stroke="#FAF7F2"
                    strokeWidth="0.8"
                  />
                ))}
              </g>
            ))}
            {/* Apex pyramid */}
            <polygon
              points="-10,-80 0,-94 10,-80"
              fill="#1A1A1A"
              stroke="#FAF7F2"
              strokeWidth="0.8"
            />
          </g>
        ))}

        {/* Section divider bands — terracotta + gold tessera strips */}
        {[0.26, 0.52, 0.78].map((p, idx) => {
          const y = pageH * p;
          return (
            <g key={`div${idx}`}>
              {Array.from({ length: 64 }).map((_, j) => {
                const x = 80 + j * 20;
                const hue = j % 4 === 0 ? "#8B6914" : j % 4 === 1 ? "#A04020" : j % 4 === 2 ? "#1A1A1A" : "#E8DCC4";
                return (
                  <rect
                    key={j}
                    x={x}
                    y={y - 6}
                    width="16"
                    height="12"
                    fill={hue}
                    stroke="#FAF7F2"
                    strokeWidth="1"
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* L3: predator-eye gold/black tessera (kept on top, NOT multiplied) */}
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
        {layout.eyes.map((e, i) => (
          <g key={i} transform={`translate(${e.x} ${e.y})`}>
            <rect x="-9" y="-5" width="10" height="10" fill="#8B6914" stroke="#FAF7F2" strokeWidth="0.8" />
            <rect x="2" y="-5" width="10" height="10" fill="#1A1A1A" stroke="#FAF7F2" strokeWidth="0.8" />
            <rect x="-7" y="-3" width="3" height="3" fill="#FAF7F2" />
            <rect x="6" y="-3" width="3" height="3" fill="#8B1A1A" />
          </g>
        ))}

        {/* Header cartouche */}
        <g transform="translate(72 124)" opacity="0.95">
          <rect x="-10" y="-26" width="380" height="48" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="1.2" />
          <text x="6" y="0" fontFamily="Playfair Display, Georgia, serif" fontWeight="700" fontStyle="italic" fontSize="22" fill="#1A1A1A">
            LEPONEUS · pavimentum
          </text>
          <text x="6" y="18" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.26em" fill="#6B6B6B">
            TESSERA · XII · ANTE OBSERVATA
          </text>
        </g>

        {/* Footer axiom — set inside a small mosaic plaque */}
        <g transform={`translate(72 ${pageH - 90})`}>
          <rect x="-10" y="-20" width="360" height="48" fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="1.2" />
          <text x="6" y="0" fontFamily="'Space Mono', monospace" fontWeight="700" fontSize="11" letterSpacing="0.28em" fill="#A04020">
            WALKED FOR CENTURIES
          </text>
          <text x="6" y="16" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.22em" fill="#6B6B6B">
            the field outlives the runner · the floor remembers
          </text>
        </g>
      </svg>
    </>
  );
}
