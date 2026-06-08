import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-side scout + dossier — the two judgment agents wired into the tower
 * as buttons + crons (Option 2 in the founder review). Sentinel/courier/scribe
 * are deterministic (zero LLM cost); these two are LLM-in-the-loop and cost
 * real Anthropic tokens per invocation. The switches/levers gate them so the
 * founder controls when they run.
 *
 * Both ask Claude to return a structured JSON object so we can persist rows
 * without a regex. If web search is available in this SDK version Claude uses
 * it; otherwise the call still succeeds with Claude's training-data knowledge
 * (degraded sweep — the founder reviews each `sourced` row before promotion).
 */

// Per-agent model is now resolved by the caller (via lib/partnerships/
// agent-switch.getAgentModel) and passed in. We keep these as safe fallbacks
// in case a caller forgets to pass one.
const DEFAULT_SCOUT_MODEL = "claude-sonnet-4-6";
const DEFAULT_DOSSIER_MODEL = "claude-opus-4-6";

function client() {
  return new Anthropic(); // reads ANTHROPIC_API_KEY from env
}

// ── Scout sweeps ──

export type ScoutSweepId = "communities" | "newsletters_podcasts" | "practitioners";

const SCOUT_SYSTEM = `You are Scout, AESDR's partner-discovery agent.

AESDR is a self-paced sales curriculum for first-1-to-2-year SDRs and AEs in
startup SaaS. $249 SDR / $299 AE, one-time. Brand voice: operator-direct,
anti-guru, peer-built. You find AFFILIATE partners — people with an audience
who'd recommend the course to first-2-year reps.

HARD RULES (non-negotiable):
- NEVER propose mass affiliate marketplaces (Rakuten, CJ, ShareASale, Impact-
  as-marketplace). Practitioner networks only.
- NEVER use LinkedIn as a contact path. Founder direction, no exceptions.

You will be asked to sweep one specific surface and return 12–15 scored
candidates as STRICT JSON conforming to the schema you're given. Score voice_fit
honestly (1 = guru aesthetic; 5 = operator who teaches). Flag conflicts (vendor
sponsorships, competing courses) — do not drop them, mark the conflict in
why_fit.

NEVER fabricate. If you're uncertain about audience size, prefix with "est." in
why_fit. If you can't verify a contact path that isn't LinkedIn, say so in why_fit
and leave contact_path as best-guess (the founder reviews each row).`;

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
  const r = await client().messages.create({
    model,
    max_tokens: 4096,
    system: SCOUT_SYSTEM,
    messages: [
      { role: "user", content: `${SCOUT_PROMPTS[sweepId]}\n\n${JSON_SCHEMA_HINT}` },
    ],
  });
  const text = r.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");
  return parseRows(text);
}

function parseRows(text: string): ScoutRow[] {
  // Tolerate ```json fences in case the model adds them despite instructions.
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    const obj = JSON.parse(cleaned) as { rows?: unknown };
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
};

const DOSSIER_SCHEMA_HINT = `Return STRICT JSON: { "audience_est": int|null, "cadence_note": str (1 line), "voice_fit": 1-5, "voice_fit_rationale": str (1 line), "conflict": "none"|"soft"|"hard"|"unknown", "conflict_note": str (1 line), "contact_path": str (NOT LinkedIn), "first_touch_angle": str (1 sentence), "verdict": "reach_out"|"skip"|"needs_research" }. No prose, no markdown fences.`;

/** Enrich one candidate. */
export async function runDossier(
  args: {
    name: string;
    surface: string | null;
    handle: string | null;
    existingWhyFit: string | null;
  },
  model: string = DEFAULT_DOSSIER_MODEL,
): Promise<DossierBrief | null> {
  const r = await client().messages.create({
    model,
    max_tokens: 1024,
    system: DOSSIER_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Candidate: ${args.name}\nSurface: ${args.surface ?? "(unknown)"}\nHandle: ${args.handle ?? "(unknown)"}\nWhat we know: ${args.existingWhyFit ?? "(nothing yet)"}\n\n${DOSSIER_SCHEMA_HINT}`,
      },
    ],
  });
  const text = r.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned) as DossierBrief;
  } catch {
    return null;
  }
}
