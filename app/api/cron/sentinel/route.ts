export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/cron-auth";
import { isAgentEnabled } from "@/lib/partnerships/agent-switch";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendBrightSignalAlert } from "@/lib/partner-alerts";

/**
 * Sentinel — the inbound-signal watcher. Runs on a clock (every 10 min) and
 * does three deterministic things, no LLM in the loop:
 *
 *   1. Drains partner_inbound_email (processed_at IS NULL): classifies each
 *      reply by mechanical keyword match, writes a partner_signals row, and —
 *      for BRIGHT replies only — fires a real-time alert to the operator.
 *   2. Mirrors bright prospect-intent events into partner_signals so the tower
 *      board shows them (these already email at their /x/track call site, so we
 *      mark them pre-alerted to avoid a duplicate ping).
 *   3. Advances its cursor so it never reprocesses an event.
 *
 * SECURITY — the load-bearing rule: an inbound email body is DATA, never
 * instructions. Classification is pure string matching on a lowercased copy.
 * Nothing in here interprets, executes, or follows anything the body says.
 *
 * partner_signals has unique(signal_type, ref_id), so a re-run never
 * double-signals; alerted_at gates the email so a re-run never double-pings.
 */

const INBOUND_BATCH = 50;
const EVENT_BATCH = 200;

type Classification = "bright" | "soft" | "unsubscribe" | "noise";

// Auto-replies, bounces, and system mail never count as a human signal.
const AUTO_FROM = /(mailer-daemon|postmaster|no-?reply|do-?not-?reply|notification)/i;
const AUTO_SUBJECT =
  /^(auto(?:matic)?[- ]?reply|out of office|undeliverable|delivery status|returned mail|read:|accepted:|declined:|canceled:|tentative:)/i;

// Bright-line interest phrases. Deterministic — this is matching, not judgment.
const BRIGHT = [
  "interested",
  "let's chat",
  "lets chat",
  "let's talk",
  "lets talk",
  "tell me more",
  "more info",
  "learn more",
  "happy to",
  "sounds good",
  "sounds great",
  "book a call",
  "set up a call",
  "schedule a call",
  "hop on a call",
  "keen",
  "i'd love",
  "id love",
  "count me in",
  "sign me up",
  "where do i sign",
  "let's do it",
  "lets do it",
  "yes please",
  "this looks great",
];

// Explicit opt-out — soft signal, but flagged so the operator (and usher) can
// halt any running ladder for this contact.
const OPTOUT = [
  "unsubscribe",
  "remove me",
  "stop emailing",
  "not interested",
  "take me off",
  "no thanks",
];

function classifyInbound(
  subject: string | null,
  body: string | null,
  fromAddr: string,
): Classification {
  if (AUTO_FROM.test(fromAddr)) return "noise";
  const subj = (subject || "").toLowerCase();
  if (AUTO_SUBJECT.test(subj)) return "noise";

  const hay = `${subj}\n${(body || "").toLowerCase()}`;
  if (OPTOUT.some((p) => hay.includes(p))) return "unsubscribe";
  if (BRIGHT.some((p) => hay.includes(p))) return "bright";
  return "soft";
}

