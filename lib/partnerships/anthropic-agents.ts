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
// filtering, so no beta header and no separate code_execution tool. max_uses
// is kept tight: every search/fetch is a server round-trip, and the whole call
// has to finish inside the 60s function limit (see runResearchAgent's deadline).
// Each use is a sequential server-side round-trip inside one messages.create,
// and that whole call has to return before the function's ceiling. Logs showed
// 3 search + 2 fetch ≈ 60s — right at the old 60s wall. Kept deliberately lean:
// 2 searches + 1 page fetch lands a brief in ~25-35s with real margin.
const SEARCH_ONLY: Anthropic.Messages.ToolUnion[] = [
  { type: "web_search_20260209", name: "web_search", max_uses: 3 },
];
const SEARCH_AND_FETCH: Anthropic.Messages.ToolUnion[] = [
  { type: "web_search_20260209", name: "web_search", max_uses: 2 },
  { type: "web_fetch_20260209", name: "web_fetch", max_uses: 1 },
];

// Hard wall-clock budget for one research turn, per caller. A scout sweep has
// to search around and emit 12-15 candidates, so it needs much more time than a
// single-candidate dossier brief. Each must stay under its route's maxDuration
// (tower 180, candidate 100, cron 180) so an overrun surfaces as a caught
// "timed out" error, never an uncatchable platform hard-kill.
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
 * Run a research-and-return-JSON turn: messages.create with the server-side
 * web tools attached, draining pause_turn (the server tool loop hitting its
 * iteration cap) until the model finishes, then returning the final response's
 * text — where the JSON lives.
 *
 * Bounded on purpose. Each create is given the remaining budget as its timeout
 * with retries off, and the loop refuses to start a round it can't finish, so
 * a slow search surfaces as a caught "timed out" error (inline banner) rather
 * than a platform hard-kill (the turtle).
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
  for (let i = 0; i < 4; i++) {
    const remaining = deadline - Date.now();
    if (remaining < 6_000) {
      throw new Error(
        "Research ran long and was stopped before finishing — try again, or set dossier to a faster model in Agent Controls.",
      );
    }
    const r = await c.messages.create(
      {
        model: opts.model,
        max_tokens: opts.maxTokens,
        system: opts.system,
        tools: opts.tools,
        messages,
      },
      { timeout: remaining, maxRetries: 0 },
    );
    if (r.stop_reason === "pause_turn") {
      // Server tool loop paused at its cap — append + resume (no new user turn).
      messages.push({ role: "assistant", content: r.content });
      continue;
    }
    return r.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  }
  throw new Error("Research kept searching without returning a brief — try again.");
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

function parseRows(text: string): ScoutRow[] {
  try {
    const obj = JSON.parse(extractJson(text)) as { rows?: unknown };
    if (!obj.rows || !Array.isArray(obj.rows)) return [];
    return (obj.rows as ScoutRow[]).filter((row) => row && typeof row.name === "string");
  } catch {
    return [];
  }
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
