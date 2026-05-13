"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * UnderlandLayer — survival architecture beneath the page.
 *
 * Cross-section view. The world is split at a surface line near the
 * top of the page. ABOVE the line: clean cream with hare-track pairs
 * threading across in dust + sparse grass tufts. BELOW the line:
 * faint soil strata bands, thin curved tunnels connecting hidden
 * chambers, tortoise-shell stone forms embedded in the soil, root
 * systems descending from the surface, sparse crimson hazard tags
 * at danger nodes.
 *
 * Drawn in archival ink linework — no fills below ground, just
 * confident hairlines. The page reads as an architectural section
 * drawing of a training warren.
 *
 * Tone: quiet, pressured, intelligent. The work you don't see.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.50,
  standard: 0.82,
  heavy: 1.0,
};

const FALLBACK_HEIGHT = 5200;
const SURFACE_Y = 280;

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

const HAZARD_TAGS = [
  "FAULT · UNSTABLE",
  "WATER · LOW",
  "PREDATOR · KNOWN",
  "AIR · POOR",
  "CHAMBER · COLLAPSED",
];

export type UnderlandVariant = "stone" | "plan" | "angled" | "field";

interface UnderlandLayerProps {
  variant?: UnderlandVariant;
  label?: string;
}

export function UnderlandLayer({ variant = "stone", label = "Underland" }: UnderlandLayerProps = {}) {
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
    const rng = seededJitter(3221);

    // Strata band Ys + labels (below the surface)
    const strata = [
      { y: SURFACE_Y + 80, label: "TOPSOIL" },
      { y: SURFACE_Y + 260, label: "CLAY" },
      { y: SURFACE_Y + 540, label: "STONE" },
      { y: SURFACE_Y + 920, label: "WATER TABLE" },
      { y: SURFACE_Y + 1400, label: "BEDROCK" },
    ];

    // Hidden chambers — irregular ovals at varying depths
    type Chamber = { cx: number; cy: number; rx: number; ry: number; hasHazard: boolean };
    const chambers: Chamber[] = [];
    for (let i = 0; i < 9; i++) {
      const cy = SURFACE_Y + 140 + i * ((pageH - SURFACE_Y - 200) / 9);
      chambers.push({
        cx: 200 + rng() * 1040,
        cy,
        rx: 32 + rng() * 22,
        ry: 18 + rng() * 12,
        hasHazard: i % 2 === 0,
      });
    }

    // Tunnels — connect surface to chambers and chambers to each other
    const tunnels: string[] = [];
    // Drop-down entries from surface to top-band chambers
    for (let i = 0; i < 5; i++) {
      const surfaceX = 200 + i * 260 + rng() * 60;
      const targetCh = chambers[i];
      if (!targetCh) continue;
      const cp1x = surfaceX + (rng() - 0.5) * 60;
      const cp1y = SURFACE_Y + (targetCh.cy - SURFACE_Y) * 0.4;
      const cp2x = targetCh.cx + (rng() - 0.5) * 40;
      const cp2y = targetCh.cy - 60;
      tunnels.push(`M ${surfaceX} ${SURFACE_Y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${targetCh.cx} ${targetCh.cy}`);
    }
    // Inter-chamber tunnels
    for (let i = 0; i < chambers.length - 1; i++) {
      const a = chambers[i];
      const b = chambers[i + 1];
      if (rng() > 0.4) {
        const cpx = (a.cx + b.cx) / 2 + (rng() - 0.5) * 100;
        const cpy = (a.cy + b.cy) / 2 + 30;
        tunnels.push(`M ${a.cx} ${a.cy} Q ${cpx} ${cpy} ${b.cx} ${b.cy}`);
      }
    }

    // Tortoise-shell stone forms embedded in soil (small hex stones)
    type Stone = { cx: number; cy: number; r: number };
    const stones: Stone[] = [];
    for (let i = 0; i < 22; i++) {
      stones.push({
        cx: 80 + rng() * 1280,
        cy: SURFACE_Y + 100 + rng() * (pageH - SURFACE_Y - 200),
        r: 8 + rng() * 14,
      });
    }

    // Root systems descending from surface
    const roots: string[] = [];
    for (let i = 0; i < 40; i++) {
      const x = 40 + rng() * 1360;
      const endY = SURFACE_Y + 40 + rng() * 360;
      const wob = (rng() - 0.5) * 12;
      roots.push(`M ${x} ${SURFACE_Y - 2} Q ${x + wob} ${SURFACE_Y + (endY - SURFACE_Y) * 0.5} ${x + wob * 1.4} ${endY}`);
    }

    // Hare track pairs above surface
    type HareTrack = { x: number; y: number };
    const hareTracks: HareTrack[] = [];
    for (let i = 0; i < 32; i++) {
      hareTracks.push({
        x: 30 + i * 44 + rng() * 8,
        y: SURFACE_Y - 18 - (i % 3) * 6,
      });
    }

    // Sparse grass tufts on surface
    type Grass = { x: number };
    const grass: Grass[] = [];
    for (let i = 0; i < 28; i++) {
      grass.push({ x: 40 + i * 52 + rng() * 18 });
    }

    return { strata, chambers, tunnels, stones, roots, hareTracks, grass };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label={label} value={intensity} onChange={setIntensity} />

      {/* L1: subtle warm soil-strata band wash below the surface */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: SURFACE_Y,
          left: 0,
          width: "100%",
          height: pageH - SURFACE_Y,
          pointerEvents: "none",
          zIndex: 3,
          opacity: op * 0.45,
          mixBlendMode: "multiply",
          background: `linear-gradient(180deg,
            rgba(232,228,223,0.30) 0%,
            rgba(210,194,168,0.22) 14%,
            rgba(178,148,112,0.20) 30%,
            rgba(140,110,80,0.22) 52%,
            rgba(96,72,52,0.28) 72%,
            rgba(60,46,34,0.36) 92%,
            rgba(40,32,24,0.40) 100%
          )`,
          transition: "opacity 320ms",
        }}
      />

      {/* L2: archival ink — surface line, tracks, tunnels, chambers, stones, roots */}
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
        {/* Surface line */}
        <line
          x1="0"
          y1={SURFACE_Y}
          x2="1440"
          y2={SURFACE_Y}
          stroke="#1A1A1A"
          strokeWidth="1"
          opacity="0.7"
        />
        <text
          x="40"
          y={SURFACE_Y - 14}
          fontFamily="'Space Mono', monospace"
          fontSize="9"
          letterSpacing="0.24em"
          fill="#6B6B6B"
        >
          — SURFACE
        </text>

        {/* Sparse grass tufts on surface */}
        <g stroke="#1A1A1A" strokeWidth="0.5" fill="none" opacity="0.7">
          {layout.grass.map((g, i) => (
            <g key={i} transform={`translate(${g.x} ${SURFACE_Y})`}>
              <path d="M 0 0 q -1 -10 -2 -16" />
              <path d="M 2 0 q 1 -8 2 -12" />
              <path d="M -2 0 q -1 -9 -3 -14" />
            </g>
          ))}
        </g>

        {/* Hare track pairs above surface — in dust */}
        <g fill="#1A1A1A" opacity="0.75">
          {layout.hareTracks.map((p, i) => (
            <g key={i} transform={`translate(${p.x} ${p.y})`}>
              <ellipse cx="-3" cy="-2" rx="1.6" ry="3.4" />
              <ellipse cx="3" cy="-1" rx="1.6" ry="3.4" />
              <circle cx="-1" cy="4" r="1" />
              <circle cx="2" cy="5" r="1" />
            </g>
          ))}
        </g>

        {/* Strata boundary lines + labels */}
        <g opacity="0.55">
          {layout.strata.map((b, i) => (
            <g key={i}>
              <line
                x1="0"
                y1={b.y}
                x2="1440"
                y2={b.y}
                stroke="#1A1A1A"
                strokeWidth="0.4"
                strokeDasharray="3 6"
                opacity="0.7"
              />
              <text
                x="40"
                y={b.y - 6}
                fontFamily="'Space Mono', monospace"
                fontSize="8"
                letterSpacing="0.22em"
                fill="#1A1A1A"
                opacity="0.75"
              >
                — {b.label}
              </text>
            </g>
          ))}
        </g>

        {/* Root systems descending from surface */}
        <g stroke="#1A1A1A" strokeWidth="0.45" fill="none" opacity="0.55">
          {layout.roots.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* Tunnels — confident archival hairlines */}
        <g stroke="#1A1A1A" strokeWidth="1.1" fill="none" opacity="0.78" strokeLinecap="round">
          {layout.tunnels.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* Hidden chambers — ovals with rough wall hatching */}
        {layout.chambers.map((c, i) => (
          <g key={i}>
            <ellipse
              cx={c.cx}
              cy={c.cy}
              rx={c.rx}
              ry={c.ry}
              fill="#FAF7F2"
              stroke="#1A1A1A"
              strokeWidth="1"
              strokeOpacity="0.78"
            />
            {/* Inner ring suggesting depth */}
            <ellipse
              cx={c.cx}
              cy={c.cy}
              rx={c.rx * 0.7}
              ry={c.ry * 0.7}
              fill="none"
              stroke="#1A1A1A"
              strokeWidth="0.5"
              opacity="0.55"
            />
            {/* Floor hatching */}
            {Array.from({ length: 4 }).map((_, k) => (
              <line
                key={k}
                x1={c.cx - c.rx * 0.6 + k * (c.rx * 0.4)}
                y1={c.cy + c.ry * 0.3}
                x2={c.cx - c.rx * 0.6 + k * (c.rx * 0.4) - 4}
                y2={c.cy + c.ry * 0.3 + 4}
                stroke="#1A1A1A"
                strokeWidth="0.35"
                opacity="0.6"
              />
            ))}
          </g>
        ))}

        {/* Variant-driven scatter: tortoise-shell stones OR 3D rabbit holes */}
        {layout.stones.map((s, i) => {
          if (variant === "stone") {
            return (
              <g key={i} opacity="0.82">
                <polygon points={hexPoints(s.cx, s.cy, s.r)} fill="#E8DCC4" stroke="#1A1A1A" strokeWidth="0.7" />
                <polygon points={hexPoints(s.cx, s.cy, s.r * 0.45)} fill="none" stroke="#1A1A1A" strokeWidth="0.4" opacity="0.7" />
                <circle cx={s.cx} cy={s.cy} r="0.9" fill="#1A1A1A" />
              </g>
            );
          }
          if (variant === "plan") return <HolePlan key={i} cx={s.cx} cy={s.cy} r={s.r} seed={i} />;
          if (variant === "angled") return <HoleAngled key={i} cx={s.cx} cy={s.cy} r={s.r} />;
          return <HoleField key={i} cx={s.cx} cy={s.cy} r={s.r} seed={i} />;
        })}

        {/* Top-left cartouche */}
        <g transform="translate(72 124)" opacity="0.88">
          <text x="0" y="0" fontFamily="Playfair Display, Georgia, serif" fontWeight="700" fontStyle="italic" fontSize="22" fill="#1A1A1A">
            UNDERLAND · sectio XII
          </text>
          <text x="0" y="20" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.26em" fill="#6B6B6B">
            SECTION DRAWING · TRAINING WARREN · v.12
          </text>
          <line x1="0" y1="30" x2="380" y2="30" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.55" />
        </g>

        {/* Footer */}
        <g transform={`translate(72 ${pageH - 60})`} opacity="0.78">
          <text x="0" y="0" fontFamily="'Space Mono', monospace" fontWeight="700" fontSize="10" letterSpacing="0.26em" fill="#1A1A1A">
            THE WORK YOU DON&apos;T SEE
          </text>
          <text x="0" y="14" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill="#6B6B6B">
            survival architecture beneath the floor · trained in silence
          </text>
        </g>
      </svg>

      {/* L3: crimson hazard tags at danger nodes (not multiplied) */}
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
        {layout.chambers.filter((c) => c.hasHazard).map((c, i) => (
          <g key={i} stroke="#8B1A1A" strokeWidth="0.6">
            <line x1={c.cx} y1={c.cy} x2={c.cx + (c.cx < 720 ? 90 : -90)} y2={c.cy + 30} />
            <circle cx={c.cx} cy={c.cy} r="3" fill="#8B1A1A" />
            <g transform={`translate(${c.cx + (c.cx < 720 ? 96 : -96)} ${c.cy + 30})`}>
              <rect
                x={c.cx < 720 ? 0 : -110}
                y="-9"
                width="110"
                height="18"
                fill="none"
                stroke="#8B1A1A"
                strokeWidth="0.9"
              />
              <text
                x={c.cx < 720 ? 6 : -106}
                y="4"
                fontFamily="'Space Mono', monospace"
                fontSize="9"
                letterSpacing="0.20em"
                fill="#8B1A1A"
                fontWeight="700"
                stroke="none"
              >
                {HAZARD_TAGS[i % HAZARD_TAGS.length]}
              </text>
            </g>
          </g>
        ))}
      </svg>
    </>
  );
}

