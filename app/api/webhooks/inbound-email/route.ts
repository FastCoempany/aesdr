export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/inbound-email — receives an inbound email and writes it to
 * `partner_inbound_email` for Sentinel to triage. Solves the gap that the
 * affiliates@ mailbox forwards to a human inbox but doesn't give an agent a
 * pollable mailbox: we receive via webhook, store, and let the agent read the
 * table. Spec: docs/partnerships/new-agents-wiring.md §2.
 *
 * Fed by the Cloudflare Email Worker (infra/cloudflare/affiliates-inbound-worker.js),
 * which POSTs the raw RFC822 message with content-type message/rfc822. Also
 * accepts a normalized JSON shape (for a future Resend-style provider).
 *
 * Security posture (load-bearing — this ingests attacker-controllable text):
 *  - Secret-gated: rejects anything without the shared INBOUND_EMAIL_SECRET.
 *  - Plain text only: we persist a text body, never HTML, never render/execute.
 *  - Idempotent: `message_id` is unique, so a re-delivered webhook is a no-op.
 *  - The stored body is DATA. No downstream consumer (Sentinel included) may
 *    treat its content as instructions.
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

type Parsed = {
  messageId: string | null;
  inReplyTo: string | null;
  from: string | null;
  to: string | null;
  subject: string | null;
  text: string | null;
};

function cap(v: string | null | undefined, max: number): string | null {
  return typeof v === 'string' && v.length > 0 ? v.slice(0, max) : null;
}

// ── Minimal, dependency-free RFC822 parse — good enough for triage. ──
// Pulls the headers we route on + a best-effort plain-text body. Perfect MIME
// fidelity isn't needed: Sentinel classifies on from/subject + body gist.
function parseRfc822(raw: string): Parsed {
  const splitAt = raw.search(/\r?\n\r?\n/);
  const headerBlock = splitAt === -1 ? raw : raw.slice(0, splitAt);
  let body = splitAt === -1 ? '' : raw.slice(splitAt).replace(/^\r?\n\r?\n/, '');

  // Unfold + collect headers (a line starting with whitespace continues prior).
  const headers: Record<string, string> = {};
  const unfolded = headerBlock.replace(/\r?\n[ \t]+/g, ' ');
  for (const line of unfolded.split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const k = line.slice(0, i).trim().toLowerCase();
    const val = line.slice(i + 1).trim();
    if (!(k in headers)) headers[k] = val;
  }

  // If multipart, lift the first text/plain part out of the body.
  const ctype = headers['content-type'] || '';
  const boundaryMatch = ctype.match(/boundary="?([^";]+)"?/i);
  if (boundaryMatch) {
    const b = boundaryMatch[1];
    const parts = body.split(new RegExp(`--${b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    const plain = parts.find((p) => /content-type:\s*text\/plain/i.test(p));
    if (plain) {
      const ps = plain.search(/\r?\n\r?\n/);
      body = ps === -1 ? plain : plain.slice(ps).replace(/^\r?\n\r?\n/, '');
      if (/quoted-printable/i.test(plain)) body = decodeQuotedPrintable(body);
    }
  } else if (/quoted-printable/i.test(headers['content-transfer-encoding'] || '')) {
    body = decodeQuotedPrintable(body);
  }

  return {
    messageId: stripAngles(headers['message-id']),
    inReplyTo: stripAngles(headers['in-reply-to']),
    from: headers['from'] ?? null,
    to: headers['to'] ?? null,
    subject: headers['subject'] ?? null,
    text: body.trim() || null,
  };
}

function stripAngles(v: string | undefined): string | null {
  if (!v) return null;
  const m = v.match(/<([^>]+)>/);
  return (m ? m[1] : v).trim() || null;
}

function decodeQuotedPrintable(s: string): string {
  return s
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

export async function POST(req: Request) {
  // 1. Gate on the shared secret.
  const secret =
    req.headers.get('x-inbound-secret') || req.headers.get('x-webhook-secret');
  const expected = process.env.INBOUND_EMAIL_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // 2. Parse — raw RFC822 (Cloudflare Worker) or normalized JSON (other providers).
  const ctype = req.headers.get('content-type') || '';
  let p: Parsed;
  try {
    if (ctype.includes('json')) {
      const j = (await req.json()) as Record<string, unknown>;
      p = {
        messageId: cap((j.messageId ?? j.message_id) as string, 512),
        inReplyTo: cap((j.inReplyTo ?? j.in_reply_to) as string, 512),
        from: cap(j.from as string, 320),
        to: cap(j.to as string, 320),
        subject: cap(j.subject as string, 512),
        text: cap(j.text as string, 20000),
      };
    } else {
      const raw = await req.text();
      p = parseRfc822(raw);
      // Envelope fallbacks the Worker passes as headers.
      p.from = p.from || req.headers.get('x-mail-from');
      p.to = p.to || req.headers.get('x-mail-to');
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const fromAddr = cap(p.from, 320);
  const toAddr = cap(p.to, 320);
  if (!fromAddr || !toAddr) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 3. Insert. message_id is unique → a re-delivered webhook is a clean no-op.
  //    Plain text only, capped; HTML is intentionally never stored.
  const { error } = await supabase.from('partner_inbound_email').upsert(
    {
      message_id: cap(p.messageId, 512),
      in_reply_to: cap(p.inReplyTo, 512),
      from_addr: fromAddr,
      to_addr: toAddr,
      subject: cap(p.subject, 512),
      text_body: cap(p.text, 20000),
      received_at: new Date().toISOString(),
    },
    { onConflict: 'message_id', ignoreDuplicates: true },
  );

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
