import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Candidate timeline events — what the room's story is built from. Best-effort
 * by design: an event append must never break the action or cron it rides on,
 * and must degrade silently until the 20260612 migration is applied.
 */

export type PartnerEvent = {
  pipelineId: string;
  /** Operator email, or an agent name: scout | dossier | scribe | courier |
   *  sentinel. Supabase types the auth email as possibly-undefined; an absent
   *  one records as "operator". */
  actor: string | undefined;
  /** sourced | promoted | rejected | brief_written | drafted | draft_edited |
   *  approved | held | released | sent | send_failed | contacted */
  kind: string;
  detail?: Record<string, unknown>;
};

export async function logPartnerEvents(events: PartnerEvent[]): Promise<void> {
  if (events.length === 0) return;
  try {
    const supabase = createAdminClient();
    await supabase.from("partner_events").insert(
      events.map((e) => ({
        pipeline_id: e.pipelineId,
        actor: e.actor ?? "operator",
        kind: e.kind,
        detail: e.detail ?? {},
      })),
    );
  } catch {
    // pre-migration or transient — the timeline just misses a line
  }
}

export async function logPartnerEvent(e: PartnerEvent): Promise<void> {
  return logPartnerEvents([e]);
}
