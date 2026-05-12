"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * PaceLayer — pace as a discipline.
 *
 * The page is a long, faint terrain of motion trails. Light dotted
 * hare-track bursts skitter across it; slow continuous tortoise trails
 * grind through in steady rhythm. Crossed paths show bad handoffs.
 * Small terrain symbols (stones, grass, bramble, hills) punctuate the
 * field. Start/stop markers and "freeze points" where tracks halt.
 * Shell-shaped contour lines float behind like topographic relief.
 *
 * Tone: speed is not the enemy. Untrained speed is.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.32,
  standard: 0.56,
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

export function PaceLayer() {
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

  const field = useMemo(() => {
    const rng = seededJitter(89);

    // Hare burst clusters — short scatters of 4-print stagger, fast & broken
    const hareBursts: Array<{ x: number; y: number; angle: number; len: number }> = [];
    for (let i = 0; i < 32; i++) {
      hareBursts.push({
        x: 80 + rng() * 1280,
        y: 80 + rng() * (pageH - 160),
        angle: rng() * 360,
        len: 4 + Math.floor(rng() * 5),
      });
    }

    // Tortoise continuous trails — long meandering polylines, steady rhythm
    const tortoiseTrails: string[] = [];
    for (let i = 0; i < 5; i++) {
      const startX = 60 + rng() * 200;
      const startY = 60 + (i / 5) * pageH;
      const points: string[] = [`M${startX} ${startY}`];
      let x = startX;
      let y = startY;
      for (let j = 0; j < 40; j++) {
        x += 28 + rng() * 6;
        y += (rng() - 0.5) * 12;
        if (x > 1380) {
          x = 60 + rng() * 200;
          y += 80;
          points.push(`M${x} ${y}`);
        } else {
          points.push(`L${x} ${y}`);
        }
      }
      tortoiseTrails.push(points.join(" "));
    }

    // Crossed paths (bad handoffs) — locations where hare and tortoise tracks cross
    const crosses: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 6; i++) {
      crosses.push({ x: 200 + rng() * 1080, y: pageH * (0.12 + rng() * 0.72) });
    }

    // Freeze points — abrupt stops with a halt marker
    const freezes: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 5; i++) {
      freezes.push({ x: 160 + rng() * 1120, y: pageH * (0.10 + rng() * 0.76) });
    }

    // Terrain symbols
    const stones: Array<{ x: number; y: number; r: number }> = [];
    const grass: Array<{ x: number; y: number }> = [];
    const bramble: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 38; i++) stones.push({ x: rng() * 1440, y: rng() * pageH, r: 2 + rng() * 4 });
    for (let i = 0; i < 70; i++) grass.push({ x: rng() * 1440, y: rng() * pageH });
    for (let i = 0; i < 14; i++) bramble.push({ x: rng() * 1440, y: rng() * pageH });

    // Shell-shaped contour lines — concentric hex curves at low frequency
    const contours: Array<{ cx: number; cy: number; r: number }> = [];
    for (let i = 0; i < 4; i++) {
      contours.push({
        cx: 200 + rng() * 1040,
        cy: 200 + rng() * (pageH - 400),
        r: 120 + rng() * 220,
      });
    }

    return { hareBursts, tortoiseTrails, crosses, freezes, stones, grass, bramble, contours };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Pace" value={intensity} onChange={setIntensity} />

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
        {/* ─── Shell-shaped contours (topographic relief) ─── */}
        <g stroke="#1A1A1A" strokeWidth="0.5" fill="none" opacity="0.30">
          {field.contours.map((c, i) => (
            <g key={i}>
              {[1.0, 0.78, 0.56, 0.38].map((s, j) => {
                const r = c.r * s;
                const pts = Array.from({ length: 6 }).map((_, k) => {
                  const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
                  return `${(c.cx + Math.cos(a) * r).toFixed(1)},${(c.cy + Math.sin(a) * r * 0.7).toFixed(1)}`;
                });
                return <polygon key={j} points={pts.join(" ")} />;
              })}
            </g>
          ))}
        </g>

        {/* ─── Terrain: stones ─── */}
        <g fill="#1A1A1A" opacity="0.6">
          {field.stones.map((s, i) => (
            <ellipse key={i} cx={s.x} cy={s.y} rx={s.r} ry={s.r * 0.62} />
          ))}
        </g>

        {/* ─── Terrain: grass blades ─── */}
        <g stroke="#1A1A1A" strokeWidth="0.5" fill="none" opacity="0.45">
          {field.grass.map((g, i) => (
            <path key={i} d={`M${g.x} ${g.y} q1 -7 ${1 + (i % 3)} -10`} />
          ))}
        </g>

        {/* ─── Terrain: bramble (thorny tangles) ─── */}
        <g stroke="#1A1A1A" strokeWidth="0.6" fill="none" opacity="0.55">
          {field.bramble.map((b, i) => (
            <g key={i} transform={`translate(${b.x} ${b.y})`}>
              <path d="M-8 -2 L4 8 L-2 -6 L6 -4 L-4 4 L8 -8" />
              <path d="M-6 6 L2 -8 L-8 0 L4 -2 L-4 -6" />
            </g>
          ))}
        </g>

        {/* ─── Tortoise trails — slow, continuous ─── */}
        <g stroke="#1A1A1A" strokeWidth="0.9" fill="none" opacity="0.72" strokeDasharray="3 4">
          {field.tortoiseTrails.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* ─── Hare bursts — short scattered staggers ─── */}
        <g fill="#1A1A1A" opacity="0.72">
          {field.hareBursts.map((burst, i) => (
            <g key={i} transform={`translate(${burst.x} ${burst.y}) rotate(${burst.angle})`}>
              {Array.from({ length: burst.len }).map((_, j) => {
                const dy = j * 16;
                return (
                  <g key={j}>
                    <ellipse cx="-4" cy={dy} rx="1.8" ry="3.6" />
                    <ellipse cx="4" cy={dy + 1} rx="1.8" ry="3.6" />
                    <circle cx="-2" cy={dy + 8} r="1.1" />
                    <circle cx="3" cy={dy + 9} r="1.1" />
                  </g>
                );
              })}
            </g>
          ))}
        </g>

        {/* ─── Crossed paths — bad handoffs marked with × and small label ─── */}
        <g stroke="#1A1A1A" strokeWidth="1" opacity="0.7">
          {field.crosses.map((c, i) => (
            <g key={i} transform={`translate(${c.x} ${c.y})`}>
              <line x1="-8" y1="-8" x2="8" y2="8" />
              <line x1="-8" y1="8" x2="8" y2="-8" />
              <text
                x="14"
                y="4"
                fontFamily="'Space Mono', monospace"
                fontSize="8"
                letterSpacing="0.20em"
                fill="#1A1A1A"
                opacity="0.6"
              >
                handoff
              </text>
            </g>
          ))}
        </g>

        {/* ─── Freeze points — abrupt stop markers ─── */}
        <g stroke="#1A1A1A" strokeWidth="1" opacity="0.78">
          {field.freezes.map((f, i) => (
            <g key={i} transform={`translate(${f.x} ${f.y})`}>
              <line x1="-10" y1="0" x2="10" y2="0" />
              <line x1="-10" y1="-4" x2="-10" y2="4" />
              <line x1="10" y1="-4" x2="10" y2="4" />
              <text
                x="0"
                y="-8"
                fontFamily="'Space Mono', monospace"
                fontSize="8"
                letterSpacing="0.22em"
                fill="#1A1A1A"
                opacity="0.65"
                textAnchor="middle"
              >
                HALT
              </text>
            </g>
          ))}
        </g>

        {/* ─── Section axiom in lower-right ─── */}
        <g transform={`translate(1340 ${pageH - 60})`} opacity="0.6">
          <text
            x="0"
            y="0"
            fontFamily="'Space Mono', monospace"
            fontSize="9"
            letterSpacing="0.20em"
            fill="#1A1A1A"
            textAnchor="end"
          >
            PACE IS A DISCIPLINE
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
            untrained speed loses races
          </text>
        </g>
      </svg>
    </>
  );
}
