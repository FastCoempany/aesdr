import Anthropic from "@anthropic-ai/sdk";

import type { ScoutSweepId } from "./anthropic-agents";

/**
 * The scout research engine — a real agentic loop in TWO phases so a long
 * research run never loses what it found to a timeout:
 *
 *   Phase 1 (research, with tools): search + fetch, no cap, no "stop at N" —
 *     find as much as it can in the window. We accumulate the full transcript
 *     (every search result + fetched page) into the message history.
 *   Phase 2 (write-up, NO tools): a separate, fast call that dumps EVERY
 *     candidate it found as JSON. No tool round-trips, so it always completes —
 *     even when research ran right to the wall. This is what was missing: the
 *     old single-call version spent its whole window searching and got cut off
 *     before it could emit, returning 0 despite reading a dozen pages.
 *
 * Runs in the background (after()); the function ceiling is 300s. Research gets
 * the bulk; a fixed slice is reserved for the write-up so the data always lands.
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
   *  way in. False is kept (not dropped) — we surface it flagged. */
  contact_verified: boolean;
  conflict: string;
};

export type ResearchProgress = {
  phase: string;
  searches: number;
  pagesRead: number;
};

// Find AND read — kept deliberately generous (NOT cut). It searches and reads
// as much as fits in the research window.
const RESEARCH_TOOLS: Anthropic.Messages.ToolUnion[] = [
  { type: "web_search_20260209", name: "web_search", max_uses: 20 },
  { type: "web_fetch_20260209", name: "web_fetch", max_uses: 12 },
];

// Phase 1 researches up to here; phase 2 (the guaranteed write-up) gets the
// reserve. Total stays under the 300s route ceiling with margin for insert.
const RESEARCH_BUDGET_MS = 200_000;
const EMIT_BUDGET_MS = 80_000;
const MAX_TURNS = 20; // pause_turn drains across many tool uses
const PROGRESS_THROTTLE_MS = 1_500;

const SCHEMA = `Each object has EXACTLY these keys: { "name": str, "surface": str (e.g. "Substack newsletter" / "Podcast"), "handle": str (their URL or @handle), "audience_est": int|null, "archetype": "creator"|"coach"|"alumni"|"community", "voice_fit": 1-5, "why_fit": str (one line), "contact_path": str (NOT LinkedIn), "contact_verified": true|false, "conflict": str ("" if none) }`;

const SYSTEM = `You are Scout, AESDR's partner-discovery researcher.

AESDR is a self-paced sales curriculum for FIRST-1-TO-2-YEAR SDRs and AEs in
startup SaaS ($249 SDR / $299 AE, one-time). Voice: operator-direct, anti-guru,
peer-built. You find AFFILIATE partners — people with an audience who'd
recommend the course to early-career reps for commission.

HOW YOU WORK — a real research loop, not a single guess:
1. SEARCH practitioner networks, Substack/Beehiiv, podcast directories, Skool/
   Mighty/Circle — whatever the brief names.
2. For each promising name, USE web_fetch to OPEN their site / newsletter / show
   page and their About or contact page. Read it. Confirm they're real and
   currently active, estimate audience from what you actually see, and find a
   real NON-LINKEDIN contact path.
3. Keep going. Find as MANY qualified candidates as you can — there is no cap,
   more is better. Don't stop early; use your tools until you run out of fresh
   leads or are told to wrap up.

CONTACT PATH (hard rule): NEVER LinkedIn. A usable path is a reply-to/newsletter
email, an @-handle with open X/Twitter DMs, a contact/"work with me" form, or a
podcast guest-pitch form. Set "contact_verified": true ONLY if you opened the
page and confirmed that path; otherwise false — but still keep the candidate.

HONESTY: Never fabricate an audience number — if you didn't read it, prefix the
estimate basis in why_fit with "est.". Flag conflicts (a competing paid course,
a vendor-owned show) in the "conflict" field — do NOT drop them, mark them.

When asked to output, return ONLY a strict JSON array (no prose, no markdown
fences). ${SCHEMA}`;

