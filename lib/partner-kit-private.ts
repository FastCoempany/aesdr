/**
 * Partner kit — PRIVATE catalog.
 *
 * Maps URL slugs → markdown source under content/partner-kit-private/.
 * Routes lit from this catalog are gated via /partners/kit-private/* and
 * require a valid signed token (lib/partner-kit-tokens.ts) to access.
 *
 * This is the post-signing kit: full operating manual, voice system, full
 * pricing math, every promo template, day-by-day cadence, lesson-level
 * curriculum. None of these are appropriate to render publicly. Do not move
 * a slug from this catalog to lib/partner-kit.ts without an explicit founder
 * review of public/gate boundaries.
 */

import fs from "node:fs";
import path from "node:path";
import { renderMarkdown } from "./markdown";

export type PrivateKitCategory =
  | "Brand"
  | "Compliance"
  | "Pricing"
  | "Curriculum"
  | "Promotional Copy"
  | "Operations";

export type PrivateKitEntry = {
  slug: string;
  title: string;
  description: string;
  category: PrivateKitCategory;
  /** Filename inside content/partner-kit-private/ (without extension). */
  source: string;
};

export const PRIVATE_KIT_ENTRIES: PrivateKitEntry[] = [
  // Brand — full operating manual
  {
    slug: "canon-excerpt",
    title: "Canon Excerpt — Full",
    description:
      "Voice system, banned vocabulary, lockup syntax, FTC disclosure language, honesty discipline. The operating manual you are partnering with.",
    category: "Brand",
    source: "00-canon-excerpt",
  },
  {
    slug: "lockup-usage-guide",
    title: "Lockup Usage Guide — Full",
    description:
      "Color, sizing, clearspace, partner-mark slot rules. Full version with proportions and worked examples.",
    category: "Brand",
    source: "10d-lockup-usage-guide",
  },

  // Compliance
  {
    slug: "claims-sheet",
    title: "Approved & Forbidden Claims — Full",
    description:
      "Full grid: what AESDR's outcome language can and cannot say. Includes substantiation refs (internal use only — do not share).",
    category: "Compliance",
    source: "D20-claims-sheet",
  },
  {
    slug: "disclosure-language-pack",
    title: "Disclosure Language Pack — Full",
    description:
      "Full FTC disclosure pack with rationale, audit framing, and the do-not-disclose language list.",
    category: "Compliance",
    source: "D19-disclosure-language-pack",
  },

  // Pricing
  {
    slug: "pricing-and-promo-sheet",
    title: "Pricing & Commission Sheet — Full",
    description:
      "List pricing, commission math, worked examples, attribution rules, $40 follow-on artifact, never-discount doctrine.",
    category: "Pricing",
    source: "D28-pricing-and-promo-sheet",
  },

  // Curriculum
  {
    slug: "curriculum-map",
    title: "Curriculum Map — Lesson-Level",
    description:
      "All 12 courses, 36 lessons, real questions on each card.",
    category: "Curriculum",
    source: "D31-curriculum-map",
  },

  // Promotional Copy — pre-cleared templates
  {
    slug: "newsletter-launch",
    title: "Newsletter — Launch Send (template)",
    description:
      "Pre-cleared launch newsletter, 10–14 days before workshop. Bracketed placeholders only.",
    category: "Promotional Copy",
    source: "09a-newsletter-launch",
  },
  {
    slug: "newsletter-reminder",
    title: "Newsletter — Reminder Send (template)",
    description:
      "Pre-cleared reminder, 3–5 days before workshop.",
    category: "Promotional Copy",
    source: "09b-newsletter-reminder",
  },
  {
    slug: "podcast-intro-script",
    title: "Podcast & Live Intro Scripts (template)",
    description:
      "Two-minute live intro + 60-second podcast intro with host ad-lib zones marked.",
    category: "Promotional Copy",
    source: "09c-podcast-intro-script",
  },
  {
    slug: "social-pre-approved-posts",
    title: "Six Pre-Cleared Social Posts",
    description:
      "LinkedIn / X / Bluesky variants for pre-, during-, and post-workshop windows.",
    category: "Promotional Copy",
    source: "09d-social-pre-approved-posts",
  },

  // Operations
  {
    slug: "positioning-brief",
    title: "Positioning Brief — Internal",
    description:
      "Full positioning with internal cross-refs and rationale. Use as background, not as customer copy.",
    category: "Operations",
    source: "D21-positioning-brief",
  },
  {
    slug: "tracking-links",
    title: "Tracking Links — Reference",
    description:
      "Reference for how partner-specific UTM + ref-code attribution works. Your actual links arrive separately, scoped to your partner slug.",
    category: "Operations",
    source: "11-tracking-links",
  },
  {
    slug: "operating-cadence",
    title: "30-Day Operating Cadence — Day-by-Day",
    description:
      "Day-by-day deliverable schedule, expected response windows, internal handoffs.",
    category: "Operations",
    source: "13-operating-cadence",
  },
];

export const PRIVATE_KIT_CATEGORIES: {
  name: PrivateKitCategory;
  blurb: string;
}[] = [
  {
    name: "Brand",
    blurb: "The operating standard the curriculum encodes. Read first.",
  },
  {
    name: "Compliance",
    blurb: "What you can claim. What you must disclose.",
  },
  {
    name: "Pricing",
    blurb: "List pricing, commission math, worked examples.",
  },
  {
    name: "Curriculum",
    blurb: "All 12 courses, lesson-level. The IP behind the workshop.",
  },
  {
    name: "Promotional Copy",
    blurb:
      "Pre-cleared templates. Lift verbatim or submit edits per the cadence.",
  },
  {
    name: "Operations",
    blurb: "Positioning, attribution, day-by-day pilot rhythm.",
  },
];

export function getPrivateKitEntry(slug: string): PrivateKitEntry | undefined {
  return PRIVATE_KIT_ENTRIES.find((e) => e.slug === slug);
}

export function getPrivateKitEntryHtml(entry: PrivateKitEntry): string {
  const file = path.join(
    process.cwd(),
    "content",
    "partner-kit-private",
    `${entry.source}.md`,
  );
  const md = fs.readFileSync(file, "utf8");
  return renderMarkdown(md);
}
