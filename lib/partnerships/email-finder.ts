/**
 * Prospeo email finder — name-anchored, multi-domain. The person's NAME is the
 * constant; we waterfall it across every domain that could plausibly be theirs
 * (the ones named in their record, then name-based guesses like janedoe.com)
 * and return the first hit. A single domain coming up empty no longer ends the
 * search — that was the whole problem. No SDK; POST /enrich-person with an
 * X-KEY header per domain. Prospeo charges one credit only on a hit, so the
 * empty tries in the waterfall are free (free tier: 75 hits/mo).
 *
 * If the waterfall still comes up empty across real domains, the limit is
 * Prospeo's dataset, not the query — swapping to a waterfall PROVIDER
 * (FullEnrich/BetterContact chain 15-20 sources) is a rewrite of this file
 * only; callers see { email, status, verified, domain } or null.
 */

import { createAdminClient } from "@/utils/supabase/admin";
import { logPartnerEvent } from "./events";
import { extractEmail } from "./outreach-templates";

const API = "https://api.prospeo.io";
// The only live endpoint — /email-finder is removed ("DEPRECATED" tombstone,
// confirmed by a live response 2026-06-12).
const ENDPOINT = "/enrich-person";
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const DOMAIN_RE = /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/;
// Per-lookup network timeout + overall waterfall budget. Both well under the
// route's function ceiling so a slow/hung Prospeo can't 504 the page.
const CALL_TIMEOUT_MS = 8_000;
const WATERFALL_BUDGET_MS = 40_000;
const MAX_DOMAINS = 6;

