/**
 * Affiliate playbooks registry.
 *
 * Each playbook is a path-specific "now that you're an affiliate, here's
 * the actual step-by-step for YOUR format" doc. Source markdown lives in
 * content/affiliate-playbooks/; this module maps slugs → file paths and
 * loads them on demand for the dashboard renderer.
 *
 * Per the 2026-05-28 architecture decision: playbooks live inside the
 * authenticated affiliate dashboard at /affiliates/dashboard/playbooks,
 * not in the public kit. Reasoning: they're paths through the program,
 * not promotional material; they make sense in the context of an
 * already-approved affiliate looking at their own dashboard.
 *
 * Mirrors the existing lib/affiliate-kit.ts pattern.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { renderMarkdown } from "@/lib/markdown";
import type { AffiliateArchetype } from "@/lib/affiliate-entity";

export type PlaybookStatus = "ready" | "draft";

export type PlaybookEntry = {
  slug: string;
  title: string;
  audience: string;
  status: PlaybookStatus;
  /** Sort order on the index page. Lower = higher. */
  order: number;
};

/**
 * Path-specific playbooks. The four "ready" entries have full content
 * in content/affiliate-playbooks/. The three "draft" entries render a
 * stub page that points the affiliate at affiliates@aesdr.com to
 * co-write theirs — which doubles as signal-gathering on which paths
 * the long-tail of affiliates actually wants.
 */
export const PLAYBOOK_ENTRIES: PlaybookEntry[] = [
  {
    slug: "workshop-host",
    title: "Workshop host",
    audience:
      "You can convene an audience for a 60-minute live session. Newsletter list 5k+, paid community 100+, or a regular live audience.",
    status: "ready",
    order: 1,
  },
  {
    slug: "newsletter-feature",
    title: "Newsletter feature",
    audience:
      "You write a newsletter your audience opens. Substack, Beehiiv, ConvertKit, Mailchimp — open rate matters more than list size.",
    status: "ready",
    order: 2,
  },
  {
    slug: "coach-endorsement",
    title: "Coach / 1:1 endorsement",
    audience:
      "You coach SDRs and AEs 1:1 or in small groups. Mentions stay contextual, sent person-by-person, never blasted.",
    status: "ready",
    order: 3,
  },
  {
    slug: "community-drop",
    title: "Community drop",
    audience:
      "You run a paid community (Circle, Discord, Slack, Substack chat) of 50–2,000 sales practitioners.",
    status: "ready",
    order: 4,
  },
  {
    slug: "social-promotion",
    title: "Social-only promotion",
    audience:
      "Twitter, LinkedIn, or short-video as your only channel. No list, no community, no live audience yet.",
    status: "draft",
    order: 5,
  },
  {
    slug: "podcast-read",
    title: "Podcast read",
    audience:
      "You host a podcast and run mid-roll reads or full-episode integrations.",
    status: "draft",
    order: 6,
  },
  {
    slug: "alumni-ambassador",
    title: "Alumni ambassador",
    audience:
      "You went through AESDR and now refer peers. Testimony-based, distinct from cold recommendation.",
    status: "draft",
    order: 7,
  },
];

export function getPlaybook(slug: string): PlaybookEntry | undefined {
  return PLAYBOOK_ENTRIES.find((p) => p.slug === slug);
}

export function getPlaybookHtml(entry: PlaybookEntry): string {
  const filePath = path.join(
    process.cwd(),
    "content",
    "affiliate-playbooks",
    `${entry.slug}.md`,
  );
  const raw = readFileSync(filePath, "utf-8");
  return renderMarkdown(raw);
}

/**
 * Maps an affiliate's archetype to the playbook slug that fits their
 * format. Drives the "Start here" callout on the playbooks index.
 *
 * - `hybrid` returns null (no single recommendation — show the grid only).
 * - `alumni` maps to its draft playbook; the UI handles the draft-fallback
 *   render.
 */
const ARCHETYPE_TO_PLAYBOOK: Record<AffiliateArchetype, string | null> = {
  creator: "newsletter-feature",
  coach: "coach-endorsement",
  community: "community-drop",
  alumni: "alumni-ambassador",
  hybrid: null,
};

/** One-sentence reason the recommended playbook fits this archetype. */
const ARCHETYPE_REASON: Record<AffiliateArchetype, string | null> = {
  creator:
    "Newsletter is the lowest-coordination path and matches the reach pattern most creators already have.",
  coach:
    "1:1 endorsement converts highest in the program for an active client base — and re-uses the trust you've already built.",
  community:
    "Pinned community posts convert at 12-20% for paid communities; the path is built around the dynamics you already run.",
  alumni:
    "Your testimony is the strongest content angle in your network — distinct from cold recommendation and worth co-writing.",
  hybrid: null,
};

/**
 * Closest "ready" playbook to fall back to when the archetype's
 * native playbook is still in draft (currently: alumni).
 */
const DRAFT_FALLBACK = "newsletter-feature";

export type PlaybookRecommendation = {
  primary: PlaybookEntry;
  reason: string;
  fallback?: PlaybookEntry;
};

export function recommendForArchetype(
  archetype: AffiliateArchetype
): PlaybookRecommendation | null {
  const slug = ARCHETYPE_TO_PLAYBOOK[archetype];
  if (!slug) return null;
  const primary = getPlaybook(slug);
  if (!primary) return null;
  const reason = ARCHETYPE_REASON[archetype] || "";
  if (primary.status === "draft") {
    const fallback = getPlaybook(DRAFT_FALLBACK);
    return { primary, reason, fallback };
  }
  return { primary, reason };
}
