import { createAdminClient } from "@/utils/supabase/admin";
import { getAgentModel } from "@/lib/partnerships/agent-switch";
import { runScoutSweep, type ScoutSweepId } from "@/lib/partnerships/anthropic-agents";
import { logPartnerEvents } from "@/lib/partnerships/events";

/**
 * The canonical scout-sweep runner: research the live web, de-dupe against the
 * pipeline, insert the new candidates as `sourced`, and log the events. Shared
 * by the /api/admin/run-sweep route (the button's trigger) so the long Anthropic
 * call runs on a route handler — a substrate that reliably honours maxDuration —
 * instead of a blocking Server Action, whose POST the platform can kill mid-call
 * and surface to the client as the "unexpected response from the server" turtle.
 *
 * The model writes, the human approves: everything lands at `status='sourced'`
 * for review, nothing reaches `enriched` (where the auto-drafter acts) until the
 * operator promotes it.
 */

export const VALID_SWEEPS: readonly ScoutSweepId[] = [
  "communities",
  "newsletters_podcasts",
  "practitioners",
];

export function isValidSweep(s: string): s is ScoutSweepId {
  return (VALID_SWEEPS as readonly string[]).includes(s);
}

export type SweepResult = { inserted: number; seen: number };

/** Run one sweep and persist new rows. `seen` = candidates surfaced, `inserted`
 *  = new rows after de-duping against existing names. */
export async function runSweepAndInsert(
  sweep: ScoutSweepId,
  actor: string,
): Promise<SweepResult> {
  const model = await getAgentModel("scout");
  const rows = await runScoutSweep(sweep, model);
  const seen = rows.length;
  if (seen === 0) return { inserted: 0, seen };

  const supabase = createAdminClient();
  // De-dupe against existing names (case-insensitive); scout surfaces dupes.
  const names = rows.map((r) => r.name);
  const { data: existing } = await supabase
    .from("partner_pipeline")
    .select("name")
    .in("name", names);
  const have = new Set((existing ?? []).map((e) => (e.name as string).toLowerCase()));

  const inserts = rows
    .filter((r) => !have.has(r.name.toLowerCase()))
    .map((r) => ({
      name: r.name,
      surface: r.surface,
      handle: r.handle,
      motion: "affiliate",
      archetype: r.archetype,
      audience_est: r.audience_est,
      voice_fit: r.voice_fit,
      status: "sourced", // human review before promotion to 'enriched'
      contact_path: r.contact_path,
      why_fit: `${r.why_fit} [scout/${sweep}, ${actor}]`,
      source_agent: `scout-tower:${sweep}`,
      next_action: "Review and promote, or reject",
    }));

  if (inserts.length === 0) return { inserted: 0, seen };

  const { data: created, error } = await supabase
    .from("partner_pipeline")
    .insert(inserts)
    .select("id");
  if (error) throw new Error(error.message);

  await logPartnerEvents(
    (created ?? []).map((c) => ({
      pipelineId: c.id as string,
      actor: "scout",
      kind: "sourced",
      detail: { sweep, model, triggered_by: actor },
    })),
  );

  return { inserted: inserts.length, seen };
}
