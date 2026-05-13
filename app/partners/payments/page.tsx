/**
 * Page: /partners/payments
 * Payment mechanics in plain English. Phase 2 build.
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/partners/HubChrome";
import { MonoEyebrow, HubCTA, CaveatLayer } from "@/components/partners/HubElements";

export const metadata: Metadata = {
  title: "Payments · AESDR Partners",
  description:
    "How and when commissions clear. Methods, tax forms, refund handling, minimums — all in plain English.",
};

export default function PaymentsPage() {
  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0" }}>
        <MonoEyebrow>AESDR · PARTNERS · PAYMENTS</MonoEyebrow>
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
          Getting paid.
        </h1>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--muted)",
            textAlign: "center",
            lineHeight: 1.7,
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          How the money moves, when it moves, what happens on refunds, and the boring tax stuff. No surprises.
        </p>
      </div>

      <section style={section}>
        <Block label="The headline">
          <p style={pStyle}>
            <strong>30% of net revenue on every enrollment you bring in.</strong> Net-45 from the close of your 30-day attribution window &mdash; in practice, about 75 days from the day you send your first promotion.
          </p>
        </Block>

        <Block label="What &lsquo;net&rsquo; means">
          <p style={pStyle}>
            Net = gross revenue, minus:
          </p>
          <ul style={listStyle}>
            <li>Refunds within the 14-day refund window. (Realistic rate: ~10%.)</li>
            <li>Payment processor fees (Stripe: 2.9% + $0.30 per transaction, US cards).</li>
            <li>Sales tax we collected and remitted to states.</li>
          </ul>
          <p style={pStyle}>
            Your 30% is calculated off that net number. We don&rsquo;t skim &mdash; the formula is published and the Friday report shows the math on every line.
          </p>
        </Block>

        <Block label="When you actually see the money">
          <p style={pStyle}>
            Counting from the day you send your first promotion:
          </p>
          <ul style={listStyle}>
            <li>Days 0&ndash;30: attribution window open. Enrollments that come in via your link count.</li>
            <li>Day 30: attribution window closes. Last refunds within the 14-day window still settling.</li>
            <li>Day 44: refund window closes for the latest enrollments. Net revenue locked.</li>
            <li>Day 44+45 = Day 89: payment clears. ACH, Wise, or PayPal &mdash; your pick.</li>
          </ul>
        </Block>

        <Block label="Payment methods">
          <p style={pStyle}>
            ACH (US bank), Wise (international), or PayPal. We&rsquo;ll ask which you prefer when you sign. Stripe Connect partner payouts coming later in 2026; we&rsquo;ll migrate existing partners with no change to commission terms.
          </p>
        </Block>

        <Block label="Tax forms">
          <p style={pStyle}>
            US partners: we&rsquo;ll send a W-9 to fill out at signing. 1099-NEC issued in January for the prior tax year if total commissions cross $600.
          </p>
          <p style={pStyle}>
            Non-US partners: W-8BEN at signing. No US tax withholding applies for most non-US individuals on commission income; we&rsquo;ll handle the paperwork either way.
          </p>
        </Block>

        <Block label="Minimum payout">
          <p style={pStyle}>
            $50. If your pilot commission lands below $50, it rolls into your next pilot. If you have no next pilot, we pay it out anyway at Day 89 &mdash; the minimum exists to keep transfer fees from eating the whole commission on tiny pilots, not to withhold what you earned.
          </p>
        </Block>

        <Block label="What happens on refunds">
          <p style={pStyle}>
            AESDR has a 14-day, no-questions-asked refund. Within those 14 days, refunds reduce net revenue (and therefore your commission) before payment is calculated. We don&rsquo;t pay commission and then claw it back &mdash; we wait until the refund window closes, then calculate.
          </p>
          <p style={pStyle}>
            Refunds after the 14-day window are rare and case-by-case. We don&rsquo;t claw back commission on those.
          </p>
        </Block>

        <Block label="The $500 sign-on bonus (Cohort 1)">
          <p style={pStyle}>
            For partners we specifically invite to Pilot Cohort 1: $500 paid within 5 business days of agreement signing, via your stated payment method. Counted as separate from pilot commission, not subtracted from it. Reported as 1099-MISC income.
          </p>
          <p style={pStyle}>
            <em>Why it exists:</em> Most affiliate programs ask partners to take all the trust risk &mdash; promote first, see if we pay. The sign-on inverts that. We have skin in the game from day one, not just you.
          </p>
        </Block>

        <Block label="If something doesn't square">
          <p style={pStyle}>
            Email the founder directly. The Friday report shows our math; if you see a number that doesn&rsquo;t match what you&rsquo;re seeing on your end, we want to know before payment, not after.
          </p>
        </Block>
      </section>

      <div style={{ padding: "96px 24px 0" }}>
        <HubCTA href="/partners/apply">Request a partner conversation →</HubCTA>
      </div>

      <CaveatLayer>
        PS &mdash; The whole reason this page is this detailed is that the worst part of being an affiliate is not knowing when the money is coming. We&rsquo;d rather publish the timeline than have you email us asking.
      </CaveatLayer>
    </HubPage>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid var(--light)",
        padding: "32px 36px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontFamily: "var(--cond)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 14,
        }}
      >
        {label}
      </div>
      {children}
    </article>
  );
}

const section: React.CSSProperties = {
  maxWidth: 880,
  margin: "64px auto 0",
  padding: "0 24px",
};
const pStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: 17,
  color: "var(--ink)",
  lineHeight: 1.7,
  marginBottom: 12,
};
const listStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: 16,
  color: "var(--ink)",
  lineHeight: 1.7,
  paddingLeft: 0,
  listStyle: "none",
  marginBottom: 12,
};
