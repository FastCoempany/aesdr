import Anthropic from "@anthropic-ai/sdk";

import type { ScoutSweepId } from "./anthropic-agents";

/**
 * The rebuilt scout research engine — a real agentic loop, not the old
 * 3-search-one-shot. It's handed BOTH server tools (web_search to find,
 * web_fetch to OPEN pages) with a real budget, and told to verify each
 * candidate by reading their site before returning it. It streams, so we watch
 * its own tool calls go by and report live progress ("searching… reading…").
 *
 * Runs in the background (after()), so it has real time to think; the function
 * ceiling is 300s, and we stop gracefully a little before that, salvaging
 * whatever the model has already emitted.
 */

export type ResearchCandidate = {
  name: string;
  surface: string;
  handle: string;
  audience_est: number | null;
  archetype: "creator" | "coach" | "alumni" | "community";
  voice_fit: number;
  why_fit: string;
  contact_path: string;
  /** True only if the model opened the page and confirmed a usable, non-LinkedIn
   *  way in (reply-to/newsletter email, contact form, open DMs, guest form). */
  contact_verified: boolean;
  conflict: string;
};

export type ResearchProgress = {
  phase: string;
  searches: number;
  pagesRead: number;
};

// Find AND read. The whole point of the rebuild: it can open pages now.
const RESEARCH_TOOLS: Anthropic.Messages.ToolUnion[] = [
  { type: "web_search_20260209", name: "web_search", max_uses: 20 },
  { type: "web_fetch_20260209", name: "web_fetch", max_uses: 12 },
];

// Generous wall-clock for the background run; stays under the 300s route ceiling
// with margin for parse + insert. This is a graceful stop, not a failure gate.
const RESEARCH_BUDGET_MS = 255_000;
const MAX_TURNS = 16; // pause_turn drains across many tool uses
const PROGRESS_THROTTLE_MS = 1_500;

const SYSTEM = `You are Scout, AESDR's partner-discovery researcher.

AESDR is a self-paced sales curriculum for FIRST-1-TO-2-YEAR SDRs and AEs in
startup SaaS ($249 SDR / $299 AE, one-time). Voice: operator-direct, anti-guru,
peer-built. You find AFFILIATE partners — people with an audience who'd
recommend the course to early-career reps for commission.

HOW YOU WORK — this is a real research loop, not a single guess:
1. SEARCH practitioner networks, Substack/Beehiiv, podcast directories, Skool/
   Mighty/Circle — whatever the brief names.
2. For each promising name, USE web_fetch to OPEN their site / newsletter /
   show page and their About or contact page. Read it. Confirm they're real and
   currently active, estimate audience from what you actually see, and find a
   real NON-LINKEDIN contact path.
3. Only then score and keep them. Move on. Repeat until you have 12–15 solid,
   verified candidates.

CONTACT PATH (hard rule): NEVER LinkedIn. A usable path is a reply-to/newsletter
email, an @-handle with open X/Twitter DMs, a contact/"work with me" form, or a
podcast guest-pitch form. Set "contact_verified": true ONLY if you opened the
page and confirmed that path. If you could not confirm one, set it false and say
why in why_fit — do not invent an email.

HONESTY: Never fabricate an audience number — if you didn't read it, prefix the
estimate basis in why_fit with "est.". Flag conflicts (a competing paid course,
a vendor-owned show) in the "conflict" field — do NOT drop them, mark them.

OUTPUT: When done, return ONLY a strict JSON array (no prose, no markdown
fences) of objects with EXACTLY these keys:
{ "name": str, "surface": str (e.g. "Substack newsletter" / "Podcast"),
  "handle": str (their URL or @handle), "audience_est": int|null,
  "archetype": "creator"|"coach"|"alumni"|"community", "voice_fit": 1-5,
  "why_fit": str (one line), "contact_path": str (NOT LinkedIn),
  "contact_verified": true|false, "conflict": str ("" if none) }`;

const PROMPTS: Record<ScoutSweepId, string> = {
  communities:
    "PAID COMMUNITIES — Skool, Mighty Networks, Circle. Sales/SDR/AE/revenue, ~50–2,000 members; the community OWNER is the candidate. Open each community/owner page to verify it's live and find a non-LinkedIn contact.",
  newsletters_podcasts:
    "NEWSLETTERS + PODCASTS — independent sales newsletters (Substack/Beehiiv) with an operator (not influencer) voice writing to early-career reps, and sales podcasts with operator hosts. OPEN their site + About/contact page to confirm activity and get a reply-to email, guest-pitch form, or open-DM handle.",
  practitioners:
    "PRACTITIONER NETWORK FIGURES — active contributors in 30MPC, Outbound Squad, RepVue, Modern Sales Pros, Pavilion, Apex BDR Club who have their OWN audience. Open their personal site/newsletter to verify and find a non-LinkedIn contact.",
};

function phaseFor(searches: number, pagesRead: number): string {
  if (searches === 0 && pagesRead === 0) return "Starting the search…";
  if (pagesRead === 0) return `Searching the web… (${searches} ${searches === 1 ? "search" : "searches"})`;
  return `Reading their sites to verify… (${searches} searches, ${pagesRead} read)`;
}

