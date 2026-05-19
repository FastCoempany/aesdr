import { Resend } from 'resend';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
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
const UNSUBSCRIBE_HEADERS = {
  'List-Unsubscribe': '<mailto:hello@aesdr.com?subject=UNSUBSCRIBE>',
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
};

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

/** Centered Leponeus image table-row, drops into any email card layout. */
function mascotRow(pose: Pose, size = 180): string {
  const url = mascotUrl(pose);
  return `
        <tr>
          <td align="center" style="padding:32px 48px 0 48px;">
            <img src="${url}" width="${size}" height="${size}" alt="" style="display:block;border:0;width:${size}px;height:${size}px;max-width:100%;" />
          </td>
        </tr>`;
}

/**
 * Wrapper that sends an email and logs failures.
 * Returns true on success, false on failure (never throws).
 */
async function safeSend(
  label: string,
  sendFn: () => ReturnType<ReturnType<typeof getResend>['emails']['send']>
): Promise<boolean> {
  try {
    const result = await sendFn();
    if (result.error) {
      console.error(`[email] ${label} failed:`, result.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[email] ${label} threw:`, err);
    return false;
  }
}

// ─── Partner Application Notification (internal, to founder) ───

export type PartnerApplicationPayload = {
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
  submittedAt: string;
};

export async function sendPartnerApplicationNotification(payload: PartnerApplicationPayload) {
  const recipient = process.env.EMAIL_RECIPIENT;
  if (!recipient) {
    console.warn("[email] EMAIL_RECIPIENT not set; skipping partner application notification.");
    return false;
  }
  const from = process.env.EMAIL_FROM || "AESDR Partners <partner@aesdr.com>";
  const subject = `Partner application — ${payload.applicantName}`;
  return safeSend(`partner-application from ${payload.applicantName}`, () =>
    getResend().emails.send({
      from,
      to: recipient,
      replyTo: recipient,
      subject,
      html: partnerApplicationHtml(payload),
      text: partnerApplicationText(payload),
    })
  );
}

function partnerApplicationText(p: PartnerApplicationPayload): string {
  const utm = [
    p.utmSource && `source=${p.utmSource}`,
    p.utmMedium && `medium=${p.utmMedium}`,
    p.utmCampaign && `campaign=${p.utmCampaign}`,
    p.utmContent && `content=${p.utmContent}`,
  ].filter(Boolean).join(" · ") || "(none)";
  return [
    `New partner application — ${p.applicantName}`,
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
    `Review in Supabase: partner_applications table.`,
  ].join("\n");
}

function partnerApplicationHtml(p: PartnerApplicationPayload): string {
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
<head><meta charset="utf-8"><title>Partner application</title></head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAF7F2;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;width:100%;background:#FFFFFF;border:1px solid #E8E4DF;">
      <tr><td style="padding:28px 32px 8px 32px;">
        <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
          AESDR &middot; Partner Application
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
          Persisted to <code style="font-family:'SF Mono',Consolas,monospace;font-size:12px;background:#FAF7F2;padding:1px 6px;">partner_applications</code> in Supabase.
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

// ─── Welcome Email (immediate after purchase) ───

export async function sendWelcomeEmail(to: string, name: string, tempPassword: string | null) {
  const loginUrl = `${SITE}/login?email=${encodeURIComponent(to)}`;
  return safeSend(`welcome to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: "You're in. Start here.",
      html: welcomeHtml(name, to, loginUrl, tempPassword),
    })
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
              You're in. What follows is everything you need to begin — no orientation video, no onboarding checklist. Only the work.
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
              Lesson 1 &middot; The Fundamentals
            </p>
            <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.7;color:#334155;">
              Structure. Real camaraderie in your AE/SDR partnership. A first 90 days done the right way. That is where this begins.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding:10px 0;border-top:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#334155;">
                  <strong style="color:#1A1A1A;">Twelve lessons.</strong> Three units each. Interactive exercises, not video lectures.
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-top:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#334155;">
                  <strong style="color:#1A1A1A;">Progress saves.</strong> Return at any hour. Pick up where you stopped.
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-top:1px solid #E8E3D8;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#334155;">
                  <strong style="color:#1A1A1A;">Five tools unlock along the way.</strong> Commission tracker. Alignment contracts. Strike plans. Yours when the lesson is done.
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Discord VIP Section -->
        <tr>
          <td style="padding:40px 48px 0 48px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:linear-gradient(135deg,#5865F2 0%,#4752C4 100%);border-radius:0;">
              <tr>
                <td style="padding:32px 32px 28px 32px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="vertical-align:middle;padding-right:20px;" width="64">
                        <!-- Discord logo SVG (inline) -->
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="56" height="56" style="background:#FFFFFF;border-radius:12px;">
                          <tr>
                            <td align="center" valign="middle" style="padding:12px;">
                              <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.png" width="32" height="32" alt="Discord" style="display:block;border:0;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="margin:0 0 4px;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:rgba(255,255,255,0.7);font-weight:700;">
                          Members only
                        </p>
                        <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.2;color:#FFFFFF;font-weight:400;">
                          The AESDR Discord
                        </p>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:20px 0 22px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.92);">
                    Real AEs and SDRs. Real deals. Real accountability. A private room where the work continues between lessons &mdash; no guru energy, no motivational noise.
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background:#FFFFFF;">
                        <a href="https://discord.gg/uEpAz3yw" style="display:inline-block;padding:14px 28px;font-family:'SF Mono',Consolas,monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#5865F2;text-decoration:none;font-weight:700;">
                          Accept Your Invitation &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
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
            ${emailFooterInner()}
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

export async function sendReceiptEmail(to: string, name: string, tier: string, amountCents: number) {
  return safeSend(`receipt to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: 'AESDR — Purchase Confirmation',
      html: receiptHtml(name, tier, amountCents),
    })
  );
}

function receiptHtml(name: string, tier: string, amountCents: number) {
  const safeName = esc(name);
  const amount = (amountCents / 100).toFixed(2);
  const planLabel = tier === 'team' ? 'Team' : 'Individual';
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const receiptNo = `AESDR-${Date.now().toString(36).toUpperCase().slice(-8)}`;
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
            ${emailFooterInner()}
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
      headers: UNSUBSCRIBE_HEADERS,
      subject: "Your Manager Archetype Map",
      html: managerArchetypeMapHtml(),
    })
  );
}

function managerArchetypeMapHtml() {
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
          This week's move
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
    Four manager OSes.<br/>One you're running on.
  </h1>
  <p style="margin:0 0 24px;color:#6B6B6B;font-size:16px">
    Pinned here for your notebook. Skim it Sunday, run the move during the week.
    If it doesn't land, just hit reply and tell me why — that's how the next version improves.
  </p>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #E8E4DF">
    ${rows}
  </table>

  <p style="margin:28px 0 8px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B">
    Optional · One pointer · Then I'm out of your inbox
  </p>
  <p style="margin:0 0 12px">
    This is one tool from Lesson 3 of the full course. Eleven more lessons,
    five takeaway tools, lifetime access. 14-day refund if it doesn't deliver.
  </p>
  <p style="margin:0 0 24px">
    <a href="${SITE}/#pricing" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">See the full course →</a>
  </p>
  <p style="margin:0;color:#6B6B6B;font-size:14px">
    — Antaeus
  </p>
  ${footer()}
</div>`;
}

// ─── Lesson-completed nudge: 24h after a completion ───
// Capitalises on the warm "I just shipped a thing" moment. Names the
// next lesson, gives the rough time, kills the open-tab cost. Per
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
      headers: UNSUBSCRIBE_HEADERS,
      subject: `Next: ${nextLessonTitle} (~${nextMinutes} min)`,
      html: lessonCompletedNudgeHtml(name, nextLessonId, nextLessonTitle, nextMinutes),
    })
  );
}

