/**
 * /x/landing/v1 — Variant 1: "Editorial Marginalia"
 *
 * Subtle layer of design-system elements on top of the same shape as
 * the base /x/landing route:
 *   • Thin iris hairline divider directly under the nav
 *   • Numbered section anchors (§ 01 · Honesty, etc.) with mono caps
 *     and matching hairline rules either side
 *   • Magazine-page register — minimal additions, maximum restraint
 *
 * The base landing JSX is identical; LandingShell internally branches
 * on the variant prop to render the variant-specific decorations.
 */
import type { Metadata } from "next";
import { LandingShell } from "../page";

export const metadata: Metadata = {
  title: "AESDR — Variant 1 (Editorial Marginalia)",
  robots: { index: false, follow: false },
};

export default function LandingV1() {
  return <LandingShell variant="v1" />;
}
