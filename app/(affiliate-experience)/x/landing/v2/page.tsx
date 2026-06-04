/**
 * /x/landing/v2 — Variant 2: "Stamped Documentary"
 *
 * Subtle layer of design-system elements on top of the same shape as
 * the base /x/landing route:
 *   • Classified-stamp dossier band directly under the nav
 *     (DOSSIER — AESDR Course Prospectus + ClassifiedStamp + TerminalDots)
 *   • Section anchors rendered as ClassifiedStamp-outlined chips
 *     (§01 · Honesty, etc.) with a small terminal-dots punctuation
 *   • Documentary / archival register — same shape, classified treatment
 *
 * The base landing JSX is identical; LandingShell internally branches
 * on the variant prop to render the variant-specific decorations.
 */
import type { Metadata } from "next";
import { LandingShell } from "../page";

export const metadata: Metadata = {
  title: "AESDR — Variant 2 (Stamped Documentary)",
  robots: { index: false, follow: false },
};

export default function LandingV2() {
  return <LandingShell variant="v2" />;
}