function lessonCompletedNudgeHtml(
  name: string,
  nextLessonId: string,
  nextLessonTitle: string,
  nextMinutes: number
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
  <p>Next up: <strong>${safeTitle}</strong>. Roughly ${nextMinutes} minutes. Same window you used yesterday is the cheapest decision you can make.</p>
  <p style="margin:20px 0">
    <a href="${SITE}/course/${safeLesson}" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Open ${safeTitle} →</a>
  </p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer()}
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
      headers: UNSUBSCRIBE_HEADERS,
      subject: "This week, expect this",
      html: weeklyFramingHtml(name, completed, total),
    })
  );
}

function weeklyFramingHtml(name: string, completed: number, total: number) {
  const safeName = esc(name);
  const remaining = total - completed;
  const stage =
    completed === 0
      ? "Week one is foundational — camaraderie, silos, how the team you're on actually works (and where it doesn't)."
      : completed < total / 3
        ? "You're in the foundation half. Expect short lessons that re-wire how you read your own pipeline and your own manager."
        : completed < (total * 2) / 3
          ? "Middle third — the harder lessons: prospecting math, the 30% rule, the CRM as a friend or witness. Heavier at-bats."
          : "Final third. Compensation realities, sober selling, the relationship-graph lesson nobody else teaches. Hardest because you'll recognise yourself.";
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Sunday framing
  </p>
  <p>Hey ${safeName},</p>
  <p>You're ${completed} of ${total} in. ${remaining > 0 ? `${remaining} to go.` : ""}</p>
  <p>${stage}</p>
  <p>You don't have to do all of it this week. You have to do one. The window you blocked when you signed up is enough.</p>
  <p style="margin:20px 0">
    <a href="${SITE}/dashboard" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Open the dashboard →</a>
  </p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer()}
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
      headers: UNSUBSCRIBE_HEADERS,
      subject: "Is this still useful — or should we close the loop?",
      html: winBackHtml(name),
    })
  );
}

