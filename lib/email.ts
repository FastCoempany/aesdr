import crypto from 'node:crypto';

import * as Sentry from '@sentry/nextjs';
import { Resend } from 'resend';

import { bridgeAfter } from '@/utils/progress/bridges';
import { createAdminClient } from '@/utils/supabase/admin';

function getResend() {
  // RESEND_API_KEY is the canonical name used by production aesdr.com.
  // aesdr_email_api_key is the lowercase alias used by the affiliatekit
  // preview Vercel project. Either resolves to the same Resend SDK init.
  const apiKey =
    process.env.RESEND_API_KEY || process.env.aesdr_email_api_key;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY (or aesdr_email_api_key) environment variable is not set",
    );
  }
  return new Resend(apiKey);
}

/** Escape HTML special characters to prevent injection in email templates. */
function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const FROM = 'AESDR <hello@aesdr.com>';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://aesdr.com';

// HTTPS one-click unsubscribe endpoint (RFC 8058). Pairing
// `List-Unsubscribe-Post: List-Unsubscribe=One-Click` with a `mailto:` is
// malformed and trips Gmail/Yahoo bulk-sender enforcement (P0-12), so the
// header points at an HTTPS URL instead.
//
// AUDIT: P0-12 — the /unsubscribe route + the suppression table it writes to
// (and the cron gate that reads it) are a sibling-owned follow-up; this lane
// only emits the correct header. Until that route exists the link 404s, but a
// 404 is still RFC-valid and strictly better than the spam-flagged mailto pair.
// AUDIT: CAN-SPAM physical address still required before bulk-mailing — the
// founder has no postal/PO-box address to expose yet, so footers route contact
// to hello@ instead. A real mailing address MUST be added to both footers
// before any non-transactional bulk send to stay CAN-SPAM/CASL compliant.
const UNSUBSCRIBE_URL = `${SITE}/unsubscribe`;

// P0-12: the VISIBLE footer "Unsubscribe" link must carry ?email=<recipient> so
// a human clicking it lands on /unsubscribe pre-identified — same per-recipient
// shape as the List-Unsubscribe header in bulkHeaders(). When no recipient is in
// scope (transactional sends with no single addressee) we fall back to the bare
// URL, which still resolves.
function unsubscribeLink(email?: string) {
  return email
    ? `${UNSUBSCRIBE_URL}?email=${encodeURIComponent(email)}`
    : UNSUBSCRIBE_URL;
}

const UNSUBSCRIBE_HEADERS = {
  'List-Unsubscribe': `<${UNSUBSCRIBE_URL}>`,
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
};

// Bulk/lifecycle headers (R5-DV-5 / P0-12): per-RECIPIENT one-click unsubscribe.
// The List-Unsubscribe URL carries ?email=<recipient> so the /unsubscribe route
// (and a mail client's one-click POST) knows exactly which address to suppress —
// without this the header can't identify anyone. Plus a stable List-Id and
// `Precedence: bulk`. Use for marketing/lifecycle sends; keep transactional
// confirmations on the plain UNSUBSCRIBE_HEADERS set.
function bulkHeaders(to: string) {
  return {
    'List-Unsubscribe': `<${UNSUBSCRIBE_URL}?email=${encodeURIComponent(to)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    'List-Id': 'AESDR Lifecycle <lifecycle.aesdr.com>',
    Precedence: 'bulk',
  };
}

/**
 * AUDIT (P0-12 / R5-DV-2): the suppression gate the lifecycle crons call before
 * sending. Returns the lowercased set of addresses (from email_suppressions —
 * written by /unsubscribe and a future bounce/complaint webhook) that must NOT
 * be bulk-mailed. Fail-open on a read error so a transient blip can't drop a
 * whole cohort.
 */
export async function getSuppressedEmails(
  emails: Array<string | null | undefined>,
): Promise<Set<string>> {
  const lower = [...new Set(emails.map((e) => (e || '').toLowerCase()).filter(Boolean))];
  if (lower.length === 0) return new Set();
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('email_suppressions')
      .select('email')
      .in('email', lower);
    return new Set((data ?? []).map((r) => String(r.email).toLowerCase()));
  } catch {
    return new Set();
  }
}

/**
 * Strip HTML to plain-text for the multipart/alternative `text:` body.
 *
 * Resend builds multipart MIME only when both html and text are passed.
 * Without a text part, plain-text-only clients (CLI mail, accessibility
 * tools, search-indexed previews) fall back to raw-HTML rendering, and
 * spam filters penalize HTML-only sends. This helper produces a
 * deliverability-safe text alternative from the existing HTML body.
 *
 * Behavior:
 *   - Replaces <a href="X">Y</a> with `Y (X)` so links survive the strip
 *   - Replaces <br> and block-element openers with newlines
 *   - Strips remaining tags
 *   - Decodes the four entities `esc()` introduces (&amp; &lt; &gt; &quot;)
 *   - Collapses ≥3 consecutive newlines to 2 (paragraph breaks)
 *   - Trims surrounding whitespace
 */
function htmlToText(html: string): string {
  return html
    // R4-DR-6: allow nested tags inside the anchor (e.g.
    // <a ...><strong>X</strong></a>) so the URL survives — the old
    // `([^<]*)` label capture stopped at the first inner `<` and dropped the
    // whole link, losing the href. Capture lazily across tags, then strip any
    // inner tags from the visible label.
    .replace(
      /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_m, href, label) => `${String(label).replace(/<[^>]+>/g, "").trim()} (${href})`,
    )
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr|blockquote)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/^[ \t]+/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Brand: Leponeus pose helper for email templates ───
// Mirrors utils/brand/lesson-poses.ts but inlined here so this server-side
// file doesn't import a client TSX component. Update both if the canon
// pose mapping ever changes.
type Pose =
  | "doctrine"
  | "diagnosis"
  | "sprint"
  | "fall"
  | "recovery"
  | "rest"
  | "verdict"
  | "owner";

const LESSON_POSE_EMAIL: Record<string, Pose> = {
  "1":  "doctrine",
  "2":  "doctrine",
  "3":  "verdict",
  "4":  "verdict",
  "5":  "fall",
  "6":  "sprint",
  "7":  "doctrine",
  "8":  "doctrine",
  "9":  "recovery",
  "10": "doctrine",
  "11": "verdict",
  "12": "owner",
};

function poseForLessonEmail(lessonId: string): Pose {
  return LESSON_POSE_EMAIL[lessonId] ?? "doctrine";
}

/** Absolute URL of a mascot PNG, for email <img src>. */
function mascotUrl(pose: Pose): string {
  return `${SITE}/mascot/leponeus-${pose}.png`;
}

// R3-EMAIL-7: the mascot carries the email's emotional content, so it needs a
// meaningful alt for image-off / screen-reader recipients — not alt="".
const POSE_ALT: Record<Pose, string> = {
  doctrine: "Leponeus the tortoise, standing at attention",
  diagnosis: "Leponeus the tortoise, looking things over",
  sprint: "Leponeus the tortoise, mid-stride at a run",
  fall: "Leponeus the tortoise, knocked onto his shell",
  recovery: "Leponeus the tortoise, getting back to his feet",
  rest: "Leponeus the tortoise, resting",
  verdict: "Leponeus the tortoise, delivering a verdict",
  owner: "Leponeus the tortoise, standing tall as an owner",
};

/** Centered Leponeus image table-row, drops into any email card layout. */
function mascotRow(pose: Pose, size = 180): string {
  const url = mascotUrl(pose);
  const alt = esc(POSE_ALT[pose] ?? "Leponeus the tortoise");
  return `
        <tr>
          <td align="center" style="padding:32px 48px 0 48px;">
            <img src="${url}" width="${size}" height="${size}" alt="${alt}" style="display:block;border:0;width:${size}px;height:${size}px;max-width:100%;" />
          </td>
        </tr>`;
}

/**
 * Wrapper that sends an email and logs failures.
 * Returns true on success, false on failure (never throws).
 *
 * R4-DR-11: a Resend API error (`result.error`) returns `false` rather than
 * throwing, so callers that only `try/catch` (e.g. the Stripe webhook) would
 * otherwise never see it — not even in Sentry. We capture BOTH the
 * `result.error` path and the thrown path here, so a failed send is always
 * visible centrally regardless of how the caller treats the boolean. Callers
 * should still check the return and avoid setting any `*_sent` flag on `false`.
 */
async function safeSend(
  label: string,
  sendFn: () => ReturnType<ReturnType<typeof getResend>['emails']['send']>
): Promise<boolean> {
  try {
    const result = await sendFn();
    if (result.error) {
      console.error(`[email] ${label} failed:`, result.error);
      Sentry.captureMessage(`[email] ${label} failed`, {
        level: 'error',
        extra: { resendError: result.error },
      });
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[email] ${label} threw:`, err);
    Sentry.captureException(err, { extra: { emailLabel: label } });
    return false;
  }
}

// ─── Affiliate Application Notification (internal, to founder) ───
// Renamed Phase 3 (2026-05-22) — function + type + Supabase table all
// carry the affiliate-naming canonical now that the Phase 3 migration
// has shipped (20260522_affiliate_slug_rename.sql).

export type AffiliateApplicationPayload = {
  applicantName: string;
  audienceDescriptor: string;
  primaryChannel: string;
  audienceSize: string;
  linkUrl: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  ipHash?: string | null;
  userAgent?: string | null;
  applicantEmail?: string | null;
  submittedAt: string;
};

export async function sendAffiliateApplicationNotification(payload: AffiliateApplicationPayload) {
  const recipient = process.env.EMAIL_RECIPIENT;
  if (!recipient) {
    console.warn("[email] EMAIL_RECIPIENT not set; skipping affiliate application notification.");
    return false;
  }
  const from = process.env.EMAIL_FROM || "AESDR Affiliates <hello@aesdr.com>";
  const subject = `Affiliate application — ${payload.applicantName}`;
  return safeSend(`affiliate-application from ${payload.applicantName}`, () =>
    getResend().emails.send({
      from,
      to: recipient,
      // AUDIT (P1-7): reply goes to the applicant so the founder can send the
      // promised yes/no decision directly. (An applicant auto-acknowledgement
      // email is a follow-up.)
      replyTo: payload.applicantEmail || recipient,
      subject,
      html: affiliateApplicationHtml(payload),
      text: affiliateApplicationText(payload),
    })
  );
}

function affiliateApplicationText(p: AffiliateApplicationPayload): string {
  const utm = [
    p.utmSource && `source=${p.utmSource}`,
    p.utmMedium && `medium=${p.utmMedium}`,
    p.utmCampaign && `campaign=${p.utmCampaign}`,
    p.utmContent && `content=${p.utmContent}`,
  ].filter(Boolean).join(" · ") || "(none)";
  return [
    `New affiliate application — ${p.applicantName}`,
    "",
    `Applicant:        ${p.applicantName}`,
    `Primary channel:  ${p.primaryChannel}`,
    `Audience:         ${p.audienceDescriptor}`,
    `Audience size:    ${p.audienceSize}`,
    `Link:             ${p.linkUrl}`,
    `UTM:              ${utm}`,
    `Submitted:        ${p.submittedAt}`,
    `IP hash:          ${p.ipHash || "(none)"}`,
    `User agent:       ${p.userAgent || "(none)"}`,
    "",
    `Review in Supabase: affiliate_applications table.`,
  ].join("\n");
}

