/**
 * Page: /[affiliateSlug]/workshop
 * Per D07 (registration-page spec), D08 (title ratified 2026-05-28),
 * AESDR-AFFILIATE-HUB-SPEC §"Page 1.x — workshop registration".
 *
 * Architecture (ratified 2026-05-28): page copy lives in
 * content/affiliate-kit/workshop-registration.md (already in
 * canon-check's allowIn carve-out for the operating-manual ban).
 * This server component is plumbing only — fetches the affiliate
 * record, resolves per-affiliate slot values, renders the markdown,
 * and splits the rendered HTML around [REGISTRATION_FORM_SLOT] to
 * inject the client-side <WorkshopRegistrationForm /> component.
 *
 * URL pattern follows D14's ratified `[affiliateSlug]/...` top-level
 * shape (e.g. aesdr.com/apex-bdr/replay/[token] → /apex-bdr/workshop).
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { renderMarkdown } from "@/lib/markdown";
import {
  getLiveWorkshopAffiliate,
  resolveTemplateSlots,
  DEFAULT_WORKSHOP_TITLE,
} from "@/lib/workshop";
import WorkshopRegistrationForm from "@/components/workshop/WorkshopRegistrationForm";
import "./workshop.css";

// Dynamic rendering — workshop_date_iso and registration_open change
// without a deploy. ISR (revalidate) would also work but adds staleness
// risk for a time-sensitive registration form.
export const dynamic = "force-dynamic";

type Params = { affiliateSlug: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { affiliateSlug } = await params;
  const affiliate = await getLiveWorkshopAffiliate(affiliateSlug);
  if (!affiliate) {
    return { title: "Workshop not found · AESDR" };
  }
  const title = affiliate.workshop_title || DEFAULT_WORKSHOP_TITLE;
  return {
    title: `${title} · AESDR workshop`,
    description:
      "Sixty minutes on the part of the job your onboarding skipped — for SDRs and AEs in their first two years, and the experienced ones running it back with more context.",
    robots: { index: false, follow: false }, // per-affiliate page, not for organic search
  };
}

function loadTemplate(): string {
  const filePath = path.join(
    process.cwd(),
    "content",
    "affiliate-kit",
    "workshop-registration.md",
  );
  return readFileSync(filePath, "utf-8");
}

export default async function WorkshopRegistrationPage(
  { params }: { params: Promise<Params> },
) {
  const { affiliateSlug } = await params;
  const affiliate = await getLiveWorkshopAffiliate(affiliateSlug);
  if (!affiliate) notFound();

  const template = loadTemplate();
  const resolved = resolveTemplateSlots(template, affiliate);
  const rendered = renderMarkdown(resolved);

  // Split the rendered HTML around the form-slot marker. The marker
  // survives markdown rendering as a paragraph because it's a bare
  // bracketed token on its own line.
  const FORM_MARKER = "[REGISTRATION_FORM_SLOT]";
  const [before, after] = rendered.includes(FORM_MARKER)
    ? rendered.split(FORM_MARKER)
    : [rendered, ""];

  return (
    <main className="workshop-page">
      <article
        className="workshop-prose"
        dangerouslySetInnerHTML={{ __html: before }}
      />
      <WorkshopRegistrationForm
        affiliateSlug={affiliate.slug}
        smsEnabled={affiliate.sms_enabled}
      />
      {after && (
        <article
          className="workshop-prose"
          dangerouslySetInnerHTML={{ __html: after }}
        />
      )}
    </main>
  );
}
