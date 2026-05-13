"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * HoleFilterLayer — Option B. Rich SVG filter pipeline.
 *
 * Each hole is rendered entirely in SVG, using the filter pipeline to
 * simulate depth, dirt texture, and lighting without raster sprites or
 * 3D libraries:
 *
 *  - feTurbulence    procedural noise field (dirt grit)
 *  - feDisplacementMap   distort the mound rim with that noise so it
 *                         reads as irregular, not smooth
 *  - feSpecularLighting  fake 3D specular lighting on the mound from a
 *                         low-angle point light
 *  - feGaussianBlur      cast shadow softening
 *
 * Combined with layered radial gradients (cream → tan → dark brown →
 * black for the hole interior) the result has visible depth and grit
 * without leaving SVG. No new dependencies.
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

const HAZARD_TAGS = [
  "FAULT · UNSTABLE",
  "WATER · LOW",
  "PREDATOR · KNOWN",
  "AIR · POOR",
  "CHAMBER · COLLAPSED",
];

export function HoleFilterLayer() {
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

    const strata = [
      { y: SURFACE_Y + 80, label: "TOPSOIL" },
      { y: SURFACE_Y + 260, label: "CLAY" },
      { y: SURFACE_Y + 540, label: "STONE" },
      { y: SURFACE_Y + 920, label: "WATER TABLE" },
      { y: SURFACE_Y + 1400, label: "BEDROCK" },
    ];

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

    const tunnels: string[] = [];
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
    for (let i = 0; i < chambers.length - 1; i++) {
      const a = chambers[i];
      const b = chambers[i + 1];
      if (rng() > 0.4) {
        const cpx = (a.cx + b.cx) / 2 + (rng() - 0.5) * 100;
        const cpy = (a.cy + b.cy) / 2 + 30;
        tunnels.push(`M ${a.cx} ${a.cy} Q ${cpx} ${cpy} ${b.cx} ${b.cy}`);
      }
    }

    type Hole = { cx: number; cy: number; r: number; seed: number };
    const holes: Hole[] = [];
    for (let i = 0; i < 16; i++) {
      holes.push({
        cx: 80 + rng() * 1280,
        cy: SURFACE_Y + 100 + rng() * (pageH - SURFACE_Y - 200),
        r: 30 + rng() * 28,
        seed: Math.floor(rng() * 1000),
      });
    }

    const roots: string[] = [];
    for (let i = 0; i < 40; i++) {
      const x = 40 + rng() * 1360;
      const endY = SURFACE_Y + 40 + rng() * 360;
      const wob = (rng() - 0.5) * 12;
      roots.push(`M ${x} ${SURFACE_Y - 2} Q ${x + wob} ${SURFACE_Y + (endY - SURFACE_Y) * 0.5} ${x + wob * 1.4} ${endY}`);
    }

    type HareTrack = { x: number; y: number };
    const hareTracks: HareTrack[] = [];
    for (let i = 0; i < 32; i++) {
      hareTracks.push({
        x: 30 + i * 44 + rng() * 8,
        y: SURFACE_Y - 18 - (i % 3) * 6,
      });
    }

    const grass: { x: number }[] = [];
    for (let i = 0; i < 28; i++) {
      grass.push({ x: 40 + i * 52 + rng() * 18 });
    }

    return { strata, chambers, tunnels, holes, roots, hareTracks, grass };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Hole · Filter" value={intensity} onChange={setIntensity} />

      {/* Soil strata wash */}
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

      {/* Ink scaffolding */}
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
        <line x1="0" y1={SURFACE_Y} x2="1440" y2={SURFACE_Y} stroke="#1A1A1A" strokeWidth="1" opacity="0.7" />
        <text x="40" y={SURFACE_Y - 14} fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.24em" fill="#6B6B6B">— SURFACE</text>

        <g stroke="#1A1A1A" strokeWidth="0.5" fill="none" opacity="0.7">
          {layout.grass.map((g, i) => (
            <g key={i} transform={`translate(${g.x} ${SURFACE_Y})`}>
              <path d="M 0 0 q -1 -10 -2 -16" />
              <path d="M 2 0 q 1 -8 2 -12" />
              <path d="M -2 0 q -1 -9 -3 -14" />
            </g>
          ))}
        </g>

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

        <g opacity="0.55">
          {layout.strata.map((b, i) => (
            <g key={i}>
              <line x1="0" y1={b.y} x2="1440" y2={b.y} stroke="#1A1A1A" strokeWidth="0.4" strokeDasharray="3 6" opacity="0.7" />
              <text x="40" y={b.y - 6} fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.22em" fill="#1A1A1A" opacity="0.75">— {b.label}</text>
            </g>
          ))}
        </g>

        <g stroke="#1A1A1A" strokeWidth="0.45" fill="none" opacity="0.55">
          {layout.roots.map((d, i) => <path key={i} d={d} />)}
        </g>

        <g stroke="#1A1A1A" strokeWidth="1.1" fill="none" opacity="0.78" strokeLinecap="round">
          {layout.tunnels.map((d, i) => <path key={i} d={d} />)}
        </g>

        {layout.chambers.map((c, i) => (
          <g key={i}>
            <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill="#FAF7F2" stroke="#1A1A1A" strokeWidth="1" strokeOpacity="0.78" />
            <ellipse cx={c.cx} cy={c.cy} rx={c.rx * 0.7} ry={c.ry * 0.7} fill="none" stroke="#1A1A1A" strokeWidth="0.5" opacity="0.55" />
          </g>
        ))}

        <g transform="translate(72 124)" opacity="0.88">
          <text x="0" y="0" fontFamily="Playfair Display, Georgia, serif" fontWeight="700" fontStyle="italic" fontSize="22" fill="#1A1A1A">UNDERLAND · filter</text>
          <text x="0" y="20" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.26em" fill="#6B6B6B">
            OPTION B · SVG TURBULENCE + LIGHTING
          </text>
          <line x1="0" y1="30" x2="380" y2="30" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.55" />
        </g>
      </svg>

      {/* SVG holes with filter pipeline */}
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
          {/* Hole interior gradient — dark fade with rim glow */}
          <radialGradient id="hole-depth" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="1" />
            <stop offset="65%" stopColor="#0E0805" stopOpacity="1" />
            <stop offset="95%" stopColor="#2A1A10" stopOpacity="1" />
            <stop offset="100%" stopColor="#5C3A20" stopOpacity="0.85" />
          </radialGradient>

          {/* Mound radial: tan rim → mid brown → dark brown core (where it would shadow against the hole) */}
          <radialGradient id="mound-base" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3a2818" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#6c4a30" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#a47a4e" stopOpacity="1" />
            <stop offset="92%" stopColor="#6c4a30" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#3a2818" stopOpacity="0" />
          </radialGradient>

          {/* Turbulence + displacement: distorts the mound rim into irregular shape */}
          <filter id="rim-roughen" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.06" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" />
          </filter>

          {/* Specular lighting filter for fake 3D mound */}
          <filter id="mound-lit" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="2" seed="3" result="bump" />
            <feSpecularLighting in="bump" surfaceScale="3" specularConstant="1.2" specularExponent="18" lightingColor="#fff4d8" result="spec">
              <fePointLight x="-200" y="-300" z="220" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceGraphic" operator="in" result="spec-masked" />
            <feComposite in="SourceGraphic" in2="spec-masked" operator="arithmetic" k1="0" k2="1" k3="0.65" k4="0" />
          </filter>

          {/* Cast shadow filter */}
          <filter id="hole-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="6" dy="6" result="shadow" />
            <feComponentTransfer in="shadow" result="shadow-faded">
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="shadow-faded" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Grit overlay filter — applies noise tint */}
          <filter id="dirt-grit" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="11" result="grit" />
            <feColorMatrix in="grit" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1" result="grit-alpha" />
            <feComposite in="grit-alpha" in2="SourceGraphic" operator="in" result="grit-masked" />
            <feComposite in="SourceGraphic" in2="grit-masked" operator="arithmetic" k1="0" k2="1" k3="-0.25" k4="0" />
          </filter>
        </defs>

        {layout.holes.map((h, i) => {
          // Per-hole jitter for ellipse aspect ratio
          const rx = h.r;
          const ry = h.r * (0.74 + (h.seed % 13) / 60);
          const moundRx = rx * 2.05;
          const moundRy = ry * 1.85;
          return (
            <g key={i} transform={`translate(${h.cx} ${h.cy})`}>
              {/* Cast shadow ellipse, offset and blurred */}
              <ellipse cx={moundRx * 0.18} cy={moundRy * 0.20} rx={moundRx * 1.08} ry={moundRy * 1.0} fill="rgba(0,0,0,0.32)" filter="url(#hole-shadow)" />

              {/* Mound — distorted ring, with specular lighting + grit */}
              <g filter="url(#rim-roughen)">
                <g filter="url(#mound-lit)">
                  <g filter="url(#dirt-grit)">
                    {/* Solid mound disc */}
                    <ellipse cx="0" cy="0" rx={moundRx} ry={moundRy} fill="url(#mound-base)" />
                  </g>
                </g>
              </g>

              {/* Cut out the hole — black ellipse with depth gradient on top */}
              <ellipse cx="0" cy="0" rx={rx * 1.02} ry={ry * 1.02} fill="#0E0805" />
              <ellipse cx="0" cy={ry * 0.05} rx={rx * 0.95} ry={ry * 0.92} fill="url(#hole-depth)" />

              {/* Rim highlight crescent on sun-facing side (upper-left) */}
              <path
                d={`M ${-rx * 0.95} ${ry * 0.05} A ${rx * 0.95} ${ry * 0.92} 0 0 1 ${rx * 0.1} ${-ry * 0.92}`}
                stroke="#c89a64"
                strokeWidth={Math.max(1, rx * 0.06)}
                fill="none"
                opacity="0.75"
              />
            </g>
          );
        })}
      </svg>

      {/* Crimson hazard tags */}
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
          zIndex: 7,
          opacity: op * 0.95,
          transition: "opacity 320ms",
        }}
      >
        {layout.chambers.filter((c) => c.hasHazard).map((c, i) => (
          <g key={i} stroke="#8B1A1A" strokeWidth="0.6">
            <line x1={c.cx} y1={c.cy} x2={c.cx + (c.cx < 720 ? 90 : -90)} y2={c.cy + 30} />
            <circle cx={c.cx} cy={c.cy} r="3" fill="#8B1A1A" />
            <g transform={`translate(${c.cx + (c.cx < 720 ? 96 : -96)} ${c.cy + 30})`}>
              <rect x={c.cx < 720 ? 0 : -110} y="-9" width="110" height="18" fill="none" stroke="#8B1A1A" strokeWidth="0.9" />
              <text x={c.cx < 720 ? 6 : -106} y="4" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.20em" fill="#8B1A1A" fontWeight="700" stroke="none">
                {HAZARD_TAGS[i % HAZARD_TAGS.length]}
              </text>
            </g>
          </g>
        ))}
      </svg>
    </>
  );
}