/** Strip fences, then full-parse the array; if the stream was cut mid-array,
 *  salvage every complete {…} object. Mirrors the tolerant scout parser. */
function extractCandidates(text: string): ResearchCandidate[] {
  const noFences = text.replace(/```(?:json)?/gi, "");
  const start = noFences.indexOf("[");
  const end = noFences.lastIndexOf("]");
  const body = start !== -1 && end > start ? noFences.slice(start, end + 1) : noFences;

  const coerce = (o: unknown): ResearchCandidate | null => {
    if (!o || typeof o !== "object") return null;
    const r = o as Record<string, unknown>;
    if (typeof r.name !== "string" || r.name.trim().length === 0) return null;
    return {
      name: r.name.trim(),
      surface: typeof r.surface === "string" ? r.surface : "",
      handle: typeof r.handle === "string" ? r.handle : "",
      audience_est: typeof r.audience_est === "number" ? r.audience_est : null,
      archetype: (["creator", "coach", "alumni", "community"] as const).includes(r.archetype as never)
        ? (r.archetype as ResearchCandidate["archetype"])
        : "creator",
      voice_fit: typeof r.voice_fit === "number" ? r.voice_fit : 3,
      why_fit: typeof r.why_fit === "string" ? r.why_fit : "",
      contact_path: typeof r.contact_path === "string" ? r.contact_path : "",
      contact_verified: r.contact_verified === true,
      conflict: typeof r.conflict === "string" ? r.conflict : "",
    };
  };

  try {
    const arr = JSON.parse(body);
    if (Array.isArray(arr)) {
      const out = arr.map(coerce).filter((c): c is ResearchCandidate => c !== null);
      if (out.length) return out;
    }
  } catch {
    /* fall through to salvage */
  }

  const salvaged: ResearchCandidate[] = [];
  for (const chunk of body.match(/\{[^{}]*\}/g) ?? []) {
    try {
      const c = coerce(JSON.parse(chunk));
      if (c) salvaged.push(c);
    } catch {
      /* skip incomplete object */
    }
  }
  return salvaged;
}

/**
 * Run the research loop for one sweep. Streams; reports live progress via
 * onProgress (throttled); returns the verified candidate list. Throws only when
 * it ended with nothing salvageable (so the caller marks the run failed/empty,
 * never a silent success).
 */
export async function researchSweep(opts: {
  sweep: ScoutSweepId;
  model: string;
  onProgress?: (p: ResearchProgress) => void;
}): Promise<ResearchCandidate[]> {
  const c = new Anthropic();
  const deadline = Date.now() + RESEARCH_BUDGET_MS;
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `${PROMPTS[opts.sweep]}\n\nResearch with your tools — search, then OPEN pages to verify — and return 12–15 candidates as the strict JSON array.`,
    },
  ];

  let captured = "";
  let searches = 0;
  let pagesRead = 0;
  let lastEmit = 0;
  const emit = (force = false) => {
    const now = Date.now();
    if (!force && now - lastEmit < PROGRESS_THROTTLE_MS) return;
    lastEmit = now;
    opts.onProgress?.({ phase: phaseFor(searches, pagesRead), searches, pagesRead });
  };

  for (let i = 0; i < MAX_TURNS; i++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;

    const stream = c.messages.stream({
      model: opts.model,
      max_tokens: 8000,
      system: SYSTEM,
      tools: RESEARCH_TOOLS,
      messages,
    });
    const stop = setTimeout(() => stream.abort(), remaining);

    // Watch the model's own tool calls stream by — this is the live progress.
    stream.on("streamEvent", (event) => {
      try {
        if (event.type === "content_block_start" && event.content_block.type === "server_tool_use") {
          const name = event.content_block.name;
          if (name === "web_search") searches++;
          else if (name === "web_fetch") pagesRead++;
          emit();
        }
      } catch {
        /* progress is best-effort */
      }
    });
    let turnText = "";
    stream.on("text", (delta) => {
      turnText += delta;
      captured += delta;
    });

    try {
      const final = await stream.finalMessage();
      clearTimeout(stop);
      if (final.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: final.content });
        emit(true);
        continue;
      }
      return extractCandidates(turnText || captured);
    } catch (err) {
      clearTimeout(stop);
      // Budget abort or drop: salvage whatever streamed in.
      if (captured.trim().length > 0) return extractCandidates(captured);
      // Nothing streamed in. A genuine API error (overloaded, rate-limited,
      // auth) carries its own message — surface it. A clean abort with no
      // output gets the contextual line.
      const reason = err instanceof Anthropic.APIError ? err.message : null;
      throw new Error(
        reason
          ? `The model call failed before returning anything: ${reason} (after ${searches} searches, ${pagesRead} page reads)`
          : `The research stopped before returning anything (after ${searches} searches, ${pagesRead} page reads). Run it again.`,
      );
    }
  }

  if (captured.trim().length > 0) return extractCandidates(captured);
  throw new Error(
    `The research kept searching but never returned a result (${searches} searches, ${pagesRead} page reads across ${MAX_TURNS} turns). Run it again.`,
  );
}
