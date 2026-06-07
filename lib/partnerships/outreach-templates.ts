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

export type OutreachTemplateId = "newsletter" | "community" | "podcast";

type Template = { id: OutreachTemplateId; subject: string; body: string };

const BOOKING = "https://calendar.app.google/wFRpSWG2ehvNhgd4A";
const SIGNOFF = "— Antaeus, AESDR · affiliates@aesdr.com";

const TEMPLATES: Record<OutreachTemplateId, Template> = {
  newsletter: {
    id: "newsletter",
    subject: "the part of the job your readers are mid-struggle with",
    body: `[NAME] — I read [SPECIFIC PIECE], and the bit about [REAL DETAIL] is the exact gap AESDR is built for: first-1-to-2-year SDRs and AEs who got dropped into the seat and told to figure it out.

It is a one-time course ($249 SDR / $299 AE), built by operators, no guru act. If you ever point readers at it, the affiliate terms are 40% commission on a 30-day attribution window — real money, paid through Stripe, no games.

Not asking for a yes today. Want the partner kit, so you can see whether it fits your list?

${SIGNOFF}`,
  },
  community: {
    id: "community",
    subject: "something for the first-two-years crowd in [COMMUNITY]",
    body: `[NAME] — [COMMUNITY] is full of exactly who AESDR is for: SDRs and AEs a year or two in, ramping harder than anyone warned them. It is a one-time course built by operators, not by course-people.

If it fits your members, the affiliate terms are 40% commission on a 30-day attribution window, paid clean through Stripe. We read your first couple of posts so they sound like you and not like an ad — that protects your members' trust, and then you post on your own.

Worth fifteen minutes to see if it fits? ${BOOKING}

${SIGNOFF}`,
  },
  podcast: {
    id: "podcast",
    subject: "a guest angle your listeners are living right now",
    body: `[NAME] — [SPECIFIC EPISODE OR SHOW THEME] lines up with what AESDR teaches: the first-1-to-2-year SDR and AE problem — dropped into the seat, handed a quota, left to guess. Your show already talks to exactly those listeners.

It is a one-time course ($249 SDR / $299 AE), built by operators. If you mention it — host-read or a guest spot — the affiliate terms are 40% commission on a 30-day attribution window, paid through Stripe.

Happy to come on and earn it, or just take the partner kit first. Fifteen minutes if that is easier: ${BOOKING}

${SIGNOFF}`,
  },
};

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
 * Render a first-touch draft from a pipeline row. Fills the placeholders we can
 * confidently fill ([NAME], [COMMUNITY]) and substitutes the Dossier why-fit for
 * [REAL DETAIL] when present. Any placeholder still in the text after fill is
 * returned in `unfilled` so the caller can mark the row needs-personalization.
 */
export function renderFirstTouch(row: {
  name: string;
  surface: string | null;
  handle: string | null;
  why_fit: string | null;
}): RenderedDraft {
  const templateId = pickTemplate(row.surface);
  const t = TEMPLATES[templateId];

  const firstName = row.name.trim().split(/\s+/)[0] || row.name;
  const communityName = row.handle?.trim() || row.surface?.trim() || row.name;

  const replacements: Record<string, string> = {
    "[NAME]": firstName,
    "[COMMUNITY]": communityName,
  };
  // why_fit is a real, specific Dossier sentence — use it for [REAL DETAIL].
  if (row.why_fit && row.why_fit.trim()) {
    replacements["[REAL DETAIL]"] = row.why_fit.trim().replace(/\.$/, "");
  }

  const fill = (s: string) =>
    Object.entries(replacements).reduce(
      (acc, [k, v]) => acc.split(k).join(v),
      s,
    );

  const subject = fill(t.subject);
  const body = fill(t.body);

  // Anything left like [SPECIFIC PIECE] / [SPECIFIC EPISODE OR SHOW THEME].
  const unfilled = Array.from(
    new Set((subject + "\n" + body).match(/\[[A-Z][A-Z0-9 /]+\]/g) || []),
  );

  return { templateId, subject, body, unfilled };
}

/** Pull the first email address out of a contact_path, if any. */
export function extractEmail(contactPath: string | null): string | null {
  if (!contactPath) return null;
  const m = contactPath.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  return m ? m[0] : null;
}
