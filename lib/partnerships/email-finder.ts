/**
 * BetterContact email finder — a waterfall provider that chains 20+ data
 * sources behind one API. We hand it the person's name + the best domain we
 * have (or a company name when we have none) and it runs its own waterfall;
 * we no longer fan out across domains ourselves — that's BetterContact's job.
 *
 * It's asynchronous: POST /async enqueues and returns a request id; we poll
 * GET /async/{id} until `status: "terminated"`, then read
 * data[].contact_email_address. Auth is the `X-API-Key` header, value from
 * EMAIL_FINDER_API_KEY (same env var as before, now a BetterContact key).
 *
 * Callers see the same { email, status, verified, domain } / null surface, so
 * swapping providers stays a single-file change.
 */

import { createAdminClient } from "@/utils/supabase/admin";
import { logPartnerEvent } from "./events";
import { extractEmail } from "./outreach-templates";

const BASE = "https://app.bettercontact.rocks/api/v2";
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const DOMAIN_RE = /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/;
// Bounds: the waterfall is async and can take tens of seconds; these keep the
// whole enqueue+poll well under the route's 100s function ceiling.
const CALL_TIMEOUT_MS = 10_000;
const POLL_EVERY_MS = 3_000;
// Single lookups (Find-email button, candidate route maxDuration 100) get a
// tighter budget; batches (find-now / cron, maxDuration 180-200) get longer,
// because BetterContact's per-batch time scales and varies.
const SINGLE_BUDGET_MS = 80_000;
const BATCH_BUDGET_MS = 150_000;
const MAX_DOMAINS = 2;

export type FoundEmail = {
  email: string;
  /** BetterContact's deliverability status, e.g. deliverable / catch_all. */
  status: string;
  /** True only for statuses safe to send to without a second look. */
  verified: boolean;
  /** The email's own domain (after the @). */
  domain: string;
  /** Which waterfall source found it, when BetterContact reports it. */
  source?: string;
};

export function emailFinderConfigured(): boolean {
  return Boolean(process.env.EMAIL_FINDER_API_KEY);
}

// Hosts that can never be the person's own mail domain — platforms their
// content lives on, not where their inbox is.
const PLATFORM_HOSTS =
  /(^|\.)(skool\.com|circle\.so|substack\.com|beehiiv\.com|kit\.com|convertkit\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|linkedin\.com|lnkd\.in|facebook\.com|instagram\.com|tiktok\.com|spotify\.com|apple\.com|podcasts\.apple\.com|gmail\.com|google\.com|calendly\.com|linktr\.ee|mailchi\.mp|medium\.com|patreon\.com|gumroad\.com)$/i;

/**
 * Pull EVERY plausible own-domain out of free text (contact path, handle, the
 * why_fit trail) — URLs and bare domains whose host isn't a big platform, in
 * first-seen order, deduped.
 */
