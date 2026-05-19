/**
 * Page: /partners/economics
 * Public-facing version of worked-commission-example.md, plus an
 * interactive calculator for partners to plug in their audience size
 * and conversion assumptions and see projected commission.
 *
 * Phase 2 build per partner-hub copy revision. Linked from /partners/program.
 */

import type { Metadata } from "next";
import { HubPage } from "@/components/partners/HubChrome";
import { MonoEyebrow, HubCTA, CaveatLayer } from "@/components/partners/HubElements";
import { EconomicsCalculator } from "@/components/partners/EconomicsCalculator";

export const metadata: Metadata = {
  title: "Economics · AESDR Partners",
  description:
    "The math, in advance. Real numbers from a real-shaped pilot, plus a calculator for your audience size.",
};

export default function EconomicsPage() {
  return (
    <HubPage>
      <div style={{ padding: "64px 24px 0" }}>
        <MonoEyebrow>AESDR · PARTNERS · ECONOMICS</MonoEyebrow>
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
          The math, in advance.
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
            marginBottom: 16,
          }}
        >
          Real numbers from a real-shaped pilot, plus a calculator. Plug in your audience size and conversion assumptions and see what the commission looks like before you apply.
        </p>
      </div>

      {/* Terms in plain English */}
      <section style={section}>
        <h2 style={h2Style}>The terms.</h2>
        <ul style={listStyle}>
          <li><strong>Commission:</strong> 30% of net revenue on every sale you bring in.</li>
          <li><strong>Net revenue:</strong> Gross minus refunds (within the 14-day window), payment processor fees (~2.9% + $0.30 per transaction), and any sales tax. It&rsquo;s what AESDR actually keeps. 30% of that goes to you.</li>
          <li><strong>Attribution window:</strong> 30 days from the first time someone clicks your partner-attributed link. If they come back later via Google or directly within those 30 days and enroll, you&rsquo;re still the attributed partner.</li>
          <li><strong>Refund window:</strong> 14 days from purchase, no questions asked. Net revenue is calculated <em>after</em> the refund window closes &mdash; we don&rsquo;t pay commission on something that gets refunded.</li>
          <li><strong>Payment:</strong> Net-45 from the close of the 30-day attribution window. So roughly 75 days from your first promotion send, you see the money.</li>
          <li><strong>Methods:</strong> ACH, Wise, or PayPal &mdash; whichever you prefer. We send a W-9 (US) or W-8BEN (non-US) at signing.</li>
        </ul>
      </section>

      {/* Calculator */}
      <section style={section}>
        <h2 style={h2Style}>Calculator.</h2>
        <p style={pStyle}>
          Plug in your audience size and adjust the assumptions. Defaults match what we&rsquo;ve seen in pilot-shaped events with similar audiences.
        </p>
        <EconomicsCalculator />
      </section>

      {/* Worked example */}
      <section style={section}>
        <h2 style={h2Style}>Worked example.</h2>
        <p style={pStyle}>
          A real-shape pilot to a 1,000-person audience. Plan-mix is typical for SaaS AE/SDR audiences &mdash; mostly SDRs, some AEs.
        </p>
        <div style={tableBox}>
          <Row k="Audience promoted to" v="1,000 people" />
          <Row k="Workshop registration rate" v="8% → 80 registrants" />
          <Row k="Live workshop attendance" v="45% of registrants → 36 live" />
          <Row k="Replay attendance" v="18% of registrants → 14 viewers" />
          <Row k="Enrollment conversion (live + replay)" v="12% of registrants → 10 enrollments" />
          <Row k="Plan mix" v="7 SDR @ $249 + 3 AE @ $299 = $2,640 gross" />
          <Row k="Less refunds (1 in 14-day window)" v="−$249" />
          <Row k="Less Stripe fees (3.2% effective)" v="−$76" />
          <Row k="Net revenue" v="$2,315" highlight />
          <Row k="Your 30% commission" v="$694.50" highlight />
        </div>
        <p style={smallNote}>
          That&rsquo;s ~$8.70 per registrant, ~$19 per live attendee. Numbers scale linearly with audience size at the same conversion rates &mdash; no break-point that shifts the math.
        </p>
      </section>

      {/* Tracking stack */}
      <section style={section}>
        <h2 style={h2Style}>Tracking + attribution.</h2>
        <p style={pStyle}>
          First-touch attribution. 30-day cookie. UTMs preserved through the registration → workshop → enrollment → Stripe flow. Three things happen when someone clicks your partner link:
        </p>
        <ul style={listStyle}>
          <li>A cookie sets in their browser with your partner code, scoped to a 30-day window.</li>
          <li>First-touch attribution gets recorded in the AESDR dashboard with their email (if they register) or as an anonymous click (if they don&rsquo;t).</li>
          <li>UTM parameters get logged for post-pilot reporting &mdash; which channel converted best, which post drove the best registrants.</li>
        </ul>
        <p style={pStyle}>
          You receive a Friday report each week of the pilot showing every click, registration, attendance, enrollment, refund, and projected commission. Same numbers we&rsquo;re looking at on our end.
        </p>
      </section>

      {/* Benchmarks note */}
      <section style={section}>
        <h2 style={h2Style}>About these numbers.</h2>
        <p style={pStyle}>
          The conversion assumptions above are based on workshop-format precedents in adjacent SaaS-AE/SDR audiences, not on multi-pilot AESDR data &mdash; Cohort 1 is the first cohort, so we don&rsquo;t have AESDR-specific benchmarks yet. We&rsquo;ll publish those after Cohort 1 wraps, with anonymized partner-by-partner data. If you want a calibration on what&rsquo;s realistic for your specific audience shape, ask in the partner conversation.
        </p>
      </section>

      <div style={{ padding: "96px 24px 0" }}>
        <HubCTA href="/partners/apply">Request a partner conversation →</HubCTA>
      </div>

      <CaveatLayer>
        PS &mdash; A 10,000-person send at the same rates produces ~$6,945 in commission. A 100-person send produces ~$70. The math is the math. Audience quality and fit matter more than size.
      </CaveatLayer>
    </HubPage>
  );
}

function Row({ k, v, highlight = false }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        padding: "14px 20px",
        borderBottom: "1px solid var(--light)",
        background: highlight ? "var(--light)" : "transparent",
        fontFamily: "var(--serif)",
        fontSize: 16,
        color: "var(--ink)",
        gap: 12,
      }}
    >
      <span style={{ fontWeight: highlight ? 700 : 400 }}>{k}</span>
      <span style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: highlight ? 700 : 400 }}>{v}</span>
    </div>
  );
}

const section: React.CSSProperties = {
  maxWidth: 880,
  margin: "64px auto 0",
  padding: "0 24px",
};
const h2Style: React.CSSProperties = {
  fontFamily: "var(--display)",
  fontStyle: "italic",
  fontWeight: 700,
  fontSize: 28,
  color: "var(--ink)",
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
  paddingLeft: 0,
  listStyle: "none",
};
const tableBox: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--light)",
  marginBottom: 16,
};
const smallNote: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontStyle: "italic",
  fontSize: 15,
  color: "var(--muted)",
  lineHeight: 1.6,
  marginTop: 12,
};
