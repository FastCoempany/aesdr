"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * ContestedLayer — Tactical descendant #1.
 *
 * "Contested Terrain Interface" — the sales floor as contested terrain.
 *
 * Visual logic: the MOST COMPREHENSIVE tactical map of the three. Full
 * topographic contour system, named hazard zones at every section, a
 * downward-guiding route stitched through the entire page, friendly
 * shell-glyph position markers at section anchors, observation posts,
 * compass rose, scale bar, stats-coordinate panel. The page reads as
 * a complete operational chart.
 *
 * Tone: this is not a meadow. It is a contested field. Training is
 * the map.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.46,
  standard: 0.78,
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

const HAZARDS = [
  { label: "HANDOFF FAILURE", sub: "14% loss · no-go" },
  { label: "WEAK DISCOVERY", sub: "low-conviction zone" },
  { label: "UNQUALIFIED ROUTE", sub: "stakeholder unknown" },
  { label: "LOSS CORRIDOR", sub: "exposure 40m" },
  { label: "FAKE URGENCY", sub: "false signal" },
  { label: "QUOTA PANIC", sub: "burnout · ranging" },
];

export function ContestedLayer() {
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

  const map = useMemo(() => {
    const rng = seededJitter(719);

    // Contour groups — many across the page
    type ContourGroup = { cx: number; cy: number; rx: number; ry: number; rot: number; elev: number };
    const contours: ContourGroup[] = [];
    for (let i = 0; i < 8; i++) {
      contours.push({
        cx: 180 + rng() * 1080,
        cy: 240 + i * (pageH / 8) + (rng() - 0.5) * 80,
        rx: 110 + rng() * 200,
        ry: 70 + rng() * 130,
        rot: rng() * 80 - 40,
        elev: 280 + i * 50,
      });
    }

    // Hazard zones — one per section, named from HAZARDS list
    type Hazard = { x: number; y: number; w: number; h: number; label: string; sub: string };
    const hazards: Hazard[] = HAZARDS.map((h, i) => {
      const onLeft = i % 2 === 0;
      return {
        x: onLeft ? 380 + rng() * 80 : 880 - rng() * 80,
        y: 320 + i * (pageH / HAZARDS.length) + (rng() - 0.5) * 40,
        w: 220 + rng() * 40,
        h: 80 + rng() * 20,
        label: h.label,
        sub: h.sub,
      };
    });

    // Observation posts — 6
    type OP = { x: number; y: number; id: string; bearing: number };
    const obsPosts: OP[] = [];
    for (let i = 0; i < 6; i++) {
      const onLeft = i % 2 === 0;
      obsPosts.push({
        x: onLeft ? 80 + rng() * 30 : 1320 - rng() * 30,
        y: 260 + i * (pageH / 6) + (rng() - 0.5) * 60,
        id: `OP-${(i + 1).toString().padStart(2, "0")}`,
        bearing: Math.round(rng() * 360),
      });
    }

    // Friendly shell-hex markers at section anchors
    type FriendlyPos = { x: number; y: number; tag: string };
    const friendlies: FriendlyPos[] = [];
    [0.16, 0.30, 0.44, 0.58, 0.72, 0.86].forEach((p, i) => {
      friendlies.push({ x: 720 + (i % 2 === 0 ? -380 : 380), y: pageH * p, tag: `HOLD-${(i + 1).toString().padStart(2, "0")}` });
    });

    // Main route — sinuous polyline guiding downward, threading between hazards
    const route: string[] = [];
    let x = 720;
    let y = 220;
    route.push(`M${x} ${y}`);
    for (let i = 0; i < 18; i++) {
      const dx = (rng() - 0.5) * 320;
      const dy = 200 + rng() * 80;
      const nx = Math.max(280, Math.min(1160, x + dx));
      const ny = Math.min(pageH - 200, y + dy);
      const cpx = (x + nx) / 2 + (rng() - 0.5) * 100;
      const cpy = (y + ny) / 2;
      route.push(`Q${cpx} ${cpy} ${nx} ${ny}`);
      x = nx;
      y = ny;
    }

    // Range rings only around the top 2 hazards
    const rangeRings = hazards.slice(0, 2).map((h) => ({ cx: h.x + h.w / 2, cy: h.y + h.h / 2 }));

    return {
      contours,
      hazards,
      obsPosts,
      friendlies,
      route: route.join(" "),
      rangeRings,
    };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Contested" value={intensity} onChange={setIntensity} />

      {/* Olive-drab substrate */}
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
          opacity: op * 0.55,
          mixBlendMode: "multiply",
          background: "rgba(122,123,92,0.6)",
          transition: "opacity 320ms",
        }}
      />

      {/* Ink terrain layer */}
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
        {/* Topographic contours — dense */}
        <g stroke="#1A1A1A" strokeWidth="0.5" fill="none" opacity="0.6">
          {map.contours.map((c, i) => (
            <g key={i} transform={`rotate(${c.rot} ${c.cx} ${c.cy})`}>
              {[1.0, 0.88, 0.76, 0.64, 0.52, 0.40, 0.28, 0.18].map((s, j) => (
                <ellipse key={j} cx={c.cx} cy={c.cy} rx={c.rx * s} ry={c.ry * s} opacity={0.45 + j * 0.05} />
              ))}
              <text
                x={c.cx}
                y={c.cy + 3}
                fontFamily="'Space Mono', monospace"
                fontSize="8"
                letterSpacing="0.18em"
                fill="#1A1A1A"
                textAnchor="middle"
              >
                ▲ {c.elev}m
              </text>
            </g>
          ))}
        </g>

        {/* Main route — bold ink path */}
        <g stroke="#1A1A1A" strokeWidth="2.2" fill="none" opacity="0.85" strokeLinecap="round" strokeLinejoin="round">
          <path d={map.route} strokeDasharray="0" />
          {/* Direction tick markers along route */}
          <path d={map.route} strokeWidth="0.6" strokeDasharray="4 6" opacity="0.7" />
        </g>

        {/* Friendly shell-hex position markers */}
        {map.friendlies.map((f, i) => (
          <g key={i} transform={`translate(${f.x} ${f.y})`} stroke="#1A1A1A" fill="none" strokeWidth="1">
            <polygon points={hexPoints(0, 0, 22)} />
            <polygon points={hexPoints(0, 0, 14)} strokeWidth="0.6" />
            <circle cx="0" cy="0" r="2" fill="#1A1A1A" />
            <text
              x="0"
              y="40"
              fontFamily="'Space Mono', monospace"
              fontSize="8"
              letterSpacing="0.20em"
              fill="#1A1A1A"
              stroke="none"
              textAnchor="middle"
              fontWeight="700"
            >
              {f.tag}
            </text>
          </g>
        ))}

        {/* Observation posts */}
        {map.obsPosts.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`} stroke="#1A1A1A" fill="none" strokeWidth="1">
            <line x1="0" y1="-24" x2="0" y2="0" />
            <rect x="-7" y="-32" width="14" height="8" fill="#1A1A1A" stroke="none" />
            <path d="M-9 -32 L0 -38 L9 -32" />
            {Array.from({ length: 5 }).map((_, k) => (
              <line key={k} x1={-9 + k * 4} y1="3" x2={-11 + k * 4} y2="7" strokeWidth="0.4" />
            ))}
            <text
              x="14"
              y="-26"
              fontFamily="'Space Mono', monospace"
              fontSize="9"
              letterSpacing="0.20em"
              fill="#1A1A1A"
              stroke="none"
              fontWeight="700"
            >
              {p.id}
            </text>
            <text
              x="14"
              y="-14"
              fontFamily="'Space Mono', monospace"
              fontSize="7"
              letterSpacing="0.20em"
              fill="#6B6B6B"
              stroke="none"
            >
              brg {p.bearing.toString().padStart(3, "0")}°
            </text>
          </g>
        ))}

        {/* Compass rose */}
        <g transform="translate(1280 200)" stroke="#1A1A1A" fill="none" strokeWidth="1">
          <circle cx="0" cy="0" r="48" />
          <circle cx="0" cy="0" r="38" strokeWidth="0.5" />
          <circle cx="0" cy="0" r="24" strokeWidth="0.5" />
          {(["N", "E", "S", "W"] as const).map((dir, k) => {
            const a = (k / 4) * Math.PI * 2 - Math.PI / 2;
            return (
              <g key={dir}>
                <line x1={Math.cos(a) * 24} y1={Math.sin(a) * 24} x2={Math.cos(a) * 48} y2={Math.sin(a) * 48} strokeWidth="1.4" />
                <text x={Math.cos(a) * 60} y={Math.sin(a) * 60 + 3} fontFamily="Playfair Display, Georgia, serif" fontWeight="700" fontSize="14" fill="#1A1A1A" stroke="none" textAnchor="middle">
                  {dir}
                </text>
              </g>
            );
          })}
          <circle cx="0" cy="0" r="2" fill="#1A1A1A" />
        </g>

        {/* Scale bar */}
        <g transform={`translate(80 ${pageH - 80})`} stroke="#1A1A1A" strokeWidth="0.8">
          {[0, 1, 2, 3, 4].map((k) => (
            <rect key={k} x={k * 22} y="0" width="22" height="8" fill={k % 2 === 0 ? "#1A1A1A" : "none"} stroke="#1A1A1A" />
          ))}
          {["0", "10", "20", "30", "40", "50m"].map((label, k) => (
            <text
              key={k}
              x={k * 22}
              y="22"
              fontFamily="'Space Mono', monospace"
              fontSize="7"
              letterSpacing="0.18em"
              fill="#1A1A1A"
              stroke="none"
              textAnchor="middle"
            >
              {label}
            </text>
          ))}
          <text x="0" y="-8" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.22em" fill="#6B6B6B" stroke="none">
            SCALE · 1:200
          </text>
        </g>

        {/* Stats / coordinate panel — mid-right */}
        <g transform={`translate(1100 ${pageH * 0.48})`} stroke="#1A1A1A" strokeWidth="0.6" fill="none" opacity="0.78">
          <rect x="0" y="0" width="220" height="120" />
          <text x="12" y="22" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.24em" fill="#1A1A1A" stroke="none" fontWeight="700">
            COORDS · SECTOR-12
          </text>
          <line x1="12" y1="32" x2="208" y2="32" strokeWidth="0.4" opacity="0.55" />
          {[
            ["GRID", "N48 32 12 / E2 18 04"],
            ["ELEV", "412m · ridge"],
            ["WIND", "NW 14kts · gust 22"],
            ["LIGHT", "0612 · golden"],
            ["RISK", "ELEVATED · 3 hazards"],
          ].map(([k, v], i) => (
            <g key={i}>
              <text x="12" y={48 + i * 14} fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.18em" fill="#6B6B6B" stroke="none">
                {k}
              </text>
              <text x="80" y={48 + i * 14} fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.18em" fill="#1A1A1A" stroke="none">
                {v}
              </text>
            </g>
          ))}
        </g>

        {/* Top-left cartouche */}
        <g transform="translate(72 124)" opacity="0.88">
          <text x="0" y="0" fontFamily="Playfair Display, Georgia, serif" fontWeight="700" fontSize="20" fill="#1A1A1A">
            FIELD CHART · CONTESTED TERRAIN
          </text>
          <text x="0" y="18" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.24em" fill="#6B6B6B">
            SECTOR LEPONEUS · OPERATIONS · v.12
          </text>
          <line x1="0" y1="28" x2="400" y2="28" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.55" />
        </g>
      </svg>

      {/* Crimson risk layer */}
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
          <pattern id="contested-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#8B1A1A" strokeWidth="0.9" />
          </pattern>
        </defs>

        {map.hazards.map((z, i) => (
          <g key={i}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="url(#contested-hatch)" opacity="0.6" />
            <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="none" stroke="#8B1A1A" strokeWidth="1.4" />
            <text x={z.x + 10} y={z.y + 22} fontFamily="'Space Mono', monospace" fontSize="11" letterSpacing="0.24em" fill="#8B1A1A" fontWeight="700">
              {z.label}
            </text>
            <text x={z.x + 10} y={z.y + 38} fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill="#8B1A1A" opacity="0.85">
              ⚠ {z.sub}
            </text>
            {[
              [z.x, z.y, 1, 1],
              [z.x + z.w, z.y, -1, 1],
              [z.x, z.y + z.h, 1, -1],
              [z.x + z.w, z.y + z.h, -1, -1],
            ].map(([cx, cy, sx, sy], k) => (
              <g key={k} stroke="#8B1A1A" strokeWidth="1.6">
                <line x1={cx} y1={cy} x2={cx + sx * 12} y2={cy} />
                <line x1={cx} y1={cy} x2={cx} y2={cy + sy * 12} />
              </g>
            ))}
          </g>
        ))}

        {map.rangeRings.map((r, i) => (
          <g key={i} stroke="#8B1A1A" fill="none">
            {[140, 200, 260].map((rad, k) => (
              <circle key={k} cx={r.cx} cy={r.cy} r={rad} strokeWidth="0.6" strokeDasharray="4 6" opacity={0.65 - k * 0.15} />
            ))}
          </g>
        ))}

        {/* Enemy contact ticks at OPs */}
        {map.obsPosts.map((p, i) => (
          <g key={i} stroke="#8B1A1A" fill="#8B1A1A">
            <circle cx={p.x + 60} cy={p.y - 28} r="3" />
            <text x={p.x + 68} y={p.y - 24} fontFamily="'Space Mono', monospace" fontSize="7" letterSpacing="0.18em" stroke="none">
              tgt
            </text>
          </g>
        ))}

        <g transform={`translate(1340 ${pageH - 60})`}>
          <text x="0" y="0" fontFamily="'Space Mono', monospace" fontSize="10" letterSpacing="0.26em" fill="#8B1A1A" textAnchor="end" fontWeight="700">
            THE FIELD IS CONTESTED
          </text>
          <text x="0" y="14" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill="#6B6B6B" textAnchor="end">
            plan your route · the training is the map
          </text>
        </g>
      </svg>
    </>
  );
}