export function extractAllDomains(
  ...texts: Array<string | null | undefined>
): string[] {
  const candidates: string[] = [];
  for (const t of texts) {
    if (!t) continue;
    for (const m of t.match(/https?:\/\/[^\s)>,;"']+/gi) ?? []) {
      try {
        candidates.push(new URL(m).hostname);
      } catch {
        /* malformed URL in free text — skip */
      }
    }
    for (const m of t.match(/\b(?:[a-z0-9-]+\.)+(?:com|io|co|net|org|ai|me|club|xyz|tv|fm)\b/gi) ?? []) {
      candidates.push(m);
    }
  }
  const out: string[] = [];
  for (const raw of candidates) {
    const host = raw.toLowerCase().replace(/^www\./, "").split("/")[0].split("?")[0];
    if (host.includes("@") || PLATFORM_HOSTS.test(host) || !DOMAIN_RE.test(host)) continue;
    if (!out.includes(host)) out.push(host);
  }
  return out;
}

/** First plausible own-domain, or null — back-compat for single-domain callers. */
export function extractOwnDomain(
  ...texts: Array<string | null | undefined>
): string | null {
  return extractAllDomains(...texts)[0] ?? null;
}

/**
 * Normalize a pasted or model-reported domain ("https://www.janedoe.com/about",
 * "janedoe.com") to a bare host. Throws on non-domains and on platform hosts —
 * an email lookup against skool.com would only return junk.
 */
export function sanitizeDomainInput(input: string): string {
  let host = input.trim().toLowerCase();
  try {
    if (/^https?:\/\//.test(host)) host = new URL(host).hostname;
  } catch {
    /* fall through to bare-string handling */
  }
  host = host.replace(/^www\./, "").split("/")[0].split("?")[0];
  if (!DOMAIN_RE.test(host)) {
    throw new Error(`"${input}" doesn't look like a domain (expected something like janedoe.com).`);
  }
  if (PLATFORM_HOSTS.test(host)) {
    throw new Error(`${host} is a platform, not their own site — an email lookup there would return junk. Their personal/company domain is what works.`);
  }
  return host;
}

/** A non-platform brand name from a handle, used only when we have no domain. */
export function companyFromHandle(handle: string | null | undefined): string | undefined {
  if (!handle) return undefined;
  const h = handle.trim().replace(/^@+/, "").replace(/^https?:\/\//, "").split(/[/\s]/)[0];
  if (!h || h.includes(".")) return undefined; // a domain/url, not a brand name
  const words = h.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").trim();
  return words.length >= 2 ? words : undefined;
}

/** Map BetterContact's deliverability status to our verified/unverified/none.
 *  Order matters: undeliverable contains "deliverable"; not_safe contains
 *  "safe" — the negative checks run first. */
function classify(statusRaw: string): "verified" | "unverified" | "none" {
  const s = (statusRaw || "").toLowerCase();
  if (s.includes("undeliverable") || s.includes("invalid") || s.includes("not_found")) return "none";
  if (s.includes("not_safe") || s.includes("risky") || s === "catch_all" || s === "unknown" || s.includes("accept")) {
    return "unverified";
  }
  if (s.includes("deliverable") || s.includes("valid") || s.includes("safe")) return "verified";
  return "unverified"; // an email with an unfamiliar status → surface as use-anyway
}

type BCContact = {
  first_name: string;
  last_name: string;
  company_domain?: string;
  company?: string;
  /** Echoed back in the result so a batch can be mapped to candidate ids. */
  custom_fields?: { uuid: string };
};

function bcKey(): string {
  const key = process.env.EMAIL_FINDER_API_KEY;
  if (!key) throw new Error("EMAIL_FINDER_API_KEY is not set in this environment.");
  return key;
}

/** Enqueue the waterfall — expects 2xx + JSON carrying a request id. */
async function bcEnqueue(contacts: BCContact[]): Promise<string> {
  const key = bcKey();
  let res: Response;
  try {
    res = await fetch(`${BASE}/async`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": key },
      body: JSON.stringify({ data: contacts, enrich_email_address: true, enrich_phone_number: false }),
      signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
    });
  } catch (e) {
    throw new Error(`BetterContact unreachable: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error("BetterContact rejected the API key (401/403) — check EMAIL_FINDER_API_KEY holds a valid BetterContact key.");
  }
  const raw = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    json = null;
  }
  if (!res.ok || !json) {
    const msg = json ? String(json.message ?? json.error ?? "") : raw.slice(0, 180);
    throw new Error(`BetterContact enqueue failed: ${msg || `HTTP ${res.status}`}`);
  }
  const id = String(json.id ?? json.request_id ?? "");
  if (!id) throw new Error(`BetterContact enqueue returned no request id: ${raw.slice(0, 180)}`);
  return id;
}

/**
 * Poll once. While the waterfall runs, BetterContact answers HTTP 202 (empty
 * body) or 200 with status "not_started"/"in_progress" — those are PENDING,
 * not errors (the original bug threw on the empty 202 and killed the run).
 * Only a 200 with status "terminated" yields the result.
 */
async function bcPoll(id: string): Promise<"pending" | { data: unknown[] }> {
  const key = bcKey();
  let res: Response;
  try {
    res = await fetch(`${BASE}/async/${id}`, {
      method: "GET",
      headers: { "X-API-Key": key },
      signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
    });
  } catch (e) {
    throw new Error(`BetterContact unreachable: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error("BetterContact rejected the API key (401/403) on poll.");
  }
  if (res.status === 202) return "pending"; // accepted, still processing, no body
  const raw = await res.text();
  if (res.status >= 400) {
    throw new Error(`BetterContact poll failed: HTTP ${res.status} ${raw.slice(0, 180)}`);
  }
  let json: Record<string, unknown> | null = null;
  try {
    json = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    json = null;
  }
  if (!json || String(json.status ?? "").toLowerCase() !== "terminated") return "pending";
  return { data: (json.data as unknown[]) ?? [] };
}

/** Enqueue contacts and poll until BetterContact terminates; returns the raw
 *  data[] (one entry per submitted contact). Throws on timeout/API errors. */
async function bcEnqueueAndWait(contacts: BCContact[], budgetMs: number): Promise<unknown[]> {
  const id = await bcEnqueue(contacts);
  const deadline = Date.now() + budgetMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_EVERY_MS));
    const r = await bcPoll(id);
    if (r !== "pending") return r.data;
  }
  throw new Error("BetterContact's waterfall didn't finish in time — try Find email again in a moment.");
}