function winBackHtml(name: string) {
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
    3. You'd actually like to start now. Pick Lesson 1, block 25 minutes this week, hit it.
  </p>
  <p style="margin:20px 0">
    <a href="${SITE}/dashboard" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Open the dashboard →</a>
  </p>
  <p style="font-size:14px;color:#6B6B6B">If none of those land, no further emails on this — promise. You have lifetime access; the course will be here if and when you come back.</p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer()}
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
      headers: UNSUBSCRIBE_HEADERS,
      subject:
        monthMark === 6
          ? "Six months in — what stuck?"
          : "A year of being AESDR-trained",
      html: alumniReengagementHtml(name, monthMark),
    })
  );
}

function alumniReengagementHtml(name: string, monthMark: 6 | 12) {
  const safeName = esc(name);
  const lede =
    monthMark === 6
      ? "Six months since you finished. Long enough for the lessons to have either landed or faded."
      : "A year since you finished. Long enough that the part of the job you do reflexively now was probably learned somewhere.";
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · ${monthMark} months in
  </p>
  <p>Hey ${safeName},</p>
  <p>${lede}</p>
  <p>Three things, briefly:</p>
  <ol style="line-height:1.8;padding-left:22px;margin:8px 0 16px">
    <li>The takeaway tools are re-downloadable any time at <a href="${SITE}/alumni" style="color:#8B1A1A;text-decoration:underline">${SITE}/alumni</a>. Most alumni grab the 72-hour strike plan again around their next bad quarter.</li>
    <li>If something from the course actually helped this year, one sentence to <a href="${SITE}/account/review" style="color:#8B1A1A;text-decoration:underline">${SITE}/account/review</a> would be genuinely useful.</li>
    <li>If you know an AE or SDR in their first eighteen months who could use the course — share the free Manager Archetype Map at <a href="${SITE}/free/manager-archetype-map" style="color:#8B1A1A;text-decoration:underline">${SITE}/free/manager-archetype-map</a>. Cheaper than asking them to buy something.</li>
  </ol>
  <p style="margin:20px 0">
    <a href="${SITE}/alumni" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Open alumni surface →</a>
  </p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer()}
