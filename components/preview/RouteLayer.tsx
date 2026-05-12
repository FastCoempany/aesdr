"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * RouteLayer — Tactical descendant #2.
 *
 * "Operator Route Map" — route-planning surface for an AE/SDR
 * operating under pressure.
 *
 * Visual logic: ONE primary route line traverses the entire page from
 * hero to CTA, ending at a single waypoint marker. Hazards are
 * minimal (2–3 zones max). Coordinate micro-labels along the route.
 * Compass rose smaller, less prominent. Cleaner overall — every mark
 * means something. A line is a path. A hatch is danger. A ring is
 * exposure. A shell glyph is a defended position.
 *
 * Tone: editorial rather than tactical cosplay. Premium, restrained,
 * matte. The reader is being trained to move through pressure.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.46,
  standard: 0.78,
  heavy: 1.0,
};

const FALLBACK_HEIGHT = 5200;

function hexPoints(cx: number, cy: number, r: number, rot = 0) {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rot;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
}

export function RouteLayer() {
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
    // ONE primary route — deliberately composed waypoints from hero → CTA
    // Each waypoint has a coordinate label, every other one is a hex hold-position
    type Waypoint = { x: number; y: number; coord: string; isHold: boolean; label?: string };
    const waypoints: Waypoint[] = [
      { x: 720, y: 240, coord: "N48 32 12", isHold: true, label: "WP-01 · START" },
      { x: 460, y: 540, coord: "N48 33 08", isHold: false },
      { x: 880, y: 880, coord: "N48 33 54", isHold: true, label: "WP-02 · HOLD" },
      { x: 520, y: 1240, coord: "N48 34 32", isHold: false },
      { x: 980, y: 1620, coord: "N48 35 16", isHold: false },
      { x: 600, y: 2020, coord: "N48 36 02", isHold: true, label: "WP-03 · HOLD" },
      { x: 960, y: 2420, coord: "N48 36 48", isHold: false },
      { x: 520, y: 2820, coord: "N48 37 24", isHold: false },
      { x: 900, y: 3220, coord: "N48 38 12", isHold: true, label: "WP-04 · CHECK" },
      { x: 560, y: 3640, coord: "N48 38 58", isHold: false },
      { x: 960, y: 4040, coord: "N48 39 42", isHold: false },
      { x: 720, y: 4440, coord: "N48 40 28", isHold: true, label: "WP-05 · OBJECTIVE" },
    ].map((w) => ({ ...w, y: Math.min(w.y, pageH - 200) }));

    // Build smooth Bezier path through waypoints
    let path = `M${waypoints[0].x} ${waypoints[0].y}`;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      const cpx = (a.x + b.x) / 2 + (i % 2 === 0 ? 80 : -80);
      const cpy = (a.y + b.y) / 2;
      path += ` Q${cpx} ${cpy} ${b.x} ${b.y}`;
    }

    // ONLY 2-3 hazards across the entire page (sparse)
    type Hazard = { x: number; y: number; w: number; h: number; label: string; sub: string };
    const hazards: Hazard[] = [
      { x: 280, y: pageH * 0.22, w: 220, h: 76, label: "DISCOVERY GAP", sub: "stakeholder unknown" },
      { x: 1040, y: pageH * 0.52, w: 220, h: 76, label: "ROUTE COMPROMISED", sub: "late-stage stall" },
      { x: 220, y: pageH * 0.78, w: 220, h: 76, label: "NO-GO", sub: "call objective unclear" },
    ];

    // Sparse contour groups — just enough to read as terrain, not dense
    const contours = [
      { cx: 280, cy: pageH * 0.15, rx: 180, ry: 90, rot: 18, elev: 320 },
      { cx: 1180, cy: pageH * 0.36, rx: 220, ry: 110, rot: -22, elev: 380 },
      { cx: 360, cy: pageH * 0.66, rx: 200, ry: 100, rot: 14, elev: 410 },
      { cx: 1100, cy: pageH * 0.86, rx: 220, ry: 110, rot: -8, elev: 450 },
    ];

    return { waypoints, path, hazards, contours };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Route" value={intensity} onChange={setIntensity} />

      {/* Olive-drab substrate — lighter than Contested */}
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
          opacity: op * 0.4,
          mixBlendMode: "multiply",
          background: "rgba(122,123,92,0.5)",
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
        {/* Sparse contour groups */}
        <g stroke="#1A1A1A" strokeWidth="0.5" fill="none" opacity="0.55">
          {map.contours.map((c, i) => (
            <g key={i} transform={`rotate(${c.rot} ${c.cx} ${c.cy})`}>
              {[1.0, 0.78, 0.58, 0.4, 0.24].map((s, j) => (
                <ellipse key={j} cx={c.cx} cy={c.cy} rx={c.rx * s} ry={c.ry * s} opacity={0.4 + j * 0.07} />
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

        {/* THE primary route */}
        <g stroke="#1A1A1A" fill="none" opacity="0.92" strokeLinecap="round" strokeLinejoin="round">
          <path d={map.path} strokeWidth="2.6" />
          {/* Dashed reference line over it */}
          <path d={map.path} strokeWidth="0.6" strokeDasharray="6 4" opacity="0.7" />
        </g>

        {/* Waypoint markers */}
        {map.waypoints.map((w, i) => (
          <g key={i} transform={`translate(${w.x} ${w.y})`}>
            {w.isHold ? (
              // Shell-hex hold position
              <g stroke="#1A1A1A" fill="#FAF7F2" strokeWidth="1.2">
                <polygon points={hexPoints(0, 0, 18)} />
                <polygon points={hexPoints(0, 0, 11)} strokeWidth="0.6" />
                <circle cx="0" cy="0" r="2" fill="#1A1A1A" />
              </g>
            ) : (
              // Small waypoint cross
              <g stroke="#1A1A1A" strokeWidth="1.4">
                <line x1="-5" y1="0" x2="5" y2="0" />
                <line x1="0" y1="-5" x2="0" y2="5" />
                <circle cx="0" cy="0" r="3" fill="none" />
              </g>
            )}
            {/* Coordinate label */}
            <text
              x="14"
              y="-12"
              fontFamily="'Space Mono', monospace"
              fontSize="8"
              letterSpacing="0.18em"
              fill="#6B6B6B"
              stroke="none"
            >
              {w.coord}
            </text>
            {w.label && (
              <text
                x="14"
                y="4"
                fontFamily="'Space Mono', monospace"
                fontSize="9"
                letterSpacing="0.20em"
                fill="#1A1A1A"
                stroke="none"
                fontWeight="700"
              >
                {w.label}
              </text>
            )}
          </g>
        ))}

        {/* Smaller compass rose — top-right, less prominent */}
        <g transform="translate(1340 200)" stroke="#1A1A1A" fill="none" strokeWidth="0.8" opacity="0.75">
          <circle cx="0" cy="0" r="28" />
          <circle cx="0" cy="0" r="18" strokeWidth="0.4" />
          {(["N", "E", "S", "W"] as const).map((dir, k) => {
            const a = (k / 4) * Math.PI * 2 - Math.PI / 2;
            return (
              <g key={dir}>
                <line x1={Math.cos(a) * 18} y1={Math.sin(a) * 18} x2={Math.cos(a) * 28} y2={Math.sin(a) * 28} strokeWidth="1.1" />
                <text x={Math.cos(a) * 38} y={Math.sin(a) * 38 + 3} fontFamily="Playfair Display, Georgia, serif" fontWeight="700" fontSize="10" fill="#1A1A1A" stroke="none" textAnchor="middle">
                  {dir}
                </text>
              </g>
            );
          })}
          <circle cx="0" cy="0" r="1.6" fill="#1A1A1A" />
        </g>

        {/* Scale bar — minimal */}
        <g transform={`translate(80 ${pageH - 80})`} stroke="#1A1A1A" strokeWidth="0.7">
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={k * 28} y="0" width="28" height="6" fill={k % 2 === 0 ? "#1A1A1A" : "none"} stroke="#1A1A1A" />
          ))}
          {["0", "20", "40", "60", "80m"].map((label, k) => (
            <text
              key={k}
              x={k * 28}
              y="18"
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
        </g>

        {/* Top-left cartouche */}
        <g transform="translate(72 124)" opacity="0.88">
          <text x="0" y="0" fontFamily="Playfair Display, Georgia, serif" fontWeight="700" fontSize="20" fill="#1A1A1A">
            OPERATOR ROUTE MAP
          </text>
          <text x="0" y="18" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.24em" fill="#6B6B6B">
            ROUTE 12 · 5 WAYPOINTS · OBJECTIVE: WP-05
          </text>
          <line x1="0" y1="28" x2="320" y2="28" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.55" />
        </g>
      </svg>

      {/* Crimson layer */}
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
          <pattern id="route-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#8B1A1A" strokeWidth="0.9" />
          </pattern>
        </defs>

        {map.hazards.map((z, i) => (
          <g key={i}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="url(#route-hatch)" opacity="0.55" />
            <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="none" stroke="#8B1A1A" strokeWidth="1.3" />
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
              <g key={k} stroke="#8B1A1A" strokeWidth="1.5">
                <line x1={cx} y1={cy} x2={cx + sx * 11} y2={cy} />
                <line x1={cx} y1={cy} x2={cx} y2={cy + sy * 11} />
              </g>
            ))}
          </g>
        ))}

        {/* Range ring around the middle hazard only */}
        <g stroke="#8B1A1A" fill="none">
          {[120, 180].map((rad, k) => (
            <circle
              key={k}
              cx={map.hazards[1].x + map.hazards[1].w / 2}
              cy={map.hazards[1].y + map.hazards[1].h / 2}
              r={rad}
              strokeWidth="0.6"
              strokeDasharray="4 6"
              opacity={0.6 - k * 0.15}
            />
          ))}
        </g>

        {/* Final objective marker — bright crimson ring around WP-05 */}
        <g stroke="#8B1A1A" fill="none">
          <circle
            cx={map.waypoints[map.waypoints.length - 1].x}
            cy={map.waypoints[map.waypoints.length - 1].y}
            r="34"
            strokeWidth="1.4"
            strokeDasharray="6 4"
          />
          <circle
            cx={map.waypoints[map.waypoints.length - 1].x}
            cy={map.waypoints[map.waypoints.length - 1].y}
            r="46"
            strokeWidth="0.6"
            strokeDasharray="3 5"
            opacity="0.55"
          />
          <text
            x={map.waypoints[map.waypoints.length - 1].x}
            y={map.waypoints[map.waypoints.length - 1].y + 64}
            fontFamily="'Space Mono', monospace"
            fontSize="10"
            letterSpacing="0.26em"
            fill="#8B1A1A"
            stroke="none"
            textAnchor="middle"
            fontWeight="700"
          >
            OBJECTIVE
          </text>
        </g>

        <g transform={`translate(1340 ${pageH - 60})`}>
          <text x="0" y="0" fontFamily="'Space Mono', monospace" fontSize="10" letterSpacing="0.26em" fill="#8B1A1A" textAnchor="end" fontWeight="700">
            EVERY MARK MEANS SOMETHING
          </text>
          <text x="0" y="14" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill="#6B6B6B" textAnchor="end">
            a line is a path · a hatch is danger · a ring is exposure
          </text>
        </g>
      </svg>
    </>
  );
}