/** Pick the best emailed entry from a terminated response's data[]. */
function pickBest(data: unknown): FoundEmail | null {
  if (!Array.isArray(data)) return null;
  let best: FoundEmail | null = null;
  let bestRank = 99;
  for (const entry of data) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const email = String(e.contact_email_address ?? "");
    if (!EMAIL_RE.test(email)) continue;
    const status = String(e.contact_email_address_status ?? "unknown");
    const klass = classify(status);
    if (klass === "none") continue;
    const rank = klass === "verified" ? 0 : 1;
    if (rank < bestRank) {
      bestRank = rank;
      best = {
        email,
        status,
        verified: klass === "verified",
        domain: email.split("@")[1] ?? "",
        source: e.email_provider ? String(e.email_provider) : undefined,
      };
      if (rank === 0) break; // can't beat a verified hit
    }
  }
  return best;
}

/**
 * Run one BetterContact waterfall: enqueue the contact(s), poll until the
 * request terminates, return the best hit. Returns null on a clean no-result;
 * throws with BetterContact's own words on key/API/network errors.
 */
async function runWaterfall(contacts: BCContact[]): Promise<FoundEmail | null> {
  return pickBest(await bcEnqueueAndWait(contacts, SINGLE_BUDGET_MS));
}

export type EmailFindResult = {
  skipped?: "has_email" | "no_domain" | "already_checked";
  found: FoundEmail | null;
  /** Signals submitted to the waterfall (domains/company) — for the room's
   *  empty-state line and the timeline. */
  tried: string[];
  /** True when a verified hit was written into contact_path (drafts will now
   *  route as real email sends). Unverified hits sit on the brief instead,
   *  waiting for the operator's explicit "use anyway". */
  applied: boolean;
};

/**
 * Finder pass for one candidate. Builds the BetterContact contact(s) — the
 * best domain(s) we have, or a company name when we have none — runs the
 * waterfall, and applies a verified hit to contact_path. Throws only on real
 * BetterContact/config errors so callers can surface them.
 */
