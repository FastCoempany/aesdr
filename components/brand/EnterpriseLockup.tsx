import type { CSSProperties } from "react";

/**
 * Canonical AESDR / Enterprise sub-brand lockup. Mirrors the .subLogo*
 * pattern from app/enterprise/enterprise.module.css (the sub-brand canon
 * at AESDR_ENTERPRISE_CANON.md §2.4):
 *
 *   AESDR  (Playfair italic 900, iris-shimmer animated text)
 *   /      (slash separator, muted ink at 30%)
 *   ENTERPRISE  (Barlow Condensed bold caps, ink, letter-spacing .15em)
 *
 * Three sizes:
 *  - "small" — inline/list use (12px AESDR, 11px suffix)
 *  - "medium" — section eyebrows (18px AESDR, 14px suffix) — default
 *  - "large" — hero use (32px AESDR, 18px suffix)
 *
 * The iris shimmer uses the global `var(--iris)` linear-gradient + the
 * shared `shimmer` keyframe from app/globals.css (already defined; the
 * existing /enterprise route consumes the same animation).
 */
export function EnterpriseLockup({
  size = "medium",
  className,
  style,
  label = "AESDR / Enterprise",
}: {
  size?: "small" | "medium" | "large";
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  const dims = {
    small: { aesdr: 14, suffix: 11, slashGap: 4 },
    medium: { aesdr: 20, suffix: 13, slashGap: 6 },
    large: { aesdr: 36, suffix: 16, slashGap: 10 },
  }[size];

  return (
    <span
      role="img"
      aria-label={label}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 0,
        lineHeight: 1,
        userSelect: "none",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: dims.aesdr,
          letterSpacing: "-0.02em",
          background: "var(--iris)",
          backgroundSize: "300% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          animation: "shimmer 4s linear infinite",
        }}
      >
        AESDR
      </span>
      <span
        aria-hidden
        style={{
          fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
          fontWeight: 300,
          fontStyle: "italic",
          fontSize: dims.aesdr,
          color: "rgba(26, 26, 26, 0.3)",
          margin: `0 ${dims.slashGap}px`,
        }}
      >
        /
      </span>
      <span
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          fontWeight: 700,
          fontSize: dims.suffix,
          letterSpacing: ".15em",
          textTransform: "uppercase",
          color: "var(--ink, #1A1A1A)",
        }}
      >
        Enterprise
      </span>
    </span>
  );
}
