import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-side scout + dossier — the two judgment agents wired into the tower
 * as buttons + crons. Sentinel/courier/scribe are deterministic (zero LLM
 * cost); these two are LLM-in-the-loop and cost real Anthropic tokens per
 * invocation. The switches/levers gate them so the founder controls when they
 * run.
 *
 * Both are handed Anthropic's server-side web_search (and, for dossier,
 * web_fetch) tools and told to ACTUALLY research — not answer from training
 * memory. This is the difference between a brief whose audience number,
 * contact path, and own-domain are real versus guessed. The model runs a
 * server-side tool loop; we drain any pause_turn, then parse the final JSON.
 */

// Per-agent model is resolved by the caller (via agent-switch.getAgentModel)
// and passed in; these are safe fallbacks. Both support web_search_20260209
// with dynamic filtering (no beta header).
const DEFAULT_SCOUT_MODEL = "claude-sonnet-4-6";
const DEFAULT_DOSSIER_MODEL = "claude-opus-4-6";

function client() {
  return new Anthropic(); // reads ANTHROPIC_API_KEY from env
}

// Anthropic-hosted research tools — GA versions with built-in dynamic
// filtering, so no beta header and no separate code_execution tool. Each use is
// a sequential server-side round-trip; the model searches, then streams its JSON
// answer. max_uses is lean so there's always time left to emit after searching:
// scout gets 3 searches, dossier 2 searches + 1 page fetch.
const SEARCH_ONLY: Anthropic.Messages.ToolUnion[] = [
  { type: "web_search_20260209", name: "web_search", max_uses: 3 },
];
const SEARCH_AND_FETCH: Anthropic.Messages.ToolUnion[] = [
  { type: "web_search_20260209", name: "web_search", max_uses: 2 },
  { type: "web_fetch_20260209", name: "web_fetch", max_uses: 1 },
];

// Wall-clock stop for one research call, per caller. This is NOT a deadline we
// fail on — it's the point at which we stop waiting and hand back whatever the
// model has already streamed in (see runResearchAgent). A scout sweep emits
// 12-15 candidates so it's given more room than a single-candidate dossier.
// Both stay under their route's maxDuration (tower 180, candidate 100, cron 180)
// so the graceful stop always wins the race against a platform hard-kill.
const SCOUT_BUDGET_MS = 150_000;
const DOSSIER_BUDGET_MS = 80_000;

/** Pull the outermost JSON object/array out of a reply that may wrap it in
 *  prose or fences — likelier once the model has been narrating its search. */
