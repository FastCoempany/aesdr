export const dynamic = "force-dynamic";

import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/cron-auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { canonCheck } from "@/lib/partnerships/canon-mechanical";
import {
  renderFollowUp1,
  renderFollowUp2,
  extractEmail,
} from "@/lib/partnerships/outreach-templates";

/**
 * Follow-up ladder — the cold-outreach cadence, automated to the draft stage.
 * Runs hourly. For every candidate that was contacted but hasn't replied, it
 * advances the fixed ladder and DRAFTS the next touch into the tower:
 *
 *   first-touch (day 0) → +4d follow-up 1 → +9d follow-up 2 → +13d mark cold
 *
 * "+4 / +9" = days after the first-touch. Follow-up 1 (day 4) adds value;
 * follow-up 2 (day 9) is the honest close. Both reuse the original thread.
 *
 * HALT ON REPLY (the load-bearing rule): a ladder that keeps firing after
 * someone answered is the fastest way to look like a bot. Before drafting any
 * step we check two halts — (a) the candidate's status is no longer
 * 'contacted' (the operator moved them when they worked the reply), and
 * (b) an inbound email from their address landed after the first-touch. Either
 * stops the ladder cold.
 *
 * Like the first-touch drafter, this only AUTO-DRAFTS — the queued follow-up is
 * a 'ready' row the operator approves in the tower. The send stays one human
 * click; the automation is the detection + drafting + scheduling.
 *
 * Idempotent: idempotency_key = followup:<pipelineId>:<step>.
 */

const BATCH = 25;
const FU1_DAYS = 4;
const FU2_DAYS = 9;
const COLD_DAYS = 13;
const DAY = 24 * 60 * 60 * 1000;

function idemKey(pipelineId: string, step: number): string {
  return crypto
    .createHash("sha256")
    .update(`followup:${pipelineId}:${step}`)
    .digest("hex")
    .slice(0, 32);
}

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  const supabase = createAdminClient();
  const now = Date.now();
  const nowIso = new Date().toISOString();

  const { data: rows, error } = await supabase
    .from("partner_pipeline")
    .select("id, name, why_fit, contact_path, first_touch_at, ladder_step, motion, status")
    .eq("status", "contacted")
    .eq("motion", "affiliate")
    .not("first_touch_at", "is", null)
    .order("first_touch_at", { ascending: true })
    .limit(BATCH * 3);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let drafted = 0;
  let halted = 0;
  let coldened = 0;

  for (const r of rows ?? []) {
    if (drafted >= BATCH) break;
    const firstTouch = new Date(r.first_touch_at as string).getTime();
    const ageDays = (now - firstTouch) / DAY;

    // ── Halt (b): a real reply landed from this contact's address. ──
    const email = extractEmail(r.contact_path);
    if (email) {
      const { data: replies } = await supabase
        .from("partner_inbound_email")
        .select("id")
        .ilike("from_addr", `%${email}%`)
        .gt("received_at", r.first_touch_at as string)
        .limit(1);
      if (replies && replies.length > 0) {
        await supabase
          .from("partner_pipeline")
          .update({ status: "replied", updated_at: nowIso })
          .eq("id", r.id)
          .eq("status", "contacted");
        halted++;
        continue;
      }
    }

    const step = r.ladder_step ?? 0;

    // ── Advance the ladder. ──
    if (step === 0 && ageDays >= FU1_DAYS) {
      const rendered = renderFollowUp1({ name: r.name });
      await draftFollowUp(supabase, r, rendered, 1, nowIso);
      await supabase
        .from("partner_pipeline")
        .update({ ladder_step: 1, last_ladder_at: nowIso, updated_at: nowIso })
        .eq("id", r.id)
        .eq("status", "contacted");
      drafted++;
    } else if (step === 1 && ageDays >= FU2_DAYS) {
      const rendered = renderFollowUp2({ name: r.name, why_fit: r.why_fit });
      await draftFollowUp(supabase, r, rendered, 2, nowIso);
      await supabase
        .from("partner_pipeline")
        .update({ ladder_step: 2, last_ladder_at: nowIso, updated_at: nowIso })
        .eq("id", r.id)
        .eq("status", "contacted");
      drafted++;
    } else if (step === 2 && ageDays >= COLD_DAYS) {
      // No reply after the full ladder → park as cold (the second-wave list).
      await supabase
        .from("partner_pipeline")
        .update({ status: "cold", updated_at: nowIso })
        .eq("id", r.id)
        .eq("status", "contacted");
      coldened++;
    }
  }

  return NextResponse.json({
    examined: rows?.length ?? 0,
    drafted,
    halted,
    coldened,
  });
}

async function draftFollowUp(
  supabase: ReturnType<typeof createAdminClient>,
  row: { id: string; contact_path: string | null; handle?: string | null },
  rendered: { subject: string; body: string; unfilled: string[] },
  step: number,
  nowIso: string,
): Promise<void> {
  const { clean, hits } = canonCheck(`${rendered.subject}\n${rendered.body}`);
  const email = extractEmail(row.contact_path);
  const sendChannel = email ? "email" : "manual";
  const toAddr = email || row.contact_path || "(no contact path)";
  const wardenCleared = clean && rendered.unfilled.length === 0;
  const noteParts: string[] = [];
  if (rendered.unfilled.length > 0) noteParts.push(`Fill before sending: ${rendered.unfilled.join(", ")}`);
  if (!clean) noteParts.push(`Canon flags: ${hits.map((h) => `"${h.term}"`).join(", ")}`);

  await supabase.from("partner_outbound_queue").insert({
    to_addr: toAddr,
    subject: `Follow-up ${step}`,
    body: rendered.body,
    tier: "cold",
    status: "ready",
    warden_cleared: wardenCleared,
    send_after: nowIso,
    idempotency_key: idemKey(row.id, step),
    related_pipeline_id: row.id,
    drafted_by: `followup-cron:step-${step}`,
    draft_source: `followup-cron:step-${step}`,
    send_channel: sendChannel,
    personalization_note: noteParts.join(" · ") || null,
  });
}
