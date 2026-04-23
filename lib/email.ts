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
  'List-Unsubscribe': '<mailto:support@aesdr.com?subject=UNSUBSCRIBE>',
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
};

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

        <!-- Header / monogram -->
        <tr>
          <td style="padding:36px 48px 8px 48px;">
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
                    Real reps. Real deals. Real accountability. A private room where the work continues between lessons &mdash; no guru energy, no motivational noise.
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
              <strong style="color:#0F172A;">If you need anything:</strong> reply here, or write to <a href="mailto:support@aesdr.com" style="color:#10B981;text-decoration:underline;">support@aesdr.com</a>. Real person, real inbox, 48-hour response.
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

        <!-- Kicker -->
        <tr>
          <td style="padding:36px 48px 6px 48px;">
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
              Need a formal invoice, VAT details, or a billing change? Reply here and we'll handle it. Questions go to <a href="mailto:support@aesdr.com" style="color:#10B981;text-decoration:underline;">support@aesdr.com</a>.
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
  <p>The "blame chain" is a pattern where everyone points fingers — reps blame their manager, managers blame marketing, and marketing blames the product. Nobody's fixing anything.</p>
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
  <p style="font-size:13px;color:#666"><em>P.S. — The first course covers surviving your first 90 days, including the manager types that make or break new reps. If that's not relevant to you right now, save your money. But if it is — you already know.</em></p>
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
  <p>If you need anything: <a href="mailto:support@aesdr.com" style="color:#10B981">support@aesdr.com</a></p>
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
  <p style="padding:12px 16px;background:#f5f5f5;border-left:3px solid #10B981;margin:12px 0"><em>"AESDR helped me [specific thing]. I'd recommend it for [type of rep]."</em></p>
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
    AESDR · <a href="mailto:support@aesdr.com" style="color:#999">support@aesdr.com</a><br>
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
          AESDR &middot; <a href="mailto:support@aesdr.com" style="color:#94A3B8;text-decoration:none;">support@aesdr.com</a>
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
