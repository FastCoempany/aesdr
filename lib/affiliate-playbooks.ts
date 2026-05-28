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