</div>`;
}

// ─── Day 3 Drip Email ───

// ─── Day-0 (+12hr): "what to do first" ───
// Largest single retention lever in the product. Sent ~12 hours after
// purchase. Names the implementation-intention move concretely — pick a
// 25-minute window, put it in the calendar, do Lesson 1.1 in it. See
// behavioral audit §H.2.1.

export async function sendDay0PlusTwelveHours(to: string, name: string) {
  return safeSend(`day0+12h to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: "Pick a 25-minute window. Put it on your calendar.",
      html: day0PlusTwelveHoursHtml(name),
    })
  );
}

function day0PlusTwelveHoursHtml(name: string) {
  const safeName = esc(name);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Welcome (1 of 2)
  </p>
  <p>Hey ${safeName},</p>
  <p>The most important thing about AESDR isn't the content. It's whether you actually start it.</p>
  <p>Most AEs and SDRs who buy a course like this never do Lesson 1. Not because the course is bad. Because there's never an obvious moment to start. Tomorrow's full. Next week's full. Then it's been a month.</p>
  <p>The thing that breaks the pattern is dumb and effective:</p>
  <p style="margin:18px 0;padding:14px 18px;border-left:3px solid #8B1A1A;background:#FFFFFF;font-style:italic">
    Pick a 25-minute window in the next 48 hours. Put it on your calendar — actually on your calendar, not in your head. Do Lesson 1.1 in that window. Don't "find time" — choose a time.
  </p>
  <p>That's it. The hardest part of the course is the first 25 minutes. Once it's a calendar event, it happens.</p>
  <p><a href="${SITE}/dashboard" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px;margin:8px 0">Go to Lesson 1.1 →</a></p>
  <p>Reply to this email if anything's broken. Real person, real inbox.</p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer()}
</div>`;
}

// ─── Day-0 (+36hr): "did you start" check-in ───
// Sent ~36 hours after purchase IF the user hasn't completed Lesson 1.1
// yet. Tone: friend nudging, not SaaS auto-emailer. Recovers 10–20% of
// would-be droppers. Audit §H.2.2.

export async function sendDay0PlusThirtySixHours(to: string, name: string) {
  return safeSend(`day0+36h to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: "Two days in. Did you start?",
      html: day0PlusThirtySixHoursHtml(name),
    })
  );
}

function day0PlusThirtySixHoursHtml(name: string) {
  const safeName = esc(name);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Welcome (2 of 2)
  </p>
  <p>Hey ${safeName},</p>
  <p>Quick check — did you get to Lesson 1 yet?</p>
  <p>If you did: good. The first lesson is the hardest activation. Everything after compounds.</p>
  <p>If you didn't: also fine. Here's the thing that gets most people unstuck —</p>
  <p style="margin:18px 0;padding:14px 18px;border-left:3px solid #8B1A1A;background:#FFFFFF;font-style:italic">
    The reason you haven't started isn't time. It's that nothing in your day says "this is the moment." Don't wait for the moment. Put it on tomorrow morning's calendar, before you check Slack. 25 minutes.
  </p>
  <p>If you're certain AESDR isn't for you, reply REFUND. We process within 3 business days, no questions. We don't want your money if it doesn't deliver value.</p>
  <p>If you want to talk through anything — the role you bought (SDR / AE), where to start, whether it fits your situation — reply to this email. Real reply, real human.</p>
  <p><a href="${SITE}/dashboard" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px;margin:8px 0">Open Lesson 1.1 →</a></p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer()}
</div>`;
}

export async function sendDay3Email(to: string, name: string) {
  return safeSend(`day3 to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: "How's Course 1 going?",
      html: day3Html(name),
    })
  );
}

function day3Html(name: string) {
  const safeName = esc(name);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Day three
  </p>
  <p>Hey ${safeName},</p>
  <p>Three days in. If you've started Lesson 1, you're on track. If you haven't, no guilt — the lesson sits there until you come back.</p>
  <p>One thing from Lesson 2 to keep in your back pocket while you're going about your week:</p>
  <p style="border-left:3px solid #8B1A1A;padding:6px 0 6px 14px;margin:14px 0;font-style:italic;color:#1A1A1A">
    There's a pattern where everyone in the org points at someone else. AEs and SDRs blame their manager, managers blame marketing, marketing blames the product. Nobody fixes anything.
  </p>
  <p>Lesson 2 lays out how to break that pattern — not by being a hero, but by asking the right questions in the right meetings.</p>
  <p style="margin:20px 0">
    <a href="${SITE}/dashboard" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Continue where you left off →</a>
  </p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer()}
