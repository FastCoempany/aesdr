/**
 * /x/landing/v3 — Variant 3: "Bracketed + Iris-Bordered"
 *
 * Subtle layer of design-system elements on top of the same shape as
 * the base /x/landing route:
 *   • Iris-shimmer Wordmark centered between the nav and the cinematic,
 *     framed by quiet corner brackets
 *   • Section anchors with an iris-gradient hairline bar (animated
 *     shimmer) under each section label
 *   • Huge GhostNumeral background watermark behind the 'What this is
 *     NOT' section — magazine-spread register
 *   • Final CTA gets a subtle crimson hairline border to read as a
 *     framed closing card
 *
 * The base landing JSX is identical; LandingShell internally branches
 * on the variant prop to render the variant-specific decorations.
 */
import type { Metadata } from "next";
import { LandingShell } from "../page";

export const metadata: Metadata = {
  title: "AESDR — Variant 3 (Bracketed + Iris-Bordered)",
  robots: { index: false, follow: false },
};

export default function LandingV3() {
  return <LandingShell variant="v3" />;
}
