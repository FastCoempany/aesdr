import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | AESDR",
  description: "Get in touch with the AESDR team. We respond within 48 hours.",
};

export default function ContactPage() {
  return (
    <main
      className="min-h-screen px-6 py-20"
      style={{ background: "var(--bg-main)" }}
    >
      <div className="mx-auto max-w-2xl" style={{ color: "var(--text-main)" }}>
        <Link
          href="/"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "var(--theme)",
            textDecoration: "none",
          }}
        >
          &larr; Back
        </Link>

        <h1
          style={{
            fontFamily: "var(--display)",
            fontSize: "clamp(32px, 5vw, 48px)",
            lineHeight: "1",
            marginTop: "32px",
            marginBottom: "40px",
          }}
        >
          Contact
        </h1>

        <section style={{ marginBottom: "40px" }}>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: "18px",
              lineHeight: "1.8",
              color: "var(--text-muted)",
              marginBottom: "24px",
            }}
          >
            Have a question, need help with your account, or want to share
            feedback? Reach out directly.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
            <a
              href="mailto:support@aesdr.com"
              style={{
                display: "inline-block",
                fontFamily: "var(--cond)",
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--theme)",
                border: "1px solid var(--theme)",
                padding: "14px 28px",
                textDecoration: "none",
              }}
            >
              support@aesdr.com
            </a>
            <a
              href="https://tally.so/r/EkD7V2"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                fontFamily: "var(--cond)",
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--text-main)",
                border: "1px solid var(--line)",
                padding: "14px 28px",
                textDecoration: "none",
              }}
            >
              Submit a Support Ticket
            </a>
          </div>

          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginTop: "16px",
              opacity: 0.7,
            }}
          >
            We respond within 48 hours.
          </p>
        </section>

        <footer
          style={{
            borderTop: "1px solid var(--line)",
            paddingTop: "24px",
            marginTop: "48px",
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
            fontFamily: "var(--mono)",
            fontSize: "9px",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          <Link href="/terms" style={{ color: "var(--text-muted)", textDecoration: "none", opacity: 0.7 }}>Terms</Link>
          <Link href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "none", opacity: 0.7 }}>Privacy</Link>
          <Link href="/refund-policy" style={{ color: "var(--text-muted)", textDecoration: "none", opacity: 0.7 }}>Refunds</Link>
          <Link href="/about" style={{ color: "var(--text-muted)", textDecoration: "none", opacity: 0.7 }}>About</Link>
        </footer>
      </div>
    </main>
  );
}
