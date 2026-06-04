/**
 * Isolated layout for the affiliate-experience environment.
 *
 * This route group — app/(affiliate-experience)/ — is the self-contained
 * "affiliate prospect experience" (Leponeus gate -> forced landing -> kit)
 * plus its own founder-only analytics admin (/x/ops). It is NOT part of the
 * production aesdr.com funnel and must never be promoted to production; it
 * lives on the claude/affiliate-experience-env branch and ships to its own
 * preview deployment.
 *
 * The whole group is noindex. ProspectTracker (mounted here) reads the ?p=
 * link tag and starts attributing behavior to that prospect.
 */
import type { Metadata } from "next";
import ProspectTracker from "./_lib/ProspectTracker";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AffiliateExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProspectTracker />
      {children}
    </>
  );
}
