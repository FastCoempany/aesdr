import type { Metadata } from "next";
import LegalShell, { Section, DocLink } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service | AESDR",
  description: "AESDR terms of service — usage rights, limitations, and legal agreement.",
};

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="Legal · Terms"
      title="Terms of Service"
      lastUpdated="June 29, 2026"
      current="terms"
      ghostNumber="03"
    >
      <Section title="1. Acceptance of Terms">
        <p>
          By accessing or purchasing the AESDR course curriculum, you agree to
          be bound by these Terms of Service. If you do not agree, do not use
          the platform.
        </p>
      </Section>

      <Section title="2. Account & Access">
        <p>
          You are responsible for maintaining the confidentiality of your
          login credentials. One purchase grants access to one individual.
          Sharing login credentials or course materials with others is
          prohibited.
        </p>
      </Section>

      <Section title="3. Intellectual Property">
        <p>
          All course content, tools, frameworks, and materials are the
          intellectual property of AESDR. You may not reproduce, distribute,
          modify, or create derivative works from any course content without
          prior written permission.
        </p>
      </Section>

      <Section title="4. Acceptable Use">
        <p>You agree not to:</p>
        <ul style={{ paddingLeft: 22, marginTop: 8 }}>
          <li>Share, resell, or redistribute course content</li>
          <li>Use automated tools to scrape or download course materials</li>
          <li>Misrepresent your identity or affiliation</li>
          <li>Interfere with or disrupt the platform</li>
        </ul>
      </Section>

      <Section title="5. Payment & Pricing">
        <p>
          All prices are listed in USD. Payment is processed securely through
          our payment provider. By completing a purchase, you authorize the
          charge to your payment method.
        </p>
      </Section>

      <Section title="6. Refunds">
        <p>
          See our <DocLink href="/refund-policy">Refund Policy</DocLink> for
          details on returns and refunds.
        </p>
      </Section>

      <Section title="7. Disclaimer">
        <p>
          AESDR provides educational content for professional development.
          Results vary based on individual effort, market conditions, and
          circumstances. We do not guarantee specific income outcomes, job
          placement, or career advancement.
        </p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, AESDR shall not be liable
          for any indirect, incidental, or consequential damages arising from
          your use of the platform or course materials.
        </p>
      </Section>

      {/* R4-LEG-6: Delaware confirmed by founder 2026-06-29. */}
      <Section title="9. Governing Law">
        <p>
          This agreement is governed by the laws of the State of Delaware,
          without regard to its conflict-of-laws rules. Subject to the
          arbitration terms below, this choice of law applies regardless of
          where you access or use the platform.
        </p>
      </Section>

      <Section title="10. Dispute Resolution & Binding Arbitration">
        <p style={{ marginBottom: 12 }}>
          <strong>Informal resolution first.</strong> Most disputes can be
          sorted out quickly. Before starting arbitration, you agree to give us
          at least 30 days&rsquo; written notice describing the dispute by
          emailing{" "}
          <a
            href="mailto:hello@aesdr.com"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            hello@aesdr.com
          </a>
          , and to work with us in good faith to resolve it. We&rsquo;ll do the
          same for any dispute we have with you.
        </p>
        <p style={{ marginBottom: 12 }}>
          <strong>Binding arbitration.</strong> If we can&rsquo;t resolve a
          dispute informally, you and AESDR agree that it will be settled by
          binding individual arbitration administered by the American
          Arbitration Association (AAA) under its rules then in effect, rather
          than in court. The seat and venue of the arbitration are determined
          under the AAA rules. The arbitrator&rsquo;s decision may be entered as
          a judgment in any court with jurisdiction. Except as the AAA rules
          provide, each party bears its own fees and costs.
        </p>
        <p style={{ marginBottom: 12 }}>
          <strong>Small-claims option.</strong> Either party may instead bring
          a qualifying claim in small-claims court, so long as the claim stays
          in that court and proceeds on an individual basis.
        </p>
        <p>
          <strong>30-day opt-out.</strong> Arbitration isn&rsquo;t mandatory if
          you don&rsquo;t want it. You may opt out by emailing{" "}
          <a
            href="mailto:hello@aesdr.com"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            hello@aesdr.com
          </a>{" "}
          within 30 days of first accepting these terms. Opting out
          doesn&rsquo;t affect any other part of this agreement.
        </p>
      </Section>

      <Section title="11. Class-Action & Class-Arbitration Waiver">
        <p>
          You and AESDR agree to bring disputes only in an individual capacity,
          and not as a plaintiff or class member in any purported class,
          consolidated, or representative proceeding. The arbitrator may not
          consolidate more than one person&rsquo;s claims or otherwise preside
          over any form of a class or representative proceeding.
        </p>
      </Section>

      <Section title="12. Severability">
        <p>
          If any provision of these terms is found unenforceable, that
          provision will be limited or removed to the minimum extent necessary,
          and the remaining provisions stay in full force. If the
          class-action waiver above is found unenforceable as to a particular
          claim, that claim&mdash;and only that claim&mdash;will be separated
          from the arbitration and may proceed in court.
        </p>
      </Section>

      <Section title="13. Changes to These Terms">
        <p>
          We may update these terms from time to time. Changes take effect when
          we post the updated terms on this page, and the &ldquo;last
          updated&rdquo; date at the top reflects the most recent revision (last
          updated June 29, 2026). Continued use of the platform after changes
          are posted constitutes acceptance of the updated terms.
        </p>
      </Section>

      <Section title="14. Contact & a Note on This Agreement">
        <p style={{ marginBottom: 12 }}>
          Questions about these terms? Reach{" "}
          <a
            href="mailto:hello@aesdr.com"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            hello@aesdr.com
          </a>
          .
        </p>
        <p>
          This is our standard customer agreement, written to be clear and fair
          for everyone who buys the course. It is a general agreement, not
          individualized legal advice for your situation. If you need advice
          specific to you, talk to your own lawyer before agreeing.
        </p>
      </Section>
    </LegalShell>
  );
}
