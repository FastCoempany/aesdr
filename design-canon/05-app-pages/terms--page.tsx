import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | AESDR",
  description: "AESDR terms of service — usage rights, limitations, and legal agreement.",
};

export default function TermsPage() {
  return (
    <main
      className="min-h-screen px-6 py-20"
      style={{ background: "var(--bg-main)" }}
    >
      <article
        className="mx-auto max-w-2xl space-y-8"
        style={{ color: "var(--text-main)" }}
      >
        <header className="space-y-3">
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "10px",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "var(--theme)",
            }}
          >
            Legal
          </p>
          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: "clamp(28px, 5vw, 42px)",
              lineHeight: "1",
            }}
          >
            Terms of Service
          </h1>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--text-muted)",
            }}
          >
            Last updated: April 5, 2026
          </p>
        </header>

        <div
          className="space-y-6"
          style={{
            fontFamily: "var(--serif)",
            fontSize: "16px",
            lineHeight: "1.8",
            color: "var(--text-muted)",
          }}
        >
          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>1. Acceptance of Terms</h2>
            <p>By accessing or purchasing the AESDR course curriculum, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>2. Account &amp; Access</h2>
            <p>You are responsible for maintaining the confidentiality of your login credentials. One purchase grants access to one individual. Sharing login credentials or course materials with others is prohibited.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>3. Intellectual Property</h2>
            <p>All course content, tools, frameworks, and materials are the intellectual property of AESDR. You may not reproduce, distribute, modify, or create derivative works from any course content without prior written permission.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Share, resell, or redistribute course content</li>
              <li>Use automated tools to scrape or download course materials</li>
              <li>Misrepresent your identity or affiliation</li>
              <li>Interfere with or disrupt the platform</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>5. Payment &amp; Pricing</h2>
            <p>All prices are listed in USD. Payment is processed securely through our payment provider. By completing a purchase, you authorize the charge to your payment method.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>6. Refunds</h2>
            <p>Please see our <a href="/refund-policy" style={{ color: "var(--theme)" }}>Refund Policy</a> for details on returns and refunds.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>7. Disclaimer</h2>
            <p>AESDR provides educational content for professional development. Results vary based on individual effort, market conditions, and circumstances. We do not guarantee specific income outcomes, job placement, or career advancement.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, AESDR shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform or course materials.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>9. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>10. Contact</h2>
            <p>Questions about these terms? Contact us at <strong style={{ color: "var(--text-main)" }}>support@aesdr.com</strong>.</p>
          </section>
        </div>

        <footer className="pt-8" style={{ borderTop: "1px solid var(--line)" }}>
          <Link href="/" style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--theme)", textDecoration: "none" }}>&larr; Back to Home</Link>
        </footer>
      </article>
    </main>
  );
}