/* ─────────────────────────────────────────── Rabbit-hole renderers ─── */

/**
 * HolePlan — top-down minimalist ink sketch of a rabbit hole.
 * Solid dark void ellipse + sparse ink dot-clods around the rim + a
 * few claw-scratch lines radiating from one side (digging direction).
 */
function HolePlan({ cx, cy, r, seed }: { cx: number; cy: number; r: number; seed: number }) {
  // Deterministic clod jitter from index — no Math.random
  const clods = Array.from({ length: 14 }).map((_, k) => {
    const a = (k / 14) * Math.PI * 2 + ((seed * 7 + k) % 5) * 0.1;
    const dist = r * (1.22 + ((seed + k) % 4) * 0.12);
    return {
      cx: cx + Math.cos(a) * dist,
      cy: cy + Math.sin(a) * dist * 0.85,
      cr: 0.7 + ((seed + k) % 3) * 0.5,
    };
  });
  return (
    <g>
      {/* The void */}
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.72} fill="#1A1A1A" />
      <ellipse cx={cx} cy={cy - r * 0.1} rx={r * 0.84} ry={r * 0.58} fill="#000" />
      {/* Dirt clods around the rim */}
      {clods.map((c, k) => (
        <circle key={k} cx={c.cx} cy={c.cy} r={c.cr} fill="#1A1A1A" opacity="0.78" />
      ))}
      {/* Three claw-scratch lines indicating digging direction (top-right of hole) */}
      {[0, 1, 2].map((k) => {
        const a = -Math.PI / 4 + k * 0.18;
        return (
          <line
            key={k}
            x1={cx + Math.cos(a) * r * 1.18}
            y1={cy + Math.sin(a) * r * 0.95}
            x2={cx + Math.cos(a) * r * 1.85}
            y2={cy + Math.sin(a) * r * 1.45}
            stroke="#1A1A1A"
            strokeWidth="0.5"
            opacity="0.7"
          />
        );
      })}
    </g>
  );
}

