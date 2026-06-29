import type { Metadata } from "next";
import LegalShell, { Section, DocLink } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy | AESDR",
  description: "How AESDR collects, uses, and protects your personal data.",
};

/** Service providers that process AESDR user data on our behalf.
 *  Each is verified present in the codebase (package.json + usage). These
 *  are "subprocessors" in the data-protection sense — the term security
 *  reviewers look for. Keep this list honest: add a row only when the
 *  service actually receives user data in production. */
const SUBPROCESSORS: {
  name: string;
  purpose: string;
  privacyHref: string;
}[] = [
  {
    name: "Stripe",
    purpose: "Payment processing and billing. Stripe handles your card details — we never see or store full card numbers.",
    privacyHref: "https://stripe.com/privacy",
  },
  {
    name: "Supabase",
    purpose: "Database and authentication. Stores your account, login credentials, course progress, and purchase records.",
    privacyHref: "https://supabase.com/privacy",
  },
  {
    name: "Resend",
    purpose: "Email delivery — purchase confirmations, password resets, and the course emails tied to your account.",
    privacyHref: "https://resend.com/legal/privacy-policy",
  },
  {
    name: "Anthropic (Claude)",
    purpose: "AI used to generate your personal course deliverables from the answers you write during lessons.",
    privacyHref: "https://www.anthropic.com/legal/privacy",
  },
  {
    name: "PostHog",
    purpose: "Product analytics — how the course is used, so we can see what works and fix what doesn't.",
    privacyHref: "https://posthog.com/privacy",
  },
  {
    name: "Vercel",
    purpose: "Application hosting and infrastructure. Runs the site and the requests you make to it.",
    privacyHref: "https://vercel.com/legal/privacy-policy",
  },
  {
    name: "Sentry",
    purpose: "Error monitoring. Captures technical details when something breaks so we can repair it.",
    privacyHref: "https://sentry.io/privacy/",
  },
  {
    name: "Upstash",
    purpose: "Rate-limiting and abuse prevention that keeps the service stable and secure.",
    privacyHref: "https://upstash.com/trust/privacy.pdf",
  },
];

const cellStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid var(--light)",
  verticalAlign: "top",
  textAlign: "left",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Legal · Privacy"
      title="Privacy Policy"
      lastUpdated="June 29, 2026"
      current="privacy"
      ghostNumber="04"
    >
      <Section title="Information we collect">
        <p style={{ marginBottom: 12 }}>
          <strong>Account information:</strong> When you create an account, we
          collect your email address and a password you choose. If you take the
          course, we also keep the role you select (AE or SDR) and the
          short answers you write during lessons.
        </p>
        <p style={{ marginBottom: 12 }}>
          <strong>Purchase &amp; affiliate records:</strong> When you buy the
          course, we keep a record of the purchase (plan, amount, date,
          status). If you join the Affiliate Program, we keep the records
          needed to attribute referrals and pay commissions.
        </p>
        <p style={{ marginBottom: 12 }}>
          <strong>Payment information:</strong> Payment details are processed
          and stored by our payment provider, Stripe. We do not store credit
          card numbers on our servers.
        </p>
        <p>
          <strong>Usage data:</strong> We track course progress (which lessons
          you have completed and your current position) so you can pick up
          where you left off, and we collect basic product analytics to
          understand how the course is used.
        </p>
      </Section>

      <Section title="Why we collect your data and our legal basis">
        <p style={{ marginBottom: 12 }}>
          We collect only what the app needs to deliver what it promises and
          what you need to get value from it — your account, your course
          progress, your purchases, and the communications tied to them. We
          don&apos;t collect data we don&apos;t use.
        </p>
        <p style={{ marginBottom: 12 }}>
          Our legal basis is the performance of our contract with you
          (providing the course and your account) and our legitimate interest
          in operating, securing, and improving the service. For the course
          deliverables that AI generates, we process the answers you write so
          the app can produce the personalized result you asked for.
        </p>
        <p style={{ margin: 0 }}>
          We don&apos;t sell your personal data.
        </p>
      </Section>

      <Section title="How we use your information">
        <ul style={{ paddingLeft: 22 }}>
          <li>To provide and maintain your course access</li>
          <li>To save and restore your learning progress</li>
          <li>
            To generate the personal course deliverables built from the
            answers you write during lessons
          </li>
          <li>To process your purchase and, for affiliates, your payouts</li>
          <li>
            To send transactional and course emails (purchase confirmation,
            password reset, and the lesson sequence tied to your account)
          </li>
          <li>To respond to support requests and share product updates</li>
          <li>To keep the service secure and prevent abuse</li>
        </ul>
      </Section>

      <Section title="Subprocessors / service providers">
        <p style={{ marginBottom: 16 }}>
          We don&apos;t run everything ourselves. The services below process
          some of your data on our behalf so the app can work — these are our
          subprocessors in the data-protection sense. We share only what each
          one needs for its job, and each is bound to handle your data in line
          with its own privacy terms and our agreement with them.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 15,
              lineHeight: 1.55,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    ...cellStyle,
                    fontFamily: "var(--cond)",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--crimson)",
                    borderBottom: "2px solid var(--light)",
                    width: "30%",
                  }}
                >
                  Provider
                </th>
                <th
                  style={{
                    ...cellStyle,
                    fontFamily: "var(--cond)",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--crimson)",
                    borderBottom: "2px solid var(--light)",
                  }}
                >
                  What it does
                </th>
              </tr>
            </thead>
            <tbody>
              {SUBPROCESSORS.map((s) => (
                <tr key={s.name}>
                  <td style={cellStyle}>
                    <a
                      href={s.privacyHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--crimson)",
                        textDecoration: "underline",
                        textUnderlineOffset: 2,
                        fontWeight: 600,
                      }}
                    >
                      {s.name}
                    </a>
                  </td>
                  <td style={cellStyle}>{s.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 16, fontSize: 15, color: "var(--muted)" }}>
          We may add or change providers as the service evolves; when we do,
          we&apos;ll update this list and hold any new provider to the same
          standard.
        </p>
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
          Authentication and your account data are handled through Supabase,
          and all connections use HTTPS/TLS. Access to your data is limited to
          what&apos;s needed to operate the service.
        </p>
      </Section>

      <Section title="Cookies & local storage">
        <p>
          We use essential cookies for authentication and session management,
          and browser local storage to cache your course progress. We use
          product analytics (PostHog) to understand how the course is used; we
          do not use third-party advertising cookies.
        </p>
      </Section>

      <Section title="Your rights">
        <p style={{ marginBottom: 12 }}>
          You can ask for a copy of your personal data, correct it, or have it
          deleted. You manage your email, role, and password directly in your{" "}
          <DocLink href="/account">account settings</DocLink>. To request an
          export or deletion of your data, email{" "}
          <a
            href="mailto:hello@aesdr.com"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            hello@aesdr.com
          </a>{" "}
          and we&apos;ll take care of it. When your account is deleted, your
          course progress is permanently removed.
        </p>
        <p style={{ margin: 0 }}>
          Some records tied to purchases may be retained where we&apos;re
          required to keep them — for example, billing and tax records held by
          our payment provider.
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
            href="mailto:hello@aesdr.com"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            hello@aesdr.com
          </a>
          .
        </p>
      </Section>
    </LegalShell>
  );
}