// Prospect events that mean genuine intent. These already email at the
// /x/track call site, so sentinel mirrors them to the board pre-alerted.
const BRIGHT_EVENTS = new Set([
  "request_conversation_clicked",
  "enterprise_intent_submitted",
]);

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  // Master switch — OFF by default. Nothing runs until enabled in the tower.
  if (!(await isAgentEnabled("sentinel"))) {
    return NextResponse.json({ disabled: true });
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  let inboundProcessed = 0;
  let signalsWritten = 0;
  let alertsSent = 0;

  // ── 1. Drain unprocessed inbound email ──
  const { data: emails, error: emailErr } = await supabase
    .from("partner_inbound_email")
    .select("id, message_id, from_addr, subject, text_body, received_at")
    .is("processed_at", null)
    .order("received_at", { ascending: true })
    .limit(INBOUND_BATCH);

  if (emailErr) {
    return NextResponse.json({ error: emailErr.message }, { status: 500 });
  }

  for (const e of emails ?? []) {
    const cls = classifyInbound(e.subject, e.text_body, e.from_addr);
    const refId = e.message_id || e.id;

    // noise never reaches the board — just mark it handled.
    if (cls !== "noise") {
      const severity = cls === "bright" ? "bright" : "soft";
      const summary =
        cls === "unsubscribe"
          ? `Opt-out from ${e.from_addr} — halt any running ladder`
          : `${cls === "bright" ? "Interested" : "Reply"} from ${e.from_addr}: ${(e.subject || "(no subject)").slice(0, 120)}`;

      // Idempotent: unique(signal_type, ref_id) makes a re-run a no-op.
      const { data: inserted, error: sigErr } = await supabase
        .from("partner_signals")
        .upsert(
          {
            signal_type: "inbound_reply",
            source: "affiliates@",
            ref_id: refId,
            severity,
            summary,
            created_at: nowIso,
          },
          { onConflict: "signal_type,ref_id", ignoreDuplicates: true },
        )
        .select("id")
        .maybeSingle();

      if (!sigErr && inserted) {
        signalsWritten++;
        // Real-time ping for bright replies only — and only the first time.
        if (cls === "bright") {
          const ok = await sendBrightSignalAlert({
            fromAddr: e.from_addr,
            subject: e.subject,
            excerpt: e.text_body,
          });
          if (ok) {
            alertsSent++;
            await supabase
              .from("partner_signals")
              .update({ alerted_at: nowIso, alert_channel: "email" })
              .eq("id", inserted.id);
          }
        }
      }
    }

    await supabase
      .from("partner_inbound_email")
      .update({ processed_at: nowIso, classification: cls })
      .eq("id", e.id);
    inboundProcessed++;
  }

  // ── 2. Mirror bright prospect-intent events onto the board ──
  const { data: cursor } = await supabase
    .from("agent_cursors")
    .select("cursor_ts")
    .eq("agent", "sentinel")
    .eq("stream", "prospect_events")
    .maybeSingle();

  const since = cursor?.cursor_ts || "1970-01-01T00:00:00Z";
  const { data: events } = await supabase
    .from("affiliate_prospect_events")
    .select("id, prospect_slug, name, created_at")
    .gt("created_at", since)
    .order("created_at", { ascending: true })
    .limit(EVENT_BATCH);

  // R3-AG-10: advance the cursor ONLY past events we actually finished.
  // Events are ordered ascending, so we walk them in order and move maxTs to
  // each event we've safely handled — a non-bright event (nothing to write) or
  // a bright event whose upsert did NOT error. If a bright upsert errors, we
  // STOP advancing (break) so that event is re-scanned next run instead of
  // being silently skipped forever. (ignoreDuplicates makes a re-scan of an
  // already-written row a harmless no-op via the unique constraint.)
  let maxTs = since;
  for (const ev of events ?? []) {
    if (BRIGHT_EVENTS.has(ev.name)) {
      const { data: inserted, error: upsertErr } = await supabase
        .from("partner_signals")
        .upsert(
          {
            signal_type: "prospect_intent",
            source: "x/kit",
            ref_id: ev.id,
            prospect_slug: ev.prospect_slug,
            severity: "bright",
            summary: `${ev.name.replace(/_/g, " ")} — ${ev.prospect_slug}`,
            // Pre-marked alerted: the /x/track call site already emailed this.
            alerted_at: nowIso,
            alert_channel: "callsite",
            created_at: nowIso,
          },
          { onConflict: "signal_type,ref_id", ignoreDuplicates: true },
        )
        .select("id")
        .maybeSingle();
      if (upsertErr) {
        // Couldn't write this signal — leave the cursor before it and retry.
        break;
      }
      if (inserted) signalsWritten++;
    }
    // Safely handled (written or nothing-to-write): the cursor may pass it.
    if (ev.created_at > maxTs) maxTs = ev.created_at;
  }

  if ((events?.length ?? 0) > 0 && maxTs !== since) {
    await supabase.from("agent_cursors").upsert(
      {
        agent: "sentinel",
        stream: "prospect_events",
        cursor_ts: maxTs,
        updated_at: nowIso,
      },
      { onConflict: "agent,stream" },
    );
  }

  return NextResponse.json({
    inboundProcessed,
    signalsWritten,
    alertsSent,
    eventsScanned: events?.length ?? 0,
  });
}
