import type { Metadata } from "next";
import LegalShell, { Section } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Contact | AESDR",
  description: "Get in touch with the AESDR team. We respond within 48 hours.",
};

export default function ContactPage() {
  return (
    <LegalShell eyebrow="Contact" title="Get in touch" current="contact" ghostNumber="02">
      <p style={{ marginBottom: 28, fontSize: 18 }}>
        Have a question, need help with your account, or want to share
        feedback? Reach out directly.
      </p>

      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <a
          href="mailto:hello@aesdr.com"
          style={{
            display: "inline-block",
            fontFamily: "var(--cond)",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#fff",
            background: "var(--crimson)",
            padding: "14px 26px",
            textDecoration: "none",
          }}
        >
          hello@aesdr.com →
        </a>
        <a
          href="https://tally.so/r/KYDb7X"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            fontFamily: "var(--cond)",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink)",
            background: "transparent",
            border: "1px solid var(--ink)",
            padding: "13px 26px",
            textDecoration: "none",
          }}
        >
          Submit a support ticket
        </a>
      </div>

      <p
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 48,
        }}
      >
        We respond within 48 hours.
      </p>

      <Section title="Partner inquiries">
        <p>
          If you run a newsletter, podcast, community, or course audience of
          early-career SaaS reps and want to explore a partner pilot, the
          partner-side page is at{" "}
          <a
            href="/partners"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            /partners
          </a>
          . Or email{" "}
          <a
            href="mailto:partner@aesdr.com"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            partner@aesdr.com
          </a>{" "}
          directly.
        </p>
      </Section>

      <Section title="Press, hiring, anything else">
        <p>
          Same inbox:{" "}
          <a
            href="mailto:hello@aesdr.com"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            hello@aesdr.com
          </a>
          . A real person reads it.
        </p>
      </Section>
    </LegalShell>
  );
}
