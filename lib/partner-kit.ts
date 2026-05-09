/**
 * Partner kit catalog. Maps URL slugs → markdown source + metadata.
 *
 * The kit lives on-site (rendered, not downloaded) per founder direction
 * 2026-05-07. Each entry below renders at /partners/kit/[slug] using the
 * markdown source under content/partner-kit/.
 *
 * Public-vs-gate boundary (ratified 2026-05-09): this catalog only contains
 * partner-prospect-facing docs. The full operating manual (canon excerpt with
 * voice system, full claims grid, full pricing math, every promo template,
 * day-by-day cadence, lesson-level curriculum) lives in
 * content/partner-kit-private/ and ships to partners post-signing via a
 * mechanism still TBD. Do not move private files into the public catalog
 * without an explicit founder review.
 */

import fs from "node:fs";
import path from "node:path";
import { renderMarkdown } from "./markdown";

export type KitCategory = "About AESDR" | "How co-promotion works";

export type KitEntry = {
  slug: string;
  title: string;
  description: string;
  category: KitCategory;
  /** Filename inside content/partner-kit/ (without extension). */
  source: string;
};

export const KIT_ENTRIES: KitEntry[] = [
  // About AESDR
  {
    slug: "positioning-brief",
    title: "Positioning Brief",
    description:
      "Who AESDR is for. Who it isn't. The three things we always say.",
    category: "About AESDR",
    source: "positioning-brief",
  },
  {
    slug: "curriculum-overview",
    title: "Curriculum Overview",
    description:
      "12 courses, four arcs, five tools. What partners need to know without enrolling.",
    category: "About AESDR",
  source: "curriculum-overview",
  },

  // How co-promotion works
  {
    slug: "co-promoting-aesdr",
    title: "Co-Promoting AESDR",
    description:
      "Three bright-line rules. What's pre-cleared and what needs review. What we won't ask you to do.",
    category: "How co-promotion works",
    source: "co-promoting-aesdr",
  },
  {
    slug: "disclosure-language-pack",
    title: "Disclosure Language Pack",
    description:
      "FTC-compliant disclosure language by surface. Lift verbatim.",
    category: "How co-promotion works",
    source: "disclosure-language-pack",
  },
  {
    slug: "lockup-usage",
    title: "Lockup Usage Rules",
    description:
      "Where the AESDR × Partner mark goes. Color, spacing, the three things never to do.",
    category: "How co-promotion works",
    source: "lockup-usage",
  },
  {
    slug: "pilot-rhythm",
    title: "30-Day Pilot — At a Glance",
    description:
      "Week-by-week rhythm of an AESDR pilot. Day-by-day spec ships post-signing.",
    category: "How co-promotion works",
    source: "pilot-rhythm",
  },
];

export const KIT_CATEGORIES: { name: KitCategory; blurb: string }[] = [
  {
    name: "About AESDR",
    blurb:
      "What AESDR is, who it's for, what it teaches. Read these to decide if your audience fits.",
  },
  {
    name: "How co-promotion works",
    blurb:
      "Rules and language for partners who promote AESDR. Lift what's pre-cleared; ask before reworking.",
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
  return renderMarkdown(md);
}
