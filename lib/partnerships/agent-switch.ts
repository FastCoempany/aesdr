import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Agent master switches. The fail-safe gate every partnership cron checks
 * before doing anything. OFF is the default in every failure mode:
 *   - the agent_switches table doesn't exist yet  → OFF
 *   - there's no row for this agent               → OFF
 *   - enabled is false                            → OFF
 *   - any query/network error                     → OFF
 * Only an explicit row with enabled=true runs the agent. So nothing moves
 * until the operator flips a lever in the tower's Agent Controls.
 */

export const PARTNER_AGENTS = [
  "sentinel",
  "scribe",
  "courier",
  "usher",
  "almanac",
  "followup",
  "dossier-enrich",
] as const;
export type PartnerAgent = (typeof PARTNER_AGENTS)[number];

export async function isAgentEnabled(agent: PartnerAgent): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("agent_switches")
      .select("enabled")
      .eq("agent", agent)
      .maybeSingle();
    if (error) return false; // table missing / any error → OFF
    return data?.enabled === true;
  } catch {
    return false;
  }
}

// ── Per-agent model preference ──
// Only LLM-calling agents (scout, dossier-enrich) read this. The model lives
// in agent_switches.model; null/missing = use the default for that agent.
// SDK 0.88 supports these four IDs — Opus 4.7/4.8 are not in this SDK yet.
export const SUPPORTED_MODELS = [
  "claude-opus-4-6",
  "claude-opus-4-5",
  "claude-opus-4-1",
  "claude-sonnet-4-6",
] as const;
export type ModelId = (typeof SUPPORTED_MODELS)[number];

export const AGENT_MODEL_DEFAULTS: Record<string, ModelId> = {
  // Both now run a live web_search/web_fetch loop and must finish inside the
  // 60s function limit, so the default is the fast model. Sonnet 4.6 reads
  // pages and fills the brief JSON well, and it's ~5x cheaper. Override to an
  // Opus in Agent Controls if you want sharper voice-fit verdicts and can
  // accept the slower (timeout-prone) call.
  "dossier-enrich": "claude-sonnet-4-6",
  // Volume list-building — Sonnet 4.6 (fast + cheap).
  scout: "claude-sonnet-4-6",
};

export async function getAgentModel(agent: string): Promise<ModelId> {
  const fallback = AGENT_MODEL_DEFAULTS[agent] ?? "claude-sonnet-4-6";
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("agent_switches")
      .select("model")
      .eq("agent", agent)
      .maybeSingle();
    if (error) return fallback;
    const m = (data?.model ?? null) as string | null;
    if (m && (SUPPORTED_MODELS as readonly string[]).includes(m)) return m as ModelId;
    return fallback;
  } catch {
    return fallback;
  }
}