// ─── Affiliate Application Acknowledgement (to the applicant) ───
// AUDIT (P1-7): closes the loop the moment an application lands. The founder
// notification (above) goes to EMAIL_RECIPIENT; this one reassures the applicant
// that a human will read it and follow up. Fire-and-forget from the apply route.
export async function sendAffiliateApplicationReceivedEmail(
  to: string,
  name?: string,
): Promise<boolean> {
  const html = affiliateApplicationReceivedHtml(to, name);
  return safeSend(`affiliate-application-received to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: "We've got your AESDR Affiliate Program application",
      html,
      text: htmlToText(html),
    })
  );
}

function affiliateApplicationReceivedHtml(email: string, name?: string): string {
  const greeting = name && name.trim() ? `Hey ${esc(name.trim())},` : "Hey,";
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Affiliate Program · Application received
  </p>
  <p>${greeting}</p>
  <p>Your application to the AESDR Affiliate Program landed — thank you. This is just the confirmation that it's in.</p>
  <p>A real person reads every one, so it takes a little time rather than a few seconds. Once yours has had that read, we'll follow up by email either way.</p>
  <p>Nothing you need to do in the meantime. If you want to add anything to your application, just reply to this email — it reaches a person.</p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

// ─── Affiliate hub lifecycle emails ───
// Triggered by app/actions/affiliate.ts during the copy-submission review
// flow + status transitions. All sent from hello@aesdr.com to the
// affiliate's email on the affiliates table.

function affiliateShellHtml(args: {
  eyebrow: string;
  headline: string;
  body: string;
  ctaUrl?: string;
  ctaLabel?: string;
}): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${esc(args.eyebrow)}</title></head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF7F2;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E8E4DF;">
      <tr><td style="padding:28px 32px 8px 32px;">
        <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
          ${esc(args.eyebrow)}
        </p>
      </td></tr>
      <tr><td style="padding:4px 32px 16px 32px;">
        <h1 style="margin:0;font-family:Georgia,'Playfair Display',serif;font-style:italic;font-weight:700;font-size:28px;line-height:1.2;color:#1A1A1A;">
          ${esc(args.headline)}
        </h1>
      </td></tr>
      <tr><td style="padding:0 32px 24px 32px;font-family:Georgia,'Source Serif 4',serif;font-size:15px;line-height:1.7;color:#1A1A1A;">
        ${args.body}
      </td></tr>
      ${args.ctaUrl && args.ctaLabel ? `<tr><td style="padding:0 32px 32px 32px;">
        <a href="${esc(args.ctaUrl)}" style="display:inline-block;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#FFFFFF;background:#8B1A1A;padding:13px 24px;text-decoration:none;">${esc(args.ctaLabel)}</a>
      </td></tr>` : ""}
      <tr><td style="padding:0 32px 28px 32px;border-top:1px solid #E8E4DF;">
        <p style="margin:16px 0 0;font-family:Georgia,'Source Serif 4',serif;font-size:13px;line-height:1.65;color:#6B6B6B;font-style:italic;">
          A real person reads replies to this thread. Email hello@aesdr.com
          with anything that needs a human.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

/** Welcome an affiliate the moment they're activated on the canonical table. */
export async function sendAffiliateOnboardingEmail(args: {
  to: string;
  displayName: string;
  slug: string;
  sophisticationTier: "developing" | "proven";
}): Promise<boolean> {
  const gateRequirement = args.sophisticationTier === "proven" ? 1 : 3;
  const pieceWord = gateRequirement === 1 ? "piece" : "pieces";
  const body = `
        <p style="margin:0 0 16px;">${esc(args.displayName)}, you're set up under the handle <code style="font-family:'SF Mono',Consolas,monospace;font-size:14px;background:#FAF7F2;padding:1px 6px;">${esc(args.slug)}</code> — that's the suffix on every tracking link you'll create.</p>
        <p style="margin:0;">Your first ${gateRequirement} ${pieceWord} run through a quick brand-fit check from the dashboard's <strong>Submit copy</strong> page. After that, you post freely.</p>
  `;
  return safeSend(`affiliate-onboarding to ${args.to}`, () =>
    getResend().emails.send({
      from: FROM,
      to: args.to,
      subject: "You're in — AESDR Affiliate Program",
      html: affiliateShellHtml({
        eyebrow: "AESDR · Affiliates",
        headline: "You're in.",
        body,
        ctaUrl: `${SITE}/affiliates/dashboard`,
        ctaLabel: "Open the dashboard",
      }),
      text: [
        `${args.displayName}, you're set up under the handle ${args.slug} — that's the suffix on every tracking link you'll create.`,
        ``,
        `Your first ${gateRequirement} ${pieceWord} run through a quick brand-fit check from the dashboard's "Submit copy" page. After that, you post freely.`,
        ``,
        `Open the dashboard: ${SITE}/affiliates/dashboard`,
      ].join("\n"),
    })
  );
}

export async function sendAffiliateCopyApprovedEmail(args: {
  to: string;
  displayName: string;
  channel: string;
  reviewerNotes: string | null;
  gateCleared: boolean;
}): Promise<boolean> {
  const body = `
        <p style="margin:0 0 16px;">${esc(args.displayName)} — approved. Your ${esc(args.channel)} draft cleared review${args.gateCleared ? " and cleared the brand-conformance gate" : ""}. Ship it.</p>
        ${args.reviewerNotes ? `<p style="margin:0 0 16px;font-style:italic;color:#6B6B6B;">Reviewer notes: ${esc(args.reviewerNotes)}</p>` : ""}
        ${args.gateCleared ? `<p style="margin:0;">From here on, post freely. You can still send pieces for a sanity check, but you don't have to.</p>` : `<p style="margin:0;">Two more approved pieces and you exit the gate — after that, post freely.</p>`}
  `;
  return safeSend(`affiliate-copy-approved to ${args.to}`, () =>
    getResend().emails.send({
      from: FROM,
      to: args.to,
      subject: args.gateCleared ? "Approved — and you just cleared the gate" : "Approved — ship it",
      html: affiliateShellHtml({
        eyebrow: "AESDR · Affiliates · Approved",
        headline: args.gateCleared ? "Approved. Gate cleared." : "Approved.",
        body,
        ctaUrl: `${SITE}/affiliates/dashboard/submissions`,
        ctaLabel: "Back to submissions",
      }),
      text: `${args.displayName} — approved. ${args.gateCleared ? "Gate cleared." : ""}${args.reviewerNotes ? `\n\nReviewer notes: ${args.reviewerNotes}` : ""}`,
    })
  );
}

export async function sendAffiliateCopyEditsRequestedEmail(args: {
  to: string;
  displayName: string;
  channel: string;
  editRequests: string;
}): Promise<boolean> {
  const body = `
        <p style="margin:0 0 16px;">${esc(args.displayName)} — your ${esc(args.channel)} draft needs a couple of edits before it ships.</p>
        <p style="margin:0 0 16px;font-family:'SF Mono',Consolas,monospace;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;">What to change</p>
        <p style="margin:0 0 16px;white-space:pre-wrap;background:#FAF7F2;padding:14px 16px;font-size:14px;">${esc(args.editRequests)}</p>
        <p style="margin:0;">Tweak and resubmit through the same form.</p>
  `;
  return safeSend(`affiliate-copy-edits to ${args.to}`, () =>
    getResend().emails.send({
      from: FROM,
      to: args.to,
      subject: "Edits requested before this can ship",
      html: affiliateShellHtml({
        eyebrow: "AESDR · Affiliates · Edits",
        headline: "Almost there — one round of edits.",
        body,
        ctaUrl: `${SITE}/affiliates/dashboard/submissions`,
        ctaLabel: "Open submissions",
      }),
      text: `${args.displayName} — edits requested on your ${args.channel} draft.\n\n${args.editRequests}\n\nResubmit at ${SITE}/affiliates/dashboard/submissions`,
    })
  );
}

export async function sendAffiliateCopyDeclinedEmail(args: {
  to: string;
  displayName: string;
  channel: string;
  declineReason: string;
  declineCategory: string;
  strikeNumber: number;
  autoPaused: boolean;
}): Promise<boolean> {
  const categoryLabel = args.declineCategory.replace(/_/g, " ");
  const body = `
        <p style="margin:0 0 16px;">${esc(args.displayName)} — this ${esc(args.channel)} draft can't run as written.</p>
        <p style="margin:0 0 16px;font-family:'SF Mono',Consolas,monospace;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;">Category</p>
        <p style="margin:0 0 16px;">${esc(categoryLabel)} · strike ${args.strikeNumber} of 3 in this category</p>
        <p style="margin:0 0 16px;font-family:'SF Mono',Consolas,monospace;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;">Why</p>
        <p style="margin:0 0 16px;white-space:pre-wrap;background:#FAF7F2;padding:14px 16px;font-size:14px;">${esc(args.declineReason)}</p>
        ${args.autoPaused ? `<p style="margin:0;color:#8B1A1A;font-weight:600;">Your account is paused pending a conversation. Email hello@aesdr.com to reopen.</p>` : `<p style="margin:0;">Submit a different draft when you're ready. Three same-category strikes pauses the account.</p>`}
  `;
  return safeSend(`affiliate-copy-declined to ${args.to}`, () =>
    getResend().emails.send({
      from: FROM,
      to: args.to,
      subject: args.autoPaused ? "Account paused" : "Draft declined",
      html: affiliateShellHtml({
        eyebrow: "AESDR · Affiliates · Declined",
        headline: args.autoPaused ? "Paused for a conversation." : "Declined.",
        body,
        ctaUrl: `${SITE}/affiliates/dashboard/submissions`,
        ctaLabel: "Open submissions",
      }),
      text: `${args.displayName} — declined.\n\nCategory: ${categoryLabel} (strike ${args.strikeNumber}/3)\nReason: ${args.declineReason}\n${args.autoPaused ? "\nAccount paused — email hello@aesdr.com." : ""}`,
    })
  );
}

export async function sendAffiliateGateClearedEmail(args: {
  to: string;
  displayName: string;
}): Promise<boolean> {
  const body = `
        <p style="margin:0 0 16px;">${esc(args.displayName)} — gate cleared. You're off the brand-conformance review queue.</p>
        <p style="margin:0 0 24px;">Post freely from here on. You can still send a draft for a sanity check before a big push, but it's not required.</p>
        <p style="margin:0 0 12px;font-family:'SF Mono',Consolas,monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#6B6B6B;">How the money works now</p>
        <ul style="margin:0;padding:0 0 0 20px;font-family:Georgia,'Source Serif 4',serif;font-size:15px;line-height:1.7;color:#1A1A1A;">
          <li style="margin-bottom:6px;">30% of net revenue on any enrolment attributed to your link</li>
          <li style="margin-bottom:6px;">30-day attribution window from a visitor's first click</li>
          <li style="margin-bottom:0;">14-day refund window — commission clears the moment it closes, then ships in the next payout batch</li>
        </ul>
  `;
  return safeSend(`affiliate-gate-cleared to ${args.to}`, () =>
    getResend().emails.send({
      from: FROM,
      to: args.to,
      subject: "Gate cleared — post freely",
      html: affiliateShellHtml({
        eyebrow: "AESDR · Affiliates · Gate cleared",
        headline: "You're off the review queue.",
        body,
        ctaUrl: `${SITE}/affiliates/dashboard`,
        ctaLabel: "Open the dashboard",
      }),
      text: [
        `${args.displayName} — gate cleared. You're off the brand-conformance review queue.`,
        ``,
        `Post freely from here on. You can still send a draft for a sanity check before a big push, but it's not required.`,
        ``,
        `How the money works now:`,
        `  - 30% of net revenue on any enrolment attributed to your link`,
        `  - 30-day attribution window from a visitor's first click`,
        `  - 14-day refund window — commission clears the moment it closes, then ships in the next payout batch`,
        ``,
        `Dashboard: ${SITE}/affiliates/dashboard`,
      ].join("\n"),
    })
  );
}

export async function sendAffiliatePauseEmail(args: {
  to: string;
  displayName: string;
  reason: string;
}): Promise<boolean> {
  const body = `
        <p style="margin:0 0 16px;">${esc(args.displayName)} — your affiliate account is paused.</p>
        <p style="margin:0 0 16px;font-family:'SF Mono',Consolas,monospace;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;">Reason</p>
        <p style="margin:0 0 16px;">${esc(args.reason)}</p>
        <p style="margin:0;">Tracking links keep working for purposes of in-flight attributions inside the existing window, but no new pieces can ship. Email hello@aesdr.com to talk it through.</p>
  `;
  return safeSend(`affiliate-pause to ${args.to}`, () =>
    getResend().emails.send({
      from: FROM,
      to: args.to,
      subject: "Affiliate account paused",
      html: affiliateShellHtml({
        eyebrow: "AESDR · Affiliates · Paused",
        headline: "Account paused.",
        body,
      }),
      text: `${args.displayName} — account paused.\nReason: ${args.reason}\nEmail hello@aesdr.com to reopen.`,
    })
  );
}

