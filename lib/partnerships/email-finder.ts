/**
 * Prospeo email finder — name + the person's own domain in, verified email
 * out. No SDK; two POSTs with an X-KEY header. Prospeo is mid-migration from
 * /email-finder to /enrich-person (their docs are bot-walled), so we try the
 * new endpoint first and fall back, and parse the response defensively. A
 * lookup costs one credit only when something is found (free tier: 75/mo).
 *
 * Swapping providers later (e.g. a FullEnrich waterfall) means rewriting this
 * file only — callers see { email, status, verified } or null.
 */

import { createAdminClient } from "@/utils/supabase/admin";
import { logPartnerEvent } from "./events";
import { extractEmail } from "./outreach-templates";

const API = "https://api.prospeo.io";
const ENDPOINTS = ["/enrich-person", "/email-finder"];
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export type FoundEmail = {
  email: string;
  /** Prospeo's verification status, e.g. VALID / ACCEPT_ALL / UNKNOWN. */
  status: string;
  /** True only for statuses safe to send to without a second look. */
  verified: boolean;
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
 * Pull the person's own domain out of free text (contact path, handle, the
 * why_fit trail): first URL or bare domain whose host isn't a big platform.
 */
export function extractOwnDomain(
  ...texts: Array<string | null | undefined>
): string | null {
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
  for (const raw of candidates) {
    const host = raw.toLowerCase().replace(/^www\./, "");
    if (host.includes("@")) continue;
    if (!PLATFORM_HOSTS.test(host)) return host;
  }
  return null;
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
  if (!/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/.test(host)) {
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
    if (typeof v === "string") {
      if (!out.email && k.toLowerCase() === "email" && EMAIL_RE.test(v)) {
        out.email = v;
      } else if (!out.status && /status|verification/i.test(k) && v.length < 40) {
        out.status = v;
      }
    } else if (typeof v === "object") {
      scan(v, out);
    }
  }
}

/**
 * Look up an email for a person. Returns null when Prospeo genuinely has
 * nothing; throws with Prospeo's own message on config/API errors so the
 * caller can show it.
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

  // Per-endpoint request shapes. /enrich-person (current) nests the person
  // under `data` with `company_website`; /email-finder (legacy, being
  // removed) was flat. only_verified_email stays false — catch-all results
  // are wanted too, surfaced as the room's "use it anyway" path.
  const bodies: Record<string, unknown> = {
    "/enrich-person": {
      only_verified_email: false,
      enrich_mobile: false,
      data: { first_name, last_name, company_website: args.domain },
    },
    "/email-finder": { first_name, last_name, company: args.domain },
  };

  let lastErr = "no response";
  for (const ep of ENDPOINTS) {
    let json: Record<string, unknown> | null = null;
    let raw = "";
    let httpStatus = 0;
    try {
      const res = await fetch(API + ep, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-KEY": key },
        body: JSON.stringify(bodies[ep]),
      });
      httpStatus = res.status;
      raw = await res.text();
      try {
        json = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        json = null;
      }
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
      continue;
    }

    // Prospeo's "nothing found" is a clean no, not an error.
    const msg = json
      ? String((json.message as string | undefined) ?? (json.error_message as string | undefined) ?? "")
      : "";
    if (json && json.error === true && /no.?(result|email|found)|not.?found|no.?match/i.test(msg)) {
      return null;
    }
    if (!json || json.error === true || httpStatus >= 400) {
      // Carry Prospeo's own words so the room banner self-diagnoses.
      lastErr = msg || `HTTP ${httpStatus} from ${ep} — ${raw.slice(0, 180) || "(empty body)"}`;
      continue;
    }

    const out: { email?: string; status?: string } = {};
    scan((json.response as unknown) ?? json, out);
    if (!out.email) return null;
    const status = (out.status ?? "UNKNOWN").toUpperCase();
    return {
      email: out.email,
      status,
      verified: /^(VALID|DELIVERABLE|VERIFIED|SAFE)$/.test(status),
      endpoint: ep,
    };
  }
  throw new Error(`Prospeo lookup failed: ${lastErr}`);
}

export type EmailFindResult = {
  skipped?: "has_email" | "no_domain";
  found: FoundEmail | null;
  /** True when a verified hit was written into contact_path (drafts will now
   *  route as real email sends). Unverified hits sit on the brief instead,
   *  waiting for the operator's explicit "use anyway". */
  applied: boolean;
};

/**
 * Post-brief finder pass for one candidate. Decides whether a lookup makes
 * sense (no email yet + their own domain is named somewhere), runs it, and
 * applies the result. Throws only on API/config errors — callers decide
 * whether to surface (room button) or swallow (cron).
 */
export async function attemptEmailFind(args: {
  pipelineId: string;
  name: string;
  contactPath: string | null;
  handle?: string | null;
  extraText?: string | null;
  /** A known-good domain (operator-pasted or the brief's own_domain) —
   *  takes precedence over extraction from the record. */
  domainOverride?: string | null;
  via: "dossier" | "find-now";
  actor: string | undefined;
}): Promise<EmailFindResult> {
  if (extractEmail(args.contactPath)) {
    return { skipped: "has_email", found: null, applied: false };
  }
  const domain =
    args.domainOverride ?? extractOwnDomain(args.contactPath, args.handle, args.extraText);
  if (!domain) {
    return { skipped: "no_domain", found: null, applied: false };
  }

  const found = await findEmail({ name: args.name, domain });
  if (!found) {
    await logPartnerEvent({
      pipelineId: args.pipelineId,
      actor: args.actor,
      kind: "email_found",
      detail: { email: null, domain, via: args.via, applied: false },
    });
    return { found: null, applied: false };
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  if (found.verified) {
    await supabase
      .from("partner_pipeline")
      .update({
        contact_path: `${found.email} (verified · prospeo) · ${args.contactPath ?? ""}`.replace(/ · $/, ""),
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
            found_email: { email: found.email, status: found.status, verified: found.verified },
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
      domain,
      via: args.via,
      applied: found.verified,
    },
  });

  return { found, applied: found.verified };
}
