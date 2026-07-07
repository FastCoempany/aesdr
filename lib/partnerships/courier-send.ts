import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";

import { logPartnerEvent } from "@/lib/partnerships/events";
import { getSuppressedEmails } from "@/lib/email";

/**
 * The outbound send executor — claim-before-send, transmit via Resend, flip the
 * queue row, write the immutable sent-log line, stamp first-touch on a cold send.
 *
 * Shared by two callers so the send path (and its at-most-once idempotency) is
 * byte-identical whether the mail goes out on a schedule or on a click:
 *   - the Courier cron (app/api/cron/courier) — batch, automated, lever-gated
 *   - the tower's manual "Send now" (app/admin/tower/actions:sendNow) — one row,
 *     fired synchronously by an admin click, NO cron required.
 */

const FROM = process.env.EMAIL_FROM || "AESDR Partnerships <hello@aesdr.com>";
const UNSUB = {
  "List-Unsubscribe": "<mailto:hello@aesdr.com?subject=UNSUBSCRIBE>",
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
};

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY || process.env.aesdr_email_api_key;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  return new Resend(apiKey);
}

/**
 * Optional BCC of every outbound to a founder mailbox, so a copy of each send
 * lands in the inbox — Resend API sends never populate a Gmail "Sent" folder.
 * Defaults ON to hello@aesdr.com (where replies already land); set OUTBOUND_BCC
 * to a different address, or to "" to turn the BCC off entirely.
 */
function bccAddr(): string | undefined {
  const v = process.env.OUTBOUND_BCC;
  if (v === undefined) return "hello@aesdr.com";
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : undefined;
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

export type OutboundRow = {
  id: string;
  to_addr: string;
  subject: string;
  body: string;
  tier: string | null;
  idempotency_key: string;
  related_pipeline_id: string | null;
};

export type SendOutcome = {
  result: "sent" | "reconciled" | "failed";
  resendId: string | null;
  error?: string;
};

/**
 * Transmit ONE approved outbound row. Claim-before-send: insert the
 * partner_sent_log row (unique on idempotency_key) BEFORE the Resend call, so a
 * crash, a retry, or a double-fire (a courier tick racing a manual click) can
 * never double-send. The queue row must be status='approved'; this flips it to
 * 'sent' — or 'failed' on a send error, releasing the claim so a re-approval can
 * retry. `actor` attributes the pipeline event: "courier" for the cron, the
 * operator's email for a manual send.
 */
export async function sendOutboundRow(
  supabase: SupabaseClient,
  row: OutboundRow,
  nowIso: string,
  actor = "courier",
): Promise<SendOutcome> {
  // Suppression gate at the moment of send (founder 2026-07-07): the draft-side
  // check can go stale — someone can bounce or unsubscribe between draft and
  // send — so re-check here. getSuppressedEmails fails closed; a suppressed (or
  // unreadable) address holds the row instead of sending.
  const suppressed = await getSuppressedEmails([row.to_addr]);
  if (suppressed.has(row.to_addr.toLowerCase())) {
    await supabase
      .from("partner_outbound_queue")
      .update({ status: "held" })
      .eq("id", row.id)
      .eq("status", "approved");
    if (row.related_pipeline_id) {
      await logPartnerEvent({
        pipelineId: row.related_pipeline_id,
        actor,
        kind: "held",
        detail: { reason: "suppressed", to: row.to_addr },
      });
    }
    return {
      result: "failed",
      resendId: null,
      error: `${row.to_addr} is on the suppression list (bounce / complaint / unsubscribe) — held, not sent.`,
    };
  }

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
    if (claimErr.code === "23505") {
      // Already claimed/sent — reconcile the queue row, never re-send.
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
      return { result: "reconciled", resendId: prior?.resend_id ?? null };
    }
    // Any other insert error is transient — leave the row 'approved' so a later
    // send retries it, and do NOT mark it sent (which would drop the mail).
    return { result: "failed", resendId: null, error: claimErr.message };
  }

  // We hold the claim now — send.
  let resendId: string | null = null;
  try {
    const result = await getResend().emails.send({
      from: FROM,
      to: row.to_addr,
      bcc: bccAddr(),
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
    await supabase.from("partner_sent_log").delete().eq("idempotency_key", row.idempotency_key);
    await supabase
      .from("partner_outbound_queue")
      .update({ status: "failed", error: msg.slice(0, 500) })
      .eq("id", row.id)
      .eq("status", "approved");
    if (row.related_pipeline_id) {
      await logPartnerEvent({
        pipelineId: row.related_pipeline_id,
        actor,
        kind: "send_failed",
        detail: { subject: row.subject, error: msg.slice(0, 200) },
      });
    }
    return { result: "failed", resendId: null, error: msg };
  }

  // Sent: reconcile the claim with the resend_id, then mark the queue row sent.
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
      actor,
      kind: "sent",
      detail: { subject: row.subject, to: row.to_addr },
    });

    // Start the follow-up ladder clock on the first cold send. Guarded so
    // follow-ups never reset it.
    if (row.tier === "cold") {
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
          actor,
          kind: "contacted",
          detail: { via: actor === "courier" ? "first cold send" : "first cold send (manual)" },
        });
      }
    }
  }

  return { result: "sent", resendId };
}
