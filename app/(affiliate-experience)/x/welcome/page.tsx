/**
 * /x/welcome — the prospect entry point AND the invite wall.
 *
 * Invited (has the experience cookie) → the Leponeus "Step 1" gate; "Begin"
 * carries them to /x/landing. Arriving on a ?p= link but not yet invited → hand
 * off to /x/access to validate the slug and grant. Bare / un-invited → the
 * "private preview" wall. ProspectTracker (in the group layout) records the
 * open + identifies them off the ?p= tag once they're through.
 */
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { EXPERIENCE_COOKIE, EXPERIENCE_GRANT } from "@/lib/experience-gate";
import ExperienceGate from "../../_components/ExperienceGate";
import ExperienceWall from "../../_components/ExperienceWall";

export const metadata: Metadata = {
  title: "Welcome · AESDR",
  robots: { index: false, follow: false },
};

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const jar = await cookies();
  const invited = jar.get(EXPERIENCE_COOKIE)?.value === EXPERIENCE_GRANT;

  if (invited) return <ExperienceGate />;

  // Not invited yet, but arrived on a ?p= link → validate + grant at /x/access.
  const p =
    typeof sp.p === "string" ? sp.p : Array.isArray(sp.p) ? sp.p[0] : undefined;
  if (p) redirect(`/x/access?p=${encodeURIComponent(p)}`);

  // Bare domain / un-invited deep link → the wall.
  return <ExperienceWall />;
}
