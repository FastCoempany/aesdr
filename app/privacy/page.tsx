import type { Metadata } from "next";
import LegalShell, { Section } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy | AESDR",
  description: "How AESDR collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Legal · Privacy"
      title="Privacy Policy"
      lastUpdated="April 5, 2026"
      current="privacy"
      ghostNumber="04"
    >
      <Section title="Information we collect">
        <p style={{ marginBottom: 12 }}>
          <strong>Account information:</strong> When you create an account, we
          collect your email address and a password you choose.
        </p>
        <p style={{ marginBottom: 12 }}>
          <strong>Payment information:</strong> Payment details are processed
          and stored by our payment provider. We do not store credit card
          numbers on our servers.
        </p>
        <p>
          <strong>Usage data:</strong> We track course progress (which lessons
          you have completed and your current position) to provide a seamless
          learning experience.
        </p>
      </Section>

      <Section title="How we use your information">
        <ul style={{ paddingLeft: 22 }}>
          <li>To provide and maintain your course access</li>
          <li>To save and restore your learning progress</li>
          <li>
            To send transactional emails (purchase confirmation, password
            reset)
          </li>
          <li>To communicate product updates or support responses</li>
        </ul>
      </Section>

      <Section title="What we do not do">
        <ul style={{ paddingLeft: 22 }}>
          <li>We do not sell your personal information to third parties</li>
          <li>We do not share your data with advertisers</li>
          <li>
            We do not send unsolicited marketing emails without your consent
          </li>
        </ul>
      </Section>

      <Section title="Data storage & security">
        <p>
          Your data is stored securely using industry-standard encryption.
          Authentication is handled through Supabase, and all connections use
          HTTPS/TLS.
        </p>
      </Section>

      <Section title="Cookies & local storage">
        <p>
          We use essential cookies for authentication and session management.
          We also use browser local storage to cache your course progress for
          offline access. No third-party tracking cookies are used.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You may request access to, correction of, or deletion of your
          personal data at any time by contacting us. Upon account deletion,
          your course progress data will be permanently removed.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We may update this policy periodically. We will notify registered
          users of material changes via email.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Privacy questions? Reach{" "}
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
