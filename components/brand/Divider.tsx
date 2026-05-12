import type { CSSProperties } from "react";

/**
 * Canon divider patterns, ported from the design system canvas at
 * `aesdr-design-system/brand/synthesis.jsx`. Four variants:
 *
 *   - `dotted-path` — gentle dashed arc, lessons-flow rhythm
 *   - `iris`        — animated iris-gradient hairline, section seams
 *   - `hair`        — 1px ink-tone hairline, low-emphasis row separator
 *   - `meander`     — Greek-key zigzag, chapter-end mark
 *
 * Use intentionally. Per the canon, each variant signals something
 * different about the break it's making.
 */

export type DividerVariant = "dotted-path" | "iris" | "hair" | "meander";

interface DividerProps {
  variant: DividerVariant;
  /** Optional override for the inline wrapper. */
  style?: CSSProperties;
  className?: string;
}

export function Divider({ variant, style, className }: DividerProps) {
  const wrapper: CSSProperties = {
    display: "block",
    width: "100%",
    margin: "24px 0",
    ...style,
  };

  switch (variant) {
    case "dotted-path":
      return (
        <svg
          className={className}
          viewBox="0 0 480 8"
          width="100%"
          height={8}
          style={wrapper}
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 4 Q 240 0 480 4"
            stroke="var(--ink, #1A1A1A)"
            strokeWidth="1.2"
            strokeDasharray="2 6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      );

    case "iris":
      return (
        <span
          aria-hidden="true"
          className={className}
          style={{
            ...wrapper,
            height: 2,
            background:
              "linear-gradient(90deg,#FF006E,#FF6B00,#F59E0B,#10B981,#38BDF8,#8B5CF6,#FF006E)",
            backgroundSize: "200% 100%",
            animation: "iris-flow 8s linear infinite",
          }}
        />
      );

    case "hair":
      return (
        <span
          aria-hidden="true"
          className={className}
          style={{
            ...wrapper,
            height: 1,
            background: "var(--light, #E8E4DF)",
          }}
        />
      );

    case "meander":
      return (
        <svg
          className={className}
          viewBox="0 0 480 12"
          width="100%"
          height={12}
          style={wrapper}
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d="M 0 6 L 6 6 L 6 2 L 12 2 L 12 10 L 18 10 L 18 2 L 24 2 L 24 10 L 30 10 L 30 2 L 36 2 L 36 10 L 42 10 L 42 2 L 48 2 L 48 10 L 54 10 L 54 6 L 480 6"
            fill="none"
            stroke="var(--ink, #1A1A1A)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
