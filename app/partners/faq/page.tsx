/**
 * Page: /partners/faq
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.5"
 * Canon: §3.3 (voice ratio 80/20), §10.1 (FTC), §13 (honesty)
 * Copy sources: D23 partner-facing FAQ (Q05/Q07 lifts), Phase 0 #5
 *               (never-discount), canon §1, §12, §14
 * Five-question check: PASS
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/partners/HubChrome";
import { MonoEyebrow, HubCTA, CaveatLayer } from "@/components/partners/HubElements";
import { FAQAccordion } from "@/components/partners/FAQAccordion";

export const metadata: Metadata = {
  title: "Partner FAQ · AESDR",
  description: "Twelve questions. Plain answers. The buyer FAQ lives at /syllabus.",
};

const FAQ_ITEMS = [
  {
    q: "Why so few partners?",
    a: (
      <p>
        Right now AESDR works with a handful of partners at a time, not a marketplace &mdash; partly because we&rsquo;re in Pilot Cohort 1, partly because we&rsquo;d rather run a small number of partnerships well than a large number of them on autopilot. We may grow the program after Cohort 1 wraps; we may not. The current shape is the current shape.
      </p>
    ),
  },
  {
    q: "Why won't you discount?",
    a: (
      <p>
        The reason your audience trusts you is that you sound like yourself. If we let you offer them 20% off they couldn&rsquo;t get elsewhere, the recommendation starts feeling transactional. We&rsquo;d rather your audience see you recommending something you&rsquo;d recommend anyway. <strong>Same price every time, every audience, every channel.</strong>
      </p>
    ),
  },
  {
    q: "What's the commission rate?",
    a: (
      <p>
        30% of net revenue (gross minus refunds, payment fees, sales tax). Net is calculated after the 14-day refund window closes. Payment is net-45 from close of the 30-day attribution window.
      </p>
    ),
  },
  {
    q: "How does attribution work?",
    a: (
      <p>
        30-day cookie window from the first time someone clicks your link. If they come back
        via Google or directly within those 30 days and sign up, you&rsquo;re still the attributed
        partner. Commission gets paid on net revenue (after refunds and processing fees). Your
        Friday report shows every click, every signup, and your running commission total.
      </p>
    ),
  },
  {
    q: "Do I get the AESDR email list?",
    a: (
      <p>
        No, ever. List co-promotion is not part of any AESDR partner agreement. Reciprocally, AESDR doesn&rsquo;t request your list either. Audience data belongs to the person who signed up, not to either of us to trade.
      </p>
    ),
  },
  {
    q: "How is AESDR different from free content my audience can get on YouTube?",
    a: (
      <>
        <p>You&rsquo;re right that there is a near-infinite supply of free content about SaaS sales. Three things free content cannot do:</p>
        <p style={{ marginTop: 14 }}>
          <strong>Sequence.</strong> Free content is published in the order the publisher feels like publishing. AESDR is sequenced; you move from foundational to advanced in a deliberate order.
        </p>
        <p style={{ marginTop: 14 }}>
          <strong>Frame.</strong> Free content optimizes for engagement. AESDR is the operating manual — the part the free content skipped because it doesn&rsquo;t perform well in a 60-second clip.
        </p>
        <p style={{ marginTop: 14 }}>
          <strong>Accountability.</strong> Free content is consumed alone, nodded at, and forgotten. AESDR has interactive worksheets, takeaway tools, and a Discord (Untamed) where AEs and SDRs in your situation are talking about what&rsquo;s working.
        </p>
      </>
    ),
  },
  {
    q: "Who is AESDR for, and who shouldn't I send?",
    a: (
      <>
        <p>It&rsquo;s for SaaS AEs and SDRs across the career arc &mdash; first-year hires trying to ramp, third-year veterans trying to break out, and ten-year veterans who want a re-look at fundamentals. If your audience has any of those people in it, you&rsquo;re a fit.</p>
        <p style={{ marginTop: 14 }}>Who not to send:</p>
        <ul style={{ marginTop: 14, paddingLeft: 0, listStyle: "none" }}>
          <li style={{ marginBottom: 8 }}>&mdash; Veteran AEs and SDRs who think they&rsquo;ve already figured it out. (The ones open to revisiting basics are absolutely a fit.)</li>
          <li style={{ marginBottom: 8 }}>&mdash; Anyone whose distribution is hustle-culture or motivational content. We&rsquo;re the opposite of that.</li>
          <li style={{ marginBottom: 8 }}>&mdash; Anyone hunting a credential or LinkedIn-friendly badge. The course doesn&rsquo;t issue one and we&rsquo;re not changing that.</li>
          <li style={{ marginBottom: 8 }}>&mdash; AEs and SDRs not currently in a sales seat. AESDR isn&rsquo;t a &ldquo;how to break into sales&rdquo; program.</li>
          <li>&mdash; AEs and SDRs who&rsquo;ve started three programs this year and finished none. The issue isn&rsquo;t free vs paid.</li>
        </ul>
      </>
    ),
  },
  {
    q: "What does the workshop actually look like?",
    a: (
      <p>
        60 minutes live + 10–15 minutes Q&amp;A, capped at 75 minutes total. The deck names the territory but doesn&rsquo;t teach the lessons that live behind it — the workshop is a teaser, not a sample. A small selection of catalog cards at the close, then the offer, then close. Locked sections (the framework, the offer slide) and ad-lib sections (the host&rsquo;s field stories) are marked clearly so the host knows what to read verbatim and what to make their own.
      </p>
    ),
  },
  {
    q: "What about the founder?",
    a: (
      <p>
        The host runs the public-facing workshops. The founder builds the curriculum and is open to partners via email throughout the pilot &mdash; applying, prep calls, post-pilot debriefs, anything you need. We made this split early because good curricula tend to outlive their founders, and we want the brand to outlive ours too. Nothing weird about it &mdash; talk to whoever makes sense.
      </p>
    ),
  },
  {
    q: "What if a pilot doesn't work?",
    a: (
      <p>
        We file a continue-or-end memo within 72 hours of the pilot&rsquo;s end. If the decision is to end it, we send you a close-out note within 48 hours, signed by the founder by name. The door stays open for a future revisit. We part as adults.
      </p>
    ),
  },
  {
    q: "What's the host situation?",
    a: (
      <p>
        Host casting is in progress. The host&rsquo;s job is to deliver the curriculum — not to sell their personal brand. AESDR was built to outlast any one host; if we change hosts in two years, the curriculum is the same. We&rsquo;ll introduce you to the host before your workshop date.
      </p>
    ),
  },
  {
    q: "Can my audience get the program at a different price than aesdr.com lists?",
    a: (
      <p>
        No. List price applies always — $249 SDR, $299 AE, $1,499 Team. AESDR doesn&rsquo;t run promotional codes, partner-stack discounts, or pricing variance for any audience. If a partner pushes for it, that&rsquo;s a fit signal we note.
      </p>
    ),
  },
];

export default function FAQPage() {
  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0" }}>
        <MonoEyebrow>AESDR · PARTNERS · FAQ</MonoEyebrow>
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
          Twelve questions. Plain answers.
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
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          This is the FAQ for partners. The buyer FAQ lives at <a href="/syllabus" style={{ color: "var(--ink)", textDecoration: "underline" }}>/syllabus</a>.
        </p>
      </div>

      <FAQAccordion items={FAQ_ITEMS} />

      <CaveatLayer>
        If a question you have isn&rsquo;t here, it&rsquo;s because we don&rsquo;t have a clean answer yet — apply anyway, we&rsquo;ll tell you so directly.
      </CaveatLayer>

      <div style={{ padding: "32px 24px 0" }}>
        <HubCTA href="/partners/apply">Request a partner conversation →</HubCTA>
      </div>
    </HubPage>
  );
}
