"use client";

import type { CSSProperties } from "react";

export type Intensity = "off" | "subtle" | "standard" | "heavy";

interface IntensityToggleProps {
  label: string;
  value: Intensity;
  onChange: (v: Intensity) => void;
}

const OPTIONS: Intensity[] = ["off", "subtle", "standard", "heavy"];

/**
 * Floating top-right toggle for evaluating preview-effect intensity.
 * Sits over the mockup; pointer-events:auto on itself, pointer-events:none
 * everywhere else, so it never blocks scroll behavior of the mockup.
 */
export function IntensityToggle({ label, value, onChange }: IntensityToggleProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        background: "rgba(26, 26, 26, 0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: "var(--cream)",
        padding: "10px 12px",
        fontFamily: "var(--mono, 'Space Mono', monospace)",
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        border: "1px solid rgba(255,255,255,0.12)",
        pointerEvents: "auto",
      }}
    >
      <div style={{ opacity: 0.55, fontSize: 9 }}>{label}</div>
      <div style={{ display: "flex", gap: 4 }}>
        {OPTIONS.map((opt) => {
          const active = value === opt;
          const btn: CSSProperties = {
            padding: "5px 8px",
            background: active ? "var(--cream)" : "transparent",
            color: active ? "var(--ink)" : "var(--cream)",
            border: "1px solid rgba(255,255,255,0.25)",
            fontFamily: "inherit",
            fontSize: 9,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontWeight: active ? 700 : 400,
          };
          return (
            <button key={opt} style={btn} onClick={() => onChange(opt)}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
