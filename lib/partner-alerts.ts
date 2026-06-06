import { Resend } from "resend";

/**
 * Partnerships control-tower alerting.
 *
 * The agents are deterministic cron handlers; this is the one place they
 * reach the operator. Two kinds of mail leave here:
 *   - sendBrightSignalAlert: a real-time "someone's interested" ping, sent by
 *     sentinel the moment it classifies an inbound reply as bright.
 *   - sendTowerDigest: the daily standup almanac mails at 7am ET.
 *
 * Both land at PARTNER_ALERT_EMAIL (falls back to antaeus.coe@gmail.com, a
 * permanent admin) and link straight into /admin/tower — the body never asks the
 * operator to read raw inbound text in their inbox; it points them at the
 * cockpit, where the same one-gesture controls live.
 *
 * SECURITY: any inbound-derived string passed in here is DATA. We HTML-escape
 * every interpolation and only ever include a short, escaped excerpt. The mail
 * is informational; the operator acts inside the gated tower, never by replying
 * to attacker-controllable text rendered as markup.
 */
function getResend() {
  const apiKey = process.env.RESEND_API_KEY || process.env.aesdr_email_api_key;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY (or aesdr_email_api_key) environment variable is not set",
    );
  }
  return new Resend(apiKey);
}

const FROM = process.env.EMAIL_FROM || "AESDR Partnerships <hello@aesdr.com>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://aesdr.com";
const ALERT_TO =
  process.env.PARTNER_ALERT_EMAIL ||
  process.env.EMAIL_RECIPIENT ||
  "antaeus.coe@gmail.com";

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Best-effort send that logs and swallows — alerting must never throw into a cron. */
async function safeSend(
  label: string,
  send: () => ReturnType<ReturnType<typeof getResend>["emails"]["send"]>,
): Promise<boolean> {
  try {
    const r = await send();
    if (r.error) {
      console.error(`[partner-alerts] ${label} failed:`, r.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[partner-alerts] ${label} threw:`, err);
    return false;
  }
}

// ─── Editorial shell — cream board, mono eyebrow, crimson accent ───
// Matches the retired-dark-palette ban: everything renders on --cream / --ink
// with a crimson rule, never a dark console.
function shell(args: {
  eyebrow: string;
  headline: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaPath: string;
}): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(args.eyebrow)}</title></head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF7F2;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E8E4DF;">
      <tr><td style="height:3px;background:#8B1A1A;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:26px 32px 6px 32px;">
        <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#8B1A1A;font-weight:700;">${esc(args.eyebrow)}</p>
      </td></tr>
      <tr><td style="padding:0 32px 14px 32px;">
        <h1 style="margin:0;font-family:Georgia,'Playfair Display',serif;font-style:italic;font-weight:700;font-size:28px;line-height:1.18;color:#1A1A1A;">${esc(args.headline)}</h1>
      </td></tr>
      <tr><td style="padding:0 32px 22px 32px;font-family:Georgia,'Source Serif 4',serif;font-size:15px;line-height:1.7;color:#1A1A1A;">${args.bodyHtml}</td></tr>
      <tr><td style="padding:0 32px 30px 32px;">
        <a href="${SITE}${esc(args.ctaPath)}" style="display:inline-block;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#FFFFFF;background:#8B1A1A;padding:13px 26px;text-decoration:none;">${esc(args.ctaLabel)} &rarr;</a>
      </td></tr>
      <tr><td style="padding:0 32px 26px 32px;border-top:1px solid #E8E4DF;">
        <p style="margin:14px 0 0;font-family:Georgia,'Source Serif 4',serif;font-size:12px;line-height:1.6;color:#6B6B6B;font-style:italic;">You act inside the tower, not by replying here. Every decision is one gesture.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

/** Real-time ping: sentinel classified an inbound reply as a bright signal. */
export async function sendBrightSignalAlert(args: {
  fromAddr: string;
  subject: string | null;
  excerpt: string | null;
}): Promise<boolean> {
  const subj = args.subject?.trim() || "(no subject)";
  const excerpt = (args.excerpt || "").slice(0, 280);
  const bodyHtml = `
    <p style="margin:0 0 14px;">A reply just landed in <strong>affiliates@</strong> that reads as real interest.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="padding:6px 0;font-family:'SF Mono',Consolas,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#6B6B6B;width:80px;vertical-align:top;">From</td>
          <td style="padding:6px 0;font-size:15px;color:#1A1A1A;">${esc(args.fromAddr)}</td></tr>
      <tr><td style="padding:6px 0;font-family:'SF Mono',Consolas,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#6B6B6B;vertical-align:top;">Subject</td>
          <td style="padding:6px 0;font-size:15px;color:#1A1A1A;">${esc(subj)}</td></tr>
    </table>
    ${excerpt ? `<p style="margin:14px 0 0;padding:12px 14px;background:#FAF7F2;border-left:2px solid #8B1A1A;font-family:'SF Mono',Consolas,monospace;font-size:13px;line-height:1.6;color:#1A1A1A;white-space:pre-wrap;">${esc(excerpt)}</p>` : ""}`;
  return safeSend(`bright-signal from ${args.fromAddr}`, () =>
    getResend().emails.send({
      from: FROM,
      to: ALERT_TO,
      replyTo: ALERT_TO,
      subject: `Bright signal — ${args.fromAddr}`,
      html: shell({
        eyebrow: "AESDR · Tower · Bright signal",
        headline: "Someone's interested.",
        bodyHtml,
        ctaLabel: "Open the tower",
        ctaPath: "/admin/tower",
      }),
      text: [
        `Bright signal in affiliates@`,
        ``,
        `From:    ${args.fromAddr}`,
        `Subject: ${subj}`,
        excerpt ? `\n${excerpt}\n` : ``,
        `Act in the tower: ${SITE}/admin/tower`,
      ].join("\n"),
    }),
  );
}

/** Daily 7am standup — counts only, the rest lives behind the link. */
export async function sendTowerDigest(args: {
  brightSignals: number;
  draftsAwaiting: number;
  workshopsDue: number;
  payoutsReady: number;
}): Promise<boolean> {
  const { brightSignals, draftsAwaiting, workshopsDue, payoutsReady } = args;
  const total = brightSignals + draftsAwaiting + workshopsDue + payoutsReady;
  const line = (n: number, label: string) =>
    n > 0
      ? `<tr><td style="padding:7px 0;font-family:Georgia,'Source Serif 4',serif;font-size:16px;color:#1A1A1A;"><strong style="color:#8B1A1A;">${n}</strong> ${esc(label)}</td></tr>`
      : "";
  const bodyHtml =
    total === 0
      ? `<p style="margin:0;">Nothing waiting on you. The tower handled everything that was safe to handle.</p>`
      : `<p style="margin:0 0 12px;">${total} ${total === 1 ? "thing is" : "things are"} waiting on one gesture from you.</p>
         <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
           ${line(brightSignals, brightSignals === 1 ? "bright signal" : "bright signals")}
           ${line(draftsAwaiting, draftsAwaiting === 1 ? "draft ready to send" : "drafts ready to send")}
           ${line(workshopsDue, workshopsDue === 1 ? "workshop touch due" : "workshop touches due")}
           ${line(payoutsReady, payoutsReady === 1 ? "payout run ready" : "payout runs ready")}
         </table>`;
  return safeSend("tower-digest", () =>
    getResend().emails.send({
      from: FROM,
      to: ALERT_TO,
      replyTo: ALERT_TO,
      subject:
        total === 0 ? "Tower: all clear" : `Tower: ${total} waiting on you`,
      html: shell({
        eyebrow: "AESDR · Tower · Daily standup",
        headline: total === 0 ? "All clear." : "Today, in one screen.",
        bodyHtml,
        ctaLabel: total === 0 ? "Open the tower" : "Clear the board",
        ctaPath: "/admin/tower",
      }),
      text: [
        total === 0
          ? "Tower: all clear. Nothing waiting on you."
          : `Tower standup — ${total} waiting on you:`,
        brightSignals ? `  ${brightSignals} bright signal(s)` : ``,
        draftsAwaiting ? `  ${draftsAwaiting} draft(s) ready to send` : ``,
        workshopsDue ? `  ${workshopsDue} workshop touch(es) due` : ``,
        payoutsReady ? `  ${payoutsReady} payout run(s) ready` : ``,
        ``,
        `${SITE}/admin/tower`,
      ]
        .filter(Boolean)
        .join("\n"),
    }),
  );
}
