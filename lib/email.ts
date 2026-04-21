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
  const passwordLine = tempPassword
    ? `<p style="margin:0 0 4px"><strong>Temporary password:</strong> <code style="background:#e8e8e8;padding:2px 8px;border-radius:3px;font-size:15px;letter-spacing:1px">${esc(tempPassword)}</code></p>
       <p style="margin:8px 0 0;font-size:13px;color:#666">You'll be asked to set your own password on first sign-in.</p>`
    : `<p style="margin:8px 0 0;font-size:13px;color:#666">Use your existing password to sign in.</p>`;
  const credentialsBlock = `
  <div style="background:#f8f9fa;padding:16px 20px;margin:20px 0;border-left:3px solid #10B981">
    <p style="margin:0 0 6px;font-weight:700">Your account:</p>
    <p style="margin:0 0 4px"><strong>Email:</strong> ${safeEmail}</p>
    ${passwordLine}
  </div>`;
  return `
<div style="font-family:system-ui,-apple-system,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;line-height:1.7">
  <p>Welcome to AESDR${name !== 'there' ? `, ${safeName}` : ''}.</p>
  <p>No long onboarding. No orientation video. Here's what matters:</p>
  ${credentialsBlock}
  <p style="margin:24px 0"><a href="${loginUrl}" style="display:inline-block;padding:14px 28px;background:#10B981;color:#fff;font-weight:700;text-decoration:none;font-size:16px">Sign In &amp; Start &rarr;</a></p>
  <p>Course 1 covers the fundamentals — creating structure, building real camaraderie in your AE/SDR partnership, and setting up your first 90 days the right way.</p>
  <p><strong>A few things to know:</strong></p>
  <ul>
    <li>There are 12 courses. Each has 3 lessons with interactive exercises.</li>
    <li>Your progress saves automatically. Pick up where you left off anytime.</li>
    <li>Five courses come with downloadable tools (commission tracker, alignment contracts, etc.) — they unlock when you complete the lesson.</li>
  </ul>
  <p><strong>Join the community:</strong> <a href="https://discord.gg/uEpAz3yw" style="color:#10B981">AESDR Discord</a></p>
  <p><strong>If you need help:</strong> Reply to this email or reach out at <a href="mailto:support@aesdr.com" style="color:#10B981">support@aesdr.com</a>. Real person, real inbox, 48-hour response time.</p>
  <p>Go.</p>
  <p>— AESDR</p>
  ${footer()}
</div>`;
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
  return `
<div style="font-family:system-ui,-apple-system,sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px;line-height:1.7">
  <p style="font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#10B981;margin-bottom:4px">Purchase Confirmed</p>
  <p>Hey ${safeName},</p>
  <p>This confirms your AESDR purchase. Keep this email for your records.</p>
  <div style="background:#f8f9fa;padding:16px 20px;margin:16px 0;border-left:3px solid #10B981">
    <p style="margin:0 0 4px"><strong>Plan:</strong> AESDR ${planLabel}</p>
    <p style="margin:0 0 4px"><strong>Amount:</strong> $${amount}</p>
    <p style="margin:0 0 4px"><strong>Date:</strong> ${date}</p>
    <p style="margin:0"><strong>Refund window:</strong> 14 days from purchase</p>
  </div>
  <p>If you need a formal invoice or have billing questions, reply to this email.</p>
  <p>— AESDR</p>
  ${footer()}
</div>`;
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
