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
      lastUpdated="April 5, 2026"
      current="terms"
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

      <Section title="9. Changes to Terms">
        <p>
          We reserve the right to modify these terms at any time. Continued
          use of the platform after changes constitutes acceptance of the
          updated terms.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          Questions about these terms? Reach{" "}
          <a
            href="mailto:support@aesdr.com"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            support@aesdr.com
          </a>
          .
        </p>
      </Section>
    </LegalShell>
  );
}