export async function sendAffiliatePayoutNotificationEmail(args: {
  to: string;
  displayName: string;
  amountCents: number;
  periodStart: string;
  periodEnd: string;
  paymentMethod: string | null;
  reference: string | null;
}): Promise<boolean> {
  const amount = `$${(args.amountCents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const body = `
        <p style="margin:0 0 16px;">${esc(args.displayName)} — your payout for ${esc(args.periodStart)} → ${esc(args.periodEnd)} is on its way.</p>
        <p style="margin:0 0 16px;font-family:'SF Mono',Consolas,monospace;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;">Amount</p>
        <p style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1A1A1A;">${esc(amount)}</p>
        ${args.paymentMethod ? `<p style="margin:0 0 8px;font-family:'SF Mono',Consolas,monospace;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;">Method</p><p style="margin:0 0 16px;">${esc(args.paymentMethod)}</p>` : ""}
        ${args.reference ? `<p style="margin:0 0 8px;font-family:'SF Mono',Consolas,monospace;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;">Reference</p><p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:14px;">${esc(args.reference)}</p>` : ""}
  `;
  return safeSend(`affiliate-payout to ${args.to}`, () =>
    getResend().emails.send({
      from: FROM,
      to: args.to,
      subject: `Payout sent — ${amount}`,
      html: affiliateShellHtml({
        eyebrow: "AESDR · Affiliates · Payout",
        headline: "Payout sent.",
        body,
        ctaUrl: `${SITE}/affiliates/dashboard`,
        ctaLabel: "View the dashboard",
      }),
      text: `${args.displayName} — payout sent.\nAmount: ${amount}\nPeriod: ${args.periodStart} → ${args.periodEnd}${args.paymentMethod ? `\nMethod: ${args.paymentMethod}` : ""}${args.reference ? `\nReference: ${args.reference}` : ""}`,
    })
  );
}

/**
 * AUDIT (R3-AF-2): a newly-provisioned affiliate has server-trusted app_metadata
 * claims + email_confirm but NO password, so they can't sign in. This sends the
 * recovery / set-password link so they can first access their dashboard.
 */
export async function sendAffiliateActivationEmail(args: {
  to: string;
  displayName: string;
  actionLink: string;
}): Promise<boolean> {
  const body = `
        <p style="margin:0 0 16px;">${esc(args.displayName)} — your AESDR affiliate account is set up. Set a password to sign in to your dashboard, grab your tracking links, and start.</p>
        <p style="margin:0;color:#6B6B6B;">This link sets your password and signs you in. If it has expired, use "Forgot password" on the sign-in page with this same email.</p>
  `;
  return safeSend(`affiliate-activation to ${args.to}`, () =>
    getResend().emails.send({
      from: FROM,
      to: args.to,
      subject: "Set your password — your AESDR affiliate account is ready",
      html: affiliateShellHtml({
        eyebrow: "AESDR · Affiliates",
        headline: "Set your password.",
        body,
        ctaUrl: args.actionLink,
        ctaLabel: "Set password & sign in",
      }),
      text: `${args.displayName} — your AESDR affiliate account is set up.\n\nSet your password and sign in:\n${args.actionLink}\n\nIf the link has expired, use "Forgot password" at ${SITE}/login with this email.`,
    })
  );
}

function affiliateApplicationHtml(p: AffiliateApplicationPayload): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 16px 8px 0;font-family:'SF Mono',Consolas,monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;vertical-align:top;width:170px">${esc(label)}</td>
      <td style="padding:8px 0;font-family:Georgia,'Source Serif 4',serif;font-size:15px;color:#1A1A1A;vertical-align:top;line-height:1.6;word-break:break-word">${value}</td>
    </tr>`;

  const utmParts = [
    p.utmSource && `source=${esc(p.utmSource)}`,
    p.utmMedium && `medium=${esc(p.utmMedium)}`,
    p.utmCampaign && `campaign=${esc(p.utmCampaign)}`,
    p.utmContent && `content=${esc(p.utmContent)}`,
  ].filter(Boolean).join(" &middot; ") || `<span style="color:#6B6B6B">(none)</span>`;

  const linkSafe = esc(p.linkUrl);
  const linkHtml = /^https?:\/\//i.test(p.linkUrl)
    ? `<a href="${linkSafe}" style="color:#8B1A1A;text-decoration:underline">${linkSafe}</a>`
    : linkSafe;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Affiliate application</title></head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF7F2;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;width:100%;background:#FFFFFF;border:1px solid #E8E4DF;">
      <tr><td style="padding:28px 32px 8px 32px;">
        <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
          AESDR &middot; Affiliate Application
        </p>
      </td></tr>
      <tr><td style="padding:0 32px 12px 32px;">
        <h1 style="margin:0;font-family:Georgia,'Playfair Display',serif;font-style:italic;font-weight:700;font-size:32px;line-height:1.15;color:#1A1A1A;">
          ${esc(p.applicantName)}
        </h1>
      </td></tr>
      <tr><td style="padding:0 32px 24px 32px;">
        <p style="margin:8px 0 0;font-family:Georgia,'Source Serif 4',serif;font-size:15px;line-height:1.6;color:#6B6B6B;font-style:italic;">
          ${esc(p.primaryChannel)} &middot; ${esc(p.audienceSize)}
        </p>
      </td></tr>
      <tr><td style="padding:0 32px 24px 32px;border-top:1px solid #E8E4DF;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px">
          ${row("Audience", esc(p.audienceDescriptor))}
          ${row("Link", linkHtml)}
          ${row("UTM", utmParts)}
          ${row("Submitted", esc(p.submittedAt))}
          ${row("IP hash", esc(p.ipHash || "(none)"))}
          ${row("User agent", esc(p.userAgent || "(none)"))}
        </table>
      </td></tr>
      <tr><td style="padding:0 32px 32px 32px;">
        <p style="margin:0;font-family:Georgia,'Source Serif 4',serif;font-size:13px;line-height:1.6;color:#6B6B6B;font-style:italic;">
          Persisted to <code style="font-family:'SF Mono',Consolas,monospace;font-size:12px;background:#FAF7F2;padding:1px 6px;">affiliate_applications</code> in Supabase.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Teams Inquiry Notification (internal, to founder) ───
// Triggered from the /enterprise/contact server action when a B2B prospect
// or channel partner submits the inquiry form. Routed to hello@aesdr.com
// with subject prefix [/enterprise inquiry] for inbox triage.

export type TeamsInquiryPayload = {
  name: string;
  email: string;
  company: string;
  role: string;
  teamSize: string;
  message: string;
  source: string;
  ipHash?: string | null;
  userAgent?: string | null;
  submittedAt: string;
};

export async function sendTeamsInquiryNotification(payload: TeamsInquiryPayload) {
  const recipient = process.env.EMAIL_RECIPIENT || "hello@aesdr.com";
  const from = process.env.EMAIL_FROM || FROM;
  const subject = `[/enterprise inquiry] ${payload.role} from ${payload.company} (${payload.teamSize})`;
  return safeSend(`enterprise-inquiry from ${payload.company}`, () =>
    getResend().emails.send({
      from,
      to: recipient,
      replyTo: payload.email,
      subject,
      html: teamsInquiryHtml(payload),
      text: teamsInquiryText(payload),
    })
  );
}

function teamsInquiryText(p: TeamsInquiryPayload): string {
  return [
    `New /enterprise inquiry — ${p.company}`,
    "",
    `Name:        ${p.name}`,
    `Email:       ${p.email}`,
    `Company:     ${p.company}`,
    `Role:        ${p.role}`,
    `Team size:   ${p.teamSize}`,
    `Source:      ${p.source}`,
    `Submitted:   ${p.submittedAt}`,
    `IP hash:     ${p.ipHash || "(none)"}`,
    `User agent:  ${p.userAgent || "(none)"}`,
    "",
    "What brought them here:",
    "---",
    p.message || "(none provided)",
    "---",
    "",
    `Reply directly to this email — Reply-To is set to ${p.email}.`,
  ].join("\n");
}

function teamsInquiryHtml(p: TeamsInquiryPayload): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 16px 8px 0;font-family:'SF Mono',Consolas,monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;vertical-align:top;width:170px">${esc(label)}</td>
      <td style="padding:8px 0;font-family:Georgia,'Source Serif 4',serif;font-size:15px;color:#1A1A1A;vertical-align:top;line-height:1.6;word-break:break-word">${value}</td>
    </tr>`;

  const emailHtml = `<a href="mailto:${esc(p.email)}" style="color:#8B1A1A;text-decoration:underline">${esc(p.email)}</a>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Teams inquiry</title></head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF7F2;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;width:100%;background:#FFFFFF;border:1px solid #E8E4DF;">
      <tr><td style="padding:28px 32px 8px 32px;">
        <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
          AESDR &middot; /enterprise inquiry
        </p>
      </td></tr>
      <tr><td style="padding:0 32px 4px 32px;">
        <h1 style="margin:0;font-family:Georgia,'Playfair Display',serif;font-style:italic;font-weight:700;font-size:30px;line-height:1.15;color:#1A1A1A;">
          ${esc(p.company)}
        </h1>
      </td></tr>
      <tr><td style="padding:0 32px 24px 32px;">
        <p style="margin:6px 0 0;font-family:Georgia,'Source Serif 4',serif;font-size:15px;line-height:1.6;color:#6B6B6B;font-style:italic;">
          ${esc(p.role)} &middot; ${esc(p.teamSize)} &middot; via ${esc(p.source)}
        </p>
      </td></tr>
      <tr><td style="padding:0 32px 24px 32px;border-top:1px solid #E8E4DF;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px">
          ${row("Name", esc(p.name))}
          ${row("Email", emailHtml)}
          ${row("Submitted", esc(p.submittedAt))}
          ${row("IP hash", esc(p.ipHash || "(none)"))}
          ${row("User agent", esc(p.userAgent || "(none)"))}
        </table>
      </td></tr>
      ${p.message ? `<tr><td style="padding:8px 32px 24px 32px;border-top:1px solid #E8E4DF;">
        <p style="margin:16px 0 8px;font-family:'SF Mono',Consolas,monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;">
          What brought them here
        </p>
        <p style="margin:0;font-family:Georgia,'Source Serif 4',serif;font-size:15px;line-height:1.65;color:#1A1A1A;white-space:pre-wrap;">${esc(p.message)}</p>
      </td></tr>` : ""}
      <tr><td style="padding:0 32px 32px 32px;">
        <p style="margin:0;font-family:Georgia,'Source Serif 4',serif;font-size:13px;line-height:1.6;color:#6B6B6B;font-style:italic;">
          Reply directly to this email &mdash; Reply-To is set to ${emailHtml}.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Prospect Conversation Request (internal, to founder) ───
// Fires the FIRST time a tracked prospect inside the /x/* affiliate-experience
// clicks the "Request an affiliate conversation" KitCta. Dedup happens at the
// call site (the /x/track route counts existing events for this slug before
// invoking this function), so refreshes / multi-page clicks won't double-send.
// Routed to EMAIL_RECIPIENT with replyTo set to the same address so a reply
// just threads back to your own inbox.

export type ProspectConversationRequestPayload = {
  /** Opaque slug from the ?p= link */
  slug: string;
  /** Display name from affiliate_prospects (what YOU named them when minting) */
  displayName: string | null;
  /** Path on which the prospect was when they clicked the CTA */
  path: string | null;
  /** Country from Vercel IP header, two-letter code */
  country: string | null;
  /** "desktop" or "mobile" */
  device: string | null;
  /** Total events recorded for this prospect so far (engagement-depth signal) */
  totalEvents: number;
  /** Submitted-at ISO timestamp */
  submittedAt: string;
};

export async function sendProspectConversationRequestEmail(
  p: ProspectConversationRequestPayload,
): Promise<boolean> {
  const recipient = process.env.EMAIL_RECIPIENT;
  if (!recipient) {
    console.warn(
      "[email] EMAIL_RECIPIENT not set; skipping prospect-conversation notification.",
    );
    return false;
  }
  const from = process.env.EMAIL_FROM || FROM;
  const label = p.displayName || p.slug;
  const subject = `[/x/kit] ${label} requested a conversation`;
  return safeSend(`prospect-conversation from ${label}`, () =>
    getResend().emails.send({
      from,
      to: recipient,
      replyTo: recipient,
      subject,
      html: prospectConversationRequestHtml(p),
      text: prospectConversationRequestText(p),
    }),
  );
}

function prospectConversationRequestText(
  p: ProspectConversationRequestPayload,
): string {
  return [
    `Prospect requested a conversation — ${p.displayName || p.slug}`,
    "",
    `Display name:   ${p.displayName || "(none — slug only)"}`,
    `Slug:           ${p.slug}`,
    `Last page:      ${p.path || "(unknown)"}`,
    `Device:         ${p.device || "(unknown)"}`,
    `Country:        ${p.country || "(unknown)"}`,
    `Total events:   ${p.totalEvents}`,
    `Clicked at:     ${p.submittedAt}`,
    "",
    `Open the dashboard: ${SITE}/x/ops`,
    "",
    `Reach back out using whatever channel you used to send them the link.`,
  ].join("\n");
}

function prospectConversationRequestHtml(
  p: ProspectConversationRequestPayload,
): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 16px 8px 0;font-family:'SF Mono',Consolas,monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;vertical-align:top;width:170px">${esc(label)}</td>
      <td style="padding:8px 0;font-family:Georgia,'Source Serif 4',serif;font-size:15px;color:#1A1A1A;vertical-align:top;line-height:1.6;word-break:break-word">${value}</td>
    </tr>`;

  const headline = p.displayName
    ? `${esc(p.displayName)} wants to talk.`
    : `Prospect <code style="font-family:'SF Mono',Consolas,monospace;font-size:24px;background:#FAF7F2;padding:1px 8px;">${esc(p.slug)}</code> wants to talk.`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Conversation requested</title></head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF7F2;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;width:100%;background:#FFFFFF;border:1px solid #E8E4DF;">
      <tr><td style="height:4px;background:linear-gradient(90deg,#8B1A1A 0%,#b4455d 50%,#8B5CF6 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:28px 32px 8px 32px;">
        <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#8B1A1A;font-weight:700;">
          AESDR &middot; Affiliate Kit &middot; Conversation requested
        </p>
      </td></tr>
      <tr><td style="padding:0 32px 12px 32px;">
        <h1 style="margin:0;font-family:Georgia,'Playfair Display',serif;font-style:italic;font-weight:700;font-size:30px;line-height:1.15;color:#1A1A1A;">
          ${headline}
        </h1>
      </td></tr>
      <tr><td style="padding:0 32px 24px 32px;">
        <p style="margin:8px 0 0;font-family:Georgia,'Source Serif 4',serif;font-size:15px;line-height:1.65;color:#6B6B6B;font-style:italic;">
          They clicked the kit&rsquo;s Request-conversation CTA. You named them when you minted their link — reach back out using whatever channel you used to send it.
        </p>
      </td></tr>
      <tr><td style="padding:0 32px 24px 32px;border-top:1px solid #E8E4DF;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px">
          ${row("Display name", esc(p.displayName || "(none — slug only)"))}
          ${row("Slug", `<code style="font-family:'SF Mono',Consolas,monospace;font-size:13px;background:#FAF7F2;padding:1px 6px;">${esc(p.slug)}</code>`)}
          ${row("Last page", esc(p.path || "(unknown)"))}
          ${row("Device", esc(p.device || "(unknown)"))}
          ${row("Country", esc(p.country || "(unknown)"))}
          ${row("Total events", String(p.totalEvents))}
          ${row("Clicked at", esc(p.submittedAt))}
        </table>
      </td></tr>
      <tr><td style="padding:0 32px 32px 32px;">
        <a href="${SITE}/x/ops" style="display:inline-block;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#FFFFFF;background:#8B1A1A;padding:13px 24px;text-decoration:none;">
          Open the ops dashboard &rarr;
        </a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Prospect Enterprise Intent (internal, to founder) ───
// Fires the FIRST time a tracked prospect inside the /x/* affiliate-experience
// submits the three-field "enterprise wiring" panel on /x/kit/what-you-earn.
// Same dedup-on-server pattern as the conversation-request notifier: the
// /x/track route counts existing events of this name before invoking.

export type ProspectEnterpriseIntentPayload = {
  slug: string;
  displayName: string | null;
  biggestDeal: string;
  dealDate1: string | null;
  dealDate2: string | null;
  salesCycle: string;
  verticals: string;
  path: string | null;
  country: string | null;
  device: string | null;
  submittedAt: string;
};

export async function sendProspectEnterpriseIntentEmail(
  p: ProspectEnterpriseIntentPayload,
): Promise<boolean> {
  const recipient = process.env.EMAIL_RECIPIENT;
  if (!recipient) {
    console.warn(
      "[email] EMAIL_RECIPIENT not set; skipping enterprise-intent notification.",
    );
    return false;
  }
  const from = process.env.EMAIL_FROM || FROM;
  const label = p.displayName || p.slug;
  const subject = `[/x/kit] ${label} submitted for the enterprise track`;
  return safeSend(`prospect-enterprise-intent from ${label}`, () =>
    getResend().emails.send({
      from,
      to: recipient,
      replyTo: recipient,
      subject,
      html: prospectEnterpriseIntentHtml(p),
      text: prospectEnterpriseIntentText(p),
    }),
  );
}

function prospectEnterpriseIntentText(
  p: ProspectEnterpriseIntentPayload,
): string {
  const dateLine =
    [p.dealDate1, p.dealDate2].filter(Boolean).join("  ·  ") || "(none)";
  return [
    `Enterprise-track submission — ${p.displayName || p.slug}`,
    "",
    `Display name:   ${p.displayName || "(none — slug only)"}`,
    `Slug:           ${p.slug}`,
    "",
    "── LAST 1–2 PARTNERSHIPS PLACED ──",
    p.biggestDeal,
    `When:           ${dateLine}`,
    "",
    "── TYPICAL TIME TO SIGN TEAM/ENTERPRISE PARTNERSHIPS ──",
    p.salesCycle,
    "",
    "── SECTORS / FUNCTIONS (LAST 6 MONTHS) ──",
    p.verticals,
    "",
    `Submitted at:   ${p.submittedAt}`,
    `Last page:      ${p.path || "(unknown)"}`,
    `Device:         ${p.device || "(unknown)"}`,
    `Country:        ${p.country || "(unknown)"}`,
    "",
    `Dashboard: ${SITE}/x/ops`,
    `Enterprise hub: ${SITE}/enterprise`,
  ].join("\n");
}

function prospectEnterpriseIntentHtml(
  p: ProspectEnterpriseIntentPayload,
): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:14px 0 4px;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#6B6B6B">${esc(label)}</td>
    </tr>
    <tr>
      <td style="padding:0 0 12px;font-family:Georgia,'Source Serif 4',serif;font-size:15px;line-height:1.55;color:#1A1A1A;border-bottom:1px solid #E8E4DF">${esc(value)}</td>
    </tr>`;

  const dateLine =
    [p.dealDate1, p.dealDate2].filter(Boolean).join("  ·  ") || "(none)";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Enterprise-track submission</title></head>
<body style="margin:0;padding:0;background:#1A1A1A;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#1A1A1A;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;width:100%;background:#FAF7F2;border:1px solid #1A1A1A;">
      <tr><td style="height:4px;background:linear-gradient(90deg,#FF006E,#FF6B00,#F59E0B,#10B981,#38BDF8,#8B5CF6,#FF006E);font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:28px 32px 8px 32px;">
        <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#8B1A1A;font-weight:700;">
          AESDR &middot; Enterprise track &middot; Submission
        </p>
      </td></tr>
      <tr><td style="padding:0 32px 8px 32px;">
        <h1 style="margin:0;font-family:Georgia,'Playfair Display',serif;font-style:italic;font-weight:700;font-size:30px;line-height:1.15;color:#1A1A1A;">
          ${esc(p.displayName || p.slug)} wants the enterprise track.
        </h1>
      </td></tr>
      <tr><td style="padding:0 32px 16px 32px;">
        <p style="margin:6px 0 0;font-family:Georgia,'Source Serif 4',serif;font-size:15px;line-height:1.55;color:#6B6B6B;font-style:italic;">
          They filled the qualifier on /x/kit/what-you-earn. Read their
          answers below, then decide whether to link them into the
          enterprise hub.
        </p>
      </td></tr>
      <tr><td style="padding:0 32px 24px 32px;border-top:1px solid #E8E4DF;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px">
          ${row("Last 1–2 partnerships placed", p.biggestDeal)}
          ${row("Dates (selected)", dateLine)}
          ${row("Typical time to sign team/enterprise partnerships", p.salesCycle)}
          ${row("Sectors / functions (last 6 months)", p.verticals)}
        </table>
      </td></tr>
      <tr><td style="padding:0 32px 32px 32px;">
        <a href="${SITE}/x/ops" style="display:inline-block;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#FFFFFF;background:#1A1A1A;padding:13px 24px;text-decoration:none;margin-right:8px;">
          Open ops dashboard &rarr;
        </a>
        <a href="${SITE}/enterprise" style="display:inline-block;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#1A1A1A;background:transparent;border:1.5px solid #1A1A1A;padding:11.5px 24px;text-decoration:none;">
          Enterprise hub &rarr;
        </a>
      </td></tr>
      <tr><td style="padding:0 32px 28px 32px;">
        <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B;">
          Slug: <code style="background:#FFFFFF;padding:1px 6px;font-size:12px;">${esc(p.slug)}</code>
        </p>
        <p style="margin:6px 0 0;font-family:Georgia,'Source Serif 4',serif;font-size:13px;line-height:1.55;color:#6B6B6B;font-style:italic;">
          ${esc(p.path || "(unknown)")} &middot; ${esc(p.device || "(unknown)")} &middot; ${esc(p.country || "(unknown)")} &middot; ${esc(p.submittedAt)}
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Welcome Email (immediate after purchase) ───

// R4-IC-7: `sessionId` is optional for backward-compat, but the webhook should
// pass the Stripe checkout session id so concurrent Stripe retries de-dupe on
// `welcome:<sessionId>` at Resend instead of double-sending the welcome.
// AUDIT: R4-IC-7 — the sibling-owned Stripe webhook caller
// (app/api/webhooks/stripe/route.ts:247) should pass `session.id` here.
export async function sendWelcomeEmail(
  to: string,
  name: string,
  tempPassword: string | null,
  sessionId?: string,
) {
  const loginUrl = `${SITE}/login?email=${encodeURIComponent(to)}`;
  const html = welcomeHtml(name, to, loginUrl, tempPassword);
  return safeSend(`welcome to ${to}`, () =>
    getResend().emails.send(
      {
        from: FROM,
        to,
        headers: UNSUBSCRIBE_HEADERS,
        subject: "You're in. Start here.",
        html,
        text: htmlToText(html),
        tags: [{ name: 'kind', value: 'welcome' }],
      },
      sessionId ? { idempotencyKey: `welcome:${sessionId}` } : undefined,
    )
  );
}

function welcomeHtml(name: string, email: string, loginUrl: string, tempPassword: string | null) {
  const safeName = esc(name);
  const safeEmail = esc(email);
  const greeting = name && name !== 'there' ? `Welcome, ${safeName}.` : 'Welcome.';
  const passwordRow = tempPassword
    ? `
      <tr>
        <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#64748B;width:180px;vertical-align:top">Temporary password</td>
        <td style="padding:6px 0;vertical-align:top">
          <code style="display:inline-block;background:#1A1A1A;color:#FAF7F2;padding:8px 14px;border-radius:4px;font-family:'SF Mono',Consolas,monospace;font-size:15px;letter-spacing:2px;font-weight:700">${esc(tempPassword)}</code>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#64748B;font-style:italic;line-height:1.6">
          You'll be prompted to set your own password on first sign-in.
        </td>
      </tr>`
    : `
      <tr>
        <td colspan="2" style="padding:6px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#64748B;font-style:italic;line-height:1.6">
          Use your existing password to sign in.
        </td>
      </tr>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Welcome to AESDR</title>
</head>
<body style="margin:0;padding:0;background:#F5F3EE;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F5F3EE;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E8E3D8;">

        <!-- Iris shimmer accent bar -->
        <tr>
          <td style="height:4px;background:linear-gradient(90deg,#FF006E 0%,#FF6B00 17%,#F59E0B 34%,#10B981 51%,#38BDF8 68%,#8B5CF6 85%,#FF006E 100%);font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- Mascot: doctrine pose (brand-voice) -->
        ${mascotRow("doctrine", 180)}

        <!-- Header / monogram -->
        <tr>
          <td style="padding:24px 48px 8px 48px;">
            <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#94A3B8;">
              AESDR &middot; Member No. ${Math.floor(Math.random() * 900 + 100)}
            </p>
          </td>
        </tr>

        <!-- Editorial headline -->
        <tr>
          <td style="padding:0 48px 8px 48px;">
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:44px;line-height:1.08;letter-spacing:-0.01em;color:#1A1A1A;">
              ${greeting}
            </h1>
          </td>
        </tr>

        <tr>
          <td style="padding:0 48px 32px 48px;">
            <p style="margin:16px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.7;color:#334155;font-style:italic;">
              You're in. No orientation video to sit through, no onboarding checklist to clear first — the next click drops you straight into Course 1.
            </p>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 48px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr><td style="border-top:1px solid #E8E3D8;font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>

        <!-- Credentials block -->
        <tr>
          <td style="padding:28px 48px 8px 48px;">
            <p style="margin:0 0 18px;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#8B1A1A;font-weight:700;">
              Your credentials
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAFAF7;border:1px solid #E8E3D8;border-left:3px solid #8B1A1A;">
              <tr>
                <td style="padding:24px 24px 20px 24px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#64748B;width:180px;vertical-align:top">Email</td>
                      <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#1A1A1A;vertical-align:top;word-break:break-all">${safeEmail}</td>
                    </tr>
                    ${passwordRow}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td style="padding:32px 48px 8px 48px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#1A1A1A;">
                  <a href="${loginUrl}" style="display:inline-block;padding:18px 40px;font-family:'SF Mono',Consolas,monospace;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;font-weight:700;">
                    Sign In &amp; Begin &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- The work -->
        <tr>
          <td style="padding:40px 48px 0 48px;">
            <p style="margin:0 0 10px;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#94A3B8;">
              Course 1 &middot; The Fundamentals
            </p>
            <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.7;color:#334155;">
              Course 1 covers your first 90 days in the seat: how to build real camaraderie inside your AE-SDR partnership and lay the foundation most AEs and SDRs only wish they'd had by week one.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding:10px 0;border-top:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#334155;">
                  <strong style="color:#1A1A1A;">Twelve courses</strong>, three lessons each, with interactive exercises rather than video lectures you'll never finish.
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-top:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#334155;">
                  <strong style="color:#1A1A1A;">Progress saves.</strong> Close the tab mid-lesson at 11pm and the next time you sign in, you're back on the same screen you left.
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-top:1px solid #E8E3D8;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#334155;">
                  <strong style="color:#1A1A1A;">Seven substantial assets come with the course</strong> — the ROI &amp; Commission Defense Tracker, the AE/SDR Alignment Contract, and the CRM Survival Guide among them. Each one is yours the moment you finish the lesson that builds it — plus the 72-Hour Strike Plan, which opens when you finish all twelve courses.
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Help -->
        <tr>
          <td style="padding:36px 48px 0 48px;">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.7;color:#334155;">
              <strong style="color:#1A1A1A;">If you need anything:</strong> reply here, or write to <a href="mailto:hello@aesdr.com" style="color:#8B1A1A;text-decoration:underline;">hello@aesdr.com</a>. Real person, real inbox, 48-hour response.
            </p>
          </td>
        </tr>

        <!-- Sign-off -->
        <tr>
          <td style="padding:32px 48px 40px 48px;">
            <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.5;color:#1A1A1A;font-style:italic;">
              Begin.
            </p>
            <p style="margin:24px 0 0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#94A3B8;">
              &mdash; Antaeus
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 48px 32px 48px;">
            ${emailFooterInner(email)}
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ─── Purchase Receipt Email ───

// R4-IC-7 / R4-DR-10: `sessionId` (the Stripe checkout session id) is optional
// for backward-compat but should be passed by the webhook so (a) the receipt
// number is STABLE across Stripe retries / resends, and (b) the Resend send
// carries a deterministic idempotencyKey. When absent we fall back to a
// render-time number (non-reproducible — the pre-fix behavior).
// AUDIT: R4-IC-7 — the sibling-owned Stripe webhook caller
// (app/api/webhooks/stripe/route.ts:253) should pass `session.id` here.
export async function sendReceiptEmail(
  to: string,
  name: string,
  tier: string,
  amountCents: number,
  sessionId?: string,
) {
  const html = receiptHtml(name, tier, amountCents, sessionId, to);
  return safeSend(`receipt to ${to}`, () =>
    getResend().emails.send(
      {
        from: FROM,
        to,
        headers: UNSUBSCRIBE_HEADERS,
        subject: 'Your AESDR receipt — keep this for your records',
        html,
        text: htmlToText(html),
        tags: [{ name: 'kind', value: 'receipt' }],
      },
      // idempotencyKey is a request option (2nd arg), not a payload field.
      sessionId ? { idempotencyKey: `receipt:${sessionId}` } : undefined,
    )
  );
}

/** Stable, reproducible receipt number derived from the Stripe session id. */
function receiptNumberFor(sessionId?: string): string {
  if (sessionId) {
    // Deterministic short token from the session id — same input, same number,
    // so a resend / Stripe retry shows the buyer one receipt number, not two.
    const hash = crypto.createHash('sha256').update(sessionId).digest('hex');
    return `AESDR-${hash.toUpperCase().slice(0, 8)}`;
  }
  return `AESDR-${Date.now().toString(36).toUpperCase().slice(-8)}`;
}

// R4-DR-8: the receipt is the only record of WHAT the buyer bought, so the
// 'ae'/'sdr' tracks must be named — not both flattened to "Individual".
function receiptPlanLabel(tier: string): string {
  switch (tier) {
    case 'team': return 'Team';
    case 'ae': return 'AE Track';
    case 'sdr': return 'SDR Track';
    default: return 'Individual';
  }
}

function receiptHtml(name: string, tier: string, amountCents: number, sessionId?: string, email?: string) {
  const safeName = esc(name);
  // R4-DR-10: coerce defensively so a non-number never renders "$NaN".
  const amount = ((Number(amountCents) || 0) / 100).toFixed(2);
  const planLabel = receiptPlanLabel(tier);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const receiptNo = receiptNumberFor(sessionId);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>AESDR Purchase Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#F5F3EE;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F5F3EE;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E8E3D8;">

        <!-- Iris shimmer accent bar -->
        <tr>
          <td style="height:4px;background:linear-gradient(90deg,#FF006E 0%,#FF6B00 17%,#F59E0B 34%,#10B981 51%,#38BDF8 68%,#8B5CF6 85%,#FF006E 100%);font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- Mascot: doctrine pose (brand-voice for receipts) -->
        ${mascotRow("doctrine", 160)}

        <!-- Kicker -->
        <tr>
          <td style="padding:24px 48px 6px 48px;">
            <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#8B1A1A;font-weight:700;">
              Purchase Confirmed
            </p>
          </td>
        </tr>

        <!-- Editorial headline -->
        <tr>
          <td style="padding:0 48px 6px 48px;">
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:36px;line-height:1.1;letter-spacing:-0.01em;color:#1A1A1A;">
              A record of your purchase.
            </h1>
          </td>
        </tr>

        <tr>
          <td style="padding:0 48px 28px 48px;">
            <p style="margin:16px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:#334155;font-style:italic;">
              Hey ${safeName} &mdash; thank you. Keep this note for your records.
            </p>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 48px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr><td style="border-top:1px solid #E8E3D8;font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>

        <!-- Line items -->
        <tr>
          <td style="padding:28px 48px 8px 48px;">
            <p style="margin:0 0 18px;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#94A3B8;">
              Receipt &middot; ${receiptNo}
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAFAF7;border:1px solid #E8E3D8;border-left:3px solid #8B1A1A;">
              <tr>
                <td style="padding:20px 24px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#64748B;width:180px;vertical-align:top">Plan</td>
                      <td style="padding:10px 0;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#1A1A1A;vertical-align:top">AESDR ${planLabel}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#64748B;vertical-align:top">Date</td>
                      <td style="padding:10px 0;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#1A1A1A;vertical-align:top">${date}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#64748B;vertical-align:top">Refund window</td>
                      <td style="padding:10px 0;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#1A1A1A;vertical-align:top">14 days from purchase</td>
                    </tr>
                    <tr>
                      <td style="padding:16px 0 6px;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#1A1A1A;font-weight:700;vertical-align:top">Amount paid</td>
                      <td style="padding:16px 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1;color:#1A1A1A;vertical-align:top;font-weight:400">$${amount}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Invoice note -->
        <tr>
          <td style="padding:28px 48px 0 48px;">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.7;color:#334155;">
              Need a formal invoice, VAT details, or a billing change? Reply here and we'll handle it. Questions go to <a href="mailto:hello@aesdr.com" style="color:#8B1A1A;text-decoration:underline;">hello@aesdr.com</a>.
            </p>
          </td>
        </tr>

        <!-- Sign-off -->
        <tr>
          <td style="padding:32px 48px 40px 48px;">
            <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#94A3B8;">
              &mdash; Antaeus
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 48px 32px 48px;">
            ${emailFooterInner(email)}
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ─── Free reciprocity asset: Manager Archetype Map ───
// Sent when an AE/SDR drops their email on /free/manager-archetype-map.
// Goal: re-deliver the asset to their inbox so it survives a closed tab,
// and put one (1) low-pressure pointer to the full course in the same
// message. No follow-up sequence — that's a promise on the capture form.

export async function sendManagerArchetypeMap(to: string) {
  return safeSend(`manager-archetype-map to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "Your Manager Archetype Map",
      html: managerArchetypeMapHtml(to),
      text: htmlToText(managerArchetypeMapHtml(to)),
    })
  );
}

