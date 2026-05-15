import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | AESDR",
  description: "Who built AESDR, why it exists, and the philosophy behind the 12-course curriculum.",
};

export default function AboutPage() {
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
          About AESDR
        </h1>

        <section style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontFamily: "var(--cond)",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--theme)",
              marginBottom: "16px",
            }}
          >
            Who Built This
          </h2>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: "17px",
              lineHeight: "1.8",
              color: "var(--text-muted)",
            }}
          >
            AESDR was built by a sales professional with over nine years of
            experience closing complex deals in SaaS. This isn&apos;t a course
            from someone who read about sales — it&apos;s from someone who
            lived it, survived it, and learned what actually works when the
            quota pressure is real and the playbooks are broken.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontFamily: "var(--cond)",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--theme)",
              marginBottom: "16px",
            }}
          >
            Philosophy
          </h2>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: "17px",
              lineHeight: "1.8",
              color: "var(--text-muted)",
              marginBottom: "16px",
            }}
          >
            No guru energy. No &ldquo;crush it&rdquo; motivation. No recycled
            LinkedIn wisdom. AESDR teaches sober selling — direct, practical,
            honest frameworks for AEs and SDRs who want to build a real career
            in sales without burning out or selling their soul.
          </p>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: "17px",
              lineHeight: "1.8",
              color: "var(--text-muted)",
            }}
          >
            The 12-course curriculum covers everything from surviving toxic
            managers to building financial resilience on commission-based
            income. Every lesson includes interactive exercises, not just
            text walls.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontFamily: "var(--cond)",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--theme)",
              marginBottom: "16px",
            }}
          >
            Contact
          </h2>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: "17px",
              lineHeight: "1.8",
              color: "var(--text-muted)",
            }}
          >
            Questions, feedback, or support requests:{" "}
            <a
              href="mailto:support@aesdr.com"
              style={{ color: "var(--theme)", textDecoration: "none" }}
            >
              support@aesdr.com
            </a>
            <br />
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
          <Link href="/contact" style={{ color: "var(--text-muted)", textDecoration: "none", opacity: 0.7 }}>Contact</Link>
        </footer>
      </div>
    </main>
  );
}
