"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * TracksLayer — the fable read as footprints down the gutters.
 *
 * Left gutter: hare's 4-print stagger. Bursts of acceleration separated
 * by gaps. Around mid-page the prints stop at a flattened patch of
 * grass — the form where the hare slept.
 *
 * Right gutter: tortoise's drag-track. Continuous claw-print + plastron
 * drag, slow and steady, never breaking rhythm. Passes the hare's
 * resting form mid-page and continues to the bottom.
 *
 * Top-of-page reads as dawn (cool cream), bottom reads as dusk
 * (warmer amber wash). The page IS the course.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.32,
  standard: 0.58,
  heavy: 0.85,
};

const FALLBACK_HEIGHT = 5200;

/** Tiny deterministic LCG so SSR and client agree on jitter values. */
function seededJitter(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function TracksLayer() {
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [pageH, setPageH] = useState(FALLBACK_HEIGHT);

  useEffect(() => {
    function measure() {
      const h = Math.max(document.documentElement.scrollHeight, FALLBACK_HEIGHT);
      queueMicrotask(() => setPageH(h));
    }
    measure();
    window.addEventListener("resize", measure);
    const t = setInterval(measure, 800);
    return () => {
      window.removeEventListener("resize", measure);
      clearInterval(t);
    };
  }, []);

  const opacity = OP[intensity];
  const formY = Math.round(pageH * 0.42);

  // Hare bursts — deterministic by index.
  const hareTrack = useMemo(() => {
    const rng = seededJitter(17);
    const out: number[] = [];
    let y = 80;
    while (y < pageH) {
      const burst = 4 + Math.floor(rng() * 3);
      for (let i = 0; i < burst; i++) {
        out.push(y);
        y += 36 + rng() * 14;
      }
      y += 90 + rng() * 70;
    }
    return out;
  }, [pageH]);

  // Tortoise drag — steady, every ~52px.
  const tortoiseTrack = useMemo(() => {
    const out: number[] = [];
    for (let t = 60; t < pageH; t += 52) out.push(t);
    return out;
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Tracks" value={intensity} onChange={setIntensity} />

      {/* Dawn/dusk amber wash */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 4,
          opacity: opacity * 0.55,
          background:
            "linear-gradient(180deg, rgba(232,228,223,0.6) 0%, rgba(250,247,242,0) 18%, rgba(250,247,242,0) 72%, rgba(212,176,128,0.32) 100%)",
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
          opacity,
          mixBlendMode: "multiply",
          transition: "opacity 320ms",
        }}
      >
        {/* ─── LEFT: hare 4-print bursts ─── */}
        <g fill="#1A1A1A" opacity={0.78}>
          {hareTrack.map((py, i) => {
            const zig = (i % 2 === 0 ? 0 : 14) - 7;
            const baseX = 64 + zig;
            const dist = Math.abs(py - formY);
            const fade = dist < 280 ? 0.35 + (dist / 280) * 0.55 : 1;
            return (
              <g key={`h${i}`} opacity={fade}>
                {/* Hind pair leading */}
                <ellipse cx={baseX - 6} cy={py} rx="3.2" ry="6" />
                <ellipse cx={baseX + 8} cy={py + 2} rx="3.2" ry="6" />
                {/* Fore pair trailing */}
                <circle cx={baseX - 4} cy={py + 14} r="1.6" />
                <circle cx={baseX + 6} cy={py + 16} r="1.6" />
              </g>
            );
          })}

          {/* The form: flattened patch where the hare slept */}
          <g transform={`translate(50 ${formY})`}>
            <ellipse cx="20" cy="0" rx="32" ry="9" fill="none" stroke="#1A1A1A" strokeWidth="0.8" opacity="0.55" />
            <ellipse cx="20" cy="0" rx="24" ry="6" fill="none" stroke="#1A1A1A" strokeWidth="0.5" opacity="0.4" />
            {Array.from({ length: 9 }).map((_, i) => (
              <path
                key={i}
                d={`M${4 + i * 4} -2 q1 -7 ${2 + (i % 3)} -9`}
                stroke="#1A1A1A"
                strokeWidth="0.6"
                fill="none"
                opacity="0.45"
              />
            ))}
            <text
              x="64"
              y="3"
              fontFamily="'Space Mono', monospace"
              fontSize="9"
              letterSpacing="0.18em"
              fill="#1A1A1A"
              opacity="0.55"
            >
              FORM
            </text>
          </g>
        </g>

        {/* ─── RIGHT: tortoise drag-track ─── */}
        <g stroke="#1A1A1A" strokeWidth="0.7" fill="#1A1A1A" opacity="0.7">
          <path
            d={
              "M1376 60 " +
              tortoiseTrack
                .map((ty, i) => `Q${1376 + (i % 2 ? 4 : -4)} ${ty - 26} 1376 ${ty}`)
                .join(" ")
            }
            fill="none"
            strokeDasharray="2 3"
          />
          {tortoiseTrack.map((ty, i) => {
            const side = i % 2 === 0 ? -1 : 1;
            const cx = 1376 + side * 11;
            return (
              <g key={`t${i}`} transform={`translate(${cx} ${ty})`}>
                <line x1="-3" y1="-3" x2="0" y2="0" />
                <line x1="0" y1="-4" x2="0" y2="0" />
                <line x1="3" y1="-3" x2="0" y2="0" />
                <circle cx="0" cy="1.5" r="1.1" />
              </g>
            );
          })}
        </g>

        {/* Section labels: DAWN / PASS / FORM / DUSK */}
        <g fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.22em" fill="#6B6B6B" opacity="0.55">
          {[0.08, 0.32, 0.58, 0.82].map((p, i) => (
            <text key={i} x="1400" y={pageH * p} textAnchor="end">
              {["DAWN", "PASS", "FORM", "DUSK"][i]}
            </text>
          ))}
        </g>
      </svg>
    </>
  );
}
