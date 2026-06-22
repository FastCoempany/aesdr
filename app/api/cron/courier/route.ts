export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Resend } from "resend";

import { verifyCronAuth } from "@/lib/cron-auth";
import { isAgentEnabled } from "@/lib/partnerships/agent-switch";
import { createAdminClient } from "@/utils/supabase/admin";
import { logPartnerEvent } from "@/lib/partnerships/events";

/**
 * Courier — the outbound send executor. Runs every 5 min and is the ONLY
 * sender in the roster. It never composes and never edits: it transmits rows
 * that are already status='approved' and due (send_after <= now()), then
 * writes an immutable line to partner_sent_log.
 *
 * The approval IS the human trigger-pull. Transactional rows (workshop
 * reminders, replies to people who wrote first) are written pre-approved by
 * usher; cold/sequenced rows reach 'approved' only when the operator presses
 * the button in /tower. Courier doesn't care which — it sends what's approved.
 *
 * At-most-once: Vercel never overlaps invocations of the same cron, so each
 * 'approved' row is seen once per tick. Before sending we check
 * partner_sent_log for the idempotency_key (a re-approved 'failed' row that
 * actually went out the first time is reconciled, not re-sent), and the unique
 * index on idempotency_key is the hard backstop. A send failure flips the row
 * to 'failed' with the error; the operator can re-approve.
 */

const BATCH = 25;
const FROM = process.env.EMAIL_FROM || "AESDR Partnerships <hello@aesdr.com>";
const UNSUB = {
  "List-Unsubscribe": "<mailto:hello@aesdr.com?subject=UNSUBSCRIBE>",
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
};

function getResend() {
  const apiKey = process.env.RESEND_API_KEY || process.env.aesdr_email_api_key;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  return new Resend(apiKey);
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain-text body → a deliverability-safe HTML alternative, on the cream board. */
function bodyToHtml(text: string): string {
  const paras = esc(text)
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-family:Georgia,'Source Serif 4',serif;font-size:15px;line-height:1.7;color:#1A1A1A;">${p.replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF7F2;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E8E4DF;">
      <tr><td style="padding:32px;">${paras}</td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

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
    // R3-AG-1 (claim-before-send): CLAIM the slot by inserting the
    // partner_sent_log row BEFORE the Resend call. The unique index on
    // idempotency_key makes this the atomic at-most-once guard — it closes the
    // crash window where the old order (send → then log) could re-send if the
    // process died between a successful send and writing the log.
    //
    //   - Claim insert succeeds  → we own this send; transmit, then fill in the
    //     resend_id and flip the queue row to 'sent'.
    //   - Claim insert conflicts → someone already claimed/sent this key; the
    //     mail is out (or in flight). Reconcile the queue row, never re-send.
    //   - Send fails after a fresh claim → DELETE the claim so a re-approval
    //     can genuinely retry, and mark the queue row 'failed'.
    const { error: claimErr } = await supabase.from("partner_sent_log").insert({
      queue_id: row.id,
      to_addr: row.to_addr,
      subject: row.subject,
      tier: row.tier,
      idempotency_key: row.idempotency_key,
      resend_id: null,
      sent_at: nowIso,
    });

    if (claimErr) {
      // Only a UNIQUE violation (23505) means the slot is already claimed/sent
      // — reconcile the queue row to 'sent' without re-sending. Any OTHER
      // insert error is transient: leave the row 'approved' so the next tick
      // retries, and do NOT mark it sent (which would drop the mail silently).
      if (claimErr.code === "23505") {
        const { data: prior } = await supabase
          .from("partner_sent_log")
          .select("resend_id")
          .eq("idempotency_key", row.idempotency_key)
          .maybeSingle();
        await supabase
          .from("partner_outbound_queue")
          .update({ status: "sent", sent_at: nowIso, resend_id: prior?.resend_id ?? null })
          .eq("id", row.id)
          .eq("status", "approved");
        reconciled++;
      } else {
        failed++;
      }
      continue;
    }

    // Send (we hold the claim now).
    let resendId: string | null = null;
    try {
      const result = await getResend().emails.send({
        from: FROM,
        to: row.to_addr,
        replyTo: process.env.EMAIL_RECIPIENT || "hello@aesdr.com",
        subject: row.subject,
        html: bodyToHtml(row.body),
        text: row.body,
        headers: UNSUB,
      });
      if (result.error) throw new Error(result.error.message || "resend error");
      resendId = result.data?.id ?? null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Release the claim so a re-approval can retry this row.
      await supabase
        .from("partner_sent_log")
        .delete()
        .eq("idempotency_key", row.idempotency_key);
      await supabase
        .from("partner_outbound_queue")
        .update({ status: "failed", error: msg.slice(0, 500) })
        .eq("id", row.id)
        .eq("status", "approved");
      if (row.related_pipeline_id) {
        await logPartnerEvent({
          pipelineId: row.related_pipeline_id,
          actor: "courier",
          kind: "send_failed",
          detail: { subject: row.subject, error: msg.slice(0, 200) },
        });
      }
      failed++;
      continue;
    }

    // Sent: reconcile the claim row with the resend_id, then mark the queue
    // row sent. (A crash between here and the queue update leaves the claim in
    // place, so the next tick reconciles to 'sent' without re-sending.)
    await supabase
      .from("partner_sent_log")
      .update({ resend_id: resendId })
      .eq("idempotency_key", row.idempotency_key);
    await supabase
      .from("partner_outbound_queue")
      .update({ status: "sent", sent_at: nowIso, resend_id: resendId })
      .eq("id", row.id)
      .eq("status", "approved");

    if (row.related_pipeline_id) {
      await logPartnerEvent({
        pipelineId: row.related_pipeline_id,
        actor: "courier",
        kind: "sent",
        detail: { subject: row.subject, to: row.to_addr },
      });
    }

    // Start the follow-up ladder clock: the first cold send to a pipeline
    // contact stamps first_touch_at + moves them to 'contacted'. Guarded so
    // follow-up sends (also cold, also to a pipeline contact) never reset it.
    if (row.tier === "cold" && row.related_pipeline_id) {
      const { data: stamped } = await supabase
        .from("partner_pipeline")
        .update({ first_touch_at: nowIso, status: "contacted", updated_at: nowIso })
        .eq("id", row.related_pipeline_id)
        .is("first_touch_at", null)
        .select("id")
        .maybeSingle();
      if (stamped) {
        await logPartnerEvent({
          pipelineId: row.related_pipeline_id,
          actor: "courier",
          kind: "contacted",
          detail: { via: "first cold send" },
        });
      }
    }
    sent++;
  }

  return NextResponse.json({
    examined: sendable.length,
    sent,
    reconciled,
    failed,
  });
}
