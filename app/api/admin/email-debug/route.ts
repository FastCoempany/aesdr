export const dynamic = "force-dynamic";
export const maxDuration = 100;

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";

/**
 * TEMPORARY diagnostic — raw BetterContact wire dump. Admin-only. Hit it in the
 * browser to see exactly what BetterContact returns for this account, with no
 * parsing in the way:
 *
 *   /api/admin/email-debug?name=Neil%20Bhuiyan&domain=happyselling.io
 *
 * It tries all three auth styles on enqueue (so one look tells us which the key
 * wants), captures the raw enqueue + every poll body, and reports the field
 * names verbatim. Delete once the finder is confirmed working.
 */

const BASE = "https://app.bettercontact.rocks/api/v2";

function clip(s: string, n = 2500): string {
  return s.length > n ? s.slice(0, n) + `…(+${s.length - n} chars)` : s;
}

export async function GET(request: Request) {
  await requireAdmin();

  const key = process.env.EMAIL_FINDER_API_KEY ?? "";
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || "Neil Bhuiyan";
  const domain = url.searchParams.get("domain") || "happyselling.io";
  const company = url.searchParams.get("company") || undefined;

  const parts = name.trim().split(/\s+/);
  const first_name = parts[0] ?? name;
  const last_name = parts.length > 1 ? parts.slice(1).join(" ") : parts[0];
  const contact: Record<string, string> = { first_name, last_name };
  if (company) contact.company = company;
  else contact.company_domain = domain;

  const body = JSON.stringify({
    data: [contact],
    enrich_email_address: true,
    enrich_phone_number: false,
  });

  const out: Record<string, unknown> = {
    note: "TEMP diagnostic — raw BetterContact responses. Paste this whole payload back.",
    key_present: Boolean(key),
    key_length: key.length,
    request_body: JSON.parse(body),
    enqueue_attempts: [],
  };
  const attempts = out.enqueue_attempts as Array<Record<string, unknown>>;

  // Try three auth styles; stop at the first 2xx.
  const styles: Array<{ label: string; url: string; headers: Record<string, string> }> = [
    { label: "header X-API-Key", url: `${BASE}/async`, headers: { "Content-Type": "application/json", "X-API-Key": key } },
    { label: "query ?api_key", url: `${BASE}/async?api_key=${encodeURIComponent(key)}`, headers: { "Content-Type": "application/json" } },
    { label: "header Authorization Bearer", url: `${BASE}/async`, headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` } },
  ];

  let okStyle: { label: string; headers: Record<string, string> } | null = null;
  let reqId = "";

  for (const style of styles) {
    const rec: Record<string, unknown> = { auth: style.label };
    try {
      const res = await fetch(style.url, {
        method: "POST",
        headers: style.headers,
        body,
        signal: AbortSignal.timeout(12_000),
      });
      const raw = await res.text();
      rec.http_status = res.status;
      rec.raw = clip(raw);
      let json: Record<string, unknown> | null = null;
      try {
        json = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        /* non-JSON */
      }
      // Hunt for the request id under any plausible key.
      const id =
        (json?.id as string) ??
        (json?.request_id as string) ??
        (json?.requestId as string) ??
        ((json?.data as Record<string, unknown> | undefined)?.id as string) ??
        "";
      rec.parsed_id = id || null;
      attempts.push(rec);
      if (res.ok && id) {
        okStyle = { label: style.label, headers: style.headers };
        reqId = id;
        break;
      }
    } catch (e) {
      rec.error = e instanceof Error ? e.message : String(e);
      attempts.push(rec);
    }
  }

  out.working_auth = okStyle?.label ?? null;
  out.request_id = reqId || null;

  if (!okStyle || !reqId) {
    out.conclusion =
      "Enqueue never returned a usable request id — see enqueue_attempts for the raw error (likely auth or request shape).";
    return NextResponse.json(out, { status: 200 });
  }

  // Poll the GET endpoint, capturing each raw body, until terminated or budget.
  const polls: Array<Record<string, unknown>> = [];
  out.polls = polls;
  const deadline = Date.now() + 80_000;
  let terminated = false;
  let pollN = 0;
  const pollHeaders = { ...okStyle.headers };
  delete (pollHeaders as Record<string, string>)["Content-Type"];

  while (Date.now() < deadline && pollN < 30) {
    pollN++;
    await new Promise((r) => setTimeout(r, 3000));
    const pollUrl = okStyle.label === "query ?api_key"
      ? `${BASE}/async/${reqId}?api_key=${encodeURIComponent(key)}`
      : `${BASE}/async/${reqId}`;
    const rec: Record<string, unknown> = { n: pollN };
    try {
      const res = await fetch(pollUrl, { method: "GET", headers: pollHeaders, signal: AbortSignal.timeout(12_000) });
      const raw = await res.text();
      rec.http_status = res.status;
      const isTerminal = /"status"\s*:\s*"terminated"/i.test(raw);
      rec.terminated = isTerminal;
      // Only keep the full body for the terminal poll (and the first) to stay readable.
      if (isTerminal || pollN === 1) rec.raw = clip(raw, 4000);
      polls.push(rec);
      if (isTerminal) {
        terminated = true;
        break;
      }
    } catch (e) {
      rec.error = e instanceof Error ? e.message : String(e);
      polls.push(rec);
    }
  }

  out.conclusion = terminated
    ? "Terminated — the final poll's raw body shows the exact email + status field names."
    : `Did not terminate within budget after ${pollN} polls — BetterContact is slower than our 85s window for this lookup.`;
  return NextResponse.json(out, { status: 200 });
}