function extractJson(text: string): string {
  const noFences = text.replace(/```(?:json)?/gi, "");
  const start = noFences.search(/[[{]/);
  const end = Math.max(noFences.lastIndexOf("}"), noFences.lastIndexOf("]"));
  if (start === -1 || end < start) return noFences.trim();
  return noFences.slice(start, end + 1).trim();
}

/**
 * Run a research-and-return-JSON turn and return whatever text the model
 * streamed back — where the JSON lives.
 *
 * Wire-level failsafe, not a timeout gate. We STREAM the response, so every
 * token the model emits is captured the instant it arrives. The budget is a
 * graceful stop: when it's spent (or a connection drops mid-stream), we abort
 * the stream and return the text accumulated so far instead of throwing it
 * away. A sweep that got 9 of 15 rows out before it was cut off still hands
 * those 9 back — the parser salvages complete objects from a partial array.
 * Nothing the model produced is ever discarded by an HTTP-level timeout, which
 * was the old all-or-nothing failure mode (messages.create with a client
 * timeout drops the entire body if the round-trip runs long).
 *
 * pause_turn (the server tool loop hitting its iteration cap) is drained the
 * same way — append the paused turn and resume — bounded by both the budget and
 * a hard iteration cap so it can't loop forever.
 */
async function runResearchAgent(opts: {
  model: string;
  system: string;
  prompt: string;
  tools: Anthropic.Messages.ToolUnion[];
  maxTokens: number;
  budgetMs: number;
}): Promise<string> {
  const c = client();
  const deadline = Date.now() + opts.budgetMs;
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: opts.prompt },
  ];
  // Everything the model has streamed, across every turn. This is what we hand
  // back no matter how the call ends — clean finish, budget stop, or drop.
  let captured = "";

  for (let i = 0; i < 4; i++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;

    const stream = c.messages.stream({
      model: opts.model,
      max_tokens: opts.maxTokens,
      system: opts.system,
      tools: opts.tools,
      messages,
    });
    // Arm the graceful stop: when the budget is spent, abort the stream. The
    // text already received stays in `captured`/`turnText` — abort only stops
    // further reception, it doesn't unwind what's in hand.
    const stop = setTimeout(() => stream.abort(), remaining);
    let turnText = "";
    stream.on("text", (delta) => {
      turnText += delta;
      captured += delta;
    });

    try {
      const final = await stream.finalMessage();
      clearTimeout(stop);
      if (final.stop_reason === "pause_turn") {
        // Server tool loop paused at its cap — append + resume (no new user turn).
        messages.push({ role: "assistant", content: final.content });
        continue;
      }
      // Clean finish: the final turn's text is the JSON answer.
      return turnText || captured;
    } catch (err) {
      clearTimeout(stop);
      // A budget stop (we called abort) or a drop after useful text already
      // streamed in: hand back what we have and let the parser salvage it.
      // A genuine API error before any output — bad key, rate limit, refusal —
      // has nothing to salvage, so surface the real message instead of a silent
      // "0 found". The operator needs to see it to act.
      if (stream.aborted || captured.trim().length > 0) break;
      throw err;
    }
  }
  return captured;
}

// ── Scout sweeps ──

export type ScoutSweepId = "communities" | "newsletters_podcasts" | "practitioners";

const SCOUT_SYSTEM = `You are Scout, AESDR's partner-discovery agent.

AESDR is a self-paced sales curriculum for first-1-to-2-year SDRs and AEs in
startup SaaS. $249 SDR / $299 AE, one-time. Brand voice: operator-direct,
anti-guru, peer-built. You find AFFILIATE partners — people with an audience
who'd recommend the course to first-2-year reps.

USE YOUR TOOLS. You have web_search — actually search practitioner networks,
Skool/Mighty/Circle directories, Substack/Beehiiv, and podcast directories.
Verify each candidate is a real, currently-active account with a real handle or
URL before you score it. Never return a candidate you did not surface from a
real search result.

HARD RULES (non-negotiable):
- NEVER propose mass affiliate marketplaces (Rakuten, CJ, ShareASale, Impact-
  as-marketplace). Practitioner networks only.
- NEVER use LinkedIn as a contact path. Founder direction, no exceptions.

Return 12–15 scored candidates as STRICT JSON conforming to the schema you're
given. Score voice_fit honestly (1 = guru aesthetic; 5 = operator who teaches).
Flag conflicts (vendor sponsorships, competing courses) — do not drop them,
mark the conflict in why_fit.

NEVER fabricate. If you can't verify audience size from a real result, prefix
with "est." in why_fit. If you can't find a non-LinkedIn contact path, say so in
why_fit and leave contact_path as best-guess (the founder reviews each row).`;

const SCOUT_PROMPTS: Record<ScoutSweepId, string> = {
  communities:
    "Sweep 1 — PAID COMMUNITIES (Skool, Mighty Networks, Circle). Filter to sales/SDR/AE/revenue, 50–2,000 members. The community OWNER is the candidate.",
  newsletters_podcasts:
    "Sweep 2 — NEWSLETTERS + PODCASTS. Independent sales newsletters (Substack/Beehiiv) with an operator (not influencer) voice writing to early-career reps, and sales podcasts with operator hosts. Contact path = reply-to email, podcast guest-pitch form, or open X/Twitter DMs.",
  practitioners:
    "Sweep 3 — PRACTITIONER NETWORK FIGURES. Active contributors in 30MPC, Outbound Squad, RepVue, Modern Sales Pros, Apex BDR Club, Pavilion who have their OWN audience (not just members).",
};

export type ScoutRow = {
  name: string;
  surface: string;
  handle: string;
  audience_est: number | null;
  archetype: "creator" | "coach" | "alumni" | "community";
  voice_fit: number;
  why_fit: string;
  contact_path: string;
};

const JSON_SCHEMA_HINT = `Return STRICT JSON: { "rows": [ { "name": str, "surface": str, "handle": str, "audience_est": int|null, "archetype": "creator"|"coach"|"alumni"|"community", "voice_fit": 1-5, "why_fit": str (1 line), "contact_path": str (NOT LinkedIn) } ] }. No prose, no markdown fences — JSON only.`;

/** Run one scout sweep. Returns scored rows for the operator to review. */
export async function runScoutSweep(
  sweepId: ScoutSweepId,
  model: string = DEFAULT_SCOUT_MODEL,
): Promise<ScoutRow[]> {
  const text = await runResearchAgent({
    model,
    system: SCOUT_SYSTEM,
    prompt: `${SCOUT_PROMPTS[sweepId]}\n\nSearch first, then ${JSON_SCHEMA_HINT}`,
    tools: SEARCH_ONLY,
    maxTokens: 8000,
    budgetMs: SCOUT_BUDGET_MS,
  });
  return parseRows(text);
}

/** A value is a usable row if it's an object with a non-empty name. */
function isScoutRow(row: unknown): row is ScoutRow {
  return (
    !!row &&
    typeof row === "object" &&
    typeof (row as ScoutRow).name === "string" &&
    (row as ScoutRow).name.trim().length > 0
  );
}

/**
 * Parse scout rows out of the model's reply — tolerant by design.
 *
 * Happy path: the whole `{ "rows": [...] }` object parses. Salvage path: when
 * the stream was cut off mid-array (budget stop or a drop), the blob won't
 * parse as a whole, so we pull every COMPLETE {...} object out of it and keep
 * the ones that look like rows. This is the failsafe that makes a sweep
 * "surface something" even when it didn't get to finish — 9 complete rows in a
 * truncated array of 15 come back as 9, not zero.
 */
function parseRows(text: string): ScoutRow[] {
  const json = extractJson(text);

  // Happy path — a clean, complete object.
  try {
    const obj = JSON.parse(json) as { rows?: unknown };
    if (Array.isArray(obj?.rows)) {
      const rows = (obj.rows as unknown[]).filter(isScoutRow);
      if (rows.length > 0) return rows;
    }
  } catch {
    /* fall through to salvage */
  }

  // Salvage path — pull each complete flat object from a partial/truncated
  // array. Scout rows have no nested objects, so a brace-balanced match per
  // object is exact; an incomplete trailing object simply won't match.
  const salvaged: ScoutRow[] = [];
  for (const chunk of json.match(/\{[^{}]*\}/g) ?? []) {
    try {
      const row = JSON.parse(chunk);
      if (isScoutRow(row)) salvaged.push(row);
    } catch {
      /* skip a fragment that isn't a whole object */
    }
  }
  return salvaged;
}

// ── Dossier enrichment ──

const DOSSIER_SYSTEM = `You are Dossier, AESDR's candidate-enrichment agent.

AESDR is a $249/$299 one-time sales curriculum for first-1-2-year SDRs/AEs in
startup SaaS. Voice is operator-direct, anti-guru. The R-G blocklist — "crush
it, level up, unlock your potential, 10x, rockstar, guru" — is hard-banned.

USE YOUR TOOLS. You have web_search and web_fetch — search for this person,
find their own site / newsletter / podcast, and FETCH their About or contact
page to get a real non-LinkedIn contact path and their own website domain
(own_domain). Base audience_est and voice_fit on what you actually read, not on
memory. If searches genuinely turn up nothing, say so in the notes and set
verdict to "needs_research" rather than guessing.

You take ONE candidate and produce a structured brief. NEVER invent audience
numbers (say "est." or "couldn't verify"). NEVER recommend LinkedIn as the
contact path. If they're a clear NO, say so in verdict and stop.`;

export type DossierBrief = {
  audience_est: number | null;
  cadence_note: string;
  voice_fit: number;
  voice_fit_rationale: string;
  conflict: "none" | "soft" | "hard" | "unknown";
  conflict_note: string;
  contact_path: string;
  first_touch_angle: string;
  verdict: "reach_out" | "skip" | "needs_research";
  /** Their own website domain, if the research found one — the email
   *  finder's primary input. */
  own_domain?: string | null;
  /** Set by the email-finder pass after the brief, never by the model. */
  found_email?: { email: string; status: string; verified: boolean; domain?: string } | null;
};

const DOSSIER_SCHEMA_HINT = `Return STRICT JSON: { "audience_est": int|null, "cadence_note": str (1 line), "voice_fit": 1-5, "voice_fit_rationale": str (1 line), "conflict": "none"|"soft"|"hard"|"unknown", "conflict_note": str (1 line), "contact_path": str (NOT LinkedIn), "own_domain": str|null (their personal or company website domain, e.g. "janedoe.com" — their OWN site only, never a platform like skool/substack/circle/linkedin/youtube; null if they don't have one), "first_touch_angle": str (1 sentence), "verdict": "reach_out"|"skip"|"needs_research" }. No prose, no markdown fences.`;

/** The pipeline next_action line each dossier verdict maps to — shared by the
 *  hourly cron and the room's Run-brief-now action. */
export function verdictNextAction(verdict: DossierBrief["verdict"]): string {
  return verdict === "reach_out"
    ? "Send to scribe (auto-drafter picks this up)"
    : verdict === "skip"
      ? "Skip — see why_fit"
      : "Needs more research";
}

/** Enrich one candidate — searches + fetches their pages, then returns a brief. */
export async function runDossier(
  args: {
    name: string;
    surface: string | null;
    handle: string | null;
    existingWhyFit: string | null;
  },
  model: string = DEFAULT_DOSSIER_MODEL,
): Promise<DossierBrief | null> {
  const text = await runResearchAgent({
    model,
    system: DOSSIER_SYSTEM,
    prompt: `Candidate: ${args.name}\nSurface: ${args.surface ?? "(unknown)"}\nHandle: ${args.handle ?? "(unknown)"}\nWhat we know: ${args.existingWhyFit ?? "(nothing yet)"}\n\nResearch them with your tools, then ${DOSSIER_SCHEMA_HINT}`,
    tools: SEARCH_AND_FETCH,
    maxTokens: 2048,
    budgetMs: DOSSIER_BUDGET_MS,
  });
  try {
    return JSON.parse(extractJson(text)) as DossierBrief;
  } catch {
    return null;
  }
}
