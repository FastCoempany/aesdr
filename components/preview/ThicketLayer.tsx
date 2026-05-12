"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * ThicketLayer — shell + bramble + predator eyes.
 *
 * Layered tortoise-shell polygons ghost across the page, big and faint,
 * like architectural etching. Bramble/thicket forms tangle in the
 * corners. Sparse grass blades + field shadows. Hare-ear silhouettes
 * hidden in the negative space between sections. A few tiny etched
 * predator eyes glint from the edges — almost invisible — like
 * something is watching from the treeline.
 *
 * Section dividers built from shell-plate edges.
 *
 * Tone: the field is not safe. That is why training exists.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.30,
  standard: 0.55,
  heavy: 0.85,
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
    const a = ((i / 6) * Math.PI * 2) + rot;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
}

export function ThicketLayer() {
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

  const placements = useMemo(() => {
    const rng = seededJitter(127);

    // Big ghosted shell hexagons (one per ~600px vertical band)
    const shells: Array<{ cx: number; cy: number; r: number }> = [];
    const rows = Math.ceil(pageH / 700);
    for (let i = 0; i < rows; i++) {
      const cx = (i % 2 === 0 ? 280 : 1160) + (rng() - 0.5) * 80;
      const cy = 240 + i * 700 + (rng() - 0.5) * 80;
      const r = 180 + rng() * 60;
      shells.push({ cx, cy, r });
    }

    // Section divider Ys with shell-edge style
    const dividers: number[] = [];
    for (let i = 1; i < rows; i++) dividers.push(i * (pageH / rows));

    // Hare-ears in negative space between sections
    const hareEars: Array<{ x: number; y: number; flip: boolean }> = [];
    dividers.forEach((y, i) => {
      hareEars.push({ x: i % 2 === 0 ? 720 : 540, y: y - 8, flip: i % 2 === 1 });
    });

    // Bramble in all 4 corners
    const bramble = [
      { x: 30, y: 80, scale: 1 },
      { x: 1340, y: 80, scale: 1 },
      { x: 30, y: pageH - 220, scale: 1 },
      { x: 1340, y: pageH - 220, scale: 1 },
    ];

    // Predator eyes — pairs of tiny dots near edges, at irregular intervals
    const eyes: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 8; i++) {
      const onLeft = rng() > 0.5;
      eyes.push({
        x: onLeft ? 20 + rng() * 30 : 1400 - rng() * 30,
        y: 300 + rng() * (pageH - 600),
      });
    }

    // Sparse grass blades scattered
    const grass: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 60; i++) grass.push({ x: rng() * 1440, y: rng() * pageH });

    // Watch-points (small lookout posts) on the high ground at section breaks
    const watchPoints: Array<{ x: number; y: number }> = [];
    [0.18, 0.52, 0.84].forEach((p) => {
      watchPoints.push({ x: 1200 + rng() * 100, y: pageH * p });
    });

    return { shells, dividers, hareEars, bramble, eyes, grass, watchPoints };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Thicket" value={intensity} onChange={setIntensity} />

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
          zIndex: 0,
          opacity: op,
          transition: "opacity 320ms",
        }}
      >
        {/* ─── Sparse grass field ─── */}
        <g stroke="#1A1A1A" strokeWidth="0.4" fill="none" opacity="0.35">
          {placements.grass.map((g, i) => (
            <path key={i} d={`M${g.x} ${g.y} q1 -8 ${1 + (i % 3)} -11`} />
          ))}
        </g>

        {/* ─── Big ghosted shell hexagons ─── */}
        <g stroke="#1A1A1A" fill="none" opacity="0.42">
          {placements.shells.map((s, i) => (
            <g key={i}>
              <polygon points={hexPoints(s.cx, s.cy, s.r)} strokeWidth="1.2" />
              <polygon points={hexPoints(s.cx, s.cy, s.r * 0.78)} strokeWidth="0.7" opacity="0.7" />
              <polygon points={hexPoints(s.cx, s.cy, s.r * 0.58)} strokeWidth="0.5" opacity="0.55" />
              <polygon points={hexPoints(s.cx, s.cy, s.r * 0.4)} strokeWidth="0.4" opacity="0.45" />
              <polygon points={hexPoints(s.cx, s.cy, s.r * 0.22)} strokeWidth="0.4" opacity="0.4" />
              {/* Apex dot */}
              <circle cx={s.cx} cy={s.cy} r="1.2" fill="#1A1A1A" opacity="0.55" />
              {/* Plate seam-spokes */}
              {Array.from({ length: 6 }).map((_, k) => {
                const a = (k / 6) * Math.PI * 2;
                return (
                  <line
                    key={k}
                    x1={s.cx + Math.cos(a) * 6}
                    y1={s.cy + Math.sin(a) * 6}
                    x2={s.cx + Math.cos(a) * s.r}
                    y2={s.cy + Math.sin(a) * s.r}
                    strokeWidth="0.3"
                    opacity="0.45"
                  />
                );
              })}
            </g>
          ))}
        </g>

        {/* ─── Section dividers built from shell-plate edges ─── */}
        {placements.dividers.map((y, i) => (
          <g key={`div${i}`} opacity="0.55">
            {Array.from({ length: 10 }).map((_, j) => {
              const x = 80 + j * 132;
              return (
                <polygon
                  key={j}
                  points={hexPoints(x, y, 14)}
                  fill="none"
                  stroke="#1A1A1A"
                  strokeWidth="0.55"
                />
              );
            })}
            <line x1="80" y1={y} x2="1400" y2={y} stroke="#1A1A1A" strokeWidth="0.4" strokeDasharray="2 6" opacity="0.5" />
          </g>
        ))}

        {/* ─── Hare-ear silhouettes hidden in negative space ─── */}
        <g fill="#1A1A1A" opacity="0.45">
          {placements.hareEars.map((e, i) => (
            <g key={i} transform={`translate(${e.x} ${e.y}) ${e.flip ? "scale(-1 1)" : ""}`}>
              <ellipse cx="-4" cy="-26" rx="3" ry="26" transform="rotate(-9 -4 -26)" />
              <ellipse cx="8" cy="-28" rx="3" ry="26" transform="rotate(9 8 -28)" />
            </g>
          ))}
        </g>

        {/* ─── Bramble in corners ─── */}
        {placements.bramble.map((b, i) => (
          <g key={`br${i}`} transform={`translate(${b.x} ${b.y}) scale(${b.scale})`} stroke="#1A1A1A" strokeWidth="0.7" fill="none" opacity="0.7">
            <path d="M0 0 L40 16 L12 28 L52 40 L20 52 L60 64 L26 72 L62 88" />
            <path d="M10 4 L46 22 L18 32 L48 48" />
            <path d="M28 0 L48 20 L24 40 L56 56" />
            {/* Thorns */}
            {Array.from({ length: 8 }).map((_, k) => (
              <line key={k} x1={k * 7} y1={k * 8} x2={k * 7 + 3} y2={k * 8 - 4} strokeWidth="0.5" />
            ))}
          </g>
        ))}

        {/* ─── Predator eyes — tiny pairs from the edges ─── */}
        <g fill="#1A1A1A" opacity="0.65">
          {placements.eyes.map((e, i) => (
            <g key={i} transform={`translate(${e.x} ${e.y})`}>
              <circle cx="0" cy="0" r="1.2" />
              <circle cx="8" cy="0" r="1.2" />
              {/* Faint indent shadow under */}
              <line x1="-2" y1="3" x2="10" y2="3" stroke="#1A1A1A" strokeWidth="0.4" opacity="0.5" />
            </g>
          ))}
        </g>

        {/* ─── Watch-points: lookout posts on high ground ─── */}
        <g stroke="#1A1A1A" strokeWidth="0.6" fill="none" opacity="0.55">
          {placements.watchPoints.map((w, i) => (
            <g key={i} transform={`translate(${w.x} ${w.y})`}>
              {/* Post */}
              <line x1="0" y1="-26" x2="0" y2="0" strokeWidth="1.2" />
              {/* Crow's-nest box */}
              <rect x="-8" y="-34" width="16" height="8" />
              {/* Ground hatching */}
              {Array.from({ length: 5 }).map((_, k) => (
                <line key={k} x1={-10 + k * 5} y1="4" x2={-12 + k * 5} y2="8" strokeWidth="0.4" />
              ))}
              <text
                x="14"
                y="-30"
                fontFamily="'Space Mono', monospace"
                fontSize="8"
                letterSpacing="0.20em"
                fill="#1A1A1A"
                opacity="0.7"
              >
                watch
              </text>
            </g>
          ))}
        </g>

        {/* ─── Field axiom in lower-right ─── */}
        <g transform={`translate(1340 ${pageH - 60})`} opacity="0.65">
          <text
            x="0"
            y="0"
            fontFamily="'Space Mono', monospace"
            fontSize="9"
            letterSpacing="0.22em"
            fill="#1A1A1A"
            textAnchor="end"
          >
            SHELL & SPRINT
          </text>
          <text
            x="0"
            y="14"
            fontFamily="'Space Mono', monospace"
            fontSize="8"
            letterSpacing="0.18em"
            fill="#6B6B6B"
            textAnchor="end"
          >
            the field is not safe
          </text>
        </g>
      </svg>
    </>
  );
}
