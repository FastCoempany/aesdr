"use client";

import { useState, useEffect } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * ScrubLayer — Aesop's hillside at golden hour.
 *
 * Mediterranean maquis: dry grass tufts at section feet, olive branch
 * flourishes in upper corners, a low stone-wall fragment crossing the
 * page mid-way, scattered pebble silhouettes, and a distant cypress
 * silhouette anchoring the final CTA region. A pale amber wash sits
 * over cream — warm dusk light, not shimmer.
 *
 * Hare ears occasionally peek up at section transitions (silhouetted
 * triangles in negative space). All editorial palette — ink silhouettes
 * on warm cream, no color.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.32,
  standard: 0.58,
  heavy: 0.88,
};

export function ScrubLayer() {
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [pageH, setPageH] = useState(5200);

  useEffect(() => {
    function measure() {
      queueMicrotask(() => setPageH(Math.max(document.documentElement.scrollHeight, 5200)));
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

  // Section breakpoints (approximate page-relative positions) where motifs anchor.
  const sectionYs = [0.06, 0.18, 0.30, 0.42, 0.54, 0.66, 0.78, 0.90];

  return (
    <>
      <IntensityToggle label="Scrub" value={intensity} onChange={setIntensity} />

      {/* Golden-hour amber wash */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 4,
          opacity: op * 0.55,
          background:
            "radial-gradient(ellipse at 80% 90%, rgba(212,160,96,0.45) 0%, rgba(212,160,96,0.18) 35%, transparent 70%)",
          mixBlendMode: "multiply",
          transition: "opacity 320ms",
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
        {/* ─── Olive branch in upper-left corner ─── */}
        <g transform="translate(-30 90)" stroke="#1A1A1A" fill="#1A1A1A" opacity="0.55">
          <path d="M0 0 Q120 40 240 30" strokeWidth="1.6" fill="none" />
          {/* Leaves along the branch */}
          {Array.from({ length: 14 }).map((_, i) => {
            const t = i / 13;
            const x = 240 * t;
            const y = 30 * t + (t < 0.5 ? -t * 8 : -8 + (t - 0.5) * 4);
            const angle = i % 2 === 0 ? 32 : -32;
            return (
              <ellipse
                key={i}
                cx={x}
                cy={y - 6}
                rx="12"
                ry="3.6"
                transform={`rotate(${angle} ${x} ${y - 6})`}
              />
            );
          })}
          {/* Two small olives */}
          <circle cx="180" cy="20" r="3" />
          <circle cx="208" cy="26" r="3" />
        </g>

        {/* ─── Olive branch in upper-right corner (mirrored, smaller) ─── */}
        <g transform="translate(1440 130) scale(-0.75 0.75)" stroke="#1A1A1A" fill="#1A1A1A" opacity="0.4">
          <path d="M0 0 Q120 40 240 30" strokeWidth="1.6" fill="none" />
          {Array.from({ length: 10 }).map((_, i) => {
            const t = i / 9;
            const x = 240 * t;
            const y = 30 * t - 6;
            const angle = i % 2 === 0 ? 32 : -32;
            return (
              <ellipse key={i} cx={x} cy={y} rx="11" ry="3.4" transform={`rotate(${angle} ${x} ${y})`} />
            );
          })}
        </g>

        {/* ─── Grass tufts and pebbles at each section foot ─── */}
        {sectionYs.map((p, idx) => {
          const y = pageH * p;
          return (
            <g key={`gr${idx}`} transform={`translate(0 ${y})`} opacity="0.62">
              {/* Grass tufts along the bottom edge of the section */}
              {[80, 220, 360, 1080, 1240, 1360].map((cx, i) => (
                <g key={i} transform={`translate(${cx} 0)`} stroke="#1A1A1A" fill="none" strokeWidth="0.8">
                  <path d="M0 0 q-2 -14 -1 -22" />
                  <path d="M3 0 q1 -10 2 -16" />
                  <path d="M-3 0 q-1 -12 -3 -20" />
                  <path d="M6 0 q3 -9 5 -14" />
                  <path d="M-6 0 q-3 -11 -6 -16" />
                </g>
              ))}
              {/* Pebbles between grass */}
              {[150, 290, 1150, 1310].map((cx, i) => (
                <ellipse key={`p${i}`} cx={cx} cy={-3} rx="6" ry="2.4" fill="#1A1A1A" />
              ))}
            </g>
          );
        })}

        {/* ─── Low stone wall fragment crossing mid-page ─── */}
        <g transform={`translate(120 ${pageH * 0.46})`} fill="#1A1A1A" opacity="0.42">
          {/* Stacked irregular stones */}
          {[
            [0, 0, 60, 16],
            [56, -2, 52, 18],
            [104, -1, 48, 14],
            [148, 1, 56, 16],
            [200, -3, 50, 18],
            [248, 0, 54, 14],
            [298, -2, 48, 16],
            [344, 1, 52, 14],
            [394, -1, 46, 18],
            [438, 0, 50, 16],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx={4} />
          ))}
          {/* Lower row */}
          {[
            [-20, 16, 70, 14],
            [48, 14, 56, 16],
            [102, 16, 60, 14],
            [160, 14, 52, 16],
            [210, 16, 58, 14],
            [266, 14, 54, 16],
            [318, 16, 50, 14],
            [366, 14, 56, 16],
            [420, 16, 52, 14],
          ].map(([x, y, w, h], i) => (
            <rect key={`b${i}`} x={x} y={y} width={w} height={h} rx={4} />
          ))}
        </g>

        {/* ─── Hare ears peeking up at section transitions ─── */}
        {[0.22, 0.5, 0.74].map((p, i) => (
          <g key={`ears${i}`} transform={`translate(${1290 - i * 60} ${pageH * p})`} fill="#1A1A1A" opacity="0.62">
            {/* Two long pointed ovals */}
            <ellipse cx="0" cy="0" rx="3" ry="22" transform="rotate(-10 0 0)" />
            <ellipse cx="14" cy="-2" rx="3" ry="22" transform="rotate(12 14 -2)" />
            {/* Suggestion of head */}
            <ellipse cx="7" cy="22" rx="14" ry="9" opacity="0.55" />
          </g>
        ))}

        {/* ─── Distant cypress silhouette in final region ─── */}
        <g transform={`translate(180 ${pageH * 0.87})`} fill="#1A1A1A" opacity="0.55">
          {/* Tall narrow tree */}
          <path d="M0 0 q-9 -90 0 -180 q9 90 0 180 z" />
          {/* Trunk */}
          <rect x="-2" y="0" width="4" height="14" />
          {/* Ground line */}
          <line x1="-30" y1="14" x2="30" y2="14" stroke="#1A1A1A" strokeWidth="0.8" />
        </g>

        {/* ─── Distant cypress smaller, second one ─── */}
        <g transform={`translate(1280 ${pageH * 0.89}) scale(0.65)`} fill="#1A1A1A" opacity="0.45">
          <path d="M0 0 q-9 -90 0 -180 q9 90 0 180 z" />
          <rect x="-2" y="0" width="4" height="14" />
        </g>
      </svg>
    </>
  );
}