</div>`;
}

// ─── Day 7 Drip Email ───

export async function sendDay7Email(to: string, name: string) {
  return safeSend(`day7 to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: "The tool in Course 3 is worth the entire price",
      html: day7Html(name),
    })
  );
}

function day7Html(name: string) {
  const safeName = esc(name);
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Week one
  </p>
  <p>Hey ${safeName},</p>
  <p>Week one. Most AESDR students at this point are finishing Lesson 3.</p>
  <p>Lesson 3 is where you build the <strong>AE/SDR Alignment Contract</strong> — a one-page document that gets the AE and the SDR onto the same page about handoffs, expectations, and accountability. It's the single most downloaded tool in the program.</p>
  <p>If you're ahead of that: good. Lessons 4–6 cover manager dynamics, career pathing, and the relationships that pay off two years out.</p>
  <p>If you're behind: also fine. This isn't a race; it's a system. Come back when you have twenty minutes.</p>
  <p style="margin:20px 0">
    <a href="${SITE}/course/3" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Open Lesson 3 →</a>
  </p>
  <p style="margin-top:24px">— Antaeus</p>
  <p style="margin-top:18px;font-size:13px;color:#6B6B6B"><em>P.S. — If something about the course isn't working for you, reply and tell me. I'd rather fix it than have you quietly disengage.</em></p>
  ${footer()}
</div>`;
}

// ─── Cart Abandonment: 1 Hour ───

export async function sendAbandon1hr(to: string) {
  return safeSend(`abandon-1hr to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: "Still thinking it over?",
      html: abandon1hrHtml(),
    })
  );
}

function abandon1hrHtml() {
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
    <li>Twelve interactive lessons (not video lectures you'll never finish)</li>
    <li>Five take-home tools you'll actually use — commission tracker, alignment contracts, strike plans</li>
    <li>A curriculum built by someone who carried a quota for nine years, not someone who read about it</li>
  </ul>
  <p style="margin:14px 0 6px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:18px">What you're not getting</p>
  <ul style="line-height:1.8;padding-left:22px;margin:0 0 14px">
    <li>Motivational content</li>
    <li>Generic scripts</li>
    <li>Anything that reads like a LinkedIn post</li>
  </ul>
  <p>If the money's the hesitation: the 14-day refund is real. No questions asked. Try it. If it doesn't help, get your money back inside two weeks.</p>
  <p style="margin:20px 0">
    <a href="${SITE}/#pricing" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Complete your purchase →</a>
  </p>
  <p style="margin-top:24px">— Antaeus</p>
  <p style="margin-top:18px;font-size:13px;color:#6B6B6B"><em>P.S. — Lesson 1 covers surviving your first 90 days, including the manager types that make or break new AEs and SDRs. If that's not relevant to you right now, save your money. If it is, you already know.</em></p>
  ${footer()}
</div>`;
}

// ─── Cart Abandonment: 24 Hours ───

export async function sendAbandon24hr(to: string) {
  return safeSend(`abandon-24hr to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: "Quick question before I stop following up",
      html: abandon24hrHtml(),
    })
  );
}

