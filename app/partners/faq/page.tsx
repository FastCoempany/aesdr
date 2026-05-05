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
        AESDR partners with a small number of operators at any given time — three to five.
        Per <code>AFFILIATE_BRAND_CANON.md</code> §1.3 (founding vineyard): small rows,
        careful pruning, honest yield. Volume is not a virtue here; conversion quality is.
      </p>
    ),
  },
  {
    q: "Why won't you discount?",
    a: (
      <p>
        Promotional discounting reads as the SaaS-affiliate-empire register the brand
        explicitly counter-positions against. AESDR&rsquo;s economic model is: partners earn
        commission for delivering the right audience to the right program at a fair price.
        The price is fair. It does not require a discount to be fair. <strong>Buyers see
        the same price every other AESDR buyer sees, every time.</strong>
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
        30-day cookie window from first qualifying click. Commission paid on net revenue
        after refunds. If a buyer arrives via your link, drifts away, comes back via Google,
        and enrolls within 30 days — you&rsquo;re still the attributed partner.
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
          <strong>Accountability.</strong> Free content is consumed alone, nodded at, and forgotten. AESDR has interactive worksheets, takeaway tools, and a Discord (Untamed) where reps in your situation are talking about what&rsquo;s working.
        </p>
      </>
    ),
  },
  {
    q: "Who shouldn't I send to AESDR?",
    a: (
      <>
        <p>Plain disqualification:</p>
        <ul style={{ marginTop: 14, paddingLeft: 0, listStyle: "none" }}>
          <li style={{ marginBottom: 8 }}>— Sales veterans 8+ years in. The first five courses will bore them.</li>
          <li style={{ marginBottom: 8 }}>— Anyone whose primary distribution is rise-and-grind / motivational content.</li>
          <li style={{ marginBottom: 8 }}>— Anyone wanting a credential or hiring-weight badge — AESDR doesn&rsquo;t issue one.</li>
          <li style={{ marginBottom: 8 }}>— Reps not currently in a sales seat (AESDR isn&rsquo;t &ldquo;how to get into sales&rdquo;).</li>
          <li>— Reps who&rsquo;ve enrolled in three programs in the last year and finished none — the issue isn&rsquo;t free vs paid.</li>
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
        AESDR is founder-backstage, host-fronted. The founder is fully visible to partners (that&rsquo;s you, in this conversation) and invisible to audience by default. The brand is character-led — Rowan and Michael are the brand faces, not any one human. The host carries the brand publicly; the founder carries the partnership.
      </p>
    ),
  },
  {
    q: "What if a pilot doesn't work?",
    a: (
      <p>
        We file a kill-or-keep memo within 72 hours of the pilot&rsquo;s end. If the decision is to end it, we send you a close-out note within 48 hours, signed by the founder by name. The door stays open for a future revisit. We part as adults.
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
