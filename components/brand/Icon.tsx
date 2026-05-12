import type { CSSProperties } from "react";

/**
 * The 18-glyph canonical AESDR icon set, ported from the design system
 * canvas at `aesdr-design-system/brand/synthesis.jsx`.
 *
 * Rules (from AGENTS.md + canon):
 * - 64×64 viewBox, 4px clear-zone, 1.6px round-cap monoline
 * - Stroke uses `currentColor` so the icon respects parent text color —
 *   ink, muted, crimson, or anything else the consuming context sets
 * - Crimson reserved for change/loss/money glyphs (fall, recovery sprout,
 *   warn, refund). Those are hardcoded crimson on the relevant paths
 *   regardless of currentColor, per canon.
 * - Solid fills only on `cursor` and `quill` (signal mass)
 */

export type IconName =
  | "shell"
  | "ear"
  | "mile"
  | "rep"
  | "fall"
  | "recovery"
  | "weight"
  | "ledger"
  | "hourglass"
  | "signal"
  | "eye"
  | "lock"
  | "cursor"
  | "warn"
  | "refund"
  | "discord"
  | "team"
  | "quill";

interface IconProps {
  name: IconName;
  /** Square render size in pixels. Default 16. */
  size?: number;
  /** Aria label. Default empty (decorative) — set if the icon stands alone. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 16, label, className, style }: IconProps) {
  const a11y = label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true as const };
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      {...a11y}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {PATHS[name]}
      </g>
    </svg>
  );
}

// ─── Paths (per-glyph, copied verbatim from canon synthesis.jsx) ───

const PATHS: Record<IconName, React.ReactNode> = {
  shell: (
    <>
      <path d="M 6 50 Q 32 12 58 50 Z" />
      <path d="M 28 22 L 32 18 L 36 22 L 36 28 L 32 32 L 28 28 Z" strokeOpacity=".45" />
      <path d="M 18 48 V 38 M 46 48 V 38" strokeOpacity=".45" />
      <path d="M 12 46 Q 32 50 52 46" strokeOpacity=".25" />
    </>
  ),
  ear: (
    <>
      <path d="M 24 60 Q 18 16 36 4 Q 32 32 36 60 Z" />
      <path d="M 30 56 Q 24 22 32 12" strokeOpacity=".4" />
    </>
  ),
  mile: (
    <>
      <path d="M 6 52 Q 32 22 58 52" />
      <circle cx="6" cy="52" r="2" fill="currentColor" stroke="none" />
      <line x1="32" y1="34" x2="32" y2="40" strokeOpacity=".5" />
      <path d="M 58 52 l -6 -3 m 6 3 l -3 -6" />
    </>
  ),
  rep: (
    <>
      <path d="M 50 14 a 22 22 0 1 0 -4 38" />
      <path d="M 50 14 l -6 -2 m 6 2 l -2 6" />
      <path d="M 46 52 l -6 2 m 6 -2 l 2 6" />
    </>
  ),
  fall: (
    <>
      <path d="M 6 50 Q 32 14 58 50 Z" />
      <path d="M 28 50 L 24 36 L 34 38 L 26 22" stroke="#8B1A1A" />
    </>
  ),
  recovery: (
    <>
      <path d="M 6 54 Q 32 18 58 54 Z" />
      <path d="M 32 24 Q 30 14 32 4" />
      <path d="M 32 18 q -8 -2 -10 -10 q 8 4 10 8" fill="#8B1A1A" stroke="#8B1A1A" />
      <path d="M 32 10 q 8 -2 10 -10 q -8 4 -10 8" fill="#8B1A1A" stroke="#8B1A1A" />
    </>
  ),
  weight: (
    <>
      <line x1="6" y1="34" x2="58" y2="34" />
      <line x1="32" y1="34" x2="32" y2="14" />
      <rect x="16" y="10" width="32" height="6" />
      <path d="M 4 38 a 8 8 0 0 0 16 0 Z" />
      <path d="M 44 38 a 8 8 0 0 0 16 0 Z" />
    </>
  ),
  ledger: (
    <>
      <rect x="10" y="6" width="44" height="52" />
      <line x1="14" y1="6" x2="14" y2="58" />
      <line x1="20" y1="18" x2="48" y2="18" />
      <line x1="20" y1="28" x2="48" y2="28" />
      <line x1="20" y1="38" x2="40" y2="38" />
      <line x1="20" y1="48" x2="48" y2="48" />
    </>
  ),
  hourglass: (
    <>
      <path d="M 14 6 H 50 V 14 Q 50 24 32 32 Q 50 40 50 50 V 58 H 14 V 50 Q 14 40 32 32 Q 14 24 14 14 Z" />
      <circle cx="30" cy="40" r="1" fill="currentColor" stroke="none" />
      <circle cx="34" cy="44" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  signal: (
    <>
      <rect x="8" y="42" width="6" height="14" />
      <rect x="20" y="32" width="6" height="24" />
      <rect x="32" y="22" width="6" height="34" />
      <rect x="44" y="12" width="6" height="44" />
    </>
  ),
  eye: (
    <>
      <path d="M 4 32 Q 32 8 60 32 Q 32 56 4 32 Z" />
      <circle cx="32" cy="32" r="7" />
      <circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" />
      <path d="M 10 22 Q 32 18 54 22" strokeOpacity=".35" />
    </>
  ),
  lock: (
    <>
      <rect x="12" y="28" width="40" height="28" rx="2" />
      <path d="M 18 28 V 18 a 14 14 0 0 1 28 0 V 28" />
      <circle cx="32" cy="40" r="2" fill="currentColor" stroke="none" />
      <line x1="32" y1="42" x2="32" y2="48" />
    </>
  ),
  cursor: (
    <path d="M 14 8 L 52 36 L 34 40 L 44 58 L 38 62 L 28 44 L 16 50 Z" fill="currentColor" />
  ),
  warn: (
    <>
      <path d="M 32 6 L 58 54 L 6 54 Z" />
      <line x1="32" y1="24" x2="32" y2="38" stroke="#8B1A1A" />
      <circle cx="32" cy="46" r="1.8" fill="#8B1A1A" stroke="none" />
    </>
  ),
  refund: (
    <>
      <circle cx="32" cy="32" r="20" />
      <path d="M 32 16 a 16 16 0 1 1 -16 16" stroke="#8B1A1A" />
      <path d="M 16 32 l 6 -5 m -6 5 l 6 5" stroke="#8B1A1A" />
    </>
  ),
  discord: (
    <>
      <path d="M 12 18 Q 32 6 52 18 L 56 50 Q 46 56 40 50 L 24 50 Q 18 56 8 50 Z" />
      <ellipse cx="22" cy="34" rx="2.5" ry="3.5" fill="currentColor" stroke="none" />
      <ellipse cx="42" cy="34" rx="2.5" ry="3.5" fill="currentColor" stroke="none" />
    </>
  ),
  team: (
    <>
      <circle cx="22" cy="24" r="7" />
      <circle cx="42" cy="24" r="7" />
      <path d="M 8 56 Q 22 38 32 48 Q 42 38 56 56" />
    </>
  ),
  quill: (
    <>
      <path d="M 8 56 L 50 14 Q 60 4 56 22 L 18 60 Z" fill="currentColor" />
      <line x1="20" y1="46" x2="36" y2="30" stroke="var(--cream, #FAF7F2)" strokeOpacity=".4" />
      <line x1="26" y1="52" x2="42" y2="36" stroke="var(--cream, #FAF7F2)" strokeOpacity=".4" />
    </>
  ),
};