function abandon24hrHtml() {
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · Last note on this
  </p>
  <p>Hey,</p>
  <p>Last email about this — promise.</p>
  <p>I talk to a lot of AEs and SDRs. The three reasons people don't invest in themselves are always the same:</p>
  <p style="margin:14px 0 4px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:18px">&ldquo;I can't afford it right now.&rdquo;</p>
  <p>Fair. Commission months are unpredictable. But the math: if one framework from this course helps you close one extra deal this quarter, the return isn't 2x — it's probably 10x. The course costs less than one decent dinner in most cities.</p>
  <p style="margin:14px 0 4px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:18px">&ldquo;I don't have time.&rdquo;</p>
  <p>Each lesson runs alongside a full-time quota. No four-hour video modules. Interactive screens you can do on your commute or during a slow Friday.</p>
  <p style="margin:14px 0 4px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:18px">&ldquo;I've seen courses like this before.&rdquo;</p>
  <p>You haven't. This one doesn't teach you to &ldquo;smile and dial.&rdquo; It teaches you to audit your commission structure, manage a bad manager, build a professional network that actually helps you, and run a 72-hour action plan when everything goes sideways.</p>
  <p style="margin:20px 0">
    <a href="${SITE}/#pricing" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Complete your purchase →</a>
  </p>
  <p>14 days to try it. Full refund if it's not for you.</p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer()}
</div>`;
}

// ─── Drop-Off Prevention: 5 Days ───

export async function sendDropoff5d(to: string, name: string, lessonId: string, lessonTitle: string) {
  return safeSend(`dropoff-5d to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: "No rush — but your next lesson is ready",
      html: dropoff5dHtml(name, lessonId, lessonTitle),
    })
  );
}

function dropoff5dHtml(name: string, lessonId: string, lessonTitle: string) {
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
  ${footer()}
</div>`;
}

// ─── Drop-Off Prevention: 10 Days ───

export async function sendDropoff10d(to: string, name: string) {
  return safeSend(`dropoff-10d to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: "10 minutes. One framework. Worth it.",
      html: dropoff10dHtml(name),
    })
  );
}

function dropoff10dHtml(name: string) {
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
  <p>That's one tool from Module 4. The other 35 lessons have more like it.</p>
  <p><a href="${SITE}/dashboard" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px;margin:8px 0">Pick it back up →</a></p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer()}
</div>`;
}

// ─── Drop-Off Prevention: 21 Days ───

export async function sendDropoff21d(to: string, name: string, lessonId: string) {
  return safeSend(`dropoff-21d to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: "Last check-in from us",
      html: dropoff21dHtml(name, lessonId),
    })
  );
}

function dropoff21dHtml(name: string, lessonId: string) {
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
    Your progress is saved. Access is lifetime. Pick it back up in a week, a month, a year — same login, same lessons, same Discord. The course doesn't expire just because you did.
  </p>
  <p style="margin:18px 0;padding:14px 18px;border-left:3px solid #8B1A1A;background:#FFFFFF;">
    <strong style="display:block;margin-bottom:6px;font-family:'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase;font-size:12px;color:#1A1A1A">If something was wrong</strong>
    Reply with one line — what didn't land. I read every reply. The curriculum gets better when buyers tell me what felt off.
  </p>
  <p>If you want to pick up where you stopped: <a href="${SITE}/course/${safeLesson}" style="color:#8B1A1A;text-decoration:underline">continue here</a>.</p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer()}
</div>`;
}

// ─── Review Request: Post-Completion ───

export async function sendReviewRequest(to: string, name: string) {
  return safeSend(`review-request to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: "You finished all 12. How was it?",
      html: reviewRequestHtml(name),
    })
  );
}

function reviewRequestHtml(name: string) {
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
  ${footer()}
</div>`;
}

// ─── Review Request: Nudge (4 days after first, if no response) ───

export async function sendReviewNudge(to: string, name: string) {
  return safeSend(`review-nudge to ${to}`, () =>
    getResend().emails.send({
      from: FROM,
      to,
      headers: UNSUBSCRIBE_HEADERS,
      subject: "30 seconds — that's all I need",
      html: reviewNudgeHtml(name),
    })
  );
}

function reviewNudgeHtml(name: string) {
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
  ${footer()}
</div>`;
}

// ─── Shared footer ───

function footer() {
  return `
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0 16px">
  <p style="font-size:11px;color:#999;line-height:1.5">
    AESDR · <a href="mailto:hello@aesdr.com" style="color:#999">hello@aesdr.com</a><br>
    <a href="${SITE}/contact" style="color:#999">Contact</a> · <a href="${SITE}/refund-policy" style="color:#999">Refund Policy</a><br>
    You're receiving this because you purchased or started a checkout at AESDR.<br>
    To unsubscribe, reply with UNSUBSCRIBE.
  </p>`;
}

