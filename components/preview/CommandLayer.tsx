"use client";

import { useState, useEffect, useMemo } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * CommandLayer — Tactical descendant #3.
 *
 * "Field Command Layer" — operational map that varies in density by
 * section position. Hero gets cinematic-but-readable density; mid-page
 * body sections drop to micro-texture; cards get only a faint
 * underlayer; CTA region concentrates into one tight tactical panel.
 *
 * The animal logic is EMBEDDED, not pasted. Tortoise = position-held
 * (rendered as hex hold-glyphs at section anchors). Hare = route
 * choice (rendered as small arrow glyphs along path branches). No
 * literal mascot illustration.
 *
 * Layer architecture (strict):
 *   L1: cream base (LandingMockup)
 *   L2: olive-drab terrain wash
 *   L3: ink contour + route paths
 *   L4: shell-position glyphs + OP markers
 *   L5: crimson risk marks (only where failure is indicated)
 *
 * Tone: the reader is treated as an operator, not a student.
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

export function CommandLayer() {
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
    // Density zones
    const heroEndY = pageH * 0.18;
    const bodyEndY = pageH * 0.78;

    // Hero region: medium density. Three contour groups + one hero route fragment.
    const heroContours = [
      { cx: 280, cy: heroEndY * 0.5, rx: 160, ry: 90, rot: 14, elev: 320 },
      { cx: 1140, cy: heroEndY * 0.7, rx: 200, ry: 110, rot: -22, elev: 380 },
      { cx: 720, cy: heroEndY * 0.3, rx: 240, ry: 100, rot: 0, elev: 410 },
    ];

    // Body region: micro-texture only — sparse contour ghosts, tiny hex marks
    const bodyMicroMarks: Array<{ x: number; y: number; kind: "hex" | "arrow" | "tick" }> = [];
    for (let i = 0; i < 26; i++) {
      const kind: "hex" | "arrow" | "tick" = i % 3 === 0 ? "hex" : i % 3 === 1 ? "arrow" : "tick";
      bodyMicroMarks.push({
        x: 60 + (i * 137) % 1320,
        y: heroEndY + 40 + ((i * 280) % (bodyEndY - heroEndY - 80)),
        kind,
      });
    }

    // Shell hex hold positions at section anchors (animal-logic: tortoise = position)
    const holdPositions = [
      { x: 240, y: pageH * 0.22, tag: "HOLD · DISC" },
      { x: 1200, y: pageH * 0.34, tag: "HOLD · PROOF" },
      { x: 240, y: pageH * 0.50, tag: "HOLD · PRICE" },
      { x: 1200, y: pageH * 0.66, tag: "HOLD · OBJ" },
    ];

    // Hare-arrow route-choice glyphs (animal-logic: hare = route choice)
    const routeArrows: Array<{ x: number; y: number; angle: number; len: number }> = [];
    for (let i = 0; i < 12; i++) {
      const onLeft = i % 2 === 0;
      routeArrows.push({
        x: onLeft ? 180 + (i % 3) * 30 : 1240 - (i % 3) * 30,
        y: heroEndY + i * ((bodyEndY - heroEndY) / 12) + 20,
        angle: onLeft ? 20 + (i % 4) * 10 : 160 - (i % 4) * 10,
        len: 28 + (i % 3) * 8,
      });
    }

    // CTA region: one concentrated tactical panel
    const ctaPanel = {
      x: 280,
      y: pageH * 0.84,
      w: 880,
      h: pageH * 0.10,
    };

    return { heroEndY, bodyEndY, heroContours, bodyMicroMarks, holdPositions, routeArrows, ctaPanel };
  }, [pageH]);

  return (
    <>
      <IntensityToggle label="Command" value={intensity} onChange={setIntensity} />

      {/* L2: olive-drab terrain wash — very low opacity */}
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
          opacity: op * 0.32,
          mixBlendMode: "multiply",
          background: "rgba(122,123,92,0.55)",
          transition: "opacity 320ms",
        }}
      />

      {/* L3+L4: ink contours, route, glyphs, OPs */}
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
        {/* ─── HERO: medium density terrain ─── */}
        <g stroke="#1A1A1A" strokeWidth="0.55" fill="none" opacity="0.58">
          {map.heroContours.map((c, i) => (
            <g key={i} transform={`rotate(${c.rot} ${c.cx} ${c.cy})`}>
              {[1.0, 0.82, 0.66, 0.50, 0.34].map((s, j) => (
                <ellipse key={j} cx={c.cx} cy={c.cy} rx={c.rx * s} ry={c.ry * s} opacity={0.42 + j * 0.07} />
              ))}
              <text x={c.cx} y={c.cy + 3} fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.18em" fill="#1A1A1A" textAnchor="middle">
                ▲ {c.elev}m
              </text>
            </g>
          ))}
        </g>

        {/* Hero route fragment — a single confident arc */}
        <g stroke="#1A1A1A" strokeWidth="2" fill="none" opacity="0.78" strokeLinecap="round">
          <path d={`M180 ${map.heroEndY * 0.65} Q720 ${map.heroEndY * 0.30} 1260 ${map.heroEndY * 0.85}`} />
          <path d={`M180 ${map.heroEndY * 0.65} Q720 ${map.heroEndY * 0.30} 1260 ${map.heroEndY * 0.85}`} strokeWidth="0.5" strokeDasharray="4 4" opacity="0.7" />
        </g>

        {/* ─── BODY: micro-texture only ─── */}
        {map.bodyMicroMarks.map((m, i) => (
          <g key={i} transform={`translate(${m.x} ${m.y})`} opacity="0.5">
            {m.kind === "hex" && (
              <polygon points={hexPoints(0, 0, 6)} fill="none" stroke="#1A1A1A" strokeWidth="0.5" />
            )}
            {m.kind === "arrow" && (
              <g stroke="#1A1A1A" strokeWidth="0.5" fill="#1A1A1A">
                <line x1="-5" y1="0" x2="5" y2="0" />
                <path d="M5 0 l -3 -2 l 0 4 z" />
              </g>
            )}
            {m.kind === "tick" && (
              <line x1="-3" y1="0" x2="3" y2="0" stroke="#1A1A1A" strokeWidth="0.5" />
            )}
          </g>
        ))}

        {/* Hold positions — embedded tortoise logic */}
        {map.holdPositions.map((h, i) => (
          <g key={i} transform={`translate(${h.x} ${h.y})`} stroke="#1A1A1A" fill="none" strokeWidth="1">
            <polygon points={hexPoints(0, 0, 18)} />
            <polygon points={hexPoints(0, 0, 11)} strokeWidth="0.6" />
            <circle cx="0" cy="0" r="1.8" fill="#1A1A1A" />
            <text
              x="0"
              y="36"
              fontFamily="'Space Mono', monospace"
              fontSize="8"
              letterSpacing="0.22em"
              fill="#1A1A1A"
              stroke="none"
              textAnchor="middle"
              fontWeight="700"
            >
              {h.tag}
            </text>
          </g>
        ))}

        {/* Route-choice arrows — embedded hare logic */}
        {map.routeArrows.map((a, i) => (
          <g key={i} transform={`translate(${a.x} ${a.y}) rotate(${a.angle})`} stroke="#1A1A1A" fill="#1A1A1A">
            <line x1="0" y1="0" x2={a.len} y2="0" strokeWidth="1" />
            <path d={`M${a.len} 0 l -5 -3 l 0 6 z`} />
          </g>
        ))}

        {/* CTA tactical panel — concentrated */}
        <g transform={`translate(${map.ctaPanel.x} ${map.ctaPanel.y})`} stroke="#1A1A1A" fill="none" strokeWidth="1">
          <rect x="0" y="0" width={map.ctaPanel.w} height={map.ctaPanel.h} />
          <rect x="6" y="6" width={map.ctaPanel.w - 12} height={map.ctaPanel.h - 12} strokeWidth="0.5" opacity="0.55" />
          {/* Corner brackets */}
          {[
            [0, 0, 1, 1],
            [map.ctaPanel.w, 0, -1, 1],
            [0, map.ctaPanel.h, 1, -1],
            [map.ctaPanel.w, map.ctaPanel.h, -1, -1],
          ].map(([cx, cy, sx, sy], k) => (
            <g key={k} stroke="#1A1A1A" strokeWidth="2">
              <line x1={cx} y1={cy} x2={cx + sx * 18} y2={cy} />
              <line x1={cx} y1={cy} x2={cx} y2={cy + sy * 18} />
            </g>
          ))}
          {/* Internal coords/route stub */}
          <text x="22" y="34" fontFamily="'Space Mono', monospace" fontSize="11" letterSpacing="0.24em" fill="#1A1A1A" stroke="none" fontWeight="700">
            COMMAND PANEL · ACTION
          </text>
          <text x="22" y="52" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.20em" fill="#6B6B6B" stroke="none">
            objective confirmed · route engaged
          </text>
          <g transform={`translate(${map.ctaPanel.w - 80} ${map.ctaPanel.h / 2})`} stroke="#1A1A1A" fill="none">
            <polygon points={hexPoints(0, 0, 26)} strokeWidth="1.2" />
            <polygon points={hexPoints(0, 0, 16)} strokeWidth="0.6" />
            <circle cx="0" cy="0" r="2" fill="#1A1A1A" />
          </g>
        </g>

        {/* Top-left cartouche */}
        <g transform="translate(72 124)" opacity="0.88">
          <text x="0" y="0" fontFamily="Playfair Display, Georgia, serif" fontWeight="700" fontSize="20" fill="#1A1A1A">
            FIELD COMMAND LAYER
          </text>
          <text x="0" y="18" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.24em" fill="#6B6B6B">
            OPERATOR · SECTOR LEPONEUS · v.12
          </text>
          <line x1="0" y1="28" x2="320" y2="28" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.55" />
        </g>

        {/* OPs — sparse, 4 total */}
        {[0.20, 0.42, 0.62, 0.80].map((p, i) => {
          const onLeft = i % 2 === 0;
          const x = onLeft ? 100 : 1320;
          const y = pageH * p;
          return (
            <g key={i} transform={`translate(${x} ${y})`} stroke="#1A1A1A" fill="none" strokeWidth="1">
              <line x1="0" y1="-20" x2="0" y2="0" />
              <rect x="-6" y="-28" width="12" height="8" fill="#1A1A1A" stroke="none" />
              <text x={onLeft ? 14 : -14} y="-22" fontFamily="'Space Mono', monospace" fontSize="9" letterSpacing="0.20em" fill="#1A1A1A" stroke="none" fontWeight="700" textAnchor={onLeft ? "start" : "end"}>
                OP-{(i + 1).toString().padStart(2, "0")}
              </text>
            </g>
          );
        })}
      </svg>

      {/* L5: crimson risk marks — only where failure is indicated */}
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
          <pattern id="command-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#8B1A1A" strokeWidth="0.9" />
          </pattern>
        </defs>

        {/* Hero: one risk callout */}
        <g>
          <rect x="900" y={map.heroEndY * 0.5} width="200" height="68" fill="url(#command-hatch)" opacity="0.55" />
          <rect x="900" y={map.heroEndY * 0.5} width="200" height="68" fill="none" stroke="#8B1A1A" strokeWidth="1.2" />
          <text x="912" y={map.heroEndY * 0.5 + 22} fontFamily="'Space Mono', monospace" fontSize="10" letterSpacing="0.24em" fill="#8B1A1A" fontWeight="700">
            UNMAPPED BUYER
          </text>
          <text x="912" y={map.heroEndY * 0.5 + 38} fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill="#8B1A1A" opacity="0.85">
            ⚠ stakeholder unknown
          </text>
        </g>

        {/* Mid-page: one risk callout */}
        <g>
          <rect x="380" y={pageH * 0.46} width="220" height="68" fill="url(#command-hatch)" opacity="0.55" />
          <rect x="380" y={pageH * 0.46} width="220" height="68" fill="none" stroke="#8B1A1A" strokeWidth="1.2" />
          <text x="392" y={pageH * 0.46 + 22} fontFamily="'Space Mono', monospace" fontSize="10" letterSpacing="0.24em" fill="#8B1A1A" fontWeight="700">
            LATE-STAGE STALL
          </text>
          <text x="392" y={pageH * 0.46 + 38} fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill="#8B1A1A" opacity="0.85">
            ⚠ route compromised
          </text>
        </g>

        {/* CTA panel: small crimson "ENGAGED" stamp inside the panel */}
        <g transform={`translate(${map.ctaPanel.x + map.ctaPanel.w / 2} ${map.ctaPanel.y + map.ctaPanel.h - 24}) rotate(-3)`}>
          <g stroke="#8B1A1A" fill="none" strokeWidth="1.3">
            <rect x="-66" y="-12" width="132" height="24" />
            <text x="0" y="5" fontFamily="'Space Mono', monospace" fontSize="10" letterSpacing="0.30em" fill="#8B1A1A" stroke="none" textAnchor="middle" fontWeight="700">
              OP-12 · ENGAGED
            </text>
          </g>
        </g>

        {/* Footer */}
        <g transform={`translate(1340 ${pageH - 60})`}>
          <text x="0" y="0" fontFamily="'Space Mono', monospace" fontSize="10" letterSpacing="0.26em" fill="#8B1A1A" textAnchor="end" fontWeight="700">
            YOU ARE AN OPERATOR
          </text>
          <text x="0" y="14" fontFamily="'Space Mono', monospace" fontSize="8" letterSpacing="0.20em" fill="#6B6B6B" textAnchor="end">
            move through pressure intelligently
          </text>
        </g>
      </svg>
    </>
  );
}
