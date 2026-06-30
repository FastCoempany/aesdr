/**
 * Deterministic first-touch renderer — the template-fill half of "scribe."
 *
 * These three affiliate templates are ported verbatim from
 * content/partnerships/outreach/first-touch-{newsletter,community,podcast}.md
 * (the locked economics + booking + sign-off lines are reproduced exactly). The
 * scribe drafter cron fills the bespoke top from pipeline fields it actually
 * has (name, the community/show name, the Dossier why-fit) and leaves any
 * remaining bespoke placeholder visible so the tower can flag "needs your
 * sentence" — honoring each template's "make it specific or do not send" rule.
 *
 * The judgment-heavy motions (coach_complement / open_recruit / co_marketing)
 * need a competitor name or a specific thing they made — those stay with the
 * chat-invoked `scribe` subagent, not this deterministic arm.
 *
 * KEEP IN SYNC with content/partnerships/outreach/*.md if the canon copy moves.
 */

import crypto from "node:crypto";

import { getSiteUrl } from "@/lib/site-url";
import { canonCheck } from "@/lib/partnerships/canon-mechanical";

export type OutreachTemplateId = "newsletter" | "community" | "podcast";

/**
 * Deterministic first-touch draft key — shared by the scribe cron and the
 * room's Draft-now action so neither can ever double-draft a candidate
 * (the unique index on idempotency_key is the hard backstop).
 */
export function firstTouchIdemKey(pipelineId: string): string {
  return crypto
    .createHash("sha256")
    .update(`draft:${pipelineId}:first-touch`)
    .digest("hex")
    .slice(0, 32);
}

type Template = { id: OutreachTemplateId; subject: string; body: string };

const BOOKING = "https://calendar.app.google/wFRpSWG2ehvNhgd4A";
const SIGNOFF = "— Antaeus, AESDR · affiliates@aesdr.com";
const SITE = getSiteUrl();

const TEMPLATES: Record<OutreachTemplateId, Template> = {
  newsletter: {
    id: "newsletter",
    subject: "something for the early AE/SDR readers on your list",
    body: `[NAME] — your list is full of exactly who AESDR.com is built for: SDRs and AEs a year or two in, ramping harder than anyone said they would have to. It is a one-time course built by operators like us, not by course-people.

If it fits your readers, the affiliate terms are 40% commission on a 30-day attribution window, paid clean through Stripe. We read your first couple of sends so they sound like you and not like an ad or ai-crap. That's because we're prioritizing protecting your readers' trust, and then you'll send on your own after we vet the first couple.

[ANGLE]

Worth fifteen minutes to see if it fits?

It'll be the most refreshing few minutes you've had in a while.

${BOOKING}

${SIGNOFF}`,
  },
  community: {
    id: "community",
    subject: "something for the early AE/SDR crowd in [COMMUNITY]",
    body: `[NAME] — [COMMUNITY] is full of exactly who AESDR.com is built for: SDRs and AEs a year or two in, ramping harder than anyone said they would have to. It is a one-time course built by operators like us, not by course-people.

If it fits your members, the affiliate terms are 40% commission on a 30-day attribution window, paid clean through Stripe. We read your first couple of posts so they sound like you and not like an ad or ai-crap. That's because we're prioritizing protecting your members' trust, and then you'll post on your own after we vet the first couple pieces of outreach you do.

[ANGLE]

Worth fifteen minutes to see if it fits?

It'll be the most refreshing few minutes you've had in a while.

${BOOKING}

${SIGNOFF}`,
  },
  podcast: {
    id: "podcast",
    subject: "a guest angle your listeners are living right now",
    body: `[NAME] — your show speaks to exactly who AESDR.com is built for: SDRs and AEs a year or two in, ramping harder than anyone said they would have to. It is a one-time course built by operators like us, not by course-people.

If it fits your listeners, the affiliate terms are 40% commission on a 30-day attribution window, paid clean through Stripe — host-read or a guest spot. We make sure any mention sounds like you and not like an ad or ai-crap, so your listeners' trust stays intact.

[ANGLE]

Happy to come on and earn it, or just take the partner kit first. Worth fifteen minutes to see if it fits?

It'll be the most refreshing few minutes you've had in a while.

${BOOKING}

${SIGNOFF}`,
  },
};

// Words kept lowercase when title-casing a community slug.
const SLUG_STOPWORDS = new Set(["the", "and", "for", "of", "in", "on", "to", "a", "with"]);

/**
 * "[COMMUNITY]" must read like the community's name, not its URL — an email
 * that says "skool.com/b2b-sales-university-5171 is full of exactly who…"
 * fails the read-aloud test. Turn a platform URL/slug into words
 * ("B2B Sales University"); anything already name-like passes through.
 */