function managerArchetypeMapHtml(email?: string) {
  const archetypes = [
    {
      name: "The Coach",
      snapshot: "Asks. Listens. Mirrors you back to yourself.",
      move:
        "End your 1:1 with one decision you made this week, one you're stuck on, and the option you're leaning toward.",
    },
    {
      name: "The Operator",
      snapshot: "Owns the dashboard. The number is the conversation.",
      move:
        "Send a Friday five-line: last week's number, this week's, the gap, what's closing it, what isn't.",
    },
    {
      name: "The Closer",
      snapshot: "Wants in the room. Reads silence as you hiding the deal.",
      move:
        "Pre-brief them on one live deal mid-week. Tell them the part you're not sure about. Let them decide if they're joining.",
    },
    {
      name: "The Ghost",
      snapshot: "Skips. Reschedules. Surfaces only when something's wrong.",
      move:
        "Write your update. Don't ask for their time. Make the next step a yes/no question they can answer in 20 seconds.",
    },
  ];

  const rows = archetypes
    .map(
      (a) => `
    <tr>
      <td style="padding:18px 0;border-bottom:1px solid #E8E4DF">
        <p style="margin:0 0 4px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:20px;color:#1A1A1A">
          ${esc(a.name)}
        </p>
        <p style="margin:0 0 10px;font-family:Georgia,'Source Serif 4',serif;font-style:italic;font-size:14px;color:#6B6B6B">
          ${esc(a.snapshot)}
        </p>
        <p style="margin:0;font-family:'SF Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#8B1A1A">
          Try this in your next 1:1
        </p>
        <p style="margin:4px 0 0;font-family:Georgia,'Source Serif 4',serif;font-size:15px;line-height:1.6;color:#1A1A1A">
          ${esc(a.move)}
        </p>
      </td>
    </tr>`
    )
    .join("");

  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:620px;margin:0 auto;padding:32px 24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Free · Manager Archetype Map
  </p>
  <h1 style="margin:0 0 12px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:900;font-size:32px;line-height:1.1;color:#1A1A1A">
    Four kinds of manager.<br/>One of them signs your reviews.
  </h1>
  <p style="margin:0 0 24px;color:#6B6B6B;font-size:16px">
    Pinned here for your notebook. Skim it Sunday, try the line that matches your manager in your next 1:1.
    If it doesn't land, hit reply and tell me why — that's how the next version gets sharper.
  </p>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #E8E4DF">
    ${rows}
  </table>

  <p style="margin:28px 0 8px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B">
    Optional · One pointer · Then I'm out of your inbox
  </p>
  <p style="margin:0 0 12px">
    This is one asset from Course 3 of the full program — eleven more courses and seven substantial assets come with it, all backed by a 14-day refund if it doesn't deliver. One-time purchase, no subscription.
  </p>
  <p style="margin:0 0 24px">
    <a href="${SITE}/#pricing" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">See the full course →</a>
  </p>
  <p style="margin:0;color:#6B6B6B;font-size:14px">
    — Antaeus
  </p>
  ${footer(email)}
</div>`;
}

// ─── Lesson-completed nudge: 24h after a completion ───
// Capitalises on the warm "I just shipped a thing" moment. Names the
// next lesson, gives the rough time, removes the open-tab cost. Per
// behavioral audit H.2.5.

export async function sendLessonCompletedNudge(
  to: string,
  name: string,
  nextLessonId: string,
  nextLessonTitle: string,
  nextMinutes: number
) {
  return safeSend(`lesson-complete-nudge to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: `Next: ${nextLessonTitle} (~${nextMinutes} min)`,
      html: lessonCompletedNudgeHtml(name, nextLessonId, nextLessonTitle, nextMinutes, to),
      text: htmlToText(lessonCompletedNudgeHtml(name, nextLessonId, nextLessonTitle, nextMinutes, to)),
    })
  );
}

