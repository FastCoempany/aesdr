"use client";

import { useState } from "react";

import { IntensityToggle, type Intensity } from "./IntensityToggle";

/**
 * ScutesLayer — the tortoise's carapace as page grid.
 *
 * The page is bounded and structured by hexagonal scute plates, the
 * keratin polygons that tile a tortoise shell. Each plate carries a
 * faint set of concentric growth-rings (one ring per year of life).
 * Pattern is fixed-viewport, scrolls under the content like a carapace
 * pressing through paper. Editorial cream + ink only — no shimmer.
 */

const OP: Record<Intensity, number> = {
  off: 0,
  subtle: 0.10,
  standard: 0.22,
  heavy: 0.42,
};

export function ScutesLayer() {
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const opacity = OP[intensity];

  return (
    <>
      <IntensityToggle label="Scutes" value={intensity} onChange={setIntensity} />
      <svg
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
          opacity,
          transition: "opacity 320ms",
        }}
      >
        <defs>
          <pattern id="scute-hex" width="140" height="121.24" patternUnits="userSpaceOnUse">
            {/* Hex plate */}
            <polygon
              points="70,2 138,40 138,80 70,118 2,80 2,40"
              fill="none"
              stroke="#1A1A1A"
              strokeWidth="0.6"
            />
            {/* Growth rings — 5 concentric hexes inset */}
            {[0.82, 0.66, 0.50, 0.34, 0.18].map((s, i) => {
              const cx = 70;
              const cy = 60;
              const pts = [
                [cx, cy - 58 * s],
                [cx + 58 * s * 0.866, cy - 29 * s],
                [cx + 58 * s * 0.866, cy + 29 * s],
                [cx, cy + 58 * s],
                [cx - 58 * s * 0.866, cy + 29 * s],
                [cx - 58 * s * 0.866, cy - 29 * s],
              ]
                .map((p) => p.join(","))
                .join(" ");
              return (
                <polygon
                  key={i}
                  points={pts}
                  fill="none"
                  stroke="#1A1A1A"
                  strokeWidth="0.4"
                  opacity={0.35 + i * 0.08}
                />
              );
            })}
            {/* Center dot — apex of the plate */}
            <circle cx="70" cy="60" r="0.9" fill="#1A1A1A" />
          </pattern>
          {/* Vignette: keep edges denser, center quieter so copy stays readable */}
          <radialGradient id="scute-fade" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#1A1A1A" stopOpacity="0.20" />
            <stop offset="55%" stopColor="#1A1A1A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1A1A1A" stopOpacity="1" />
          </radialGradient>
          <mask id="scute-mask">
            <rect width="100%" height="100%" fill="url(#scute-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#scute-hex)" mask="url(#scute-mask)" />
      </svg>
    </>
  );
}
