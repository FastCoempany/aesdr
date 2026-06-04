/**
 * /x/welcome?p=<slug> — the prospect entry point: the Leponeus "Step 1" gate.
 * ProspectTracker (in the group layout) records the open + identifies them.
 * "Begin" sends them to the full landing at /x/landing.
 */
import type { Metadata } from "next";
import ExperienceGate from "../../_components/ExperienceGate";

export const metadata: Metadata = {
  title: "Welcome · AESDR",
  robots: { index: false, follow: false },
};

export default function WelcomePage() {
  return <ExperienceGate />;
}
