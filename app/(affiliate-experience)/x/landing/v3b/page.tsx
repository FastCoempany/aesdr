/**
 * /x/landing/v3b — Variant 3b: "Architectural Bracket"
 *
 * Direction within the v3 register:
 *   • Big 40px ink CornerBrackets frame the entire section header band.
 *   • Iris is restricted to JUST the numeral (and the Get-Access CTA);
 *     everything else stays ink/crimson/cream.
 *   • No backdrop watermark on §01 — the bracket motif carries the
 *     section identity instead.
 *
 * Read: cleaner, more architectural, more negative space.
 */
import type { Metadata } from "next";
import { LandingShell } from "../page";

export const metadata: Metadata = {
  title: "AESDR — Variant 3b (Architectural Bracket)",
  robots: { index: false, follow: false },
};

export default function LandingV3b() {
  return <LandingShell variant="v3b" />;
}
