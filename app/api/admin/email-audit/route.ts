export const dynamic = "force-dynamic";
export const maxDuration = 200;

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  extractAllDomains,
  companyFromHandle,
  sanitizeDomainInput,
} from "@/lib/partnerships/email-finder";

/**
 * TEMPORARY audit — runs BetterContact for the whole enriched column in ONE
 * batch and returns, per candidate, exactly what BetterContact said: the email,
 * its deliverability status, the provider, and that a credit was spent. Admin
 * only, read-only (nothing is written to the pipeline). Hit it in the browser:
 *
 *   /api/admin/email-audit
 *
 * It proves the emails are provider-sourced (not constructed) across the board,
 * and shows the real hit rate on these actual creators. Delete with the
 * single-lookup debug route once we're done.
 */

const BASE = "https://app.bettercontact.rocks/api/v2";

function safeDomain(input: string | null | undefined): string | null {
  if (!input) return null;
  try {
    return sanitizeDomainInput(input);
  } catch {
    return null;
  }
}

type Row = {
  id: string;
  name: string;
  surface: string | null;
  handle: string | null;
  why_fit: string | null;
  contact_path: string | null;
  dossier_brief: Record<string, unknown> | null;
};

export async function GET(request: Request) {
  await requireAdmin();
  const key = process.env.EMAIL_FINDER_API_KEY ?? "";
  if (!key) return NextResponse.json({ error: "EMAIL_FINDER_API_KEY not set" }, { status: 200 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "enriched";
  const limit = Math.min(Number(url.searchParams.get("limit") || 25), 50);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("partner_pipeline")
    .select("id, name, surface, handle, why_fit, contact_path, dossier_brief")
    .eq("status", status)
    .eq("motion", "affiliate")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 200 });
  const rows = (data ?? []) as Row[];

  // Build one BetterContact contact per candidate, using the same domain logic
  // the live finder uses: brief.own_domain → first domain in the record →
  // company name from the handle. Map back later by the custom uuid.
  const contacts: Array<Record<string, unknown>> = [];
  const skipped: string[] = [];
  const byId = new Map<string, Row>();
  for (const r of rows) {
    byId.set(r.id, r);
    const parts = r.name.trim().split(/\s+/);
    const first_name = parts[0] ?? r.name;
    const last_name = parts.length > 1 ? parts.slice(1).join(" ") : parts[0];
    const ownDomain = safeDomain((r.dossier_brief?.own_domain as string | undefined) ?? null);
    const domain = ownDomain ?? extractAllDomains(r.contact_path, r.handle, r.why_fit)[0] ?? null;
    const company = domain ? undefined : companyFromHandle(r.handle);
    if (!domain && !company) {
      skipped.push(`${r.name} (no domain / company to search)`);
      continue;
    }
    contacts.push({
      first_name,
      last_name,
      ...(domain ? { company_domain: domain } : { company }),
      custom_fields: { uuid: r.id, list_name: r.name },
      _submitted: domain ?? company, // local note, stripped before send
    });
  }

  if (contacts.length === 0) {
    return NextResponse.json({
      note: "Nothing to audit — none of these candidates have a domain or company to search.",
      total: rows.length,
      skipped,
    }, { status: 200 });
  }

  const submittedById = new Map<string, string>();
  const sendData = contacts.map((c) => {
    const { _submitted, ...rest } = c as Record<string, unknown> & { _submitted?: string };
    const uuid = (rest.custom_fields as { uuid?: string })?.uuid;
    if (uuid && _submitted) submittedById.set(uuid, _submitted);
    return rest;
  });

  // Enqueue the whole batch in one request.
  let id = "";
  let enqueueRaw = "";
  try {
    const res = await fetch(`${BASE}/async`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": key },
      body: JSON.stringify({ data: sendData, enrich_email_address: true, enrich_phone_number: false }),
      signal: AbortSignal.timeout(15_000),
    });
    enqueueRaw = await res.text();
    const j = JSON.parse(enqueueRaw) as Record<string, unknown>;
    id = String(j.id ?? j.request_id ?? "");
  } catch (e) {
    return NextResponse.json({ error: `enqueue failed: ${e instanceof Error ? e.message : String(e)}`, enqueueRaw: enqueueRaw.slice(0, 300) }, { status: 200 });
  }
  if (!id) return NextResponse.json({ error: "no request id from enqueue", enqueueRaw: enqueueRaw.slice(0, 300) }, { status: 200 });

  // Poll until terminated.
  const deadline = Date.now() + 175_000;
  let final: Record<string, unknown> | null = null;
  let polls = 0;
  while (Date.now() < deadline) {
    polls++;
    await new Promise((r) => setTimeout(r, 4000));
    let res: Response;
    try {
      res = await fetch(`${BASE}/async/${id}`, { method: "GET", headers: { "X-API-Key": key }, signal: AbortSignal.timeout(15_000) });
    } catch {
      continue;
    }
    if (res.status === 202) continue;
    const raw = await res.text();
    if (!/"status"\s*:\s*"terminated"/i.test(raw)) continue;
    try {
      final = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      final = null;
    }
    break;
  }

  if (!final) {
    return NextResponse.json({ note: `did not terminate after ${polls} polls`, request_id: id, submitted: contacts.length }, { status: 200 });
  }

  // Map BetterContact's data[] back to candidates and build a compact table.
  const summary = (final.summary as Record<string, unknown>) ?? {};
  const results: Array<Record<string, unknown>> = [];
  for (const entry of (final.data as unknown[]) ?? []) {
    const e = (entry ?? {}) as Record<string, unknown>;
    const cf = e.custom_fields;
    let uuid: string | undefined;
    if (cf && typeof cf === "object" && !Array.isArray(cf)) uuid = (cf as { uuid?: string }).uuid;
    else if (Array.isArray(cf)) uuid = (cf.find((x) => (x as { uuid?: string })?.uuid) as { uuid?: string } | undefined)?.uuid;
    const cand = uuid ? byId.get(uuid) : undefined;
    const name = cand?.name ?? String(e.contact_full_name ?? `${e.contact_first_name ?? ""} ${e.contact_last_name ?? ""}`).trim();
    results.push({
      name,
      submitted: uuid ? submittedById.get(uuid) ?? null : null,
      email: e.contact_email_address ?? null,
      status: e.contact_email_address_status ?? null,
      provider: e.contact_email_address_provider ?? e.email_provider ?? null,
      enriched: e.enriched ?? false,
    });
  }
  results.sort((a, b) => (a.email ? 0 : 1) - (b.email ? 0 : 1));

  return NextResponse.json({
    note: "Each row is BetterContact's verbatim verdict. 'email' present = provider found+verified it (a credit was spent); null = waterfall found nothing. Read-only — nothing written to the pipeline.",
    audited: contacts.length,
    found: results.filter((r) => r.email).length,
    credits_consumed: summary.total ?? final.credits_consumed ?? null,
    credits_left: final.credits_left ?? null,
    summary,
    results,
    skipped_no_domain: skipped,
  }, { status: 200 });
}