function lessonCompletedNudgeHtml(
  name: string,
  nextLessonId: string,
  nextLessonTitle: string,
  nextMinutes: number,
  email?: string
) {
  const safeName = esc(name);
  const safeTitle = esc(nextLessonTitle);
  const safeLesson = esc(nextLessonId);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Yesterday you finished a lesson
  </p>
  <p>Hey ${safeName},</p>
  <p>One down. Momentum's a fickle thing in self-paced courses — the gap between &ldquo;I'll do the next one tomorrow&rdquo; and &ldquo;I'll do the next one&rdquo; is where most curricula die.</p>
  <p>Next up is <strong>${safeTitle}</strong>, which runs roughly ${nextMinutes} minutes — and reusing the same calendar window you used yesterday is the cheapest decision you can make to keep the momentum going.</p>
  <p style="margin:20px 0">
    <a href="${SITE}/course/${safeLesson}" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Open ${safeTitle} →</a>
  </p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

// ─── Weekly framing: Sunday "this week" ───
// Mid-program engagement primer. Sent each Sunday to active learners who
// have started but not finished. Names what they're likely to encounter,
// not which lesson — the lesson is theirs to pick. Per H.3.3.

export async function sendWeeklyFraming(
  to: string,
  name: string,
  completed: number,
  total: number
) {
  return safeSend(`weekly-framing to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "What this week of the course asks of you",
      html: weeklyFramingHtml(name, completed, total, to),
      text: htmlToText(weeklyFramingHtml(name, completed, total, to)),
    })
  );
}

function weeklyFramingHtml(name: string, completed: number, total: number, email?: string) {
  const safeName = esc(name);
  // R4-DR-12: guard the thirds math. A non-positive `total` (bad/empty data)
  // would otherwise divide by zero and mislabel a zero-lesson learner as being
  // in the "final third"; clamp so completion/remaining never go negative.
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 1;
  const safeCompleted = Math.max(0, Math.min(Number(completed) || 0, safeTotal));
  const remaining = Math.max(0, safeTotal - safeCompleted);
  const stage =
    safeCompleted >= safeTotal
      ? "You've reached the end of the program — the last third is behind you. This week is about consolidating what stuck, not starting something new."
      : safeCompleted === 0
        ? "Week one is foundational — camaraderie, silos, how the team you're on actually works (and where it doesn't)."
        : safeCompleted < safeTotal / 3
          ? "You're in the foundation half. Expect short lessons that re-wire how you read your own pipeline and your own manager."
          : safeCompleted < (safeTotal * 2) / 3
            ? "Middle third — the harder lessons: prospecting math, the 30% rule, the CRM as a friend or witness. Heavier at-bats."
            : "Final third. Compensation realities, sober selling, the relationship-graph lesson nobody else teaches. Hardest of the three, because you'll recognize yourself in it.";
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Sunday framing
  </p>
  <p>Hey ${safeName},</p>
  <p>You're ${safeCompleted} of ${safeTotal} in. ${remaining > 0 ? `${remaining} to go.` : ""}</p>
  <p>${stage}</p>
  <p>You don't have to do all of it this week — one lesson is the whole assignment, and the calendar window you blocked when you signed up is enough to clear it.</p>
  <p style="margin:20px 0">
    <a href="${SITE}/dashboard" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Open the dashboard →</a>
  </p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

// ─── Win-back: silent post-refund-window cohort ───
// Sent once, ~45 days after purchase, only to customers who completed <3
// lessons and have been quiet for ≥30d. Frame is dignity-first, no
// guilt — explicit out-clause. Per H.4.4.

export async function sendWinBack(to: string, name: string) {
  return safeSend(`win-back to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "Is this still useful — or should we close the loop?",
      html: winBackHtml(name, to),
      text: htmlToText(winBackHtml(name, to)),
    })
  );
}