export async function attemptEmailFind(args: {
  pipelineId: string;
  name: string;
  contactPath: string | null;
  handle?: string | null;
  extraText?: string | null;
  /** A known-good domain (operator-pasted or the brief's own_domain) — tried
   *  ahead of anything extracted from the record. */
  domainOverride?: string | null;
  via: "dossier" | "find-now" | "promote";
  actor: string | undefined;
  /** Re-run even if this candidate was already checked. The Find-email button
   *  forces; the automatic passes (promote / brief / cron) don't, so a
   *  candidate is billed at most once. */
  force?: boolean;
}): Promise<EmailFindResult> {
  if (extractEmail(args.contactPath)) {
    return { skipped: "has_email", found: null, tried: [], applied: false };
  }

  // Find-once guard: if a real lookup already ran for this candidate, don't
  // spend another credit (the button overrides with force). Best-effort — a
  // pre-migration DB has no email_checked_at column, so we just proceed.
  if (!args.force) {
    try {
      const sb = createAdminClient();
      const { data } = await sb
        .from("partner_pipeline")
        .select("email_checked_at, found_email")
        .eq("id", args.pipelineId)
        .maybeSingle();
      if (data?.email_checked_at) {
        const fe = (data.found_email as string | null) ?? null;
        return {
          skipped: "already_checked",
          found: fe
            ? { email: fe, status: "stored", verified: true, domain: fe.split("@")[1] ?? "" }
            : null,
          tried: [],
          applied: false,
        };
      }
    } catch {
      /* pre-migration: column missing → no guard, proceed */
    }
  }

  const parts = args.name.trim().split(/\s+/);
  const first_name = parts[0] ?? args.name;
  const last_name = parts.length > 1 ? parts.slice(1).join(" ") : parts[0];

  // Prefer domains (strong, unambiguous signal); fall back to a company name
  // only when we have no domain at all.
  const domains: string[] = [];
  const push = (d: string | null | undefined) => {
    if (d && !domains.includes(d)) domains.push(d);
  };
  push(args.domainOverride);
  for (const d of extractAllDomains(args.contactPath, args.handle, args.extraText)) push(d);

  const contacts: BCContact[] = domains
    .slice(0, MAX_DOMAINS)
    .map((company_domain) => ({ first_name, last_name, company_domain }));
  const tried = [...domains.slice(0, MAX_DOMAINS)];

  if (contacts.length === 0) {
    const company = companyFromHandle(args.handle);
    if (company) {
      contacts.push({ first_name, last_name, company });
      tried.push(company);
    }
  }
  if (contacts.length === 0) {
    return { skipped: "no_domain", found: null, tried: [], applied: false };
  }

  const found = await runWaterfall(contacts);
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  // Record the lookup outcome on the candidate so the map chips it and the room
  // shows it — both found and not-found, so the chip resolves either way.
  // Best-effort: pre-migration these columns don't exist yet.
  try {
    await supabase
      .from("partner_pipeline")
      .update({
        found_email: found?.email ?? null,
        found_email_status: found?.status ?? null,
        email_checked_at: nowIso,
      })
      .eq("id", args.pipelineId);
  } catch {
    /* pre-migration — contact_path write below still carries verified hits */
  }

  if (!found) {
    await logPartnerEvent({
      pipelineId: args.pipelineId,
      actor: args.actor,
      kind: "email_found",
      detail: { email: null, tried, via: args.via, applied: false },
    });
    return { found: null, tried, applied: false };
  }

  if (found.verified) {
    await supabase
      .from("partner_pipeline")
      .update({
        contact_path: `${found.email} (${found.status} · bettercontact) · ${args.contactPath ?? ""}`.replace(/ · $/, ""),
        updated_at: nowIso,
      })
      .eq("id", args.pipelineId);
  }

  // Stash the result on the brief for the room — best-effort: the
  // dossier_brief column is part of the 20260612 migration.
  try {
    const { data: row, error } = await supabase
      .from("partner_pipeline")
      .select("dossier_brief")
      .eq("id", args.pipelineId)
      .maybeSingle();
    if (!error) {
      const existing = (row?.dossier_brief as Record<string, unknown> | null) ?? {};
      await supabase
        .from("partner_pipeline")
        .update({
          dossier_brief: {
            ...existing,
            found_email: {
              email: found.email,
              status: found.status,
              verified: found.verified,
              domain: found.domain,
            },
          },
        })
        .eq("id", args.pipelineId);
    }
  } catch {
    /* pre-migration — the contact_path write above still carries verified hits */
  }

  await logPartnerEvent({
    pipelineId: args.pipelineId,
    actor: args.actor,
    kind: "email_found",
    detail: {
      email: found.email,
      status: found.status,
      verified: found.verified,
      domain: found.domain,
      source: found.source ?? null,
      tried,
      via: args.via,
      applied: found.verified,
    },
  });

  return { found, tried, applied: found.verified };
}

/**
 * Find an email for a candidate by id — the entry point for the background pass
 * (promote → after()). Loads the row, prefers the brief's own_domain, and runs
 * the finder. Fire-and-forget: returns void and swallows everything, since it
 * runs after the response is already sent.
 */
export async function findEmailForCandidateId(
  id: string,
  opts: { actor: string | undefined; via: "promote" | "dossier" | "find-now"; force?: boolean },
): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data: row } = await supabase
      .from("partner_pipeline")
      .select("id, name, contact_path, handle, why_fit, dossier_brief")
      .eq("id", id)
      .maybeSingle();
    if (!row) return;
    let ownDomain: string | null = null;
    try {
      const od = (row.dossier_brief as { own_domain?: string } | null)?.own_domain;
      if (od) ownDomain = sanitizeDomainInput(od);
    } catch {
      /* not a usable domain */
    }
    await attemptEmailFind({
      pipelineId: id,
      name: row.name as string,
      contactPath: row.contact_path as string | null,
      handle: row.handle as string | null,
      extraText: row.why_fit as string | null,
      domainOverride: ownDomain,
      via: opts.via,
      actor: opts.actor,
      force: opts.force,
    });
  } catch {
    /* background best-effort — surfaced later via the room's Find email button */
  }
}

export type BatchRow = {
  id: string;
  name: string;
  contact_path: string | null;
  handle: string | null;
  why_fit: string | null;
  dossier_brief: unknown;
};

/** Normalize a name for matching BetterContact results back to candidates.
 *  BetterContact doesn't reliably echo custom_fields (the audit's submitted:null
 *  proved it), so name is the join key. */
