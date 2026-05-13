"use client";

import { useState, useEffect, useMemo, useRef } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * FirstMileLayer — sunrise idea #3. Narrative scroll-driven sunrise.
 *
 * The sun rises as the reader scrolls. At hero scroll-y=0 the sun
 * sits low above a horizon line near the bottom of the viewport;
 * by the end of the page the sun has lifted to the top of the
 * viewport and paled to cream-white. The warm gradient sweeps with it.
 *
 * Each section is a milestone marker — "MILE I — 0612h",
 * "MILE VI — 0734h", "MILE XII — 0901h" — anchored at section
 * positions. Pilings as silent mile-marker posts at each anchor.
 *
 * Headline cast-shadows are LONG at the top of the page (sun is low,
 * golden-hour rake) and SHORT by the bottom (sun has risen).
 *
 * Branch silhouettes thin out from upper corners as you scroll.
 *
 * Tone: you started before dawn. Every section is another mile. The
 * training is the run.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.46,
  standard: 0.78,
  heavy: 1.0,
};

const FALLBACK_HEIGHT = 5200;

const MILES = [
  { p: 0.04, label: "MILE I",   time: "0612h", note: "first light" },
  { p: 0.18, label: "MILE II",  time: "0634h", note: "warm-up" },
  { p: 0.30, label: "MILE III", time: "0654h", note: "pace set" },
  { p: 0.42, label: "MILE V",   time: "0721h", note: "fall · recover" },
  { p: 0.54, label: "MILE VI",  time: "0734h", note: "the long mile" },
  { p: 0.66, label: "MILE VIII",time: "0758h", note: "diagnosis" },
  { p: 0.78, label: "MILE X",   time: "0824h", note: "verdict" },
  { p: 0.92, label: "MILE XII", time: "0901h", note: "owner" },
];

