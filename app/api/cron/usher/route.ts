export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { verifyCronAuth } from "@/lib/cron-auth";
import { isAgentEnabled } from "@/lib/partnerships/agent-switch";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Usher — the workshop lifecycle + nurture clock. Runs every 30 min.
 *
 * Workshop state machine (partner_workshop.status):
 *   scheduled ─(T-48h)→ reminded ─(T-1h)→ live ─(ends)→ replay_open ─(+72h)→ closed
 *
 * Each transition does TWO things deterministically: flip the status, and
 * enqueue the matching outbound row in partner_outbound_queue PRE-APPROVED at
 * the transactional tier (these recipients opted in — they registered for the
 * workshop). Courier sends pre-approved transactional rows on its next tick;
 * cold/sequenced rows still require the tower button.
 *
 * Idempotency: each enqueued row carries a deterministic idempotency_key
 * scoped to the workshop+stage, so a re-tick of the same transition is a clean
 * upsert no-op (the unique index on idempotency_key is the hard backstop).
 */

const PLACEHOLDER_REGISTRANT_TO =
  process.env.WORKSHOP_REGISTRANT_GROUP_ADDR || "hello@aesdr.com";

function idemKey(workshopId: string, stage: string): string {
  return crypto
    .createHash("sha256")
    .update(`workshop:${workshopId}:${stage}`)
    .digest("hex")
    .slice(0, 32);
}

function reminderBody(args: {
  affiliateSlug: string;
  scheduledAt: string;
  hoursAway: number;
}): { subject: string; body: string } {
  const when = new Date(args.scheduledAt).toUTCString();
  const subject =
    args.hoursAway >= 24
      ? `Reminder — your AESDR workshop is ${Math.round(args.hoursAway / 24)} days out`
      : `Reminder — your AESDR workshop starts in ${args.hoursAway}h`;
  const body = [
    `Quick reminder: your AESDR workshop is ${when}.`,
    ``,
    `The join link will be in the calendar invite you accepted at registration. If you can't find it, reply here and we'll resend.`,
    ``,
    `See you there.`,
  ].join("\n");
  return { subject, body };
}

function replayBody(args: { replayUrl: string | null }): {
  subject: string;
  body: string;
} {
  const subject = "Your AESDR workshop replay (72-hour window)";
  const body = [
    `Thanks for being part of the live session.`,
    ``,
    args.replayUrl
      ? `Replay: ${args.replayUrl}`
      : `Replay link is being posted shortly — we'll resend when it's up.`,
    ``,
    `This replay window stays open for 72 hours, then closes. Watch when you can.`,
  ].join("\n");
  return { subject, body };
}

async function enqueueTransactional(
  supabase: ReturnType<typeof createAdminClient>,
  args: {
    workshopId: string;
    stage: string;
    toAddr: string;
    subject: string;
    body: string;
    relatedPipelineId?: string | null;
  },
): Promise<void> {
  await supabase.from("partner_outbound_queue").upsert(
    {
      to_addr: args.toAddr,
      subject: args.subject,
      body: args.body,
      tier: "transactional",
      status: "approved",
      warden_cleared: true,
      approved_by: "usher",
      approved_at: new Date().toISOString(),
      send_after: new Date().toISOString(),
      idempotency_key: idemKey(args.workshopId, args.stage),
      drafted_by: "usher",
      related_pipeline_id: args.relatedPipelineId ?? null,
    },
    { onConflict: "idempotency_key", ignoreDuplicates: true },
  );
}

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  // Master switch — OFF by default. Nothing runs until enabled in the tower.
  if (!(await isAgentEnabled("usher"))) {
    return NextResponse.json({ disabled: true });
  }

  const supabase = createAdminClient();
  const now = new Date();

  let transitions = 0;
  let enqueued = 0;

  const { data: workshops, error } = await supabase
    .from("partner_workshop")
    .select(
      "id, affiliate_slug, scheduled_at, status, replay_url, replay_expires_at",
    )
    .in("status", ["scheduled", "reminded", "live", "replay_open"])
    .order("scheduled_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (const w of workshops ?? []) {
    const scheduled = new Date(w.scheduled_at);
    const msUntil = scheduled.getTime() - now.getTime();
    const hoursUntil = msUntil / 3600000;

    // scheduled → reminded (T-48h reminder)
    if (w.status === "scheduled" && hoursUntil <= 48 && hoursUntil > 1) {
      const { subject, body } = reminderBody({
        affiliateSlug: w.affiliate_slug,
        scheduledAt: w.scheduled_at,
        hoursAway: Math.max(1, Math.round(hoursUntil)),
      });
      await enqueueTransactional(supabase, {
        workshopId: w.id,
        stage: "remind-48h",
        toAddr: PLACEHOLDER_REGISTRANT_TO,
        subject,
        body,
      });
      enqueued++;
      await supabase
        .from("partner_workshop")
        .update({ status: "reminded" })
        .eq("id", w.id)
        .eq("status", "scheduled");
      transitions++;
      continue;
    }

    // reminded → live (T-1h reminder + status flip)
    if (
      (w.status === "scheduled" || w.status === "reminded") &&
      hoursUntil <= 1 &&
      msUntil > -3600000
    ) {
      const { subject, body } = reminderBody({
        affiliateSlug: w.affiliate_slug,
        scheduledAt: w.scheduled_at,
        hoursAway: 1,
      });
      await enqueueTransactional(supabase, {
        workshopId: w.id,
        stage: "remind-1h",
        toAddr: PLACEHOLDER_REGISTRANT_TO,
        subject,
        body,
      });
      enqueued++;
      await supabase
        .from("partner_workshop")
        .update({ status: "live" })
        .eq("id", w.id)
        .in("status", ["scheduled", "reminded"]);
      transitions++;
      continue;
    }

    // live → replay_open (assume a ~90 min session; flip when end has passed)
    if (w.status === "live" && msUntil < -90 * 60 * 1000) {
      const expiresAt = new Date(now.getTime() + 72 * 3600000).toISOString();
      const { subject, body } = replayBody({ replayUrl: w.replay_url });
      await enqueueTransactional(supabase, {
        workshopId: w.id,
        stage: "replay-open",
        toAddr: PLACEHOLDER_REGISTRANT_TO,
        subject,
        body,
      });
      enqueued++;
      await supabase
        .from("partner_workshop")
        .update({ status: "replay_open", replay_expires_at: expiresAt })
        .eq("id", w.id)
        .eq("status", "live");
      transitions++;
      continue;
    }

    // replay_open → closed (window expired)
    if (
      w.status === "replay_open" &&
      w.replay_expires_at &&
      new Date(w.replay_expires_at).getTime() < now.getTime()
    ) {
      await supabase
        .from("partner_workshop")
        .update({ status: "closed" })
        .eq("id", w.id)
        .eq("status", "replay_open");
      transitions++;
    }
  }

  return NextResponse.json({
    examined: workshops?.length ?? 0,
    transitions,
    enqueued,
  });
}
