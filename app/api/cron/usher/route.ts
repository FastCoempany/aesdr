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

// Per-registrant idempotency (P1-9): one outbound row per (workshop, stage,
// registrant), so a re-tick is a clean upsert no-op and no registrant is
// double-sent. A null registrantId keeps the legacy workshop-wide key shape.
function idemKey(
  workshopId: string,
  stage: string,
  registrantId?: string,
): string {
  const suffix = registrantId ? `:${registrantId}` : "";
  return crypto
    .createHash("sha256")
    .update(`workshop:${workshopId}:${stage}${suffix}`)
    .digest("hex")
    .slice(0, 32);
}

// R4-TZ-2: format the workshop time in the affiliate's timezone, matching the
// confirmation email + public page (lib/workshop.ts formatWorkshopDateForDisplay)
// — never raw UTC, which would show the registrant a different time than they
// registered against.
function formatInTz(scheduledAt: string, tz: string | null): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: tz || "America/New_York",
      timeZoneName: "short",
    }).format(new Date(scheduledAt));
  } catch {
    return new Date(scheduledAt).toUTCString();
  }
}

function reminderBody(args: {
  scheduledAt: string;
  timezone: string | null;
  hoursAway: number;
}): { subject: string; body: string } {
  const when = formatInTz(args.scheduledAt, args.timezone);
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
    registrantId?: string;
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
      idempotency_key: idemKey(args.workshopId, args.stage, args.registrantId),
      drafted_by: "usher",
      related_pipeline_id: args.relatedPipelineId ?? null,
    },
    { onConflict: "idempotency_key", ignoreDuplicates: true },
  );
}

type Registrant = { id: string; email: string; first_name: string | null };

/**
 * P1-9: fan a stage out to every registrant of this workshop (matched by
 * affiliate_slug + workshop_date_iso == scheduled_at), one pre-approved
 * outbound row each, instead of a single send to a placeholder group address.
 * Returns how many rows were enqueued. The personalized subject/body is the
 * caller's; the recipient + per-registrant idempotency are added here.
 */
async function enqueueForRegistrants(
  supabase: ReturnType<typeof createAdminClient>,
  args: {
    workshopId: string;
    affiliateSlug: string;
    scheduledAt: string;
    stage: string;
    subject: string;
    body: string;
  },
): Promise<number> {
  // AUDIT: this matches registrants on workshop_registrants.workshop_date_iso
  // == partner_workshop.scheduled_at. The two tables are populated out-of-band
  // (no in-repo writer creates partner_workshop rows — see R4-SM-1), so a
  // mismatch in how the date is stamped on each side would silently match zero
  // registrants. A follow-up should bind partner_workshop to the registrants'
  // workshop_date_iso (FK or shared id) rather than relying on timestamp eq.
  const { data: registrants, error } = await supabase
    .from("workshop_registrants")
    .select("id, email, first_name")
    .eq("affiliate_slug", args.affiliateSlug)
    .eq("workshop_date_iso", args.scheduledAt);
  if (error || !registrants || registrants.length === 0) return 0;

  let n = 0;
  for (const reg of registrants as Registrant[]) {
    if (!reg.email) continue;
    await enqueueTransactional(supabase, {
      workshopId: args.workshopId,
      stage: args.stage,
      toAddr: reg.email,
      subject: args.subject,
      body: args.body,
      registrantId: reg.id,
    });
    n++;
  }
  return n;
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

  // R4-TZ-2: resolve each affiliate's workshop_timezone once so reminders show
  // the registrant the same wall-clock time they registered against.
  const slugs = [...new Set((workshops ?? []).map((w) => w.affiliate_slug))];
  const tzBySlug = new Map<string, string | null>();
  if (slugs.length > 0) {
    const { data: affRows } = await supabase
      .from("affiliates")
      .select("slug, workshop_timezone")
      .in("slug", slugs);
    for (const a of affRows ?? []) tzBySlug.set(a.slug, a.workshop_timezone ?? null);
  }

  for (const w of workshops ?? []) {
    const scheduled = new Date(w.scheduled_at);
    const msUntil = scheduled.getTime() - now.getTime();
    const hoursUntil = msUntil / 3600000;
    const tz = tzBySlug.get(w.affiliate_slug) ?? null;

    // scheduled → reminded (T-48h reminder)
    if (w.status === "scheduled" && hoursUntil <= 48 && hoursUntil > 1) {
      const { subject, body } = reminderBody({
        scheduledAt: w.scheduled_at,
        timezone: tz,
        hoursAway: Math.max(1, Math.round(hoursUntil)),
      });
      enqueued += await enqueueForRegistrants(supabase, {
        workshopId: w.id,
        affiliateSlug: w.affiliate_slug,
        scheduledAt: w.scheduled_at,
        stage: "remind-48h",
        subject,
        body,
      });
      await supabase
        .from("partner_workshop")
        .update({ status: "reminded" })
        .eq("id", w.id)
        .eq("status", "scheduled");
      transitions++;
      continue;
    }

    // reminded → live (T-1h reminder + status flip).
    // R4-AG-13: only SEND the "starts in 1h" reminder when the workshop is
    // still in the future (msUntil > 0) — never for a past-due session, which
    // would tell the registrant it "starts in 1h" after it already began. The
    // status flip to `live` still happens for anything at/past the hour mark so
    // a missed tick doesn't strand the workshop short of replay_open.
    if (
      (w.status === "scheduled" || w.status === "reminded") &&
      hoursUntil <= 1 &&
      msUntil > -3600000
    ) {
      if (msUntil > 0) {
        const { subject, body } = reminderBody({
          scheduledAt: w.scheduled_at,
          timezone: tz,
          hoursAway: 1,
        });
        enqueued += await enqueueForRegistrants(supabase, {
          workshopId: w.id,
          affiliateSlug: w.affiliate_slug,
          scheduledAt: w.scheduled_at,
          stage: "remind-1h",
          subject,
          body,
        });
      }
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
      enqueued += await enqueueForRegistrants(supabase, {
        workshopId: w.id,
        affiliateSlug: w.affiliate_slug,
        scheduledAt: w.scheduled_at,
        stage: "replay-open",
        subject,
        body,
      });
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
