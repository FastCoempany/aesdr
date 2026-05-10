/**
 * Partner kit — PRIVATE catalog (post-signing, gated by per-partner token).
 *
 * Maps URL slugs → markdown source under content/partner-kit-private/.
 * Routes lit from this catalog are gated via /partners/kit-private/* and
 * require a valid signed token (lib/partner-kit-tokens.ts) to access.
 *
 * Public-vs-gate boundary (ratified 2026-05-09): this catalog contains only
 * what a partner OPERATIONALLY needs to run a pilot — promo copy templates,
 * commission math, pre-workshop checklist, approval workflow, escalation
 * contacts, lockup files. Brand doctrine (voice system, full canon excerpts,
 * banned-vocab rationale, day-by-day cadence with internal handoffs) stays
 * entirely internal in content/aesdr-internal/ and is not shipped to anyone
 * outside AESDR.
 *
 * Do not move slugs from content/aesdr-internal/ into this catalog without
 * an explicit founder review.
 */

import fs from "node:fs";
import path from "node:path";
import { renderMarkdown } from "./markdown";

export type PrivateKitCategory = "Run your pilot" | "Working with AESDR";

export type PrivateKitEntry = {
  slug: string;
  title: string;
  description: string;
  category: PrivateKitCategory;
  /** Filename inside content/partner-kit-private/ (without extension). */
  source: string;
};

export const PRIVATE_KIT_ENTRIES: PrivateKitEntry[] = [
  // Run your pilot — operational artifacts you'll lift, edit, or check off
  {
    slug: "promo-copy-pack",
    title: "Promotional Copy Pack",
    description:
      "Pre-cleared newsletter, live intro, podcast intro, and six social posts. Lift with placeholders filled.",
    category: "Run your pilot",
    source: "promo-copy-pack",
  },
  {
    slug: "pre-workshop-checklist",
    title: "Pre-Workshop Checklist",
    description:
      "Three short lists for the windows partners get most nervous on: 24h before, day-of, the 72h replay window.",
    category: "Run your pilot",
    source: "pre-workshop-checklist",
  },
  {
    slug: "lockup-files",
    title: "Lockup Files & Composition Guide",
    description:
      "What you receive, where each file goes, and the three things that trip people up.",
    category: "Run your pilot",
    source: "lockup-files",
  },

  // Working with AESDR — process, math, contacts
  {
    slug: "worked-commission-example",
    title: "Worked Commission Example",
    description:
      "End-to-end math on a real-shaped pilot. Plus how attribution actually works on AESDR's side.",
    category: "Working with AESDR",
    source: "worked-commission-example",
  },
  {
    slug: "approval-workflow",
    title: "Approval Workflow",
    description:
      "When you need a round, how to submit, what the response looks like, what gets edited most often.",
    category: "Working with AESDR",
    source: "approval-workflow",
  },
  {
    slug: "escalation-contacts",
    title: "Escalation Contacts",
    description:
      "Five legitimate reasons a partner emails AESDR during a pilot — match yours to the row, get a faster answer.",
    category: "Working with AESDR",
    source: "escalation-contacts",
  },
];

export const PRIVATE_KIT_CATEGORIES: {
  name: PrivateKitCategory;
  blurb: string;
}[] = [
  {
    name: "Run your pilot",
    blurb:
      "Operational artifacts you'll lift, edit, or check off during your pilot.",
  },
  {
    name: "Working with AESDR",
    blurb: "Process, math, and how to reach us.",
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
