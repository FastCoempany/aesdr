/**
 * /x/welcome?p=<slug> — the prospect entry point.
 *
 * The unique link you send a prospect points here. ProspectTracker (in the
 * group layout) records the open + identifies them; ExperienceFlow runs the
 * gate -> landing -> timer -> kit journey.
 */
import type { Metadata } from "next";
import ExperienceFlow from "../../_components/ExperienceFlow";

export const metadata: Metadata = {
  title: "Welcome · AESDR",
  robots: { index: false, follow: false },
};

export default function WelcomePage() {
  return <ExperienceFlow />;
}
