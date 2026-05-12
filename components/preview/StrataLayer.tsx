"use client";

import { useState, useEffect } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * StrataLayer — vertical earth-band descent.
 *
 * The page is a naturalist's cross-section of soil. As you scroll down,
 * you pass through mineral layers: topsoil → clay → caliche → bedrock.
 * Hair-thin root systems thread the upper bands; pebble and stone
 * silhouettes settle into the lower ones. The cream cools and quiets
 * with depth. The page is a den dug deep.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.30,
  standard: 0.55,
  heavy: 0.82,
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

export function StrataLayer() {
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

  // Deterministic pebbles
  const rng = seededJitter(41);
  const pebbles: Array<{ x: number; y: number; r: number }> = [];
  for (let i = 0; i < 80; i++) {
    pebbles.push({
      x: rng() * 1440,
      y: pageH * 0.55 + rng() * pageH * 0.45,
      r: 2 + rng() * 5,
    });
  }
  const roots: string[] = [];
  for (let i = 0; i < 18; i++) {
    const x = 60 + i * 76 + rng() * 30;
    const startY = pageH * 0.05;
    const endY = pageH * (0.18 + rng() * 0.35);
    const cp1x = x + (rng() - 0.5) * 60;
    const cp2x = x + (rng() - 0.5) * 80;
    roots.push(`M${x} ${startY} C${cp1x} ${startY + (endY - startY) * 0.5} ${cp2x} ${endY - 20} ${x + (rng() - 0.5) * 40} ${endY}`);
  }

  return (
    <>
      <IntensityToggle label="Strata" value={intensity} onChange={setIntensity} />

      {/* Strata band gradient — full-height, behind everything */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: pageH,
          pointerEvents: "none",
          zIndex: 4,
          opacity: op,
          mixBlendMode: "multiply",
          transition: "opacity 320ms",
          background: `linear-gradient(180deg,
            rgba(250,247,242,0) 0%,
            rgba(232,228,223,0.32) 12%,
            rgba(210,194,168,0.28) 30%,
            rgba(168,140,108,0.32) 52%,
            rgba(120,96,72,0.38) 74%,
            rgba(72,56,40,0.55) 92%,
            rgba(40,32,24,0.65) 100%
          )`,
        }}
      />

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
        {/* ─── Stratigraphic boundary lines + labels ─── */}
        {[
          { y: 0.12, label: "TOPSOIL" },
          { y: 0.30, label: "CLAY" },
          { y: 0.52, label: "CALICHE" },
          { y: 0.74, label: "STONE" },
          { y: 0.92, label: "BEDROCK" },
        ].map((b, i) => {
          const y = pageH * b.y;
          return (
            <g key={i}>
              <line x1="0" y1={y} x2="1440" y2={y} stroke="#1A1A1A" strokeWidth="0.5" strokeDasharray="3 5" opacity="0.45" />
              <text
                x="40"
                y={y - 8}
                fontFamily="'Space Mono', monospace"
                fontSize="9"
                letterSpacing="0.24em"
                fill="#1A1A1A"
                opacity="0.6"
              >
                — {b.label}
              </text>
              <text
                x="1400"
                y={y - 8}
                textAnchor="end"
                fontFamily="'Space Mono', monospace"
                fontSize="9"
                letterSpacing="0.24em"
                fill="#1A1A1A"
                opacity="0.45"
              >
                {`${Math.round(b.y * 100)}cm`}
              </text>
            </g>
          );
        })}

        {/* ─── Root systems threading the upper strata ─── */}
        <g stroke="#1A1A1A" strokeWidth="0.7" fill="none" opacity="0.55">
          {roots.map((d, i) => (
            <path key={i} d={d} />
          ))}
          {/* Hair-roots branching off */}
          {roots.map((_, i) => {
            const x = 60 + i * 76;
            const y = pageH * 0.2;
            return (
              <g key={`hr${i}`} opacity="0.5">
                <path d={`M${x} ${y} q-8 8 -16 6`} strokeWidth="0.4" />
                <path d={`M${x} ${y + 30} q10 6 16 4`} strokeWidth="0.4" />
                <path d={`M${x} ${y + 60} q-6 10 -12 8`} strokeWidth="0.4" />
              </g>
            );
          })}
        </g>

        {/* ─── Pebbles settling into lower strata ─── */}
        <g fill="#1A1A1A" opacity="0.7">
          {pebbles.map((p, i) => (
            <ellipse key={i} cx={p.x} cy={p.y} rx={p.r} ry={p.r * 0.7} />
          ))}
        </g>

        {/* ─── A buried chamber silhouette in bedrock ─── */}
        <g transform={`translate(720 ${pageH * 0.88})`} fill="#1A1A1A" opacity="0.55">
          <path d="M-90 0 Q-90 -42 -50 -54 Q0 -64 50 -54 Q90 -42 90 0 Z" />
          {/* Carapace lines suggesting the resident */}
          <g stroke="#FAF7F2" strokeWidth="0.5" fill="none" opacity="0.55">
            <path d="M-40 -42 Q0 -50 40 -42" />
            <path d="M-50 -28 Q0 -34 50 -28" />
            <path d="M-55 -12 Q0 -16 55 -12" />
          </g>
        </g>
      </svg>
    </>
  );
}