/**
 * Footer for the editorial/luxury-styled emails (welcome, receipt).
 * Designed to sit inside the 600px white card; uses Georgia/SF Mono
 * and the warm stone palette rather than the old grey utilitarian footer.
 */
function emailFooterInner() {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="border-top:1px solid #E8E3D8;padding-top:20px;">
        <p style="margin:0 0 10px;font-family:'SF Mono',Consolas,monospace;font-size:9px;letter-spacing:.28em;text-transform:uppercase;color:#94A3B8;">
          AESDR &middot; <a href="mailto:hello@aesdr.com" style="color:#94A3B8;text-decoration:none;">hello@aesdr.com</a>
        </p>
        <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:12px;line-height:1.6;color:#94A3B8;">
          <a href="${SITE}/contact" style="color:#94A3B8;text-decoration:underline;">Contact</a>
          &nbsp;&middot;&nbsp;
          <a href="${SITE}/refund-policy" style="color:#94A3B8;text-decoration:underline;">Refund Policy</a>
        </p>
        <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:11px;line-height:1.6;color:#B0B5BD;font-style:italic;">
          You're receiving this because you purchased or started a checkout at AESDR.
          To unsubscribe, reply with UNSUBSCRIBE.
        </p>
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
      html: teamInviteHtml(inviterName, token),
    })
  );
}

function teamInviteHtml(inviterName: string, token: string) {
  const safeName = esc(inviterName);
  const acceptUrl = `${SITE}/team/accept?token=${encodeURIComponent(token)}`;
  return `
<div style="font-family:Georgia,'Source Serif 4',serif;color:#1A1A1A;max-width:560px;margin:0 auto;padding:24px;line-height:1.65;background:#FAF7F2">
  <p style="margin:0 0 14px;font-family:'SF Mono',monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B6B6B;">
    AESDR · You've been added to a team
  </p>
  <p>Hey,</p>
  <p><strong>${safeName}</strong> added you to their team's AESDR account.</p>
  <p>AESDR is a twelve-lesson professional development curriculum for AEs and SDRs in SaaS. Interactive exercises, real frameworks, no motivational pep talks.</p>
  <div style="background:#fff;padding:18px 22px;margin:20px 0;border:1px solid #E8E4DF;border-left:3px solid #8B1A1A">
    <p style="margin:0 0 8px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:16px;color:#1A1A1A">What you get</p>
    <ul style="margin:0;padding-left:20px;line-height:1.75">
      <li>All twelve lessons with interactive exercises</li>
      <li>Five take-home tools (commission tracker, alignment contracts, strike plans)</li>
      <li>Your own progress tracking and personalised takeaway artefacts</li>
    </ul>
  </div>
  <p style="margin:24px 0">
    <a href="${acceptUrl}" style="display:inline-block;background:#8B1A1A;color:#FFFFFF;text-decoration:none;padding:12px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.15em;text-transform:uppercase;font-size:13px">Accept invite &amp; start →</a>
  </p>
  <p>This invite is tied to your email address. Click the link above to create your account, or sign in if you already have one.</p>
  <p style="margin-top:24px">— Antaeus</p>
  ${footer()}
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
      headers: UNSUBSCRIBE_HEADERS,
      subject,
      html: lessonCompleteHtml(name, lessonId, lessonTitle),
    })
  );
}

function lessonCompleteHtml(name: string, lessonId: string, lessonTitle: string): string {
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
    : `Lesson ${nextLesson} is harder.`;

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
              Back to the Journey
            </a>
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
            ${emailFooterInner()}
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
      headers: UNSUBSCRIBE_HEADERS,
      subject: "Choose your keeper.",
      html: revealUnlockedHtml(name),
    })
  );
}

function revealUnlockedHtml(name: string): string {
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
            ${emailFooterInner()}
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
