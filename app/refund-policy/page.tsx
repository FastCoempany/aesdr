export default function RefundPolicyPage() {
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
            Refund Policy
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
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>The Short Version</h2>
            <p>We offer a <strong style={{ color: "var(--text-main)" }}>14-day, no-questions-asked refund</strong> from the date of purchase. If the course is not for you, email us and we will process your refund within 3 business days.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>Eligibility</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong style={{ color: "var(--text-main)" }}>Individual purchases ($199):</strong> Full refund within 14 days of purchase. No partial refunds after 14 days.</li>
              <li><strong style={{ color: "var(--text-main)" }}>Team purchases ($999):</strong> Full refund within 14 days of purchase, provided no more than 2 team members have accessed the course. If 3 or more team members have logged in, we will work with you on a case-by-case basis.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>How to Request a Refund</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Email <strong style={{ color: "var(--text-main)" }}>support@aesdr.com</strong> with the subject line &ldquo;Refund Request&rdquo;</li>
              <li>Include the email address used for your purchase</li>
              <li>We will confirm your refund within 1 business day</li>
              <li>The refund will appear on your statement within 3&ndash;5 business days depending on your bank</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>After a Refund</h2>
            <p>Once a refund is processed, your course access will be revoked. Any downloaded tools or materials should be deleted. If you change your mind later, you are welcome to purchase again at the current price.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>Why We Offer This</h2>
            <p>We built this course for people who are serious about leveling up. If you put in the work and it does not deliver value, we do not want your money. That said, this policy exists to protect good-faith buyers &mdash; not to subsidize free access.</p>
          </section>

          <section className="space-y-3">
            <h2 style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-main)" }}>Questions</h2>
            <p>Reach us at <strong style={{ color: "var(--text-main)" }}>support@aesdr.com</strong>.</p>
          </section>
        </div>

        <footer className="pt-8" style={{ borderTop: "1px solid var(--line)" }}>
          <a href="/" style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--theme)", textDecoration: "none" }}>&larr; Back to Home</a>
        </footer>
      </article>
    </main>
  );
}
