/**
 * /x/landing/v3c — Variant 3c: "Editorial Iris"
 *
 * Direction within the v3 register:
 *   • Section anchors borrow the v1 chapter-opener layout — big italic
 *     numeral on the left, 'Chapter' mono eyebrow + display-italic
 *     section label in the middle, hairline trailing on the right.
 *   • BUT the numeral renders as iris-gradient text (instead of v1's
 *     solid crimson) and the trailing hairline is iris-animated.
 *   • Same v3 family backdrop (ghost AESDR numeral behind §01).
 *
 * Read: editorial restraint meets iris brand — magazine-page register
 * with the brand's signature gradient threading through.
 */
import type { Metadata } from "next";
import { LandingShell } from "../page";

export const metadata: Metadata = {
  title: "AESDR — Variant 3c (Editorial Iris)",
  robots: { index: false, follow: false },
};

export default function LandingV3c() {
  return <LandingShell variant="v3c" />;
}
