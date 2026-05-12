"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * TacticalLayer — Thicket descendant. The sales-floor as battlefield map.
 *
 * The page becomes a topographic operations chart. Hairline contour
 * lines map the terrain underneath the copy. Ink "safe paths" trace
 * down the gutters as tortoise routes. Crimson hostile-zone hatching
 * marks danger regions ("HANDOFF FAILURE", "WEAK DISCOVERY · NO-GO").
 * Numbered observation posts (OP-1, OP-2 …) replace base-Thicket's
 * watch points, each tagged with a crimson tick. Compass rose
 * upper-right, scale bar lower-left, crimson range-rings around the
 * worst hazards. Olive-drab faint wash to read as field substrate,
 * not paper.
 *
 * Color: crimson is the language of risk — hostile-zone hatching,
 * NO-GO callouts, range rings. Used heavily but only as semantic
 * signal, never decorative. Olive drab (#7A7B5C) is layer-local —
 * not a brand token; sandbox only.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.42,
  standard: 0.72,
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

export function TacticalLayer() {
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
    const rng = seededJitter(307);

    // Contour-line systems — ovoid concentric ellipses, mid-page
    const contours: Array<{ cx: number; cy: number; rx: number; ry: number; rot: number }> = [];
    for (let i = 0; i < 5; i++) {
      contours.push({
        cx: 200 + rng() * 1040,
        cy: 200 + rng() * (pageH - 400),
        rx: 120 + rng() * 200,
        ry: 80 + rng() * 140,
        rot: rng() * 60 - 30,
      });
    }

    // Hostile zones — crimson hatched regions with named threat
    const hostileZones: Array<{ x: number; y: number; w: number; h: number; label: string; sub: string }> = [
      { x: 460, y: pageH * 0.14, w: 240, h: 90, label: "HANDOFF FAILURE", sub: "loss · 14%" },
      { x: 880, y: pageH * 0.32, w: 200, h: 70, label: "WEAK DISCOVERY", sub: "no-go" },
      { x: 320, y: pageH * 0.52, w: 220, h: 80, label: "QUOTA PANIC", sub: "burnout zone" },
      { x: 920, y: pageH * 0.70, w: 240, h: 90, label: "FAKE URGENCY", sub: "false signal" },
      { x: 540, y: pageH * 0.86, w: 200, h: 70, label: "BAD MANAGER", sub: "ranging area" },
    ];

    // Observation posts — friendly numbered positions
    const obsPosts: Array<{ x: number; y: number; id: string; bearing: number }> = [];
    for (let i = 0; i < 7; i++) {
      const onLeft = i % 2 === 0;
      obsPosts.push({
        x: onLeft ? 80 + rng() * 60 : 1300 + rng() * 60,
        y: 240 + i * (pageH / 7) + (rng() - 0.5) * 60,
        id: `OP-${i + 1}`,
        bearing: Math.round(rng() * 360),
      });
    }

    // Range rings — concentric crimson rings around the worst hazards
    const rangeRings = hostileZones.slice(0, 3).map((z) => ({
      cx: z.x + z.w / 2,
      cy: z.y + z.h / 2,
    }));

    // Safe paths — ink trails snaking down each gutter
    const safePathLeft: string[] = [];
    const safePathRight: string[] = [];
    let lx = 56;
    let ly = 200;
    safePathLeft.push(`M${lx} ${ly}`);
    while (ly < pageH - 100) {
      lx = 50 + (rng() - 0.5) * 24;
      ly += 60 + rng() * 30;
      safePathLeft.push(`L${lx} ${ly}`);
    }
    let rx = 1384;
    let ry = 200;
    safePathRight.push(`M${rx} ${ry}`);
    while (ry < pageH - 100) {
      rx = 1390 + (rng() - 0.5) * 24;
      ry += 60 + rng() * 30;
      safePathRight.push(`L${rx} ${ry}`);
    }

    return {
      contours,
      hostileZones,
      obsPosts,
      rangeRings,
      safePathLeft: safePathLeft.join(" "),
      safePathRight: safePathRight.join(" "),
    };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Tactical" value={intensity} onChange={setIntensity} />

      {/* ─── Olive-drab substrate wash ─── */}
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
          opacity: op * 0.45,
          mixBlendMode: "multiply",
          background: "rgba(122,123,92,0.55)",
          transition: "opacity 320ms",
        }}
      />

      {/* ─── Ink terrain layer: contours + safe paths + OPs ─── */}
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
        <defs>
          {/* Diagonal hatching pattern in ink for terrain shading */}
          <pattern id="terrain-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#1A1A1A" strokeWidth="0.4" />
          </pattern>
        </defs>

        {/* Topographic contour lines */}
        <g stroke="#1A1A1A" strokeWidth="0.5" fill="none" opacity="0.55">
          {map.contours.map((c, i) => (
            <g key={i} transform={`rotate(${c.rot} ${c.cx} ${c.cy})`}>
              {[1.0, 0.85, 0.7, 0.55, 0.42, 0.3, 0.2].map((s, j) => (
                <ellipse key={j} cx={c.cx} cy={c.cy} rx={c.rx * s} ry={c.ry * s} opacity={0.4 + j * 0.06} />
              ))}
              {/* Elevation peak marker */}
              <text
                x={c.cx}
                y={c.cy + 3}
                fontFamily="'Space Mono', monospace"
                fontSize="8"
                letterSpacing="0.18em"
                fill="#1A1A1A"
                textAnchor="middle"
              >
                ▲ {320 + i * 40}m
              </text>
            </g>
          ))}
        </g>

        {/* Ink safe paths — gutter trails */}
        <g stroke="#1A1A1A" strokeWidth="1.6" fill="none" opacity="0.75">
          <path d={map.safePathLeft} strokeLinecap="round" />
          <path d={map.safePathRight} strokeLinecap="round" />
          {/* Direction arrowheads sprinkled along the paths */}
          {Array.from({ length: 6 }).map((_, i) => {
            const y = 320 + i * (pageH / 6);
            return (
              <g key={i}>
                <path
                  d={`M50 ${y} l -4 -7 l 8 0 z`}
                  fill="#1A1A1A"
                  stroke="none"
                />
                <path
                  d={`M1390 ${y} l -4 -7 l 8 0 z`}
                  fill="#1A1A1A"
                  stroke="none"
                />
              </g>
            );
          })}
        </g>

        {/* Observation posts */}
        {map.obsPosts.map((op, i) => (
          <g key={i} transform={`translate(${op.x} ${op.y})`} stroke="#1A1A1A" fill="none" strokeWidth="1">
            {/* Tower silhouette */}
            <line x1="0" y1="-24" x2="0" y2="0" />
            <rect x="-7" y="-32" width="14" height="8" fill="#1A1A1A" stroke="none" />
            <path d="M-9 -32 L0 -38 L9 -32" />
            {/* Base hatching */}
            {Array.from({ length: 5 }).map((_, k) => (
              <line key={k} x1={-9 + k * 4} y1="3" x2={-11 + k * 4} y2="7" strokeWidth="0.4" />
            ))}
            {/* Label */}
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
              {op.id}
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
              brg {op.bearing.toString().padStart(3, "0")}°
            </text>
          </g>
        ))}

        {/* Compass rose upper-right */}
        <g transform="translate(1280 200)" stroke="#1A1A1A" fill="none" strokeWidth="1">
          <circle cx="0" cy="0" r="48" />
          <circle cx="0" cy="0" r="38" strokeWidth="0.5" />
          <circle cx="0" cy="0" r="24" strokeWidth="0.5" />
          {/* Cardinal points */}
          {(["N", "E", "S", "W"] as const).map((dir, k) => {
            const a = (k / 4) * Math.PI * 2 - Math.PI / 2;
            return (
              <g key={dir}>
                <line x1={Math.cos(a) * 24} y1={Math.sin(a) * 24} x2={Math.cos(a) * 48} y2={Math.sin(a) * 48} strokeWidth="1.4" />
                <text
                  x={Math.cos(a) * 60}
                  y={Math.sin(a) * 60 + 3}
                  fontFamily="Playfair Display, Georgia, serif"
                  fontWeight="700"
                  fontSize="14"
                  fill="#1A1A1A"
                  stroke="none"
                  textAnchor="middle"
                >
                  {dir}
                </text>
              </g>
            );
          })}
          {/* Diagonal ticks */}
          {[1, 3, 5, 7].map((k) => {
            const a = (k / 8) * Math.PI * 2 - Math.PI / 2;
            return (
              <line key={k} x1={Math.cos(a) * 38} y1={Math.sin(a) * 38} x2={Math.cos(a) * 48} y2={Math.sin(a) * 48} strokeWidth="0.7" />
            );
          })}
          {/* Center pin */}
          <circle cx="0" cy="0" r="2" fill="#1A1A1A" />
        </g>

        {/* Scale bar lower-left */}
        <g transform={`translate(80 ${pageH - 80})`} stroke="#1A1A1A" fill="#1A1A1A" strokeWidth="0.8">
          {/* Alternating black/white scale bar */}
          {[0, 1, 2, 3, 4].map((k) => (
            <rect key={k} x={k * 22} y="0" width="22" height="8" fill={k % 2 === 0 ? "#1A1A1A" : "none"} stroke="#1A1A1A" />
          ))}
          {/* Tick labels */}
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
          <text
            x="0"
            y="-8"
            fontFamily="'Space Mono', monospace"
            fontSize="8"
            letterSpacing="0.22em"
            fill="#6B6B6B"
            stroke="none"
          >
            SCALE · 1:200
          </text>
        </g>

        {/* Top-left chart cartouche */}
        <g transform="translate(72 132)" opacity="0.85">
          <text
            x="0"
            y="0"
            fontFamily="Playfair Display, Georgia, serif"
            fontWeight="700"
            fontSize="18"
            fill="#1A1A1A"
          >
            FIELD CHART · SECTOR LEPONEUS
          </text>
          <text
            x="0"
            y="18"
            fontFamily="'Space Mono', monospace"
            fontSize="9"
            letterSpacing="0.24em"
            fill="#6B6B6B"
          >
            CONFIDENTIAL · ROUTE PLANNING · v.12
          </text>
          <line x1="0" y1="28" x2="380" y2="28" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.55" />
        </g>
      </svg>

      {/* ─── Crimson risk layer (NOT multiplied — keep crimson saturated) ─── */}
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
          <pattern id="crimson-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#8B1A1A" strokeWidth="0.9" />
          </pattern>
        </defs>

        {/* Hostile-zone hatched rectangles */}
        {map.hostileZones.map((z, i) => (
          <g key={i}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="url(#crimson-hatch)" opacity="0.6" />
            <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="none" stroke="#8B1A1A" strokeWidth="1.4" />
            <text
              x={z.x + 10}
              y={z.y + 22}
              fontFamily="'Space Mono', monospace"
              fontSize="11"
              letterSpacing="0.24em"
              fill="#8B1A1A"
              fontWeight="700"
            >
              {z.label}
            </text>
            <text
              x={z.x + 10}
              y={z.y + 38}
              fontFamily="'Space Mono', monospace"
              fontSize="8"
              letterSpacing="0.20em"
              fill="#8B1A1A"
              opacity="0.85"
            >
              ⚠ {z.sub}
            </text>
            {/* Corner brackets */}
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

        {/* Range rings around the top-3 hazards */}
        {map.rangeRings.map((rr, i) => (
          <g key={i} stroke="#8B1A1A" fill="none">
            {[140, 200, 260].map((r, k) => (
              <circle key={k} cx={rr.cx} cy={rr.cy} r={r} strokeWidth="0.6" strokeDasharray="4 6" opacity={0.65 - k * 0.15} />
            ))}
            {/* Bearing tick at top */}
            <line x1={rr.cx} y1={rr.cy - 140} x2={rr.cx} y2={rr.cy - 150} strokeWidth="1" />
            <text
              x={rr.cx + 4}
              y={rr.cy - 144}
              fontFamily="'Space Mono', monospace"
              fontSize="7"
              letterSpacing="0.18em"
              fill="#8B1A1A"
            >
              140m
            </text>
          </g>
        ))}

        {/* Each OP marked with a crimson tick (target log) */}
        {map.obsPosts.map((op, i) => (
          <g key={i} stroke="#8B1A1A" fill="#8B1A1A">
            <circle cx={op.x + 60} cy={op.y - 28} r="3" />
            <text
              x={op.x + 68}
              y={op.y - 24}
              fontFamily="'Space Mono', monospace"
              fontSize="7"
              letterSpacing="0.18em"
              stroke="none"
            >
              tgt
            </text>
          </g>
        ))}

        {/* Bottom-right operational stamp */}
        <g transform={`translate(1340 ${pageH - 60})`}>
          <text
            x="0"
            y="0"
            fontFamily="'Space Mono', monospace"
            fontSize="10"
            letterSpacing="0.26em"
            fill="#8B1A1A"
            textAnchor="end"
            fontWeight="700"
          >
            PLAN YOUR ROUTE
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
            the field is contested · the training is the map
          </text>
        </g>
      </svg>
    </>
  );
}
