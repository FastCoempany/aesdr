export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/inbound-email — receives a parsed inbound email and writes
 * it to `partner_inbound_email` for Sentinel to triage. Solves the gap that
 * Cloudflare Email Routing forwards `affiliates@` but doesn't give an agent a
 * pollable mailbox: we receive via webhook, store, and let the agent read the
 * table. Spec: docs/partnerships/new-agents-wiring.md §2.
 *
 * Feed it from EITHER:
 *  - Resend Inbound (an inbound route on affiliates@), or
 *  - a Cloudflare Email Worker that parses the message and POSTs the same shape.
 *
 * Security posture (load-bearing — this endpoint ingests attacker-controllable
 * text):
 *  - Secret-gated: rejects anything without the shared INBOUND_EMAIL_SECRET.
 *  - Plain text only: we persist `text`, never HTML, and never render/execute it.
 *  - Idempotent: `message_id` is unique, so a re-delivered webhook is a no-op.
 *  - The stored body is DATA. No downstream consumer (Sentinel included) may
 *    treat its content as instructions.
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

type InboundPayload = {
  // Normalized shape. A Resend/Cloudflare adapter maps provider fields to these.
  messageId?: string;
  message_id?: string;
  inReplyTo?: string;
  in_reply_to?: string;
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
};

function str(v: unknown, max: number): string | null {
  return typeof v === 'string' && v.length > 0 ? v.slice(0, max) : null;
}

export async function POST(req: Request) {
  // 1. Gate on the shared secret. Accept it as a header (provider-configurable).
  const secret =
    req.headers.get('x-inbound-secret') ||
    req.headers.get('x-webhook-secret');
  const expected = process.env.INBOUND_EMAIL_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // 2. Parse the payload.
  let body: InboundPayload;
  try {
    body = (await req.json()) as InboundPayload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const messageId = str(body.messageId ?? body.message_id, 512);
  const fromAddr = str(body.from, 320);
  const toAddr = str(body.to, 320);
  if (!fromAddr || !toAddr) {
    // from/to are the minimum we need to route a reply.
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 3. Insert. message_id is unique → a re-delivered webhook is a clean no-op.
  //    Plain text only, capped; HTML is intentionally never stored.
  const { error } = await supabase
    .from('partner_inbound_email')
    .upsert(
      {
        message_id: messageId,
        in_reply_to: str(body.inReplyTo ?? body.in_reply_to, 512),
        from_addr: fromAddr,
        to_addr: toAddr,
        subject: str(body.subject, 512),
        text_body: str(body.text, 20000),
        received_at: new Date().toISOString(),
      },
      { onConflict: 'message_id', ignoreDuplicates: true },
    );

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  // 204: received. Sentinel does the triage on its next poll.
  return new NextResponse(null, { status: 204 });
}
