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
const TOTAL_BUDGET_MS = 85_000;
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
async function bcPoll(id: string): Promise<"pending" | { done: FoundEmail | null }> {
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
  return { done: pickBest(json.data) };
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
  const id = await bcEnqueue(contacts);
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_EVERY_MS));
    const r = await bcPoll(id);
    if (r !== "pending") return r.done; // terminated → FoundEmail or null
  }
  throw new Error("BetterContact's waterfall didn't finish in time — try Find email again in a moment.");
}

export type EmailFindResult = {
  skipped?: "has_email" | "no_domain";
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
  via: "dossier" | "find-now";
  actor: string | undefined;
}): Promise<EmailFindResult> {
  if (extractEmail(args.contactPath)) {
    return { skipped: "has_email", found: null, tried: [], applied: false };
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
  if (!found) {
    await logPartnerEvent({
      pipelineId: args.pipelineId,
      actor: args.actor,
      kind: "email_found",
      detail: { email: null, tried, via: args.via, applied: false },
    });
    return { found: null, tried, applied: false };
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

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
