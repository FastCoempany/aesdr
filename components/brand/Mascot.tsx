import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * The 8 canonical Leponeus expressions. Use these literal strings — do
 * not invent new poses without a canon PR. See state0511-design-system.md
 * for the pose-to-moment mapping.
 */
export type Pose =
  | "doctrine"
  | "diagnosis"
  | "sprint"
  | "fall"
  | "recovery"
  | "rest"
  | "verdict"
  | "owner";

/**
 * Canonical mascot sizes. Every consumer-side render uses one of these
 * named tiers — not an arbitrary number. Each tier maps to a specific
 * surface class so the brand asset reads consistently across the product.
 *
 * Subsidiary surfaces (/enterprise) cap at `inline` (40px) in footer
 * position only, per the AESDR_ENTERPRISE_CANON sub-brand register.
 *
 * Audit reconciliation: §B / §M-adjacent — the audit flagged "mascot
 * used at multiple sizes inconsistently" with no enforcement. Naming
 * the scale + typing the prop is the lightest enforcement that doesn't
 * impose a visual refactor on every existing surface.
 */
export const MASCOT_SIZE = {
  /** 40px — course-player nav, /enterprise footer monogram only */
  inline: 40,
  /** 160px — dashboard header (compact alongside h1) */
  compact: 160,
  /** 200px — standard interior: syllabus, artifact-page backs, reveal */
  card: 200,
  /** 240px — default; account-flow + artifact-page primaries */
  panel: 240,
  /** 280px — welcome hero */
  welcome: 280,
  /** 320px — landing-sequence hero */
  landing: 320,
  /** 360px — course-completion celebration centerpiece */
  completion: 360,
  /** 420px — homepage banner only */
  banner: 420,
} as const;

export type MascotSize = (typeof MASCOT_SIZE)[keyof typeof MASCOT_SIZE];

export interface MascotProps {
  pose: Pose;
  /**
   * Square size in pixels. Use a value from `MASCOT_SIZE` rather than a
   * literal number — the type accepts only the canonical tiers below.
   * Default 240 (`MASCOT_SIZE.panel`). Canon scarcity: max one mascot per page.
   */
  size?: MascotSize;
  /** Set true for above-the-fold renders (hero, lesson splash) so Next preloads. */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * The brand's iridescent mascot. Single source for every mascot render
 * across the product — hero, dashboard, artifacts, error, OG card, emails.
 *
 * PNG assets live at `public/mascot/leponeus-{pose}.png`, copied from the
 * canon at `aesdr-design-system/brand/canon/mascot/png/` via the port
 * install script.
 */
export function Mascot({
  pose,
  size = 240,
  priority = false,
  className,
  style,
}: MascotProps) {
  return (
    <Image
      src={`/mascot/leponeus-${pose}.png`}
      alt={`Leponeus — ${pose}`}
      width={size}
      height={size}
      priority={priority}
      className={className}
      style={{ display: "block", ...style }}
    />
  );
}
