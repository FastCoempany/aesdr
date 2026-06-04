/**
 * /x/landing/v3a — Variant 3a: "Saturated Iris"
 *
 * Direction within the v3 register:
 *   • Section anchors render on a FULL iris-gradient plate (with
 *     animated shimmer), surrounded by quiet ink corner brackets.
 *     Iris is dominant.
 *   • Section labels render in cream over the iris plate.
 *   • Same v3 family backdrop (ghost AESDR numeral behind §01).
 *
 * Read: more saturated, more brand-mark presence, higher decoration.
 */
import type { Metadata } from "next";
import { LandingShell } from "../page";

export const metadata: Metadata = {
  title: "AESDR — Variant 3a (Saturated Iris)",
  robots: { index: false, follow: false },
};

export default function LandingV3a() {
  return <LandingShell variant="v3a" />;
}
