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
          Most affiliate hubs hide the operating doctrine. AESDR publishes it. Per canon §1.4 — borrowed trust is a merciless mirror.
        </p>
      </div>

      <article style={essayStyle}>
        <h2 style={h2Style}>1. What we believe.</h2>
        <p style={pStyle}>
          AESDR runs on six foundational doctrines, all non-negotiable.
        </p>
        <ul style={listStyle}>
          <li><strong>Workshop-first, not link-first.</strong> Every pilot leads with a single live workshop into the partner&rsquo;s audience, run by AESDR. The workshop earns the sale; the link merely attributes it.</li>
          <li><strong>Founder backstage, host-fronted.</strong> The founder is invisible to the audience by default, occasionally visible by choice. The founder is fully visible to partners. A contracted host delivers workshops; the brand outlives the host.</li>
          <li><strong>Less affiliate empire. More founding vineyard.</strong> Small rows. Careful pruning. Honest yield. We recruit a handful of tightly aligned partners, not a marketplace. Volume is not a virtue here; conversion quality is.</li>
          <li><strong>Borrowed trust is a merciless mirror.</strong> Whatever weakness exists in our message, page, deck, or follow-up, a partner&rsquo;s audience will surface in 60 minutes. We do not borrow trust we have not earned the right to spend.</li>
          <li><strong>Real Operator. Never guru.</strong> We are the operating manual, not the motivation engine. We do not perform expertise; we install it. If a piece of copy could be lifted onto a LinkedIn carousel without anyone noticing, it is wrong.</li>
          <li><strong>Honesty is the differentiator.</strong> We say out loud what competitors won&rsquo;t: who should not buy, where the math breaks, what happens when the script runs out. Honesty is not a tone. It is a competitive position.</li>
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

        <h2 style={h2Style}>3. Why the founder is invisible.</h2>
        <p style={pStyle}>
          Partner-prospects expect a founder bio. We don&rsquo;t publish one on audience-facing surfaces. Per canon §12.1, the founder is invisible to audience by default — fully visible to you, in the partner conversation.
        </p>
        <p style={pStyle}>
          Why: AESDR&rsquo;s brand is not founder-led. The brand is the operating standard the curriculum encodes. If <code style={codeStyle}>[HOST_FIRST_NAME]</code> is replaced one day, the curriculum doesn&rsquo;t change. Same with the founder — the brand outlives any one person delivering it. That&rsquo;s the doctrine; it&rsquo;s also why partner-prospects don&rsquo;t see a credibility-by-credentials surface here. The credibility surface is the canon, the curriculum, the 5 production tools, and the quality of the application call.
        </p>

        <h2 style={h2Style}>4. Honesty as competitive position.</h2>
        <p style={pStyle}>
          Most sales-training programs sand the rough edges. AESDR doesn&rsquo;t — for two reasons.
        </p>
        <p style={pStyle}>
          First, the rough edges are the work. Lessons titled <em>&ldquo;Quotas Are Bullshit&rdquo;</em> and <em>&ldquo;Why SDRs Should Stay Single&rdquo;</em> are not metaphor. They&rsquo;re the lesson titles. Per canon §13, sanitization is forbidden — naming what&rsquo;s true is the move.
        </p>
        <p style={pStyle}>
          Second, the audience knows. Sophisticated buyers (and sophisticated partners) recognize sanded-corporate register in 30 seconds. Refusing to sand is the brand&rsquo;s operational signal that the curriculum behind the brand respects them as adults. Per canon §1.6.
        </p>

        <h2 style={h2Style}>5. What this means for partners.</h2>
        <p style={pStyle}>
          You&rsquo;re partnering with a brand that publishes its operating doctrine instead of hiding it. That includes:
        </p>
        <ul style={listStyle}>
          <li>The full canon excerpt is in your kit at <a href="/partners/kit" style={linkStyle}>/partners/kit</a>.</li>
          <li>The honest-disqualification list is at <a href="/partners/who-we-dont-work-with" style={linkStyle}>/partners/who-we-dont-work-with</a>. We name who we decline.</li>
          <li>The pricing doctrine is at <a href="/partners/program" style={linkStyle}>/partners/program</a>. List price, 30% commission, never discount.</li>
          <li>The founder-visibility matrix is at canon §12.1 (excerpted in <a href="/partners/kit" style={linkStyle}>/partners/kit</a>). What we say to partners; what we say to audiences; the difference.</li>
        </ul>
        <p style={pStyle}>
          If any of this is the kind of operating model you want a partner to bring you, apply. If it&rsquo;s not, decline. Per canon §13: we&rsquo;d rather you decline now than end a pilot in week 4.
        </p>
      </article>

      <div style={{ padding: "96px 24px 0" }}>
        <HubCTA href="/partners/apply">Request a partner conversation →</HubCTA>
      </div>

      <CaveatLayer>
        PS — If you&rsquo;ve read this far, you&rsquo;ve done more partner-side homework than 90% of programs ask of you. AESDR thanks you. Apply or decline; both are honest answers.
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