function winBackHtml(name: string, email?: string) {
  const safeName = esc(name);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · A clean check-in
  </p>
  <p>Hey ${safeName},</p>
  <p>You bought the course a few weeks back and haven't been in for a stretch. That can mean three different things, and all of them are fine.</p>
  <p style="border-left:3px solid #8B1A1A;padding:6px 0 6px 12px;margin:14px 0;font-style:italic;color:#1A1A1A">
    1. It wasn't a fit. Tell me why in one line and I'll learn something. The refund window's closed, but I'd still rather know.
  </p>
  <p style="border-left:3px solid #8B1A1A;padding:6px 0 6px 12px;margin:14px 0;font-style:italic;color:#1A1A1A">
    2. Life happened. Quota week, board prep, family. Reply with a date and I'll send you back a re-entry email then — once, no sequence.
  </p>
  <p style="border-left:3px solid #8B1A1A;padding:6px 0 6px 12px;margin:14px 0;font-style:italic;color:#1A1A1A">
    3. You'd actually like to start now — pick Course 1, block 25 minutes on the calendar this week, and hit it.
  </p>
  <p style="margin:20px 0">
    <a href="${SITE}/dashboard" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Open the dashboard →</a>
  </p>
  <p style="font-size:14px;color:#6B6B6B">If none of those land, no further emails on this — promise. The course is yours; it'll be here if and when you come back.</p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

// ─── Alumni re-engagement: 6 / 12 month mark ───
// Single touch, sent only to completers, focused on the alumni surface +
// (optionally) inviting them to share. Per H.5.3.

export async function sendAlumniReengagement(to: string, name: string, monthMark: 6 | 12) {
  return safeSend(`alumni-reengagement-${monthMark}m to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject:
        monthMark === 6
          ? "Six months in — what stuck?"
          : "A year of being AESDR-trained",
      html: alumniReengagementHtml(name, monthMark, to),
      text: htmlToText(alumniReengagementHtml(name, monthMark, to)),
    })
  );
}

function alumniReengagementHtml(name: string, monthMark: 6 | 12, email?: string) {
  const safeName = esc(name);
  const lede =
    monthMark === 6
      ? "Six months since you finished. Long enough for the lessons to have either landed or faded."
      : "A year since you finished. Long enough that the moves you now run on instinct — the Friday five-line, the bad-month conversation — stopped feeling like things you learned.";
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · ${monthMark} months in
  </p>
  <p>Hey ${safeName},</p>
  <p>${lede}</p>
  <p>Three things, briefly:</p>
  <ol style="line-height:1.8;padding-left:22px;margin:8px 0 16px">
    <li>The substantial assets are re-downloadable any time at <a href="${SITE}/alumni" style="color:#8B1A1A;text-decoration:underline">${SITE}/alumni</a>. Most alumni grab the 72-hour strike plan again around their next bad quarter.</li>
    <li>If something from the course actually helped this year, one sentence to <a href="${SITE}/account/review" style="color:#8B1A1A;text-decoration:underline">${SITE}/account/review</a> would be genuinely useful.</li>
    <li>If you know an AE or SDR in their first eighteen months who could use the course — share the free Manager Archetype Map at <a href="${SITE}/free/manager-archetype-map" style="color:#8B1A1A;text-decoration:underline">${SITE}/free/manager-archetype-map</a>. Cheaper than asking them to buy something.</li>
  </ol>
  <p style="margin:20px 0">
    <a href="${SITE}/alumni" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Open alumni surface →</a>
  </p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

// ─── Day 3 Drip Email ───

// ─── Day-0 (+12hr): "what to do first" ───
// Largest single retention lever in the product. Sent ~12 hours after
// purchase. Names the implementation-intention move concretely — pick a
// 25-minute window, put it in the calendar, do Course 1.1 in it. See
// behavioral audit §H.2.1.

export async function sendDay0PlusTwelveHours(to: string, name: string) {
  return safeSend(`day0+12h to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "Pick a 25-minute window. Put it on your calendar.",
      html: day0PlusTwelveHoursHtml(name, to),
      text: htmlToText(day0PlusTwelveHoursHtml(name, to)),
    })
  );
}

function day0PlusTwelveHoursHtml(name: string, email?: string) {
  const safeName = esc(name);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Welcome (1 of 2)
  </p>
  <p>Hey ${safeName},</p>
  <p>Whether AESDR helps you comes down to one thing the content can't do for you: whether you open Course 1 this week.</p>
  <p>Most AEs and SDRs who buy a program like this never start it, and the reason is rarely the program — it's that there's no obvious moment to begin. Tomorrow is already full, next week is already full, and then a month has gone by.</p>
  <p>The fix is dumb and it works:</p>
  <p style="margin:18px 0;padding:14px 18px;border-left:3px solid #8B1A1A;background:#FFFFFF;font-style:italic">
    Pick a 25-minute window in the next 48 hours and put it on your calendar — the real one, not your head. Do Course 1.1 in that window. Don't "find time"; choose a time.
  </p>
  <p>The hardest part of this course is the first 25 minutes. Once it's a calendar event, the lesson gets done.</p>
  <p><a href="${SITE}/dashboard" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px;margin:8px 0">Go to Course 1.1 →</a></p>
  <p>Reply to this email if anything's broken. Real person, real inbox.</p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

// ─── Day-0 (+36hr): "did you start" check-in ───
// Sent ~36 hours after purchase IF the user hasn't completed Course 1.1
// yet. Tone: friend nudging, not SaaS auto-emailer. Recovers 10–20% of
// would-be droppers. Audit §H.2.2.

export async function sendDay0PlusThirtySixHours(to: string, name: string) {
  return safeSend(`day0+36h to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "Two days in. Did you start?",
      html: day0PlusThirtySixHoursHtml(name),
      text: htmlToText(day0PlusThirtySixHoursHtml(name)),
    })
  );
}

function day0PlusThirtySixHoursHtml(name: string, email?: string) {
  const safeName = esc(name);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Welcome (2 of 2)
  </p>
  <p>Hey ${safeName},</p>
  <p>Quick check — did you get into Course 1 yet?</p>
  <p>If you did: good. The first lesson is the hardest activation. Everything after compounds.</p>
  <p>If you didn't: also fine. Here's what gets most people unstuck —</p>
  <p style="margin:18px 0;padding:14px 18px;border-left:3px solid #8B1A1A;background:#FFFFFF;font-style:italic">
    You're not short on time so much as short on a moment that says "now." Stop waiting for one. Block 25 minutes on tomorrow morning's calendar, before you open Slack, and that's the moment.
  </p>
  <p>If you're certain AESDR isn't for you, reply REFUND. We process within 3 business days, no questions. We don't want your money if it doesn't deliver value.</p>
  <p>If you want to talk through anything — the role you bought (SDR / AE), where to start, whether it fits your situation — reply to this email. Real reply, real human.</p>
  <p><a href="${SITE}/dashboard" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px;margin:8px 0">Open Course 1.1 →</a></p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

export async function sendDay3Email(to: string, name: string) {
  return safeSend(`day3 to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "How's Course 1 going?",
      html: day3Html(name, to),
      text: htmlToText(day3Html(name, to)),
    })
  );
}

