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
      style={{ background: "var(--cream)" }}
    >
      <div className="mx-auto max-w-2xl" style={{ color: "var(--ink)" }}>

        <Link
          href="/"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "var(--crimson)",
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
            color: "var(--muted)",
            marginBottom: "32px",
          }}
        >
          Checkout was cancelled — nothing was charged. The course will be here when you&apos;re ready.
        </p>

        <div
          style={{
            padding: "24px",
            background: "#fff",
            border: "1px solid var(--light)",
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
              color: "var(--ink)",
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
              color: "var(--muted)",
              paddingLeft: "20px",
            }}
          >
            <li>14-day, no-questions-asked refund policy</li>
            <li>One-time payment — no subscriptions, no upsells</li>
            <li>All 12 courses + the named assets that ship with them</li>
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
              color: "var(--cream)",
              background: "var(--crimson)",
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
              color: "var(--ink)",
              border: "1px solid var(--light)",
              padding: "14px 28px",
              textDecoration: "none",
            }}
          >
            See the Curriculum
          </Link>
        </div>

        <footer
          style={{
            borderTop: "1px solid var(--light)",
            paddingTop: "24px",
            marginTop: "48px",
            fontFamily: "var(--mono)",
            fontSize: "9px",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          <p style={{ opacity: 0.6 }}>
            Questions? <a href="mailto:hello@aesdr.com" style={{ color: "var(--crimson)", textDecoration: "none" }}>hello@aesdr.com</a>
          </p>
        </footer>
      </div>
    </main>
  );
}
