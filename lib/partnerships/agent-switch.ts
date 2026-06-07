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
