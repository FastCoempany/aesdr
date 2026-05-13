/**
 * Page: /partners/how-we-work (PROMOTED to Phase 1 per Q5 ratification 2026-05-04)
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Phase 3 — /partners/how-we-work" (promoted)
 * Canon: §1 (foundational doctrines), §3 (the two voices), §10 (compliance),
 *        §12 (founder-backstage), §13 (honesty discipline)
 * Copy sources: AFFILIATE_BRAND_CANON.md §§1, 3.1, 3.2, 12.1, 13 sanitized
 *               for partner-facing register.
 * Five-question check: PASS
 *
 * The brand-doctrine page. Per build-prompt §[8] item 7: "the disqualification
 * panel placement is the most-impactful single decision" — and this page is its
 * companion. Partners read this to understand what they're partnering with.
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/partners/HubChrome";
import { MonoEyebrow, HubCTA, CaveatLayer } from "@/components/partners/HubElements";

export const metadata: Metadata = {
  title: "How We Work · AESDR Partners",
  description:
    "What we believe. The two voices. Why the founder is invisible. Honesty as competitive position.",
};

export default function HowWeWorkPage() {
  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0" }}>
        <MonoEyebrow>AESDR · HOW WE WORK · BRAND DOCTRINE</MonoEyebrow>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(36px, 5vw, 48px)",
            color: "var(--ink)",
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: 24,
          }}
        >
          What you&rsquo;re partnering with.
        </h1>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--muted)",
            textAlign: "center",
            lineHeight: 1.7,
            marginBottom: 16,
            maxWidth: 640,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          The brand doctrine, in advance. Your audience will read AESDR through your endorsement &mdash; this is the long version of what they&rsquo;ll be reading.
        </p>
      </div>

      <article style={essayStyle}>
        <h2 style={h2Style}>1. What we believe.</h2>
        <p style={pStyle}>
          AESDR runs on six things, all non-negotiable.
        </p>
        <ul style={listStyle}>
          <li><strong>We sell by teaching, not by linking.</strong> Every pilot kicks off with one live 60-minute workshop into your audience. We host it. That&rsquo;s the part that does the selling &mdash; the link just tells us who came from you.</li>
          <li><strong>The host runs the workshop. The founder builds the curriculum.</strong> The host delivers the live sessions; the founder is around for everything else &mdash; partner emails, prep, debriefs. Good curricula tend to outlive their founders, and we built the brand assuming ours will too.</li>
          <li><strong>Small program on purpose.</strong> Right now we work with a handful of partners at a time, not a marketplace. Cohort 1 is forming. We may scale after; we may not.</li>
          <li><strong>Your audience will read AESDR through your endorsement.</strong> Whatever&rsquo;s off about our message, page, or deck, your audience will catch in 60 minutes. So we work on the message hard and tell you what we&rsquo;re seeing.</li>
          <li><strong>Practical, not motivational.</strong> AESDR is the operating manual nobody wrote down. Not &ldquo;crush it.&rdquo; Not &ldquo;mindset.&rdquo; Just the work &mdash; cold-calling, gatekeepers, pipeline reads, what to do when the script runs out.</li>
          <li><strong>We&rsquo;re open about who shouldn&rsquo;t buy.</strong> We publish who the program isn&rsquo;t for so the right people enroll and the wrong ones don&rsquo;t waste their money. It also makes your recommendations easier to make.</li>
        </ul>

        <h2 style={h2Style}>2. The two voices.</h2>
        <p style={pStyle}>
          AESDR is character-driven. Two voices, always present, never blended into mush.
        </p>
        <p style={pStyle}>
          <strong>Rowan</strong> — the voice that closes. Surgical, declarative, high-status. Treats environment, behavior, math, and identity as infrastructure. *&ldquo;Every month, they reset your number to zero.&rdquo;* *&ldquo;You are not building a career. You are surviving one.&rdquo;*
        </p>
        <p style={pStyle}>
          <strong>Michael</strong> — the voice at 2am. Confessional, deadpan, embarrassingly specific. Names the laundry pile. Quotes the bad number. Closes with a one-word punchline. *&ldquo;I have a degree. From a university. With a campus.&rdquo;*
        </p>

        <h2 style={h2Style}>3. Why the founder isn&rsquo;t on the homepage.</h2>
        <p style={pStyle}>
          You might be wondering why there&rsquo;s no founder bio on the audience-facing site. Short answer: AESDR&rsquo;s brand isn&rsquo;t founder-led, on purpose. The brand is the operating standard the curriculum encodes. The host who delivers the lessons today might not be the host five years from now &mdash; the curriculum is the same either way. Same with the founder. The brand was built to outlive both.
        </p>
        <p style={pStyle}>
          For partners, this works differently. You&rsquo;ll talk to the founder directly throughout the pilot &mdash; on applying, prep calls, post-pilot debriefs, anything else. There&rsquo;s no &ldquo;founder you can&rsquo;t reach&rdquo; thing here. It&rsquo;s just a choice about where they show up: in your inbox, not on a public bio page.
        </p>

        <h2 style={h2Style}>4. Honesty as competitive position.</h2>
        <p style={pStyle}>
          Most sales-training programs sand the rough edges. AESDR doesn&rsquo;t — for two reasons.
        </p>
        <p style={pStyle}>
          First, the rough edges are the work. Lessons titled <em>&ldquo;Quotas Are Bullshit&rdquo;</em> and <em>&ldquo;Why SDRs Should Stay Single&rdquo;</em> are not metaphor. They&rsquo;re the lesson titles. Sanitizing them would lose the audience the program is built for — and that audience can spot sanitization in 30 seconds.
        </p>
        <p style={pStyle}>
          Second, sophisticated buyers (and sophisticated partners) recognize sanded-corporate register on sight. Refusing to sand is how the brand signals that the curriculum respects them as adults.
        </p>

        <h2 style={h2Style}>5. What this means for partners.</h2>
        <p style={pStyle}>
          You&rsquo;re partnering with a brand that publishes its operating doctrine instead of hiding it. That includes the partnership terms, the curriculum, the disqualification list (we publish who we decline), the pricing doctrine (list price, 30% commission, never discount), and how we handle founder visibility (visible to you in conversation; invisible to your audience).
        </p>
        <p style={pStyle}>
          If any of this is the kind of operating model you want a partner to bring you, apply. If it isn&rsquo;t, decline cleanly — we&rsquo;d rather you decline now than end a pilot in week four.
        </p>
      </article>

      <div style={{ padding: "96px 24px 0" }}>
        <HubCTA href="/partners/apply">Request a partner conversation →</HubCTA>
      </div>

      <CaveatLayer>
        PS &mdash; Thanks for reading this far. Apply if any of it fits. Skip it if it doesn&rsquo;t. Both are useful answers for both sides.
      </CaveatLayer>
    </HubPage>
  );
}

const essayStyle: React.CSSProperties = {
  maxWidth: 720,
  margin: "64px auto 0",
  padding: "0 24px",
};
const h2Style: React.CSSProperties = {
  fontFamily: "var(--display)",
  fontStyle: "italic",
  fontWeight: 700,
  fontSize: 28,
  color: "var(--ink)",
  marginTop: 48,
  marginBottom: 16,
};
const pStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: 17,
  color: "var(--ink)",
  lineHeight: 1.7,
  marginBottom: 16,
};
const listStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: 17,
  color: "var(--ink)",
  lineHeight: 1.7,
  marginBottom: 16,
  paddingLeft: 0,
  listStyle: "none",
};
const codeStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: 14,
  background: "var(--light)",
  padding: "1px 6px",
};
const linkStyle: React.CSSProperties = {
  color: "var(--ink)",
  textDecoration: "underline",
};