/**
 * HoleAngled — 3/4 perspective rabbit hole.
 * Dark elliptical void + crescent dirt mound piled on the FAR rim with
 * cross-hatched shading + faint highlight on mound peak + cast shadow.
 */
function HoleAngled({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      {/* Cast shadow under the mound */}
      <ellipse cx={cx} cy={cy - r * 0.05} rx={r * 1.05} ry={r * 0.10} fill="#1A1A1A" opacity="0.20" />
      {/* The void — angled ellipse, narrower vertically */}
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.55} fill="#1A1A1A" />
      {/* Inner darker void suggesting depth */}
      <ellipse cx={cx} cy={cy + r * 0.05} rx={r * 0.86} ry={r * 0.44} fill="#000" />
      {/* Near rim highlight (front edge of hole) */}
      <path
        d={`M ${cx - r * 0.95} ${cy + r * 0.15} Q ${cx} ${cy + r * 0.55} ${cx + r * 0.95} ${cy + r * 0.15}`}
        stroke="#1A1A1A"
        strokeWidth="0.4"
        fill="none"
        opacity="0.6"
      />
      {/* Crescent dirt mound on far rim */}
      <path
        d={`M ${cx - r * 1.1} ${cy - r * 0.25} Q ${cx} ${cy - r * 1.15} ${cx + r * 1.1} ${cy - r * 0.25} Q ${cx} ${cy - r * 0.45} ${cx - r * 1.1} ${cy - r * 0.25} Z`}
        fill="#1A1A1A"
        opacity="0.88"
      />
      {/* Cross-hatching on mound for soil texture */}
      {Array.from({ length: 7 }).map((_, k) => {
        const px = cx - r * 0.9 + k * (r * 0.3);
        return (
          <line
            key={k}
            x1={px}
            y1={cy - r * 0.45}
            x2={px + r * 0.15}
            y2={cy - r * 0.8 - (k % 2) * r * 0.1}
            stroke="#FAF7F2"
            strokeWidth="0.3"
            opacity="0.45"
          />
        );
      })}
      {/* Highlight on mound peak */}
      <path
        d={`M ${cx - r * 0.6} ${cy - r * 0.78} Q ${cx} ${cy - r * 1.06} ${cx + r * 0.6} ${cy - r * 0.78}`}
        stroke="#FAF7F2"
        strokeWidth="0.5"
        fill="none"
        opacity="0.55"
      />
      {/* Small fallen clods at base of mound on the sides */}
      {[-1.0, -0.6, 0.55, 0.95].map((dx, k) => (
        <ellipse
          key={k}
          cx={cx + r * dx}
          cy={cy - r * 0.12}
          rx={1.2 + (k % 2) * 0.6}
          ry={0.9 + (k % 2) * 0.4}
          fill="#1A1A1A"
          opacity="0.78"
        />
      ))}
    </g>
  );
}

