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

export interface MascotProps {
  pose: Pose;
  /** Square size in pixels. Default 240. Canon scarcity: max one mascot per page. */
  size?: number;
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