export function humanizeCommunityName(raw: string): string {
  let v = raw.trim();
  try {
    if (/^https?:\/\//i.test(v)) {
      v = new URL(v).pathname.split("/").filter(Boolean).pop() ?? v;
    }
  } catch {
    /* not a parseable URL — keep going with the raw string */
  }
  // Bare "skool.com/some-slug" without protocol.
  if (/^[a-z0-9.-]+\.[a-z]{2,}\//i.test(v)) {
    v = v.split("/").filter(Boolean).pop() ?? v;
  }
  if (/^[a-z0-9-]+$/i.test(v) && v.includes("-")) {
    v = v
      .replace(/-\d+$/, "") // platform ID suffixes like -5171
      .split("-")
      .map((w) =>
        SLUG_STOPWORDS.has(w.toLowerCase())
          ? w.toLowerCase()
          : /^[a-z]\d|^\d/.test(w.toLowerCase())
            ? w.toUpperCase() // b2b → B2B, 30mpc → 30MPC
            : w.charAt(0).toUpperCase() + w.slice(1),
      )
      .join(" ");
  }
  return v;
}

/**
 * Guard the [COMMUNITY] slot against dropping a bare handle into "X is full
 * of…": a real community reads as words (has a space) or is already cased
 * ("B2B Sales University"). A bare all-lowercase token ("joshbraun") is a
 * handle for a personal brand, not a community name — say "your community"
 * instead, which reads naturally in both the subject and the body.
 */
export function presentableCommunity(humanized: string, firstName: string): string {
  const v = humanized.trim();
  if (!v) return "your community";
  const isBareHandle = !/\s/.test(v) && v === v.toLowerCase();
  if (isBareHandle || v.toLowerCase() === firstName.trim().toLowerCase()) {
    return "your community";
  }
  return v;
}

/** Pick the template from the pipeline row's surface. Defaults to newsletter. */
export function pickTemplate(surface: string | null): OutreachTemplateId {
  const s = (surface || "").toLowerCase();
  if (/podcast|show|listen/.test(s)) return "podcast";
  if (/skool|mighty|circle|discord|community|slack|group/.test(s)) return "community";
  return "newsletter";
}

export type RenderedDraft = {
  templateId: OutreachTemplateId;
  subject: string;
  body: string;
  /** Bespoke placeholders the deterministic fill couldn't satisfy. */
  unfilled: string[];
};

/**
 * Render a first-touch draft from a pipeline row. Fills [NAME] and [COMMUNITY]
 * from pipeline fields, and [ANGLE] — the one personal line — from the Dossier's
 * researched first_touch_angle when a brief has run, falling back to a warm,
 * no-research-needed line otherwise. The point: a first-touch draft NEVER ships
 * with a bracket the operator has to go hunt down and fill by hand.
 */
export function renderFirstTouch(row: {
  name: string;
  surface: string | null;
  handle: string | null;
  why_fit: string | null;
  /** The Dossier's researched, sendable first-touch line (from
   *  partner_pipeline.dossier_brief.first_touch_angle), when a brief has run.
   *  Fills [ANGLE]; absent → the warm fallback below. */
  first_touch_angle?: string | null;
}): RenderedDraft {
  const templateId = pickTemplate(row.surface);
  const t = TEMPLATES[templateId];

  const firstName = row.name.trim().split(/\s+/)[0] || row.name;
  const communityName = presentableCommunity(
    humanizeCommunityName(row.handle?.trim() || row.surface?.trim() || row.name),
    firstName,
  );

  // [ANGLE]: the researched specific when a brief exists AND it passes the
  // guard (short, second-person, canon-clean); otherwise the warm fallback. The
  // guard is what stops a third-person research note ("Neil's show… his
  // audience", "the exact reps") from ever reaching the wire — worst case you
  // get the warm line, and you can still paste a sharper one in the editor.
  const rawAngle = cleanAngle(row.first_touch_angle);
  const angle = isUsableAngle(rawAngle, firstName)
    ? rawAngle
    : `I know your work, ${firstName}. I'm not worried about it.`;

  const replacements: Record<string, string> = {
    "[NAME]": firstName,
    "[COMMUNITY]": communityName,
    "[ANGLE]": angle,
  };

  const fill = (s: string) =>
    Object.entries(replacements).reduce(
      (acc, [k, v]) => acc.split(k).join(v),
      s,
    );

  const subject = fill(t.subject);
  const body = fill(t.body);

  // With [NAME]/[COMMUNITY]/[ANGLE] resolved nothing should remain, but keep the
  // guard so any future template bracket still gets flagged "needs your sentence".
  const unfilled = Array.from(
    new Set((subject + "\n" + body).match(/\[[A-Z][A-Z0-9 /]+\]/g) || []),
  );

  return { templateId, subject, body, unfilled };
}

