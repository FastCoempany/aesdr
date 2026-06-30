export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/cron-auth";
import { isAgentEnabled } from "@/lib/partnerships/agent-switch";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendOutboundRow } from "@/lib/partnerships/courier-send";

/**
 * Courier — the outbound send executor. Runs every 5 min and is the ONLY
 * scheduled sender in the roster. It never composes and never edits: it
 * transmits rows that are already status='approved' and due (send_after <=
 * now()) via the shared sendOutboundRow (the SAME path the tower's manual
 * "Send now" uses), then writes an immutable line to partner_sent_log.
 *
 * The approval IS the human trigger-pull. Transactional rows (workshop
 * reminders, replies to people who wrote first) are written pre-approved by
 * usher; cold/sequenced rows reach 'approved' only when the operator presses
 * the button in /tower. Courier doesn't care which — it sends what's approved.
 *
 * At-most-once: Vercel never overlaps invocations of the same cron, so each
 * 'approved' row is seen once per tick, and sendOutboundRow's claim-before-send
 * (unique idempotency_key) is the hard backstop against a re-send — including
 * against a manual click racing a tick. A send failure flips the row to
 * 'failed'; the operator can re-approve.
 */

const BATCH = 25;

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  // Master switch — OFF by default. Nothing runs until enabled in the tower.
  if (!(await isAgentEnabled("courier"))) {
    return NextResponse.json({ disabled: true });
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data: due, error: queryErr } = await supabase
    .from("partner_outbound_queue")
    .select("*")
    .eq("status", "approved")
    .lte("send_after", nowIso)
    .order("send_after", { ascending: true })
    .limit(BATCH);

  if (queryErr) {
    return NextResponse.json({ error: queryErr.message }, { status: 500 });
  }

  // Only transmit email-channel rows. 'manual' rows (a DM handle / a contact
  // form — no address) are sent by hand from the tower and never touch courier.
  // Read send_channel defensively so this works before/after the 20260607
  // migration (absent column → treat as 'email', the pre-channel default).
  const sendable = (due ?? []).filter(
    (row) => (row.send_channel ?? "email") === "email",
  );

  let sent = 0;
  let reconciled = 0;
  let failed = 0;

  for (const row of sendable) {
    // The whole send (claim-before-send idempotency, Resend call, status flips,
    // event log, first-touch stamp) lives in the shared executor so the cron and
    // the tower's manual "Send now" are the exact same code path.
    const outcome = await sendOutboundRow(supabase, row, nowIso, "courier");
    if (outcome.result === "sent") sent++;
    else if (outcome.result === "reconciled") reconciled++;
    else failed++;
  }

  return NextResponse.json({
    examined: sendable.length,
    sent,
    reconciled,
    failed,
  });
}