export type FoundEmail = {
  email: string;
  /** Prospeo's verification status, e.g. VALID / ACCEPT_ALL / UNKNOWN. */
  status: string;
  /** True only for statuses safe to send to without a second look. */
  verified: boolean;
  /** Which domain produced the hit. */
  domain: string;
  endpoint: string;
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
 * Name-based personal-domain guesses (janedoe.com / .co / .io). Low-yield but
 * free to try in the waterfall — Prospeo only bills a hit — and these catch the
 * common case of a creator whose email lives on a personal site we never saw.
 */
export function nameDomainGuesses(name: string): string[] {
  const parts = name.toLowerCase().replace(/[^a-z\s-]/g, "").trim().split(/\s+/);
  if (parts.length < 2) return [];
  const base = `${parts[0]}${parts[parts.length - 1]}`;
  if (base.length < 4) return [];
  return [`${base}.com`, `${base}.co`, `${base}.io`];
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

/** Recursively pull the first email-looking value and status-looking value
 *  out of whatever shape Prospeo returns. */
function scan(node: unknown, out: { email?: string; status?: string }): void {
  if (!node || typeof node !== "object") return;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    const key = k.toLowerCase();
    if (typeof v === "string") {
      if (!out.email && key === "email" && EMAIL_RE.test(v)) {
        out.email = v;
      } else if (key === "email_status") {
        out.status = v; // the canonical field always wins
      } else if (!out.status && key !== "req_status" && /status|verification/i.test(key) && v.length < 40) {
        out.status = v;
      }
    } else if (typeof v === "object") {
      scan(v, out);
    }
  }
}

/**
 * Look up an email for a person at ONE domain. Returns null when Prospeo
 * genuinely has nothing; throws with Prospeo's own message on config/API/
 * network errors so the caller can show it.
 */
export async function findEmail(args: {
  name: string;
  domain: string;
}): Promise<FoundEmail | null> {
  const key = process.env.EMAIL_FINDER_API_KEY;
  if (!key) {
    throw new Error("EMAIL_FINDER_API_KEY is not set in this environment.");
  }

  const parts = args.name.trim().split(/\s+/);
  const first_name = parts[0] ?? args.name;
  const last_name = parts.length > 1 ? parts.slice(1).join(" ") : parts[0];

  // Documented /enrich-person shape: person nested under `data`, domain key
  // is `company_website`. only_verified_email stays false — catch-all
  // results are wanted too, surfaced as the room's "use it anyway" path.
  const body = {
    only_verified_email: false,
    enrich_mobile: false,
    data: { first_name, last_name, company_website: args.domain },
  };

  let raw = "";
  let httpStatus = 0;
  let json: Record<string, unknown> | null = null;
  try {
    const res = await fetch(API + ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-KEY": key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
    });
    httpStatus = res.status;
    raw = await res.text();
    try {
      json = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      json = null;
    }
  } catch (e) {
    throw new Error(`Prospeo unreachable: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Prospeo's error dialect (seen live): { req_status: false, error_code,
  // error_toast }. "Nothing found" is a clean no, not an error.
  const code = String((json?.error_code as string | undefined) ?? "");
  const toast = String(
    (json?.error_toast as string | undefined) ??
      (json?.message as string | undefined) ??
      (json?.error_message as string | undefined) ??
      "",
  );
  if (!json || json.req_status === false || json.error === true || httpStatus >= 400) {
    if (/no.?(result|match|email)|not.?found|empt/i.test(`${code} ${toast}`)) return null;
    throw new Error(
      `Prospeo ${ENDPOINT}: ${toast || code || `HTTP ${httpStatus} — ${raw.slice(0, 180) || "(empty body)"}`}`,
    );
  }

  const out: { email?: string; status?: string } = {};
  scan((json.response as unknown) ?? json, out);
  if (!out.email) return null;
  const status = (out.status ?? "UNKNOWN").toUpperCase();
  return {
    email: out.email,
    status,
    verified: /^(VALID|DELIVERABLE|VERIFIED|SAFE)$/.test(status),
    domain: args.domain,
    endpoint: ENDPOINT,
  };
}

export type WaterfallResult = {
  found: FoundEmail | null;
  /** Domains actually queried, in order — for the "tried N, all empty" report. */
  tried: string[];
};

/**
 * Waterfall the name across an ordered domain list. First hit wins. A domain
 * that returns a clean empty is recorded and we move on; a domain that errors
 * (network/Prospeo) is held — if EVERY domain errored and none answered
 * cleanly, we throw that error (a real Prospeo problem). If at least one
 * answered cleanly, an all-miss is an honest "no result", not an error.
 */
export async function findEmailWaterfall(
  name: string,
  domains: string[],
): Promise<WaterfallResult> {
  const tried: string[] = [];
  const deadline = Date.now() + WATERFALL_BUDGET_MS;
  let firstError: Error | null = null;
  let anyClean = false;

  for (const domain of domains) {
    if (Date.now() > deadline) break;
    tried.push(domain);
    try {
      const found = await findEmail({ name, domain });
      if (found) return { found, tried };
      anyClean = true;
    } catch (e) {
      if (!firstError) firstError = e instanceof Error ? e : new Error(String(e));
    }
  }
  if (!anyClean && firstError) throw firstError;
  return { found: null, tried };
}

export type EmailFindResult = {
  skipped?: "has_email" | "no_domain";
  found: FoundEmail | null;
  /** Domains the waterfall tried — surfaced in the room's empty-state banner. */
  tried: string[];
  /** True when a verified hit was written into contact_path (drafts will now
   *  route as real email sends). Unverified hits sit on the brief instead,
   *  waiting for the operator's explicit "use anyway". */
  applied: boolean;
};

/**
 * Finder pass for one candidate — name-anchored across every domain we can
 * associate with them. Builds the domain list (operator override + brief
 * domain → all domains in the record → name guesses), waterfalls the name
 * across it, applies a verified hit to contact_path. Throws only on real
 * Prospeo/config errors so callers can surface them.
 */
export async function attemptEmailFind(args: {
  pipelineId: string;
  name: string;
  contactPath: string | null;
  handle?: string | null;
  extraText?: string | null;
  /** A known-good domain (operator-pasted or the brief's own_domain) — tried
   *  first, ahead of extraction + guesses. */
  domainOverride?: string | null;
  via: "dossier" | "find-now";
  actor: string | undefined;
}): Promise<EmailFindResult> {
  if (extractEmail(args.contactPath)) {
    return { skipped: "has_email", found: null, tried: [], applied: false };
  }

  // Build the ordered, deduped domain candidate list: the known-good domain
  // first, then anything in their record, then name-based guesses.
  const ordered: string[] = [];
  const push = (d: string | null | undefined) => {
    if (d && !ordered.includes(d)) ordered.push(d);
  };
  push(args.domainOverride);
  for (const d of extractAllDomains(args.contactPath, args.handle, args.extraText)) push(d);
  for (const d of nameDomainGuesses(args.name)) push(d);
  const domains = ordered.slice(0, MAX_DOMAINS);

  if (domains.length === 0) {
    return { skipped: "no_domain", found: null, tried: [], applied: false };
  }

  const { found, tried } = await findEmailWaterfall(args.name, domains);
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
        contact_path: `${found.email} (verified · prospeo · ${found.domain}) · ${args.contactPath ?? ""}`.replace(/ · $/, ""),
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
      tried,
      via: args.via,
      applied: found.verified,
    },
  });

  return { found, tried, applied: found.verified };
}
