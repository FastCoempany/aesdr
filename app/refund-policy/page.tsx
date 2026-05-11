import type { Metadata } from "next";
import LegalShell, { Section } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Refund Policy | AESDR",
  description:
    "AESDR 14-day no-questions-asked refund policy for individual and team plans.",
};

export default function RefundPolicyPage() {
  return (
    <LegalShell
      eyebrow="Legal · Refunds"
      title="Refund Policy"
      lastUpdated="April 5, 2026"
      current="refund-policy"
    >
      <Section title="The short version">
        <p>
          We offer a <strong>14-day, no-questions-asked refund</strong> from
          the date of purchase. If the course is not for you, email us and we
          will process your refund within 3 business days.
        </p>
      </Section>

      <Section title="Eligibility">
        <ul style={{ paddingLeft: 22 }}>
          <li style={{ marginBottom: 10 }}>
            <strong>Individual purchases (SDR $249, AE $299):</strong> Full
            refund within 14 days of purchase. No partial refunds after 14
            days.
          </li>
          <li>
            <strong>Team purchases ($1,499 for 10 seats):</strong> Full refund
            within 14 days of purchase, provided no more than 2 team members
            have accessed the course. If 3 or more team members have logged
            in, we will work with you on a case-by-case basis.
          </li>
        </ul>
      </Section>

      <Section title="How to request a refund">
        <ol style={{ paddingLeft: 22 }}>
          <li>
            Email <strong>support@aesdr.com</strong> with the subject line
            &ldquo;Refund Request&rdquo;
          </li>
          <li>Include the email address used for your purchase</li>
          <li>We will confirm your refund within 1 business day</li>
          <li>
            The refund will appear on your statement within 3&ndash;5 business
            days depending on your bank
          </li>
        </ol>
      </Section>

      <Section title="After a refund">
        <p>
          Once a refund is processed, your course access will be revoked. Any
          downloaded tools or materials should be deleted. If you change your
          mind later, you are welcome to purchase again at the current price.
        </p>
      </Section>

      <Section title="Why we offer this">
        <p>
          We built this course for people who are serious about leveling up.
          If you put in the work and it does not deliver value, we do not
          want your money. That said, this policy exists to protect
          good-faith buyers &mdash; not to subsidize free access.
        </p>
      </Section>

      <Section title="Questions">
        <p>
          Reach{" "}
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
