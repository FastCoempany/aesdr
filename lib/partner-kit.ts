/**
 * Partner kit catalog. Maps URL slugs → markdown source + metadata.
 *
 * The kit lives on-site (rendered, not downloaded) per founder direction
 * 2026-05-07. Each entry below renders at /partners/kit/[slug] using the
 * markdown source under content/partner-kit/. Per-partner items (lockup
 * SVGs, signed agreement, tracking links scoped to a slug) are gated by
 * signing and not enumerated here.
 */

import fs from "node:fs";
import path from "node:path";
import { renderMarkdown } from "./markdown";

export type KitCategory =
  | "Reference"
  | "Promotional Copy"
  | "Co-Brand"
  | "Operating Cadence";

export type KitEntry = {
  slug: string;
  title: string;
  description: string;
  category: KitCategory;
  /** Filename inside content/partner-kit/ (without extension). */
  source: string;
  /** Drop "**Field:** ..." metadata header used by D-series internal docs. */
  stripPreamble?: boolean;
};

export const KIT_ENTRIES: KitEntry[] = [
  // Reference
  {
    slug: "canon-excerpt",
    title: "Canon Excerpt for Partners",
    description:
      "The six brand-doctrine sections you need: voice, banned vocabulary, lockup rules, FTC disclosure language, honesty discipline.",
    category: "Reference",
    source: "00-canon-excerpt",
  },
  {
    slug: "positioning-brief",
    title: "Positioning Brief",
    description:
      "Who AESDR is for, who it isn't for, what we ask of partners, what we do for partners.",
    category: "Reference",
    source: "D21-positioning-brief",
    stripPreamble: true,
  },
  {
    slug: "claims-sheet",
    title: "Approved & Forbidden Claims",
    description:
      "What partners can say about AESDR's outcomes. What they cannot.",
    category: "Reference",
    source: "D20-claims-sheet",
    stripPreamble: true,
  },
  {
    slug: "disclosure-language-pack",
    title: "Disclosure Language Pack",
    description:
      "FTC-compliant disclosure phrasings, by surface (newsletter, social, reel, live workshop, DM).",
    category: "Reference",
    source: "D19-disclosure-language-pack",
    stripPreamble: true,
  },
  {
    slug: "pricing-and-commission",
    title: "Pricing & Commission Sheet",
    description:
      "List pricing. Commission structure. Never-discount doctrine. Worked commission example.",
    category: "Reference",
    source: "D28-pricing-and-promo-sheet",
    stripPreamble: true,
  },
  {
    slug: "curriculum-map",
    title: "Curriculum Map",
    description: "12 courses. 36 lessons. Real questions on each card.",
    category: "Reference",
    source: "D31-curriculum-map",
    stripPreamble: true,
  },

  // Promotional Copy
  {
    slug: "newsletter-launch",
    title: "Newsletter — Launch Send",
    description:
      "Pre-cleared launch newsletter. Bracketed placeholders only.",
    category: "Promotional Copy",
    source: "09a-newsletter-launch",
  },
  {
    slug: "newsletter-reminder",
    title: "Newsletter — Reminder Send",
    description:
      "Pre-cleared reminder send. Sent 3–5 days before the workshop.",
    category: "Promotional Copy",
    source: "09b-newsletter-reminder",
  },
  {
    slug: "podcast-and-live-intros",
    title: "Podcast & Live Intro Scripts",
    description:
      "Two-minute live workshop intro + 60-second podcast intro.",
    category: "Promotional Copy",
    source: "09c-podcast-intro-script",
  },
  {
    slug: "social-posts",
    title: "Six Pre-Cleared Social Posts",
    description:
      "LinkedIn / X / Bluesky variants for pre-, during-, and post-workshop.",
    category: "Promotional Copy",
    source: "09d-social-pre-approved-posts",
  },

  // Co-Brand
  {
    slug: "lockup-usage-guide",
    title: "Lockup Usage Guide",
    description:
      "Color rules, sizing, clearspace, where it goes, where it doesn't.",
    category: "Co-Brand",
    source: "10d-lockup-usage-guide",
  },

  // Operating Cadence
  {
    slug: "operating-cadence",
    title: "30-Day Pilot Operating Cadence",
    description: "Day-by-day. Pre-launch through pilot-close.",
    category: "Operating Cadence",
    source: "13-operating-cadence",
  },
];

export const KIT_CATEGORIES: { name: KitCategory; blurb: string }[] = [
  {
    name: "Reference",
    blurb: "Read these to understand the brand and the program shape.",
  },
  {
    name: "Promotional Copy",
    blurb:
      "Pre-cleared templates. Lift verbatim or submit edits for approval.",
  },
  {
    name: "Co-Brand",
    blurb:
      "AESDR × Partner co-branding rules. The lockup files themselves are partner-specific and arrive after signing.",
  },
  {
    name: "Operating Cadence",
    blurb: "What happens in what week of a 30-day pilot.",
  },
];

export function getKitEntry(slug: string): KitEntry | undefined {
  return KIT_ENTRIES.find((e) => e.slug === slug);
}

export function getKitEntryHtml(entry: KitEntry): string {
  const file = path.join(
    process.cwd(),
    "content",
    "partner-kit",
    `${entry.source}.md`,
  );
  const md = fs.readFileSync(file, "utf8");
  return renderMarkdown(md, { stripPreamble: entry.stripPreamble });
}
