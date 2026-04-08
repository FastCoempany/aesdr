import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "No Worries | AESDR",
  description: "Checkout cancelled. Come back when you're ready.",
};

export default function CancelPage() {
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
          &larr; Back to Home
        </Link>

        <h1
          style={{
            fontFamily: "var(--display)",
            fontSize: "clamp(32px, 5vw, 48px)",
            lineHeight: "1",
            marginTop: "32px",
            marginBottom: "24px",
          }}
        >
          No worries.
        </h1>

        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: "18px",
            lineHeight: "1.8",
            color: "var(--text-muted)",
            marginBottom: "32px",
          }}
        >
          Checkout was cancelled — nothing was charged. The course will be here when you&apos;re ready.
        </p>

        <div
          style={{
            padding: "24px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            marginBottom: "40px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--cond)",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: ".04em",
              textTransform: "uppercase",
              color: "var(--text-main)",
              marginBottom: "12px",
            }}
          >
            Still thinking?
          </p>
          <ul
            style={{
              fontFamily: "var(--serif)",
              fontSize: "15px",
              lineHeight: "1.8",
              color: "var(--text-muted)",
              paddingLeft: "20px",
            }}
          >
            <li>14-day, no-questions-asked refund policy</li>
            <li>One-time payment — no subscriptions, no upsells</li>
            <li>Lifetime access to all 12 courses + 5 tools</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <Link
            href="/#pricing"
            style={{
              display: "inline-block",
              fontFamily: "var(--cond)",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "var(--bg-main)",
              background: "var(--theme)",
              padding: "14px 28px",
              textDecoration: "none",
            }}
          >
            Back to Pricing
          </Link>
          <Link
            href="/#curriculum"
            style={{
              display: "inline-block",
              fontFamily: "var(--cond)",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "var(--text-main)",
              border: "1px solid var(--line2)",
              padding: "14px 28px",
              textDecoration: "none",
            }}
          >
            See the Curriculum
          </Link>
        </div>

        <footer
          style={{
            borderTop: "1px solid var(--line)",
            paddingTop: "24px",
            marginTop: "48px",
            fontFamily: "var(--mono)",
            fontSize: "9px",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          <p style={{ opacity: 0.6 }}>
            Questions? <a href="mailto:support@aesdr.com" style={{ color: "var(--theme)", textDecoration: "none" }}>support@aesdr.com</a>
          </p>
        </footer>
      </div>
    </main>
  );
}