/**
 * HoleField — detailed naturalist top-down rabbit hole.
 * Heavy dirt-spray ring with shadowed clods at varying sizes, torn
 * grass tufts at top edge, hare 4-print stagger leading into the
 * hole from below. Maximum visual detail of the three.
 */
function HoleField({ cx, cy, r, seed }: { cx: number; cy: number; r: number; seed: number }) {
  // Wide spray of clods around the rim — irregular distribution + shadows
  const sprayClods = Array.from({ length: 26 }).map((_, k) => {
    const a = (k / 26) * Math.PI * 2 + ((seed * 11 + k * 3) % 7) * 0.08;
    const dist = r * (1.12 + ((seed + k * 2) % 6) * 0.16);
    return {
      cx: cx + Math.cos(a) * dist,
      cy: cy + Math.sin(a) * dist * 0.85,
      cr: 0.8 + ((seed + k) % 5) * 0.7,
    };
  });
  return (
    <g>
      {/* Outer dirt spray with subtle shadow under each clod */}
      {sprayClods.map((c, k) => (
        <g key={k}>
          <ellipse cx={c.cx + 0.5} cy={c.cy + 0.5} rx={c.cr * 1.05} ry={c.cr * 0.7} fill="#1A1A1A" opacity="0.18" />
          <ellipse cx={c.cx} cy={c.cy} rx={c.cr} ry={c.cr * 0.78} fill="#1A1A1A" opacity="0.82" />
        </g>
      ))}
      {/* The void */}
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.72} fill="#1A1A1A" />
      <ellipse cx={cx} cy={cy - r * 0.1} rx={r * 0.85} ry={r * 0.6} fill="#000" />
      {/* Inner darker rim shadow at the bottom (suggests hole goes down) */}
      <path
        d={`M ${cx - r * 0.7} ${cy + r * 0.3} Q ${cx} ${cy + r * 0.6} ${cx + r * 0.7} ${cy + r * 0.3}`}
        stroke="#FAF7F2"
        strokeWidth="0.35"
        fill="none"
        opacity="0.35"
      />
      {/* Torn grass tufts at top rim */}
      {[-0.55, -0.18, 0.22, 0.6].map((dx, k) => (
        <g
          key={k}
          transform={`translate(${cx + r * dx} ${cy - r * 0.65}) rotate(${(k % 2 === 0 ? -8 : 6) + k * 3})`}
          stroke="#1A1A1A"
          strokeWidth="0.4"
          fill="none"
          opacity="0.7"
        >
          <path d="M 0 0 q -1 -7 -2 -11" />
          <path d="M 1.5 0 q 1 -6 1.5 -9" />
          <path d="M -1.5 0 q -1 -8 -2.5 -11" />
        </g>
      ))}
      {/* Hare 4-print stagger leading into the hole from below */}
      {[0, 1, 2].map((step) => {
        const py = cy + r * (1.6 + step * 0.7);
        const px = cx + (step % 2 === 0 ? -1 : 1) * 1.5;
        return (
          <g key={step} transform={`translate(${px} ${py})`} fill="#1A1A1A" opacity="0.65">
            <ellipse cx="-2" cy="-1.5" rx="1.1" ry="2.2" />
            <ellipse cx="2" cy="-1" rx="1.1" ry="2.2" />
            <circle cx="-1" cy="2.5" r="0.7" />
            <circle cx="1.5" cy="3" r="0.7" />
          </g>
        );
      })}
    </g>
  );
}
