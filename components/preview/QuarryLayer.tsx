"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * QuarryLayer — ancient survival logic carved into the page.
 *
 * The page is a stone tablet. Field-stone hex fragments scattered
 * across the surface (some broken, some intact). Engraved route
 * grooves trace down the page in single confident chisel strokes.
 * Fossilized hare-print and tortoise-drag impressions are embossed
 * along the routes (rendered with the double-line indent trick so
 * they read as depressions, not drawings). Small hare-movement
 * vector arrows mark direction. Restrained crimson pressure stamps
 * punctuate at key intervals.
 *
 * Hues: ink (#1A1A1A), warm bone (#E8DCC4), restrained crimson
 * (#8B1A1A). Cream is the stone face.
 *
 * Tone: ancient, durable, disciplined. Survival learned over
 * centuries and carved into rock.
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

function hexPoints(cx: number, cy: number, r: number, rot = 0) {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rot;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Irregular weathered hex — a hex with two random vertices chipped off (replaced by a notch). */
function chippedHexPath(cx: number, cy: number, r: number, rng: () => number) {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    pts.push([cx + Math.cos(a) * r * (0.92 + rng() * 0.14), cy + Math.sin(a) * r * (0.92 + rng() * 0.14)]);
  }
  // Random chip on one vertex
  const chip = Math.floor(rng() * 6);
  pts[chip] = [pts[chip][0] + (rng() - 0.5) * r * 0.5, pts[chip][1] + (rng() - 0.5) * r * 0.5];
  return "M " + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ") + " Z";
}

const PRESSURE_TAGS = [
  "PRESSURE WITNESSED",
  "ENDURANCE LOGGED",
  "ROUTE CONFIRMED",
  "FAULT DOCUMENTED",
  "FORM HELD",
  "PASS · NO RECORD",
];

export function QuarryLayer() {
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
    const rng = seededJitter(3061);

    // Field-stone hex fragments — irregular weathered shapes scattered through the page
    type Stone = { cx: number; cy: number; r: number; path: string; rot: number; broken: boolean };
    const stones: Stone[] = [];
    for (let i = 0; i < 18; i++) {
      const cx = 80 + rng() * 1280;
      const cy = 280 + rng() * (pageH - 480);
      const r = 36 + rng() * 64;
      stones.push({
        cx,
        cy,
        r,
        path: chippedHexPath(cx, cy, r, rng),
        rot: (rng() - 0.5) * 40,
        broken: rng() > 0.62,
      });
    }

    // Engraved route grooves — 3 long sweeping curves descending the page
    type Route = { d: string };
    const routes: Route[] = [];
    for (let r = 0; r < 3; r++) {
      const startX = 140 + r * 440;
      const points: string[] = [`M ${startX} 200`];
      let y = 200;
      let x = startX;
      while (y < pageH - 100) {
        const nx = Math.max(80, Math.min(1360, x + (rng() - 0.5) * 280));
        const ny = y + 220 + rng() * 80;
        const cpx = (x + nx) / 2 + (rng() - 0.5) * 90;
        const cpy = (y + ny) / 2;
        points.push(`Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`);
        x = nx;
        y = ny;
      }
      routes.push({ d: points.join(" ") });
    }

    // Fossilized track impressions along the routes — embossed prints
    type Impression = { x: number; y: number; kind: "hare" | "tortoise"; angle: number };
    const impressions: Impression[] = [];
    for (let i = 0; i < 26; i++) {
      impressions.push({
        x: 140 + rng() * 1180,
        y: 300 + rng() * (pageH - 500),
        kind: rng() > 0.45 ? "hare" : "tortoise",
        angle: rng() * 360,
      });
    }

    // Hare movement vector arrows in the margins
    type Vector = { x: number; y: number; angle: number };
    const vectors: Vector[] = [];
    for (let i = 0; i < 10; i++) {
      const onLeft = i % 2 === 0;
      vectors.push({
        x: onLeft ? 36 + rng() * 26 : 1380 - rng() * 26,
        y: 280 + rng() * (pageH - 520),
        angle: onLeft ? 24 + rng() * 30 : 156 + rng() * 30,
      });
    }

    // Crimson pressure stamps at key intervals along routes
    type Stamp = { x: number; y: number; text: string; rot: number };
    const stamps: Stamp[] = [];
    for (let i = 0; i < 5; i++) {
      stamps.push({
        x: i % 2 === 0 ? 280 : 1080,
        y: 380 + i * (pageH / 5.5),
        text: PRESSURE_TAGS[i % PRESSURE_TAGS.length],
        rot: (rng() - 0.5) * 10,
      });
    }

    return { stones, routes, impressions, vectors, stamps };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Quarry" value={intensity} onChange={setIntensity} />

      {/* L1: warm-bone tonal wash — stone face, weathered */}
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
          opacity: op * 0.55,
          mixBlendMode: "multiply",
          background: `
            radial-gradient(ellipse at 18% 18%, rgba(168,140,108,0.22), transparent 50%),
            radial-gradient(ellipse at 82% 30%, rgba(168,140,108,0.18), transparent 55%),
            radial-gradient(ellipse at 50% 80%, rgba(140,116,88,0.16), transparent 60%),
            repeating-linear-gradient(96deg, rgba(122,98,68,0.04) 0, rgba(122,98,68,0.04) 1px, transparent 1px, transparent 6px)
          `,
          transition: "opacity 320ms",
        }}
      />

      {/* L2: ink — stones, route grooves, embossed tracks, vectors */}
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
        {/* Engraved route grooves — double-stroke trick for chiseled-into-stone feel */}
        <g fill="none" strokeLinecap="round" opacity="0.78">
          {layout.routes.map((r, i) => (
            <g key={i}>
              <path d={r.d} stroke="#1A1A1A" strokeWidth="2.6" />
              {/* Highlight stroke offset slightly — reads as carved depth */}
              <path d={r.d} stroke="#FAF7F2" strokeWidth="0.8" transform="translate(1.5 -1.5)" opacity="0.5" />
            </g>
          ))}
        </g>

        {/* Field-stone hex fragments */}
        {layout.stones.map((st, i) => (
          <g key={i} transform={`rotate(${st.rot} ${st.cx} ${st.cy})`}>
            {/* Stone body */}
            <path d={st.path} fill="#E8DCC4" stroke="#1A1A1A" strokeWidth="1.2" />
            {/* Weathered cross-hatch on stone face */}
            {Array.from({ length: 6 }).map((_, k) => {
              const a = (k / 6) * Math.PI * 2 - Math.PI / 2;
              return (
                <line
                  key={k}
                  x1={st.cx + Math.cos(a) * st.r * 0.35}
                  y1={st.cy + Math.sin(a) * st.r * 0.35}
                  x2={st.cx + Math.cos(a) * st.r * 0.78}
                  y2={st.cy + Math.sin(a) * st.r * 0.78}
                  stroke="#1A1A1A"
                  strokeWidth="0.4"
                  opacity="0.5"
                />
              );
            })}
            {/* Scute carved into the stone (concentric inner hex) */}
            <polygon points={hexPoints(st.cx, st.cy, st.r * 0.32)} fill="none" stroke="#1A1A1A" strokeWidth="0.7" opacity="0.7" />
            <circle cx={st.cx} cy={st.cy} r="1.4" fill="#1A1A1A" />
            {/* If broken, draw a fracture line through it */}
            {st.broken && (
              <line
                x1={st.cx - st.r * 0.8}
                y1={st.cy - st.r * 0.3}
                x2={st.cx + st.r * 0.9}
                y2={st.cy + st.r * 0.4}
                stroke="#1A1A1A"
                strokeWidth="0.9"
                strokeDasharray="6 4"
                opacity="0.65"
              />
            )}
          </g>
        ))}

        {/* Fossilized track impressions — embossed (drawn shape + inset shadow) */}
        {layout.impressions.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}>
            {/* Shadow / depression layer — slightly offset, lighter */}
            <g fill="#FAF7F2" opacity="0.7">
              {p.kind === "hare" ? (
                <g transform="translate(1.5 -1)">
                  <ellipse cx="-4" cy="-2" rx="2.8" ry="5" />
                  <ellipse cx="4" cy="-1" rx="2.8" ry="5" />
                  <circle cx="-2" cy="6" r="1.4" />
                  <circle cx="3" cy="7" r="1.4" />
                </g>
              ) : (
                <g transform="translate(1.5 -1)">
                  <line x1="-3" y1="-3" x2="0" y2="0" stroke="#FAF7F2" strokeWidth="1" />
                  <line x1="0" y1="-4" x2="0" y2="0" stroke="#FAF7F2" strokeWidth="1" />
                  <line x1="3" y1="-3" x2="0" y2="0" stroke="#FAF7F2" strokeWidth="1" />
                  <circle cx="0" cy="2" r="1.4" />
                  <line x1="0" y1="3" x2="0" y2="10" stroke="#FAF7F2" strokeWidth="1" />
                </g>
              )}
            </g>
            {/* Ink track layer — main drawn shape */}
            <g fill="#1A1A1A">
              {p.kind === "hare" ? (
                <>
                  <ellipse cx="-4" cy="-2" rx="2.8" ry="5" />
                  <ellipse cx="4" cy="-1" rx="2.8" ry="5" />
                  <circle cx="-2" cy="6" r="1.4" />
                  <circle cx="3" cy="7" r="1.4" />
                </>
              ) : (
                <>
                  <line x1="-3" y1="-3" x2="0" y2="0" stroke="#1A1A1A" strokeWidth="0.8" />
                  <line x1="0" y1="-4" x2="0" y2="0" stroke="#1A1A1A" strokeWidth="0.8" />
                  <line x1="3" y1="-3" x2="0" y2="0" stroke="#1A1A1A" strokeWidth="0.8" />
                  <circle cx="0" cy="2" r="1.2" />
                  <line x1="0" y1="3" x2="0" y2="10" stroke="#1A1A1A" strokeWidth="0.8" />
                  <circle cx="0" cy="12" r="1.2" />
                </>
              )}
            </g>
          </g>
        ))}

        {/* Hare movement vector arrows in margins */}
        <g stroke="#1A1A1A" fill="#1A1A1A" strokeWidth="0.9" opacity="0.75">
          {layout.vectors.map((v, i) => (
            <g key={i} transform={`translate(${v.x} ${v.y}) rotate(${v.angle})`}>
              <line x1="0" y1="0" x2="24" y2="0" />
              <path d="M 24 0 l -5 -3 l 0 6 z" />
            </g>
          ))}
        </g>

        {/* Top-left cartouche */}
        <g transform="translate(72 124)" opacity="0.88">
          <text x="0" y="0" fontFamily="Playfair Display, Georgia, serif" fontWeight="700" fontStyle="italic" fontSize="22" fill="#1A1A1A">
            QUARRY · Leponeus
          </text>
          <text x="0" y="20" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.26em" fill="#6B6B6B">
            STONE TABLET XII · SURVIVAL CARVED
          </text>
          <line x1="0" y1="30" x2="320" y2="30" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.55" />
        </g>

        {/* Footer carved axiom */}
        <g transform={`translate(72 ${pageH - 60})`} opacity="0.78">
          <text x="0" y="0" fontFamily="'Space Mono', monospace" fontWeight="700" fontSize="10" letterSpacing="0.26em" fill="#1A1A1A">
            CARVED FOR ENDURANCE
          </text>
          <text x="0" y="14" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill="#6B6B6B">
            the stone outlasts the runner · the lesson outlasts the stone
          </text>
        </g>
      </svg>

      {/* L3: crimson pressure stamps (not multiplied — saturated) */}
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
          opacity: op * 0.95,
          transition: "opacity 320ms",
        }}
      >
        {layout.stamps.map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.rot})`}>
            <g stroke="#8B1A1A" fill="none" strokeWidth="1.4">
              <rect x="-78" y="-14" width="156" height="28" />
              <rect x="-74" y="-10" width="148" height="20" strokeWidth="0.7" />
              <text x="0" y="5" fontFamily="'Space Mono', monospace" fontSize="11" letterSpacing="0.30em" fill="#8B1A1A" stroke="none" textAnchor="middle" fontWeight="700">
                {s.text}
              </text>
            </g>
          </g>
        ))}
      </svg>
    </>
  );
}