export function FirstMileLayer() {
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [pageH, setPageH] = useState(FALLBACK_HEIGHT);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 = dawn, 1 = full risen
  const rafRef = useRef<number | null>(null);
  const pending = useRef(false);

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

  useEffect(() => {
    function update() {
      pending.current = false;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.max(0, Math.min(1, window.scrollY / h)) : 0;
      setScrollProgress(p);
    }
    function onScroll() {
      if (pending.current) return;
      pending.current = true;
      rafRef.current = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const op = OP[intensity];

  // Sun starts at lower-right (dawn) and rises to upper-center as page scrolls.
  // viewBox-space: 0..1200 horiz, 0..800 vert
  const sunVbX = 980 - scrollProgress * 320;       // drifts left as it rises
  const sunVbY = 660 - scrollProgress * 540;       // rises from low to high
  const sunSize = 70 - scrollProgress * 32;        // a bigger near-horizon disc; smaller risen
  const sunFade = 1 - scrollProgress * 0.35;       // pales out as it rises

  // Headline shadows: long at dawn, short by full day
  const shadowLen = 22 - scrollProgress * 18;      // 22px → 4px
  const shadowOffsetX = shadowLen * 0.94;           // mostly horizontal (low sun)
  const shadowOffsetY = shadowLen * 0.36 + 2;
  const shadowAlpha = 0.18 + (1 - scrollProgress) * 0.30;

  // Branch density also fades with scroll
  const branchOpacity = 0.85 - scrollProgress * 0.45;

  // Stable mile pile positions per section
  const milePilings = useMemo(() => {
    return MILES.map((m, i) => ({
      y: pageH * m.p,
      side: (i % 2 === 0 ? "left" : "right") as "left" | "right",
      ...m,
    }));
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="First Mile" value={intensity} onChange={setIntensity} />

      {/* L1: scroll-driven sky gradient — warmest at top of page, dawn fades as you go down */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 3,
          opacity: op * sunFade,
          mixBlendMode: "multiply",
          transition: "opacity 320ms",
          background: `linear-gradient(180deg,
            rgba(244,178,98,${(0.38 - scrollProgress * 0.28).toFixed(3)}) 0%,
            rgba(232,156,72,${(0.30 - scrollProgress * 0.22).toFixed(3)}) 30%,
            rgba(232,200,140,${(0.18 - scrollProgress * 0.14).toFixed(3)}) 60%,
            rgba(250,247,242,0) 100%
          )`,
        }}
      />

      {/* L2: scroll-positioned sun — fixed in viewport */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 4,
          opacity: op,
          transition: "opacity 320ms",
        }}
      >
        <defs>
          <radialGradient id="fm-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FAF7F2" stopOpacity={0.96 * sunFade} />
            <stop offset="30%" stopColor="#F4C268" stopOpacity={0.88 * sunFade} />
            <stop offset="65%" stopColor="#D88040" stopOpacity={0.5 * sunFade} />
            <stop offset="100%" stopColor="#D88040" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Atmosphere glow */}
        <circle cx={sunVbX} cy={sunVbY} r={sunSize * 3.2} fill="url(#fm-sun)" />
        {/* Disc body — pale and small at risen, warm and big at horizon */}
        <circle cx={sunVbX} cy={sunVbY} r={sunSize} fill="#FAF7F2" opacity={0.95 * sunFade} />
        <circle cx={sunVbX} cy={sunVbY} r={sunSize} fill="none" stroke="#1A1A1A" strokeWidth="0.5" opacity={0.55 * sunFade} />
      </svg>

      {/* L3: absolute layer — pilings + mile-stamps + branches (per-page positions) */}
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
        {/* Branch silhouettes — upper corners, fade with scroll */}
        <g fill="#1A1A1A" opacity={branchOpacity}>
          {/* upper-left */}
          {Array.from({ length: 14 }).map((_, i) => {
            const x = 10 + i * 22;
            const y = 100 + Math.sin(i * 0.6) * 16;
            const angle = -50 + (i % 3) * 22;
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${angle})`}>
                <path d="M 0 0 q 2 -14 5 -26 q 1 -4 -1 -1 q -2 8 -4 22 z" />
              </g>
            );
          })}
          {/* upper-right (mirrored) */}
          <g transform="translate(1440 0) scale(-1 1)">
            {Array.from({ length: 12 }).map((_, i) => {
              const x = 10 + i * 24;
              const y = 130 + Math.sin(i * 0.7) * 14;
              const angle = -50 + (i % 3) * 22;
              return (
                <g key={i} transform={`translate(${x} ${y}) rotate(${angle})`}>
                  <path d="M 0 0 q 2 -12 4 -22 q 1 -3 -1 0 q -2 7 -3 18 z" />
                </g>
              );
            })}
          </g>
        </g>

        {/* Mile-marker pilings — one cluster per milestone, all the way down the page */}
        {milePilings.map((m, i) => (
          <g key={i} transform={`translate(${m.side === "left" ? 80 : 1240} ${m.y})`}>
            {/* Cluster of 4 pilings of varying heights */}
            <g fill="#1A1A1A">
              <rect x="0" y="-18" width="3" height="20" />
              <rect x="8" y="-24" width="3" height="26" />
              <rect x="16" y="-16" width="3" height="18" />
              <rect x="24" y="-22" width="3" height="24" />
            </g>
            {/* Ground line */}
            <line x1="-12" y1="2" x2="40" y2="2" stroke="#1A1A1A" strokeWidth="0.5" opacity="0.55" />
            {/* Mile stamp */}
            <text
              x={m.side === "left" ? 50 : -10}
              y="-14"
              fontFamily="Playfair Display, Georgia, serif"
              fontWeight="700"
              fontSize="14"
              fill="#1A1A1A"
              textAnchor={m.side === "left" ? "start" : "end"}
            >
              {m.label}
            </text>
            <text
              x={m.side === "left" ? 50 : -10}
              y="2"
              fontFamily="'Space Mono', monospace"
              fontSize="9"
              letterSpacing="0.22em"
              fill="#6B6B6B"
              textAnchor={m.side === "left" ? "start" : "end"}
            >
              {m.time} · {m.note}
            </text>
          </g>
        ))}

        {/* Header — runner's starting log */}
        <g transform="translate(72 124)" opacity="0.88">
          <text x="0" y="0" fontFamily="Playfair Display, Georgia, serif" fontStyle="italic" fontWeight="700" fontSize="22" fill="#1A1A1A">
            The First Mile
          </text>
          <text x="0" y="20" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.26em" fill="#6B6B6B">
            DEPARTED 0612h · OBJECTIVE: MILE XII · ROUTE LEPONEUS
          </text>
          <line x1="0" y1="30" x2="380" y2="30" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.55" />
        </g>

        {/* Footer */}
        <g transform={`translate(72 ${pageH - 60})`} opacity="0.78">
          <text x="0" y="0" fontFamily="'Space Mono', monospace" fontWeight="700" fontSize="10" letterSpacing="0.26em" fill="#1A1A1A">
            STARTED BEFORE DAWN
          </text>
          <text x="0" y="14" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill="#6B6B6B">
            every mile is logged · the training is the run
          </text>
        </g>
      </svg>

      {/* Headline cast shadows — scroll-driven length + direction */}
      <style>{`
        [data-mockup="landing"] h1,
        [data-mockup="landing"] h2 {
          text-shadow: ${shadowOffsetX.toFixed(1)}px ${shadowOffsetY.toFixed(1)}px 0 rgba(26,26,26,${shadowAlpha.toFixed(2)});
          transition: text-shadow 220ms linear;
        }
      `}</style>
    </>
  );
}
