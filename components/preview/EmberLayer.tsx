"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * EmberLayer — Thicket descendant. The field after the burn.
 *
 * Charred negative-space shell silhouettes ghost across the page in
 * scorched outline. Predator eyes have become low-burning embers —
 * small crimson radial-glow points breathing along page edges. A
 * single watch fire in one corner pulses slowly (the only motion).
 * Faint ash drifts settle at section feet. Hare ears still in
 * negative space but smudged with soot at the tips. Lower-page
 * regions get a warm tobacco/umber wash — the burn zone.
 *
 * Color: cream + ink dominate; crimson reserved for embers and watch
 * fire only (semantic = "still alive, still watching").
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.35,
  standard: 0.62,
  heavy: 0.92,
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

export function EmberLayer() {
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [pageH, setPageH] = useState(FALLBACK_HEIGHT);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    function measure() {
      queueMicrotask(() => setPageH(Math.max(document.documentElement.scrollHeight, FALLBACK_HEIGHT)));
    }
    measure();
    window.addEventListener("resize", measure);
    const t = setInterval(measure, 800);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    queueMicrotask(() => setReducedMotion(mq.matches));
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);

    return () => {
      window.removeEventListener("resize", measure);
      clearInterval(t);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  const op = OP[intensity];
  const animations = !reducedMotion && intensity !== "off";

  const placements = useMemo(() => {
    const rng = seededJitter(211);

    // Charred shell hexes — same structural grid as Thicket but darker, scorched
    const shells: Array<{ cx: number; cy: number; r: number; smudge: number }> = [];
    const rows = Math.ceil(pageH / 700);
    for (let i = 0; i < rows; i++) {
      shells.push({
        cx: (i % 2 === 0 ? 280 : 1160) + (rng() - 0.5) * 80,
        cy: 240 + i * 700 + (rng() - 0.5) * 80,
        r: 180 + rng() * 60,
        smudge: 0.6 + rng() * 0.4,
      });
    }

    // Embers along page edges — small crimson glow points
    const embers: Array<{ x: number; y: number; r: number; phase: number }> = [];
    for (let i = 0; i < 24; i++) {
      const onLeft = rng() > 0.5;
      embers.push({
        x: onLeft ? 12 + rng() * 38 : 1394 - rng() * 38,
        y: 200 + rng() * (pageH - 400),
        r: 3 + rng() * 5,
        phase: rng() * 4,
      });
    }

    // Charred bramble in all 4 corners
    const bramble = [
      { x: 30, y: 80, scale: 1 },
      { x: 1340, y: 80, scale: 1 },
      { x: 30, y: pageH - 240, scale: 1 },
      { x: 1340, y: pageH - 240, scale: 1 },
    ];

    // Ash settling at section feet
    const ash: Array<{ x: number; y: number; r: number }> = [];
    for (let i = 0; i < 90; i++) {
      ash.push({ x: rng() * 1440, y: rng() * pageH, r: 0.6 + rng() * 1.2 });
    }

    // Hare ears in negative space — soot-tipped
    const hareEars: Array<{ x: number; y: number; flip: boolean }> = [];
    [0.22, 0.52, 0.82].forEach((p, i) => {
      hareEars.push({ x: i % 2 === 0 ? 720 : 540, y: pageH * p, flip: i % 2 === 1 });
    });

    // Watch fire — single big ember in the lower-left
    const watchFire = { x: 80, y: pageH - 180 };

    return { shells, embers, bramble, ash, hareEars, watchFire };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Ember" value={intensity} onChange={setIntensity} />

      {/* ─── Tobacco/umber wash on lower regions — the burn zone ─── */}
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
          opacity: op * 0.65,
          mixBlendMode: "multiply",
          background: `linear-gradient(180deg,
            rgba(250,247,242,0) 0%,
            rgba(250,247,242,0) 32%,
            rgba(168,128,88,0.22) 60%,
            rgba(120,80,52,0.38) 88%,
            rgba(72,48,32,0.55) 100%
          )`,
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
        {/* ─── Charred shell hexes — heavier stroke, broken edges ─── */}
        <g stroke="#1A1A1A" fill="none" opacity="0.55">
          {placements.shells.map((s, i) => (
            <g key={i}>
              <polygon points={hexPoints(s.cx, s.cy, s.r)} strokeWidth="2.4" strokeOpacity={s.smudge} />
              <polygon points={hexPoints(s.cx, s.cy, s.r * 0.78)} strokeWidth="1.2" opacity="0.6" />
              <polygon points={hexPoints(s.cx, s.cy, s.r * 0.55)} strokeWidth="0.7" opacity="0.45" />
              <polygon points={hexPoints(s.cx, s.cy, s.r * 0.32)} strokeWidth="0.5" opacity="0.35" />
              {/* Apex char-mark */}
              <circle cx={s.cx} cy={s.cy} r="2" fill="#1A1A1A" opacity="0.7" />
              {/* Soot smudge — small dark splotches around the polygon */}
              {Array.from({ length: 4 }).map((_, k) => {
                const a = (k / 4) * Math.PI * 2 + i;
                return (
                  <ellipse
                    key={k}
                    cx={s.cx + Math.cos(a) * s.r * 0.95}
                    cy={s.cy + Math.sin(a) * s.r * 0.95}
                    rx="10"
                    ry="5"
                    fill="#1A1A1A"
                    opacity="0.18"
                  />
                );
              })}
            </g>
          ))}
        </g>

        {/* ─── Charred bramble — denser, more chaotic than base Thicket ─── */}
        {placements.bramble.map((b, i) => (
          <g
            key={`br${i}`}
            transform={`translate(${b.x} ${b.y}) scale(${b.scale})`}
            stroke="#1A1A1A"
            strokeWidth="1.2"
            fill="none"
            opacity="0.85"
          >
            <path d="M0 0 L40 16 L12 28 L52 40 L20 52 L60 64 L26 72 L62 88 L34 104 L70 116" />
            <path d="M10 4 L46 22 L18 32 L48 48 L22 62 L54 78 L28 92" />
            <path d="M28 0 L48 20 L24 40 L56 56 L30 76 L62 96" />
            <path d="M-4 12 L36 30 L8 46 L42 60 L16 78" />
            {Array.from({ length: 14 }).map((_, k) => (
              <line key={k} x1={k * 6} y1={k * 7} x2={k * 6 + 3} y2={k * 7 - 5} strokeWidth="0.6" />
            ))}
            {/* Charred stumps at base */}
            <ellipse cx="10" cy="100" rx="14" ry="4" fill="#1A1A1A" stroke="none" opacity="0.55" />
            <ellipse cx="44" cy="108" rx="10" ry="3" fill="#1A1A1A" stroke="none" opacity="0.55" />
          </g>
        ))}

        {/* ─── Hare ears with soot-tipped negative space ─── */}
        <g opacity="0.55">
          {placements.hareEars.map((e, i) => (
            <g key={i} transform={`translate(${e.x} ${e.y}) ${e.flip ? "scale(-1 1)" : ""}`}>
              <ellipse cx="-4" cy="-26" rx="3.2" ry="28" transform="rotate(-9 -4 -26)" fill="#1A1A1A" />
              <ellipse cx="8" cy="-28" rx="3.2" ry="28" transform="rotate(9 8 -28)" fill="#1A1A1A" />
              {/* Soot smudge at tips */}
              <circle cx="-7" cy="-52" r="3.5" fill="#1A1A1A" opacity="0.6" />
              <circle cx="12" cy="-54" r="3.5" fill="#1A1A1A" opacity="0.6" />
            </g>
          ))}
        </g>

        {/* ─── Ash particles ─── */}
        <g fill="#1A1A1A" opacity="0.25">
          {placements.ash.map((a, i) => (
            <circle key={i} cx={a.x} cy={a.y} r={a.r} />
          ))}
        </g>

        {/* ─── Axiom in lower-right ─── */}
        <g transform={`translate(1340 ${pageH - 60})`} opacity="0.7">
          <text
            x="0"
            y="0"
            fontFamily="'Space Mono', monospace"
            fontSize="9"
            letterSpacing="0.22em"
            fill="#1A1A1A"
            textAnchor="end"
          >
            STILL WATCHING
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
            the field does not sleep
          </text>
        </g>
      </svg>

      {/* ─── Crimson embers — separate SVG layer, NOT multiplied (so glow stays bright) ─── */}
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
        <defs>
          <radialGradient id="ember-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FAF7F2" stopOpacity="0.9" />
            <stop offset="20%" stopColor="#D44A2A" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#8B1A1A" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#8B1A1A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="watch-fire" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FAF7F2" stopOpacity="0.95" />
            <stop offset="14%" stopColor="#FFB74D" stopOpacity="0.9" />
            <stop offset="38%" stopColor="#D44A2A" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#8B1A1A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8B1A1A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ember points */}
        {placements.embers.map((e, i) => (
          <g key={i}>
            <circle
              cx={e.x}
              cy={e.y}
              r={e.r * 4}
              fill="url(#ember-glow)"
              style={{
                animation: animations ? `ember-pulse-${i % 4} ${3 + (i % 4)}s ease-in-out infinite` : undefined,
                animationDelay: `${e.phase}s`,
                transformOrigin: `${e.x}px ${e.y}px`,
              }}
            />
            <circle cx={e.x} cy={e.y} r={e.r} fill="#D44A2A" />
            <circle cx={e.x} cy={e.y} r={e.r * 0.4} fill="#FAF7F2" opacity="0.85" />
          </g>
        ))}

        {/* Watch fire — bigger and more dramatic */}
        <g>
          <circle
            cx={placements.watchFire.x}
            cy={placements.watchFire.y}
            r="120"
            fill="url(#watch-fire)"
            style={{
              animation: animations ? "watch-fire-breathe 4.2s ease-in-out infinite" : undefined,
              transformOrigin: `${placements.watchFire.x}px ${placements.watchFire.y}px`,
            }}
          />
          <circle cx={placements.watchFire.x} cy={placements.watchFire.y} r="14" fill="#FFB74D" />
          <circle cx={placements.watchFire.x} cy={placements.watchFire.y} r="6" fill="#FAF7F2" opacity="0.9" />
          {/* Stones around the fire */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const sx = placements.watchFire.x + Math.cos(a) * 24;
            const sy = placements.watchFire.y + Math.sin(a) * 24;
            return <ellipse key={i} cx={sx} cy={sy} rx="6" ry="3.6" fill="#1A1A1A" opacity="0.85" />;
          })}
        </g>
      </svg>

      <style>{`
        @keyframes ember-pulse-0 { 0%, 100% { opacity: 0.5; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.15); } }
        @keyframes ember-pulse-1 { 0%, 100% { opacity: 0.6; transform: scale(0.9);  } 50% { opacity: 1; transform: scale(1.2);  } }
        @keyframes ember-pulse-2 { 0%, 100% { opacity: 0.45; transform: scale(0.8); } 50% { opacity: 0.95; transform: scale(1.1); } }
        @keyframes ember-pulse-3 { 0%, 100% { opacity: 0.55; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.25); } }
        @keyframes watch-fire-breathe {
          0%, 100% { opacity: 0.75; transform: scale(0.92); }
          50%      { opacity: 1;    transform: scale(1.08); }
        }
      `}</style>
    </>
  );
}
