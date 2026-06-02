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
 * Four sizes:
 *  - "tiny"   — the A · E monogram alone. Iris-shimmer "A", muted dot,
 *               solid ink "E". Used in tight footers, attribution lines,
 *               anywhere the full wordmark would be redundant.
 *  - "small"  — inline/list use (14px AESDR, 11px suffix)
 *  - "medium" — section eyebrows (20px AESDR, 13px suffix) — default
 *  - "large"  — hero use (36px AESDR, 16px suffix)
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
  size?: "tiny" | "small" | "medium" | "large";
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  if (size === "tiny") {
    // Initials-only mark — A (iris shimmer) · E (ink). Reads as
    // "AESDR · Enterprise" abbreviated, intended for footers and
    // attribution rows where the full wordmark would be repetitive.
    return (
      <span
        role="img"
        aria-label={label}
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
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
            fontSize: 22,
            letterSpacing: "-0.02em",
            background: "var(--iris)",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            animation: "shimmer 4s linear infinite",
            lineHeight: 1,
          }}
        >
          A
        </span>
        <span
          aria-hidden
          style={{
            color: "rgba(26, 26, 26, 0.35)",
            fontSize: 16,
            lineHeight: 1,
            fontWeight: 700,
            display: "inline-block",
            transform: "translateY(-1px)",
          }}
        >
          ·
        </span>
        <span
          style={{
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: "var(--ink, #1A1A1A)",
            lineHeight: 1,
          }}
        >
          E
        </span>
      </span>
    );
  }

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