function day3Html(name: string, email?: string) {
  const safeName = esc(name);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Day three
  </p>
  <p>Hey ${safeName},</p>
  <p>Three days in. If you've started Course 1, you're on track. If you haven't, no guilt — the course waits in your dashboard for whenever the week loosens up.</p>
  <p>One idea from Course 2 to keep in your back pocket through the rest of the week:</p>
  <p style="border-left:3px solid #8B1A1A;padding:6px 0 6px 14px;margin:14px 0;font-style:italic;color:#1A1A1A">
    There's a pattern where everyone in the org points at someone else. AEs and SDRs blame their manager, managers blame marketing, marketing blames the product. Nobody fixes anything.
  </p>
  <p>Course 2 lays out how to break that pattern across the team — not by being a hero on any single deal, but by asking the right questions in the right meetings consistently.</p>
  <p style="margin:20px 0">
    <a href="${SITE}/dashboard" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Continue where you left off →</a>
  </p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

// ─── Day 7 Drip Email ───

export async function sendDay7Email(to: string, name: string) {
  return safeSend(`day7 to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "Course 3 builds the one-pager your SDR actually reads",
      html: day7Html(name, to),
      text: htmlToText(day7Html(name, to)),
    })
  );
}

function day7Html(name: string, email?: string) {
  const safeName = esc(name);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Week one
  </p>
  <p>Hey ${safeName},</p>
  <p>You're roughly one week into the program, and most AESDR students at this point are finishing Course 3.</p>
  <p>Course 3 is where you build the <strong>AE/SDR Alignment Contract</strong> — a one-page document that gets both the AE and the SDR onto the same page about handoffs, expectations, and accountability, and it remains the single most downloaded artifact across the entire program.</p>
  <p>If you're ahead of that: good. Lessons 4–6 cover manager dynamics, career pathing, and the relationships that pay off two years out.</p>
  <p>If you're behind: also fine. Nobody's clocking your pace here — come back when you've got a clear twenty minutes.</p>
  <p style="margin:20px 0">
    <a href="${SITE}/course/3" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Open Course 3 →</a>
  </p>
  <p style="margin-top:24px">— Antaeus</p>
  <p style="margin-top:18px;font-size:13px;color:#6B6B6B"><em>P.S. — If something about the course isn't working for you, reply and tell me. I'd rather fix it than have you quietly disengage.</em></p>
  ${footer(email)}
</div>`;
}

// ─── Cart Abandonment: 1 Hour ───

export async function sendAbandon1hr(to: string) {
  return safeSend(`abandon-1hr to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "Still thinking it over?",
      html: abandon1hrHtml(to),
      text: htmlToText(abandon1hrHtml(to)),
    })
  );
}

function abandon1hrHtml(email?: string) {
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Saw you got close
  </p>
  <p>Hey,</p>
  <p>You got close to starting AESDR and stepped away. No judgment. Spending $249 on yourself when you're living on commission income is a real decision.</p>
  <p>Here's what I'd want to know if I were the one looking:</p>
  <p style="margin:14px 0 6px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:18px">What you're actually getting</p>
  <ul style="line-height:1.8;padding-left:22px;margin:0 0 14px">
    <li>Twelve interactive courses (not video lectures you'll never finish)</li>
    <li>Seven substantial assets you'll actually use — the ROI &amp; Commission Defense Tracker, the AE/SDR Alignment Contract, the CRM Survival Guide, and more</li>
    <li>A curriculum built by someone who carried a quota for nine years, not someone who read about it</li>
  </ul>
  <p style="margin:14px 0 6px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:18px">What you're not getting</p>
  <ul style="line-height:1.8;padding-left:22px;margin:0 0 14px">
    <li>Motivational content</li>
    <li>Generic scripts</li>
    <li>Anything that reads like a LinkedIn post</li>
  </ul>
  <p>If the money is the holdup, the 14-day refund is a real one: no questions, no email-tag negotiation. Run the program for a week. If it doesn't change how you work, reply REFUND inside the two-week window and the money goes back.</p>
  <p style="margin:20px 0">
    <a href="${SITE}/#pricing" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Complete your purchase →</a>
  </p>
  <p style="margin-top:24px">— Antaeus</p>
  <p style="margin-top:18px;font-size:13px;color:#6B6B6B"><em>P.S. — Course 1 covers your first 90 days in the seat: the manager types that make or break new AEs and SDRs inside the first quarter. If that's not where you are right now, save your money. If it is, you already know.</em></p>
  ${footer(email)}
</div>`;
}

// ─── Cart Abandonment: 24 Hours ───

export async function sendAbandon24hr(to: string) {
  return safeSend(`abandon-24hr to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "Quick question before I stop following up",
      html: abandon24hrHtml(to),
      text: htmlToText(abandon24hrHtml(to)),
    })
  );
}

function abandon24hrHtml(email?: string) {
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Last note on this
  </p>
  <p>Hey,</p>
  <p>Last email about this — promise.</p>
  <p>I talk to a lot of AEs and SDRs. The three reasons people don't invest in themselves are always the same:</p>
  <p style="margin:14px 0 4px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:18px">&ldquo;I can't afford it right now.&rdquo;</p>
  <p>Fair — commission months swing hard, and you know which weeks are thin. Here's the math, though: one framework from this course that helps you close one more deal this quarter pays for the course many times over. The course runs less than a decent dinner out.</p>
  <p style="margin:14px 0 4px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:18px">&ldquo;I don't have time.&rdquo;</p>
  <p>Each lesson runs alongside a full-time quota. No four-hour video modules. Interactive screens you can do on your commute or during a slow Friday.</p>
  <p style="margin:14px 0 4px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:18px">&ldquo;I've seen courses like this before.&rdquo;</p>
  <p>You haven't. This one doesn't teach you to &ldquo;smile and dial.&rdquo; It teaches you to audit your commission structure, manage a bad manager, build a professional network that actually helps you, and run a 72-hour action plan when everything goes sideways.</p>
  <p style="margin:20px 0">
    <a href="${SITE}/#pricing" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Complete your purchase →</a>
  </p>
  <p>14 days to try it. Full refund if it's not for you.</p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

// ─── Drop-Off Prevention: 5 Days ───

export async function sendDropoff5d(to: string, name: string, lessonId: string, lessonTitle: string) {
  return safeSend(`dropoff-5d to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "No rush — but your next lesson is ready",
      html: dropoff5dHtml(name, lessonId, lessonTitle, to),
      text: htmlToText(dropoff5dHtml(name, lessonId, lessonTitle, to)),
    })
  );
}

function dropoff5dHtml(name: string, lessonId: string, lessonTitle: string, email?: string) {
  const safeName = esc(name);
  const safeTitle = esc(lessonTitle);
  const safeLesson = esc(lessonId);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Five days since
  </p>
  <p>Hey ${safeName},</p>
  <p>Five days since you were last in the course. Probably nothing — week got loud, board prep, a deal slipped, normal stuff.</p>
  <p>You stopped at <strong>${safeTitle}</strong>. Picking it back up is one click:</p>
  <p><a href="${SITE}/course/${safeLesson}" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px;margin:8px 0">Continue ${safeTitle} →</a></p>
  <p>If something in the lesson felt off — boring, wrong, hard to follow — reply to this email and tell me. I'd rather fix the curriculum than have you fade out.</p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

// ─── Drop-Off Prevention: 10 Days ───

export async function sendDropoff10d(to: string, name: string) {
  return safeSend(`dropoff-10d to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "The Friday five-line — eight minutes, no login needed",
      html: dropoff10dHtml(name, to),
      text: htmlToText(dropoff10dHtml(name, to)),
    })
  );
}

function dropoff10dHtml(name: string, email?: string) {
  const safeName = esc(name);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Ten days since
  </p>
  <p>Hey ${safeName},</p>
  <p>Not going to chase. Instead, one actual thing from the course you haven't seen yet — useful whether or not you come back:</p>
  <p style="margin:18px 0 8px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:18px;color:#1A1A1A">The Friday five-line email</p>
  <p>Send your manager this, every Friday:</p>
  <ol style="line-height:1.8;padding-left:24px;margin:8px 0 16px">
    <li>What I did this week — metrics + context.</li>
    <li>One win.</li>
    <li>One blocker, with a proposed fix.</li>
    <li>One question for you.</li>
    <li>My plan for next week.</li>
  </ol>
  <p>Eight minutes. Flips the power dynamic in your 1:1 because you set the agenda. Creates a paper trail that protects you when a manager-archetype shifts at review time.</p>
  <p>That's one artifact from the managing your 'manager' course. The other 35 lessons each hand you something you can use the same week.</p>
  <p><a href="${SITE}/dashboard" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px;margin:8px 0">Pick it back up →</a></p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

// ─── Drop-Off Prevention: 21 Days ───

export async function sendDropoff21d(to: string, name: string, lessonId: string) {
  return safeSend(`dropoff-21d to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "Last check-in from us",
      html: dropoff21dHtml(name, lessonId, to),
      text: htmlToText(dropoff21dHtml(name, lessonId, to)),
    })
  );
}

function dropoff21dHtml(name: string, lessonId: string, email?: string) {
  const safeName = esc(name);
  const safeLesson = esc(lessonId);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Three weeks since — last note
  </p>
  <p>Hey ${safeName},</p>
  <p>Last re-engagement email from me. After this, no more nudges — you're on your own timeline, and that's fine.</p>
  <p>Three things before I go quiet:</p>
  <p style="margin:18px 0;padding:14px 18px;border-left:3px solid #8B1A1A;background:#FFFFFF;">
    <strong style="display:block;margin-bottom:6px;font-family:'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;font-size:12px;color:#1A1A1A">If it wasn't a fit</strong>
    Reply REFUND. Inside the 14-day window we process within 3 business days. Outside it, reply anyway — for AESDR, the refund window has been more guideline than rule when the buyer's been honest with me.
  </p>
  <p style="margin:18px 0;padding:14px 18px;border-left:3px solid #8B1A1A;background:#FFFFFF;">
    <strong style="display:block;margin-bottom:6px;font-family:'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;font-size:12px;color:#1A1A1A">If life happened</strong>
    Your progress is saved and your login still works. Come back in a week, a month, or next quarter when the deal slips and the lesson suddenly reads differently. Same account, same lessons, right where you left off.
  </p>
  <p style="margin:18px 0;padding:14px 18px;border-left:3px solid #8B1A1A;background:#FFFFFF;">
    <strong style="display:block;margin-bottom:6px;font-family:'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;font-size:12px;color:#1A1A1A">If something was wrong</strong>
    Reply with one line — what didn't land. I read every reply. The curriculum gets better when buyers tell me what felt off.
  </p>
  <p>If you want to pick up where you stopped: <a href="${SITE}/course/${safeLesson}" style="color:#8B1A1A;text-decoration:underline">continue here</a>.</p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

// ─── Review Request: Post-Completion ───

export async function sendReviewRequest(to: string, name: string) {
  return safeSend(`review-request to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "You finished all 12. How was it?",
      html: reviewRequestHtml(name, to),
      text: htmlToText(reviewRequestHtml(name, to)),
    })
  );
}

function reviewRequestHtml(name: string, email?: string) {
  const safeName = esc(name);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · You finished all 12
  </p>
  <p>Hey ${safeName},</p>
  <p>You just finished the entire AESDR curriculum. That's rare — most people don't finish most things.</p>
  <p>One screen. Sixty seconds. Rate it 1–5, drop one sentence. If you grade us 1–3, that's the one I read first — I'd rather hear what to fix than not.</p>
  <p style="margin:20px 0">
    <a href="${SITE}/account/review" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Leave a review →</a>
  </p>
  <p style="font-size:14px;color:#6B6B6B">Or just reply to this email if you'd rather type into your inbox. Both go to me.</p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

// ─── Review Request: Nudge (4 days after first, if no response) ───

export async function sendReviewNudge(to: string, name: string) {
  return safeSend(`review-nudge to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "30 seconds — that's all I need",
      html: reviewNudgeHtml(name, to),
      text: htmlToText(reviewNudgeHtml(name, to)),
    })
  );
}

function reviewNudgeHtml(name: string, email?: string) {
  const safeName = esc(name);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Follow-up
  </p>
  <p>Hey ${safeName},</p>
  <p>Last one on this from me. The review form is one screen, sixty seconds.</p>
  <p style="margin:20px 0">
    <a href="${SITE}/account/review" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Leave a review →</a>
  </p>
  <p style="font-size:14px;color:#6B6B6B">Or reply with one of: a number 1–5, a sentence to publish (first name + role only), or what to fix. Any of the three is genuinely useful.</p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

// ─── Shared footer ───

function footer(email?: string) {
  // AUDIT: CAN-SPAM physical address still required before bulk-mailing — no
  // postal address is on file yet, so contact routes to hello@ for now.
  return `
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0 16px">
  <p style="font-size:11px;color:#999;line-height:1.5">
    AESDR · <a href="mailto:hello@aesdr.com" style="color:#999">hello@aesdr.com</a><br>
    Questions? Message us at <a href="mailto:hello@aesdr.com" style="color:#999">hello@aesdr.com</a>.<br>
    <a href="${SITE}/contact" style="color:#999">Contact</a> · <a href="${SITE}/refund-policy" style="color:#999">Refund Policy</a><br>
    You're receiving this because you purchased or started a checkout at AESDR.<br>
    <a href="${unsubscribeLink(email)}" style="color:#999">Unsubscribe</a>, or reply with UNSUBSCRIBE.
  </p>`;
}

/**
 * Footer for the editorial/luxury-styled emails (welcome, receipt).
 * Designed to sit inside the 600px white card; uses Georgia/SF Mono
 * and the warm stone palette rather than the old grey utilitarian footer.
 */
function emailFooterInner(email?: string) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="border-top:1px solid #E8E3D8;padding-top:20px;">
        <p style="margin:0 0 10px;font-family:'SF Mono',Consolas,monospace;font-size:9px;letter-spacing:.28em;text-transform:uppercase;color:#94A3B8;">
          AESDR &middot; <a href="mailto:hello@aesdr.com" style="color:#94A3B8;text-decoration:none;">hello@aesdr.com</a>
        </p>
        <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:12px;line-height:1.6;color:#94A3B8;">
          Questions? Message us at <a href="mailto:hello@aesdr.com" style="color:#94A3B8;text-decoration:underline;">hello@aesdr.com</a>.
        </p>
        <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:12px;line-height:1.6;color:#94A3B8;">
          <a href="${SITE}/contact" style="color:#94A3B8;text-decoration:underline;">Contact</a>
          &nbsp;&middot;&nbsp;
          <a href="${SITE}/refund-policy" style="color:#94A3B8;text-decoration:underline;">Refund Policy</a>
        </p>
        <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:11px;line-height:1.6;color:#B0B5BD;font-style:italic;">
          You're receiving this because you purchased or started a checkout at AESDR.
          <a href="${unsubscribeLink(email)}" style="color:#B0B5BD;text-decoration:underline;">Unsubscribe</a>,
          or reply with UNSUBSCRIBE.
        </p>
        <!-- AUDIT: CAN-SPAM physical address still required before bulk-mailing -->
        <!-- (no postal/PO-box address on file yet; contact routes to hello@). -->
      </td>
    </tr>
  </table>`;
}

// ─── Team Invite Email ───

export async function sendTeamInviteEmail(to: string, inviterName: string, token: string) {
  return safeSend(`team-invite to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: `${esc(inviterName)} invited you to AESDR`,
      html: teamInviteHtml(inviterName, token, to),
      text: htmlToText(teamInviteHtml(inviterName, token, to)),
    })
  );
}

