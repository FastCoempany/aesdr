"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * BurrowLayer — the page is the system beneath the sales floor.
 *
 * A barely-visible planview of subterranean tunnels, chambers, roots,
 * and movement paths behind the content. Hare-track pairs ride along
 * an implied surface line; tortoise tunnels arc underneath into small
 * chambers; root systems thread through the soil; cave-mouth openings
 * gape near section breaks. Tiny field markers in mono — "listen,"
 * "wait," "move," "repeat" — sit beside the chambers.
 *
 * Tone: not entering a course. Entering the burrow system beneath
 * the sales floor.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.35,
  standard: 0.60,
  heavy: 0.90,
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

export function BurrowLayer() {
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

  // Surface line where the hare tracks ride. Below this, everything's underground.
  const surfaceY = 220;

  // Tunnel network — generated deterministically. Each tunnel is a cubic Bezier
  // ending at a chamber, with possibly a child tunnel branching off.
  const tunnels = useMemo(() => {
    const rng = seededJitter(53);
    type Chamber = { x: number; y: number; rx: number; ry: number; label?: string };
    const labels = ["listen", "wait", "move", "repeat", "hold", "watch", "breathe", "strike"];
    const chambers: Chamber[] = [];
    const paths: string[] = [];

    // 6 trunk tunnels descending from the surface to chambers
    let labelIdx = 0;
    for (let i = 0; i < 7; i++) {
      const startX = 120 + i * 200 + rng() * 60;
      const endX = startX + (rng() - 0.5) * 200;
      const endY = surfaceY + 140 + rng() * (pageH - 400);
      const cp1x = startX + (rng() - 0.5) * 100;
      const cp1y = surfaceY + 60 + rng() * 80;
      const cp2x = endX + (rng() - 0.5) * 100;
      const cp2y = endY - 80;
      paths.push(`M${startX} ${surfaceY} C${cp1x} ${cp1y} ${cp2x} ${cp2y} ${endX} ${endY}`);
      chambers.push({
        x: endX,
        y: endY,
        rx: 18 + rng() * 10,
        ry: 11 + rng() * 6,
        label: rng() > 0.35 ? labels[labelIdx++ % labels.length] : undefined,
      });

      // branch
      if (rng() > 0.4) {
        const branchEndX = endX + (rng() - 0.5) * 300;
        const branchEndY = endY + 80 + rng() * 200;
        const bcp1x = endX + (rng() - 0.5) * 80;
        const bcp1y = endY + 60;
        const bcp2x = branchEndX + (rng() - 0.5) * 60;
        const bcp2y = branchEndY - 40;
        paths.push(`M${endX} ${endY} C${bcp1x} ${bcp1y} ${bcp2x} ${bcp2y} ${branchEndX} ${branchEndY}`);
        chambers.push({
          x: branchEndX,
          y: branchEndY,
          rx: 14 + rng() * 8,
          ry: 9 + rng() * 5,
          label: rng() > 0.5 ? labels[labelIdx++ % labels.length] : undefined,
        });
      }
    }

    // Connector tunnels between nearby chambers
    for (let i = 0; i < chambers.length - 1; i++) {
      const a = chambers[i];
      const b = chambers[i + 1];
      if (rng() > 0.6 && Math.abs(a.y - b.y) < 320) {
        const cpx = (a.x + b.x) / 2 + (rng() - 0.5) * 80;
        const cpy = (a.y + b.y) / 2 + 40;
        paths.push(`M${a.x} ${a.y} Q${cpx} ${cpy} ${b.x} ${b.y}`);
      }
    }

    // Roots — thin hairlines descending from the surface in upper third
    const rootPaths: string[] = [];
    for (let i = 0; i < 50; i++) {
      const x = rng() * 1440;
      const endY = surfaceY + 30 + rng() * 280;
      const wob = (rng() - 0.5) * 14;
      rootPaths.push(`M${x} ${surfaceY - 4} Q${x + wob} ${surfaceY + (endY - surfaceY) * 0.5} ${x + wob * 1.5} ${endY}`);
    }

    // Cave-mouth openings — section breaks (approximate)
    const caves: Array<{ x: number; y: number }> = [];
    [0.18, 0.32, 0.48, 0.62, 0.78].forEach((p) => {
      caves.push({ x: 60 + rng() * 1320, y: pageH * p });
    });

    return { paths, chambers, rootPaths, caves };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Burrow" value={intensity} onChange={setIntensity} />

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
        {/* ─── Surface line ─── */}
        <line
          x1="0"
          y1={surfaceY}
          x2="1440"
          y2={surfaceY}
          stroke="#1A1A1A"
          strokeWidth="0.5"
          strokeDasharray="6 4"
          opacity="0.55"
        />
        <text
          x="40"
          y={surfaceY - 12}
          fontFamily="'Space Mono', monospace"
          fontSize="9"
          letterSpacing="0.22em"
          fill="#1A1A1A"
          opacity="0.5"
        >
          — SURFACE
        </text>

        {/* ─── Hare track pairs above the surface, in dust ─── */}
        <g fill="#1A1A1A" opacity="0.6">
          {Array.from({ length: 26 }).map((_, i) => {
            const x = 30 + i * 56;
            const y = surfaceY - 14 - (i % 2) * 4;
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <ellipse cx="0" cy="0" rx="2.2" ry="4.6" />
                <ellipse cx="8" cy="1" rx="2.2" ry="4.6" />
                <circle cx="1" cy="8" r="1.2" />
                <circle cx="6" cy="9" r="1.2" />
              </g>
            );
          })}
        </g>

        {/* ─── Tunnels ─── */}
        <g stroke="#1A1A1A" strokeWidth="1.2" fill="none" opacity="0.65" strokeLinecap="round">
          {tunnels.paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* ─── Roots ─── */}
        <g stroke="#1A1A1A" strokeWidth="0.4" fill="none" opacity="0.45">
          {tunnels.rootPaths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* ─── Chambers + field markers ─── */}
        {tunnels.chambers.map((c, i) => (
          <g key={i}>
            <ellipse
              cx={c.x}
              cy={c.y}
              rx={c.rx}
              ry={c.ry}
              fill="#1A1A1A"
              opacity="0.10"
              stroke="#1A1A1A"
              strokeWidth="0.8"
              strokeOpacity="0.7"
            />
            {/* Inner shell-shape suggestion */}
            <ellipse
              cx={c.x}
              cy={c.y}
              rx={c.rx * 0.55}
              ry={c.ry * 0.55}
              fill="none"
              stroke="#1A1A1A"
              strokeWidth="0.4"
              opacity="0.5"
            />
            {c.label && (
              <text
                x={c.x + c.rx + 8}
                y={c.y + 3}
                fontFamily="'Space Mono', monospace"
                fontSize="9"
                letterSpacing="0.18em"
                fill="#1A1A1A"
                opacity="0.62"
              >
                {c.label}
              </text>
            )}
          </g>
        ))}

        {/* ─── Cave-mouth openings near section breaks ─── */}
        {tunnels.caves.map((cave, i) => (
          <g key={i} transform={`translate(${cave.x} ${cave.y})`}>
            <path
              d="M-22 0 Q-22 -16 0 -20 Q22 -16 22 0 Z"
              fill="#1A1A1A"
              opacity="0.16"
              stroke="#1A1A1A"
              strokeWidth="0.7"
              strokeOpacity="0.6"
            />
            {/* Dust at threshold */}
            <line x1="-30" y1="3" x2="30" y2="3" stroke="#1A1A1A" strokeWidth="0.4" strokeDasharray="2 3" opacity="0.5" />
          </g>
        ))}

        {/* ─── Compass-rose / "depth scale" indicator in lower-right ─── */}
        <g transform={`translate(1340 ${pageH - 120})`} opacity="0.6">
          <text
            x="0"
            y="0"
            fontFamily="'Space Mono', monospace"
            fontSize="9"
            letterSpacing="0.22em"
            fill="#1A1A1A"
            textAnchor="end"
          >
            BURROW SYSTEM · Σ
          </text>
          <text
            x="0"
            y="14"
            fontFamily="'Space Mono', monospace"
            fontSize="8"
            letterSpacing="0.20em"
            fill="#6B6B6B"
            textAnchor="end"
          >
            unseen prep · quiet repetition
          </text>
        </g>
      </svg>
    </>
  );
}