const EMIT_INSTRUCTION = `Stop researching now — your time is up. Output a STRICT JSON array of EVERY candidate you found above, all of them, each one in full (never abbreviate or write "as listed above"). Include even the ones you're less sure about: set "contact_verified": false if you couldn't confirm a non-LinkedIn contact, but STILL include them — surface everything you found. ${SCHEMA}. JSON only — no prose, no markdown fences.`;

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

/** Strip fences, then full-parse the array; if it was cut mid-array, salvage
 *  every complete {…} object. */
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
 * Research one sweep, then ALWAYS write up what was found. Streams; reports
 * live progress via onProgress (throttled). Returns every candidate it
 * surfaced. Throws only if it couldn't even start (so the caller marks the run
 * failed) — never a silent loss of a long research run.
 */
export async function researchSweep(opts: {
  sweep: ScoutSweepId;
  model: string;
  onProgress?: (p: ResearchProgress) => void;
}): Promise<ResearchCandidate[]> {
  const c = new Anthropic();
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `${PROMPTS[opts.sweep]}\n\nResearch thoroughly — search, and OPEN pages to verify contacts. Find as many qualified candidates as you can; don't stop early.`,
    },
  ];

  let searches = 0;
  let pagesRead = 0;
  let lastEmit = 0;
  const report = (phase: string) => opts.onProgress?.({ phase, searches, pagesRead });
  const throttled = () => {
    const now = Date.now();
    if (now - lastEmit < PROGRESS_THROTTLE_MS) return;
    lastEmit = now;
    report(phaseFor(searches, pagesRead));
  };

  // ── Phase 1: research with tools, accumulating the transcript ──
  const researchDeadline = Date.now() + RESEARCH_BUDGET_MS;
  let naturalText = "";
  for (let i = 0; i < MAX_TURNS; i++) {
    const remaining = researchDeadline - Date.now();
    if (remaining <= 0) break;

    const stream = c.messages.stream({
      model: opts.model,
      max_tokens: 8000,
      system: SYSTEM,
      tools: RESEARCH_TOOLS,
      messages,
    });
    const stop = setTimeout(() => stream.abort(), remaining);
    stream.on("streamEvent", (event) => {
      try {
        if (event.type === "content_block_start" && event.content_block.type === "server_tool_use") {
          const name = event.content_block.name;
          if (name === "web_search") searches++;
          else if (name === "web_fetch") pagesRead++;
          throttled();
        }
      } catch {
        /* progress is best-effort */
      }
    });
    let turnText = "";
    stream.on("text", (delta) => {
      turnText += delta;
    });

    try {
      const final = await stream.finalMessage();
      clearTimeout(stop);
      messages.push({ role: "assistant", content: final.content });
      if (final.stop_reason === "pause_turn") {
        throttled();
        continue;
      }
      naturalText = turnText; // model decided it was done researching
      break;
    } catch {
      clearTimeout(stop);
      break; // research deadline hit — proceed to the forced write-up
    }
  }

  // If it finished on its own AND already emitted the array, use that.
  if (naturalText) {
    const fromNatural = extractCandidates(naturalText);
    if (fromNatural.length > 0) return fromNatural;
  }

  // ── Phase 2: forced write-up (NO tools) — always emits what it found ──
  report(`Writing up what it found… (${searches} searches, ${pagesRead} read)`);
  messages.push({ role: "user", content: EMIT_INSTRUCTION });

  let emitText = "";
  try {
    const emitStream = c.messages.stream({
      model: opts.model,
      max_tokens: 8000,
      system: SYSTEM,
      messages,
    });
    const emitStop = setTimeout(() => emitStream.abort(), EMIT_BUDGET_MS);
    emitStream.on("text", (delta) => {
      emitText += delta;
    });
    try {
      await emitStream.finalMessage();
    } finally {
      clearTimeout(emitStop);
    }
  } catch {
    /* even the write-up was cut — salvage whatever it managed below */
  }

  const candidates = extractCandidates(emitText);
  if (candidates.length === 0 && searches === 0 && pagesRead === 0) {
    throw new Error(
      "The research made no searches before stopping — likely an API error (overloaded / rate-limited). Run it again.",
    );
  }
  return candidates;
}
