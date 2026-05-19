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
// Triggered from the /teams/contact server action when a B2B prospect
// or channel partner submits the inquiry form. Routed to hello@aesdr.com
// with subject prefix [/teams inquiry] for inbox triage.

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
  const subject = `[/teams inquiry] ${payload.role} from ${payload.company} (${payload.teamSize})`;
  return safeSend(`teams-inquiry from ${payload.company}`, () =>
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
    `New /teams inquiry — ${p.company}`,
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
          AESDR &middot; /teams inquiry
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
          <code style="display:inline-block;background:#0F172A;color:#F8FAFC;padding:8px 14px;border-radius:4px;font-family:'SF Mono',Consolas,monospace;font-size:15px;letter-spacing:2px;font-weight:700">${esc(tempPassword)}</code>
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
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:44px;line-height:1.08;letter-spacing:-0.01em;color:#0F172A;">
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
            <p style="margin:0 0 18px;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#10B981;font-weight:700;">
              Your credentials
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAFAF7;border:1px solid #E8E3D8;border-left:3px solid #10B981;">
              <tr>
                <td style="padding:24px 24px 20px 24px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#64748B;width:180px;vertical-align:top">Email</td>
                      <td style="padding:6px 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#0F172A;vertical-align:top;word-break:break-all">${safeEmail}</td>
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
                <td style="background:#0F172A;">
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
              Course I &middot; The Fundamentals
            </p>
            <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.7;color:#334155;">
              Structure. Real camaraderie in your AE/SDR partnership. A first 90 days done the right way. That is where this begins.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding:10px 0;border-top:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#334155;">
                  <strong style="color:#0F172A;">Twelve courses.</strong> Three lessons each. Interactive exercises, not video lectures.
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-top:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#334155;">
                  <strong style="color:#0F172A;">Progress saves.</strong> Return at any hour. Pick up where you stopped.
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-top:1px solid #E8E3D8;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#334155;">
                  <strong style="color:#0F172A;">Five tools unlock along the way.</strong> Commission tracker. Alignment contracts. Strike plans. Yours when the lesson is done.
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
              <strong style="color:#0F172A;">If you need anything:</strong> reply here, or write to <a href="mailto:hello@aesdr.com" style="color:#10B981;text-decoration:underline;">hello@aesdr.com</a>. Real person, real inbox, 48-hour response.
            </p>
          </td>
        </tr>

        <!-- Sign-off -->
        <tr>
          <td style="padding:32px 48px 40px 48px;">
            <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.5;color:#0F172A;font-style:italic;">
              Begin.
            </p>
            <p style="margin:24px 0 0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#94A3B8;">
              &mdash; AESDR
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
            <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#10B981;font-weight:700;">
              Purchase Confirmed
            </p>
          </td>
        </tr>

        <!-- Editorial headline -->
        <tr>
          <td style="padding:0 48px 6px 48px;">
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:36px;line-height:1.1;letter-spacing:-0.01em;color:#0F172A;">
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
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAFAF7;border:1px solid #E8E3D8;border-left:3px solid #10B981;">
              <tr>
                <td style="padding:20px 24px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#64748B;width:180px;vertical-align:top">Plan</td>
                      <td style="padding:10px 0;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#0F172A;vertical-align:top">AESDR ${planLabel}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#64748B;vertical-align:top">Date</td>
                      <td style="padding:10px 0;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#0F172A;vertical-align:top">${date}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#64748B;vertical-align:top">Refund window</td>
                      <td style="padding:10px 0;border-bottom:1px solid #E8E3D8;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#0F172A;vertical-align:top">14 days from purchase</td>
                    </tr>
                    <tr>
                      <td style="padding:16px 0 6px;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#0F172A;font-weight:700;vertical-align:top">Amount paid</td>
                      <td style="padding:16px 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1;color:#0F172A;vertical-align:top;font-weight:400">$${amount}</td>
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
              Need a formal invoice, VAT details, or a billing change? Reply here and we'll handle it. Questions go to <a href="mailto:hello@aesdr.com" style="color:#10B981;text-decoration:underline;">hello@aesdr.com</a>.
            </p>
          </td>
        </tr>

        <!-- Sign-off -->
        <tr>
          <td style="padding:32px 48px 40px 48px;">
            <p style="margin:0;font-family:'SF Mono',Consolas,monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#94A3B8;">
              &mdash; AESDR
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
  <p>Most reps who buy a course like this never do Lesson 1. Not because the course is bad. Because there's never an obvious moment to start. Tomorrow's full. Next week's full. Then it's been a month.</p>
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
<div style="font-family:system-ui,-apple-system,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;line-height:1.7">
  <p>Hey ${safeName},</p>
  <p>Day 3. If you've started Course 1 — nice. If you haven't, no guilt. Open it when you're ready.</p>
  <p><strong>One thing from Course 2 to keep in your back pocket:</strong></p>
  <p>The "blame chain" is a pattern where everyone points fingers — AEs and SDRs blame their manager, managers blame marketing, and marketing blames the product. Nobody's fixing anything.</p>
  <p>Course 2 gives you a framework to break the chain — not by being a hero, but by asking the right questions in the right meetings.</p>
  <p><strong><a href="${SITE}/dashboard" style="color:#10B981">Continue where you left off →</a></strong></p>
  <p>— AESDR</p>
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
<div style="font-family:system-ui,-apple-system,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;line-height:1.7">
  <p>Hey ${safeName},</p>
  <p>Week 1. Here's where most AESDR students are right now: finishing Course 3.</p>
  <p>Course 3 is where you build the <strong>AE/SDR Alignment Contract</strong> — a one-page document that gets both sides on the same page about handoffs, expectations, and accountability. It's the single most downloaded tool in the program.</p>
  <p>If you're ahead of that: great. Courses 4–6 get into manager dynamics, career pathing, and network building.</p>
  <p>If you're behind: that's fine too. This isn't a race. It's a system. Come back to it when you have 20 minutes.</p>
  <p><strong><a href="${SITE}/course/3" style="color:#10B981">Jump to Course 3 →</a></strong></p>
  <p>— AESDR</p>
  <p style="font-size:13px;color:#666"><em>P.S. — If something about the course isn't working for you, reply and tell me. I'd rather fix it than have you quietly disengage.</em></p>
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
<div style="font-family:system-ui,-apple-system,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;line-height:1.7">
  <p>Hey,</p>
  <p>You got pretty close to starting the AESDR curriculum — then stepped away. No judgment. Spending $199 on yourself when you're living on commission income is a real decision.</p>
  <p>Here's what I'd want to know if I were you:</p>
  <p><strong>What you're actually getting:</strong></p>
  <ul>
    <li>12 courses with interactive exercises (not video lectures you'll never finish)</li>
    <li>5 downloadable tools you'll use in your actual workflow — commission tracker, alignment contracts, strike plans</li>
    <li>Frameworks built by someone who carried a quota for 9 years, not someone who read about it</li>
  </ul>
  <p><strong>What you're not getting:</strong></p>
  <ul>
    <li>Motivational content</li>
    <li>Generic scripts</li>
    <li>Anything that sounds like it came from a LinkedIn post</li>
  </ul>
  <p>If you're on the fence because of the money: the 14-day refund policy is real. No questions asked. Try it. If it doesn't help, get your money back.</p>
  <p><strong><a href="${SITE}/#pricing" style="color:#10B981">Complete Your Purchase →</a></strong></p>
  <p>— AESDR</p>
  <p style="font-size:13px;color:#666"><em>P.S. — The first course covers surviving your first 90 days, including the manager types that make or break new AEs and SDRs. If that's not relevant to you right now, save your money. But if it is — you already know.</em></p>
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
<div style="font-family:system-ui,-apple-system,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;line-height:1.7">
  <p>Hey,</p>
  <p>Last email about this — I promise.</p>
  <p>I talk to a lot of SDRs and AEs. The three reasons people don't invest in themselves are always the same:</p>
  <p><strong>"I can't afford it right now."</strong><br>Fair. Commission months are unpredictable. But here's the math: if one framework from this course helps you close one extra deal this quarter, the ROI isn't 2x — it's probably 10x. The course costs less than one decent dinner in most cities.</p>
  <p><strong>"I don't have time."</strong><br>Each lesson is designed to be completed alongside a full-time quota. No 4-hour video modules. Interactive screens you can do on your commute or during a slow Friday.</p>
  <p><strong>"I've seen courses like this before."</strong><br>You haven't. This one doesn't teach you to "smile and dial." It teaches you to audit your commission structure, manage a bad manager, build a professional network that actually helps you, and create a 72-hour action plan when everything goes sideways.</p>
  <p><strong><a href="${SITE}/#pricing" style="color:#10B981">Complete Your Purchase →</a></strong></p>
  <p>14 days to try it. Full refund if it's not for you.</p>
  <p>— AESDR</p>
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
<div style="font-family:system-ui,-apple-system,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;line-height:1.7">
  <p>Hey ${safeName},</p>
  <p>It's been a few days since you were in the course. No guilt — life happens, quota happens, Monday meetings happen.</p>
  <p>You left off at <strong>${safeTitle}</strong>. Here's a direct link to pick up where you stopped:</p>
  <p><strong><a href="${SITE}/course/${safeLesson}" style="color:#10B981">Continue ${safeTitle} →</a></strong></p>
  <p>If you're stuck or something didn't make sense, reply to this email. Real person, real inbox.</p>
  <p>— AESDR</p>
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
<div style="font-family:system-ui,-apple-system,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;line-height:1.7">
  <p>Hey ${safeName},</p>
  <p>Not going to nag. Instead, here's one actionable thing from the course you haven't seen yet:</p>
  <p><strong>The Weekly Alignment Email</strong></p>
  <p>Every Friday, send your manager a 5-line email:</p>
  <ol>
    <li>What I did this week (metrics + context)</li>
    <li>One win</li>
    <li>One blocker (with a proposed solution)</li>
    <li>One question for them</li>
    <li>My plan for next week</li>
  </ol>
  <p>That's it. Takes 8 minutes. It flips the power dynamic in your 1:1 and creates a paper trail that protects you in reviews.</p>
  <p>There's more where that came from.</p>
  <p><strong><a href="${SITE}/dashboard" style="color:#10B981">Jump back in →</a></strong></p>
  <p>— AESDR</p>
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
<div style="font-family:system-ui,-apple-system,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;line-height:1.7">
  <p>Hey ${safeName},</p>
  <p>This is the last re-engagement email I'll send. After this, I'll leave you alone.</p>
  <p>Before I do — I'd genuinely like to know:</p>
  <p><strong>Was something off?</strong></p>
  <ul>
    <li>Was the content not relevant to your role?</li>
    <li>Did something feel confusing or poorly designed?</li>
    <li>Did life just get in the way?</li>
  </ul>
  <p>Reply with a one-liner if you want. Or don't. Either way, your account is active and your progress is saved. Come back whenever.</p>
  <p>If you need anything: <a href="mailto:hello@aesdr.com" style="color:#10B981">hello@aesdr.com</a></p>
  <p>— AESDR</p>
  <p style="font-size:13px;color:#666"><em>P.S. — If you want to pick it back up, here's the link: <a href="${SITE}/course/${safeLesson}" style="color:#10B981">Continue →</a></em></p>
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
<div style="font-family:system-ui,-apple-system,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;line-height:1.7">
  <p>Hey ${safeName},</p>
  <p>You just finished the entire AESDR curriculum. That's rare — most people don't finish most things.</p>
  <p><strong>Quick ask — takes 30 seconds:</strong></p>
  <p>On a scale of 1–5, how useful was this course for your day-to-day work?</p>
  <p>Reply with a number, or reply with a one-sentence testimonial I can use on the site. Something like:</p>
  <p style="padding:12px 16px;background:#f5f5f5;border-left:3px solid #10B981;margin:12px 0"><em>"AESDR helped me [specific thing]. I'd recommend it for [type of AE/SDR]."</em></p>
  <p>Your first name and role are enough — no need to share your company if you don't want to.</p>
  <p>If you'd rate it 1–3, I want to hear what didn't work. Reply with what was missing or what felt off. I'd rather improve it than pretend everything's perfect.</p>
  <p>— AESDR</p>
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
<div style="font-family:system-ui,-apple-system,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;line-height:1.7">
  <p>Hey ${safeName},</p>
  <p>Quick follow-up on my last email. I know you're busy — this takes 30 seconds.</p>
  <p><strong>Option 1:</strong> Reply with a rating (1–5 stars).</p>
  <p><strong>Option 2:</strong> Reply with one sentence about what was most useful. I'll use it as a testimonial (first name + role only).</p>
  <p><strong>Option 3:</strong> Tell me what to fix. "Course X was confusing" or "the tool in Course 9 didn't help" — that kind of thing.</p>
  <p>Any of those three would be genuinely helpful.</p>
  <p>— AESDR</p>
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
<div style="font-family:system-ui,-apple-system,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;line-height:1.7">
  <p>Hey,</p>
  <p><strong>${safeName}</strong> has added you to their team's AESDR account.</p>
  <p>AESDR is a 12-course professional development curriculum built for AEs and SDRs in SaaS. Interactive exercises, real frameworks, no motivational fluff.</p>
  <div style="background:#f8f9fa;padding:16px 20px;margin:20px 0;border-left:3px solid #10B981">
    <p style="margin:0 0 6px;font-weight:700">What you get:</p>
    <ul style="margin:0;padding-left:20px">
      <li>All 12 courses with interactive exercises</li>
      <li>5 downloadable tools (commission tracker, alignment contracts, etc.)</li>
      <li>Your own progress tracking and personalized takeaway artifacts</li>
    </ul>
  </div>
  <p style="margin:24px 0"><a href="${acceptUrl}" style="display:inline-block;padding:14px 28px;background:#10B981;color:#fff;font-weight:700;text-decoration:none;font-size:16px">Accept Invite & Start →</a></p>
  <p>This invite is tied to your email address. Click the link above to create your account (or sign in if you already have one).</p>
  <p>— AESDR</p>
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
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-style:italic;font-size:32px;line-height:1.15;letter-spacing:-0.01em;color:#0F172A;">
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
                <td style="background:#0F172A;">
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
              &mdash; AESDR
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
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-style:italic;font-size:36px;line-height:1.1;letter-spacing:-0.01em;color:#0F172A;">
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
                <td style="background:#0F172A;">
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
              &mdash; AESDR
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
