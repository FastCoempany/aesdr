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
          zIndex: 5,
          opacity,
          mixBlendMode: "multiply",
          transition: "opacity 320ms",
        }}
      >
        <defs>
          <pattern id="scute-hex" width="140" height="121.24" patternUnits="userSpaceOnUse">
            <polygon
              points="70,2 138,40 138,80 70,118 2,80 2,40"
              fill="none"
              stroke="#1A1A1A"
              strokeWidth="0.8"
            />
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
                  strokeWidth="0.5"
                  opacity={0.5 + i * 0.08}
                />
              );
            })}
            <circle cx="70" cy="60" r="1.1" fill="#1A1A1A" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scute-hex)" />
      </svg>
    </>
  );
}