function teamInviteHtml(inviterName: string, token: string, email?: string) {
  const safeName = esc(inviterName);
  const acceptUrl = `${SITE}/team/accept?token=${encodeURIComponent(token)}`;
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · You've been added to a team
  </p>
  <p>Hey,</p>
  <p><strong>${safeName}</strong> added you to their team's AESDR account.</p>
  <p>AESDR is a twelve-course professional-development curriculum for AEs and SDRs in SaaS — interactive exercises and working frameworks, none of the motivational pep talk.</p>
  <div style="background:#fff;padding:18px 22px;margin:20px 0;border:1px solid #E8E4DF;border-left:3px solid #8B1A1A">
    <p style="margin:0 0 8px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:16px;color:#1A1A1A">What you get</p>
    <ul style="margin:0;padding-left:20px;line-height:1.75">
      <li>All twelve courses with interactive exercises</li>
      <li>Seven substantial assets (ROI &amp; Commission Defense Tracker, AE/SDR Alignment Contract, CRM Survival Guide, and more)</li>
      <li>Your own progress tracking and personalized substantial assets</li>
    </ul>
  </div>
  <p style="margin:24px 0">
    <a href="${acceptUrl}" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Accept invite &amp; start →</a>
  </p>
  <p>This invite is tied to your email address. Click the link above to create your account, or sign in if you already have one.</p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer(email)}
</div>`;
}

// ─── Lesson Complete Email ───
//
// Sent after a student marks a lesson as complete. Pose pulled from the
// canon lesson→pose mapping (doctrine for lessons 1/2/7/8/10, verdict for
// 3/4/11, fall for 5, sprint for 6, recovery for 9, owner for 12).
//
// Tone: dry "uncomfortable truths" register — no celebration confetti,
// no "great job!" — match the live landing voice. The pose carries the
// emotional content; the copy stays sober.

export async function sendLessonCompleteEmail(
  to: string,
  name: string,
  lessonId: string,
  lessonTitle: string
) {
  const isLast = lessonId === "12";
  const subject = isLast
    ? "Twelve done. Time to pick your keeper."
    : `Lesson ${lessonId} done. ${Number(lessonId) + 1} is the harder one.`;

  return safeSend(`lesson-complete-${lessonId} to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject,
      html: lessonCompleteHtml(name, lessonId, lessonTitle, to),
      text: htmlToText(lessonCompleteHtml(name, lessonId, lessonTitle, to)),
    })
  );
}

function lessonCompleteHtml(name: string, lessonId: string, lessonTitle: string, email?: string): string {
  const safeName = esc(name);
  const safeLessonId = esc(lessonId);
  const safeTitle = esc(lessonTitle);
  const isLast = lessonId === "12";
  const nextLesson = String(Number(lessonId) + 1);
  const pose = poseForLessonEmail(lessonId);

  const primaryHref = isLast ? `${SITE}/reveal` : `${SITE}/course/${nextLesson}`;
  const primaryLabel = isLast ? "Choose your keeper" : `Lesson ${nextLesson}`;

  const sub = isLast
    ? "You made it through all twelve. The shell did not stop."
    : bridgeAfter(lessonId) ?? `Lesson ${nextLesson} is harder.`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Lesson ${safeLessonId} complete | AESDR</title>
</head>
<body style="margin:0;padding:0;background:#F5F3EE;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F5F3EE;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E8E3D8;">

        <!-- Iris shimmer accent bar -->
        <tr>
          <td style="height:4px;background:linear-gradient(90deg,#FF006E 0%,#FF6B00 17%,#F59E0B 34%,#10B981 51%,#38BDF8 68%,#8B5CF6 85%,#FF006E 100%);font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- Lesson-mapped pose -->
        ${mascotRow(pose, 200)}

        <!-- Kicker -->
        <tr>
          <td style="padding:24px 48px 6px 48px;" align="center">
            <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#8B1A1A;font-weight:700;">
              Lesson ${safeLessonId} &middot; Complete
            </p>
          </td>
        </tr>

        <!-- Editorial headline (the lesson title) -->
        <tr>
          <td style="padding:0 48px 6px 48px;" align="center">
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-style:italic;font-size:32px;line-height:1.15;letter-spacing:-0.01em;color:#1A1A1A;">
              ${safeTitle}.
            </h1>
          </td>
        </tr>

        <!-- Sub copy -->
        <tr>
          <td style="padding:0 48px 32px 48px;" align="center">
            <p style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:#334155;font-style:italic;max-width:420px;">
              ${safeName ? `Hey ${safeName} &mdash; ` : ""}${sub}
            </p>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 48px 8px 48px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#1A1A1A;">
                  <a href="${primaryHref}" style="display:inline-block;padding:16px 36px;font-family:'SF Mono',Consolas,monospace;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;font-weight:700;">
                    ${primaryLabel} &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Secondary link -->
        <tr>
          <td style="padding:14px 48px 0 48px;" align="center">
            <a href="${SITE}/dashboard" style="font-family:'SF Mono',Consolas,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#94A3B8;text-decoration:none;">
              Back to all lessons
            </a>
          </td>
        </tr>

        ${isLast ? `
        <!-- Alumni room introduction — appears ONLY when isLast === true.
             Strict alumni-only Discord intro per founder direction. The
             room is gated to course-12 completers; this is the moment
             that gate opens. -->
        <tr>
          <td style="padding:40px 48px 0 48px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#1A1A1A;">
              <tr>
                <td style="padding:32px 36px 28px 36px;">
                  <p style="margin:0 0 12px;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:rgba(250,247,242,0.65);font-weight:700;">
                    Alumni room &middot; now open
                  </p>
                  <p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:700;font-size:24px;line-height:1.2;color:#FAF7F2;">
                    The Discord opens when you do.
                  </p>
                  <p style="margin:0 0 22px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.7;color:rgba(250,247,242,0.88);">
                    Small room. AEs and SDRs who finished the same twelve courses you just did. Where alumni post the post-mortems they wouldn't put in company Slack and ask the questions they can't ask their actual manager.
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background:#FAF7F2;">
                        <a href="https://discord.gg/uEpAz3yw" style="display:inline-block;padding:14px 28px;font-family:'SF Mono',Consolas,monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#1A1A1A;text-decoration:none;font-weight:700;">
                          Open the alumni room &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        <!-- Sign-off -->
        <tr>
          <td style="padding:36px 48px 36px 48px;" align="center">
            <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#94A3B8;">
              &mdash; Antaeus
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 48px 32px 48px;">
            ${emailFooterInner(email)}
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ─── Reveal Unlocked Email ───
//
// Sent after a student completes lesson 12 (or all lessons). The
// celebration moment — but in the dry "uncomfortable truths" register.
// Verdict pose: the moment of judgment.

export async function sendRevealUnlockedEmail(to: string, name: string) {
  return safeSend(`reveal-unlocked to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: bulkHeaders(to),
      subject: "Choose your keeper.",
      html: revealUnlockedHtml(name, to),
      text: htmlToText(revealUnlockedHtml(name, to)),
    })
  );
}

function revealUnlockedHtml(name: string, email?: string): string {
  const safeName = esc(name);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Choose your keeper | AESDR</title>
</head>
<body style="margin:0;padding:0;background:#F5F3EE;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F5F3EE;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E8E3D8;">

        <!-- Iris shimmer accent bar -->
        <tr>
          <td style="height:4px;background:linear-gradient(90deg,#FF006E 0%,#FF6B00 17%,#F59E0B 34%,#10B981 51%,#38BDF8 68%,#8B5CF6 85%,#FF006E 100%);font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- Verdict pose: the moment of judgment -->
        ${mascotRow("verdict", 220)}

        <!-- Kicker -->
        <tr>
          <td style="padding:24px 48px 6px 48px;" align="center">
            <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#8B1A1A;font-weight:700;">
              The Reveal &middot; Unlocked
            </p>
          </td>
        </tr>

        <!-- Editorial headline -->
        <tr>
          <td style="padding:0 48px 6px 48px;" align="center">
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-style:italic;font-size:36px;line-height:1.1;letter-spacing:-0.01em;color:#1A1A1A;">
              Choose your keeper.
            </h1>
          </td>
        </tr>

        <!-- Sub copy -->
        <tr>
          <td style="padding:0 48px 32px 48px;" align="center">
            <p style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:#334155;font-style:italic;max-width:440px;">
              ${safeName ? `Hey ${safeName} &mdash; ` : ""}you finished all twelve. Two readings of the same story. Pick the one you want to take home.
            </p>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 48px 8px 48px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#1A1A1A;">
                  <a href="${SITE}/reveal" style="display:inline-block;padding:16px 36px;font-family:'SF Mono',Consolas,monospace;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;font-weight:700;">
                    Open the Reveal &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Sign-off -->
        <tr>
          <td style="padding:36px 48px 36px 48px;" align="center">
            <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#94A3B8;">
              &mdash; Antaeus
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 48px 32px 48px;">
            ${emailFooterInner(email)}
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ─── Workshop Registration Confirmation ───
// Sent the moment a prospect submits the workshop registration form at
// /[affiliateSlug]/workshop. Resend send is fire-and-forget via safeSend
// — a failed email logs but does NOT fail the registration (the row is
// already saved). Per D07 (registration spec) and D10 (confirmation
// email spec). The "Admissions" alias decision (D17, ratified 2026-05-28)
// applies to scaled outbound DMs; transactional confirmations continue to
// send from hello@aesdr.com so replies route to the established inbox
// until admissions@ mailbox is operationally standing up.

export type WorkshopRegistrationConfirmationPayload = {
  to: string;
  firstName: string;
  workshopTitle: string;
  workshopDateDisplay: string; // human-readable, formatted in workshop tz
  affiliateDisplayName: string;
  affiliateSlug: string;
};

export async function sendWorkshopRegistrationConfirmation(
  p: WorkshopRegistrationConfirmationPayload
): Promise<boolean> {
  const body = `
    <p style="margin:0 0 16px;">You're registered for the workshop on <strong>${esc(p.workshopDateDisplay)}</strong>.</p>
    <p style="margin:0 0 16px;">Sixty minutes, live. The Q&amp;A runs as long as the questions do. A reminder lands twenty-four hours before, with the live link; another arrives three hours before.</p>
    <p style="margin:0 0 16px;">If something comes up and you can't make it live, the replay opens within twenty-four hours of the workshop and stays open for seventy-two hours. Everyone who registered gets it automatically.</p>
    <p style="margin:0 0 16px;">This workshop was organized in partnership with <strong>${esc(p.affiliateDisplayName)}</strong>.</p>
  `;
  const html = affiliateShellHtml({
    eyebrow: "AESDR · Workshop · Registered",
    // R4-DR-6: pass the RAW name — affiliateShellHtml runs esc() on headline,
    // so esc()-ing here too double-escapes ("Mac & Co" → "Mac &amp;amp; Co").
    headline: `You're in, ${p.firstName}.`,
    body,
    ctaUrl: `${SITE}/${p.affiliateSlug}/workshop`,
    ctaLabel: "Workshop details",
  });
  return safeSend(`workshop-confirmation to ${p.to}`, () =>
    getResend().emails.send({
      from: FROM,
      to: p.to,
      subject: `You're registered: ${p.workshopTitle}`,
      html,
      text: htmlToText(html),
      headers: UNSUBSCRIBE_HEADERS,
    })
  );
}