function normName(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Batch finder for the contact-finder cron — one BetterContact request for many
 * candidates, processed in parallel. Writes found_email columns (and verified
 * hits onto contact_path) for every candidate it could submit; marks no-domain
 * candidates checked too so the cron stops re-fetching them (their chip still
 * reads "no site to search", which is computed from the absent domain).
 */
export async function batchFindAndSave(
  rows: BatchRow[],
  actor: string | undefined,
): Promise<{ submitted: number; found: number; applied: number; no_domain: number }> {
  const supabase = createAdminClient();
  const now = () => new Date().toISOString();

  const contacts: BCContact[] = [];
  const byName = new Map<string, { id: string; contactPath: string | null }>();
  const noDomainIds: string[] = [];

  for (const r of rows) {
    const parts = r.name.trim().split(/\s+/);
    const first_name = parts[0] ?? r.name;
    const last_name = parts.length > 1 ? parts.slice(1).join(" ") : parts[0];
    let domain: string | null = null;
    try {
      const od = (r.dossier_brief as { own_domain?: string } | null)?.own_domain;
      if (od) domain = sanitizeDomainInput(od);
    } catch {
      /* not a usable domain */
    }
    if (!domain) domain = extractAllDomains(r.contact_path, r.handle, r.why_fit)[0] ?? null;
    if (!domain) {
      noDomainIds.push(r.id);
      continue;
    }
    contacts.push({ first_name, last_name, company_domain: domain });
    byName.set(normName(r.name), { id: r.id, contactPath: r.contact_path });
  }

  // Mark no-domain candidates checked so future ticks skip them (cheap, and the
  // chip still shows "no site to search" off the missing domain).
  if (noDomainIds.length > 0) {
    try {
      await supabase.from("partner_pipeline").update({ email_checked_at: now() }).in("id", noDomainIds);
    } catch {
      /* pre-migration */
    }
  }
  if (contacts.length === 0) {
    return { submitted: 0, found: 0, applied: 0, no_domain: noDomainIds.length };
  }

  // Mark every submitted candidate checked BEFORE we wait on the waterfall
  // (R4-AG-9). Submitting is what BetterContact bills for, so if the wait then
  // times out, the next cron tick must not re-submit and re-charge these. The
  // per-result updates below overwrite this with the real found_email/status.
  const submittedIds = [...byName.values()].map((v) => v.id);
  try {
    await supabase.from("partner_pipeline").update({ email_checked_at: now() }).in("id", submittedIds);
  } catch {
    /* pre-migration: column missing → no guard, proceed */
  }

  const data = await bcEnqueueAndWait(contacts, BATCH_BUDGET_MS);
  let found = 0;
  let applied = 0;
  const matchedIds = new Set<string>();
  for (const entry of data) {
    const e = (entry ?? {}) as Record<string, unknown>;
    const full = String(e.contact_full_name ?? `${e.contact_first_name ?? ""} ${e.contact_last_name ?? ""}`);
    const cand = byName.get(normName(full));
    if (!cand) continue;
    matchedIds.add(cand.id);
    const email = String(e.contact_email_address ?? "");
    const status = String(e.contact_email_address_status ?? "");
    const has = EMAIL_RE.test(email);
    const klass = has ? classify(status) : "none";
    const update: Record<string, unknown> = {
      found_email: klass === "none" ? null : email,
      found_email_status: has ? status : null,
      email_checked_at: now(),
    };
    if (klass !== "none") found++;
    if (klass === "verified") {
      update.contact_path = `${email} (${status} · bettercontact) · ${cand.contactPath ?? ""}`.replace(/ · $/, "");
      applied++;
    }
    try {
      await supabase.from("partner_pipeline").update(update).eq("id", cand.id);
    } catch {
      /* pre-migration */
    }
    await logPartnerEvent({
      pipelineId: cand.id,
      actor,
      kind: "email_found",
      detail: { email: klass === "none" ? null : email, status: has ? status : null, verified: klass === "verified", via: "cron", applied: klass === "verified" },
    });
  }

  // Mark any submitted candidate the results didn't name-match as checked, so a
  // rare name mismatch doesn't make the cron re-charge them every tick.
  const unmatched = [...byName.values()].map((v) => v.id).filter((id) => !matchedIds.has(id));
  if (unmatched.length > 0) {
    try {
      await supabase.from("partner_pipeline").update({ email_checked_at: now() }).in("id", unmatched);
    } catch {
      /* pre-migration */
    }
  }
  return { submitted: contacts.length, found, applied, no_domain: noDomainIds.length };
}
