import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | AESDR",
  description: "How AESDR collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
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
            Privacy Policy
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
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>Information We Collect</h2>
            <p><strong style={{ color: "var(--text-main)" }}>Account information:</strong> When you create an account, we collect your email address and a password you choose.</p>
            <p><strong style={{ color: "var(--text-main)" }}>Payment information:</strong> Payment details are processed and stored by our payment provider. We do not store credit card numbers on our servers.</p>
            <p><strong style={{ color: "var(--text-main)" }}>Usage data:</strong> We track course progress (which lessons you have completed and your current position) to provide a seamless learning experience.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and maintain your course access</li>
              <li>To save and restore your learning progress</li>
              <li>To send transactional emails (purchase confirmation, password reset)</li>
              <li>To communicate product updates or support responses</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>What We Do Not Do</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>We do not sell your personal information to third parties</li>
              <li>We do not share your data with advertisers</li>
              <li>We do not send unsolicited marketing emails without your consent</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>Data Storage &amp; Security</h2>
            <p>Your data is stored securely using industry-standard encryption. Authentication is handled through Supabase, and all connections use HTTPS/TLS.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>Cookies &amp; Local Storage</h2>
            <p>We use essential cookies for authentication and session management. We also use browser local storage to cache your course progress for offline access. No third-party tracking cookies are used.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us. Upon account deletion, your course progress data will be permanently removed.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>Changes to This Policy</h2>
            <p>We may update this policy periodically. We will notify registered users of material changes via email.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>Contact</h2>
            <p>Privacy questions? Reach us at <strong style={{ color: "var(--text-main)" }}>support@aesdr.com</strong>.</p>
          </section>
        </div>

        <footer className="pt-8" style={{ borderTop: "1px solid var(--line)" }}>
          <a href="/" style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--theme)", textDecoration: "none" }}>&larr; Back to Home</a>
        </footer>
      </article>
    </main>
  );
}