/** Lightly sanitize the Dossier's first-touch angle before it becomes the
 *  partner-facing [ANGLE] line: drop any stray bracketed tag and collapse
 *  whitespace. Empty → "" so the caller uses the warm fallback. */
function cleanAngle(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Gate the Dossier's first-touch angle before it becomes sendable copy. The
 * angle is LLM output; even with a tightened prompt it can come back as a
 * third-person note ("Neil's show… his audience"), carry a canon-banned term
 * ("reps"), or run paragraph-long like an analysis. Any of those → don't use it;
 * the caller falls back to the warm line. So a bad angle can never reach the
 * wire — and the operator can still paste a sharper one in the inline editor.
 */
function isUsableAngle(angle: string, firstName: string): boolean {
  if (!angle) return false;
  // A real one-line opener is short; a paragraph-length blob is a note/analysis.
  if (angle.length > 240) return false;
  const lower = angle.toLowerCase();
  const fn = firstName.trim().toLowerCase();
  // A line written TO them never names them, nor refers to them in third person.
  if (fn && new RegExp(`\\b${escapeRegExp(fn)}('s)?\\b`).test(lower)) return false;
  if (/\b(he|she|his|her|hers|him)\b/.test(lower)) return false;
  // Mechanical canon: drop anything with a blocklisted term (reps, etc.).
  if (!canonCheck(angle).clean) return false;
  return true;
}

/** Strip internal annotations from a why_fit note before it becomes partner-
 *  facing copy: bracketed tags ([scout/…], [⚠ …], [dossier]), a trailing
 *  "— conflict: …", the dossier "| …" tail, and any leftover email. Keeps the
 *  clean lead sentence. Belt-and-suspenders against internal data in outreach. */
function cleanWhyFit(s: string | null | undefined): string {
  if (!s) return "";
  let out = s;
  const cut = out.search(/\s\[|\s[—–-]\s*conflict:|\s\|\s|\s\(conflict:/i);
  if (cut !== -1) out = out.slice(0, cut);
  return out
    .replace(/\[[^\]]*\]/g, "") // any stray bracketed tag
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "") // any stray email
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.$/, "");
}

/** Pull the first email address out of a contact_path, if any. */
export function extractEmail(contactPath: string | null): string | null {
  if (!contactPath) return null;
  const m = contactPath.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  return m ? m[0] : null;
}

// ── Follow-up ladder (ported verbatim from content/partnerships/outreach/
//    follow-up-{1,2}.md). Sent on the same thread; subject reuses the
//    first-touch subject (no new subject line). ──

/** Follow-up 1 (+4 days): adds value, not a nag. [SPECIFIC RESOURCE…] is left
 *  for the operator to fill — the resource must genuinely fit their audience. */
export function renderFollowUp1(row: { name: string }): RenderedDraft {
  const firstName = row.name.trim().split(/\s+/)[0] || row.name;
  const body = `${firstName} — quick follow-up, with something useful either way: a copy of The Manager Archetype Map from the course. It helps a first-2-year rep read a new manager in the first couple of weeks — yours to keep no matter what.

If the affiliate thing is not for you, no problem — keep the map. If it is, the kit is here: ${SITE}/affiliates/kit. Same terms as before: 40% commission, 30-day attribution window, paid through Stripe.

${SIGNOFF}`;
  const unfilled = Array.from(new Set(body.match(/\[[A-Z][A-Z0-9 /]+\]/g) || []));
  return { templateId: "newsletter", subject: "Re: (follow-up)", body, unfilled };
}

/** Follow-up 2 (+9 days): the honest close. [THEIR AUDIENCE] names their people. */
export function renderFollowUp2(row: { name: string; why_fit?: string | null }): RenderedDraft {
  const firstName = row.name.trim().split(/\s+/)[0] || row.name;
  // Best-effort fill of [THEIR AUDIENCE] from the why-fit, sanitized of any
  // internal annotations; if absent, leave the placeholder for the operator.
  const audience = cleanWhyFit(row.why_fit) || "early-career AEs and SDRs";
  const body = `${firstName} — last note from me, no hard feelings if it is a no. I think AESDR genuinely fits ${audience}, and the terms are real — 40% commission, 30-day attribution window, one-time, paid through Stripe — but I would rather leave you alone than send a fourth email.

Door is open whenever. ${SIGNOFF}`;
  const unfilled = Array.from(new Set(body.match(/\[[A-Z][A-Z0-9 /]+\]/g) || []));
  return { templateId: "newsletter", subject: "Re: (follow-up)", body, unfilled };
}
