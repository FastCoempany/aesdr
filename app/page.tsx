import Link from "next/link";

import CheckoutButton from "@/components/CheckoutButton";
import GhostButton from "@/components/GhostButton";
import LandingSequence from "@/components/LandingSequence";
import TeaseGate from "@/components/TeaseGate";
import Testimonials from "@/components/Testimonials";
import styles from "./page.module.css";

const FAQ = [
  {
    q: "Is this for me if I'm brand new to sales?",
    a: "Yes. The curriculum starts with foundational frameworks and builds to advanced execution. If you're in your first 18 months, you'll skip years of painful trial-and-error.",
  },
  {
    q: "Is this just another motivational sales course?",
    a: "No. Zero guru energy. Zero \"crush it\" motivation. This is sober, practical training built by someone who carried a bag for 9+ years. Frameworks, not feelings.",
  },
  {
    q: "What if I want a refund?",
    a: "14-day, no-questions-asked refund. Email support@aesdr.com and we process it within 3 business days. If it doesn't deliver value, we don't want your money.",
  },
  {
    q: "How long do I have access?",
    a: "Lifetime. Buy once, access forever. That includes any future updates to the curriculum.",
  },
  {
    q: "What's the difference between Individual and Team?",
    a: "Individual is one seat, one login. Team gives you up to 10 seats with a shared admin dashboard — built for sales managers who want their whole team on the same page.",
  },
  {
    q: "Is there a community or is this self-paced only?",
    a: "Both. The course is self-paced with interactive exercises. You also get access to our Discord community — real reps, real problems, real accountability.",
  },
  {
    q: "I've been in sales for 5+ years. Is this too basic?",
    a: "Lessons 1–5 cover fundamentals. Lessons 6–12 go deep on prospecting strategy, pipeline math, financial resilience, and career-level relationship building. Experienced reps consistently say Lessons 8–12 are worth the price alone.",
  },
  {
    q: "Can my company expense this?",
    a: "Yes. We provide a receipt and invoice on purchase. Most L&D budgets cover this easily — especially the Team plan.",
  },
];

export default function LandingPage() {
  return (
    <TeaseGate>
    <main className={styles.page}>
      <div aria-hidden="true" className={styles.atmosphere} />
      <GhostButton />

      {/* ─── NAV ─── */}
      <header className={styles.nav}>
        <span className={styles.brand}>AESDR</span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/login" className={styles.navLink}>Sign In</Link>
          <a href="#pricing" className={styles.navCta}>Get Access</a>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          SECTIONS 1+2 — Landing Sequence (Warning → Confession → Terminal → Zoom)
      ═══════════════════════════════════════════════ */}
      <LandingSequence />

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════ */}
      <Testimonials />

      {/* ═══════════════════════════════════════════════
          SECTION 6 — PRICING
      ═══════════════════════════════════════════════ */}
      <section id="pricing" className={styles.pricingSection}>
        <p className={styles.sectionLabel}>Pricing</p>
        <h2 className={styles.sectionHeadline}>
          One price. Lifetime access.
        </h2>

        <div className={styles.pricingGrid}>
          {/* Individual */}
          <div className={styles.priceCard}>
            <p className={styles.priceTier}>Individual</p>
            <p className={styles.priceAmount}>
              $199<span className={styles.priceUnit}> / one-time</span>
            </p>
            <ul className={styles.priceFeatures}>
              <li>All 12 courses</li>
              <li>5 interactive tools</li>
              <li>Lifetime access</li>
              <li>Discord community</li>
              <li>Future curriculum updates</li>
              <li>14-day refund guarantee</li>
            </ul>
            <CheckoutButton tier="individual" label="Buy Individual" className={styles.priceCta} />
          </div>

          {/* Team */}
          <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
            <div className={styles.priceRibbon}>Best for teams</div>
            <p className={styles.priceTier}>Team</p>
            <p className={styles.priceAmount}>
              $999<span className={styles.priceUnit}> / up to 10 seats</span>
            </p>
            <ul className={styles.priceFeatures}>
              <li>Everything in Individual</li>
              <li>Up to 10 team members</li>
              <li>Admin dashboard</li>
              <li>Team progress tracking</li>
              <li>Priority support</li>
              <li>Invoice + receipt for L&amp;D</li>
            </ul>
            <CheckoutButton tier="team" label="Buy Team" className={styles.priceCta} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 7 — FAQ (Classified Dossier)
      ═══════════════════════════════════════════════ */}
      <section className={styles.faqSection}>
        <div className={styles.faqHeader}>
          <p className={styles.faqLabel}>
            <span className={styles.faqLabelIcon}>!</span>
            Questions &mdash; Classified
          </p>
          <h2 className={styles.sectionHeadline}>Frequently Asked</h2>
        </div>

        <div className={styles.faqGrid}>
          {FAQ.map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <p className={styles.faqNum}>Q{String(i + 1).padStart(2, "0")}</p>
              <p className={styles.faqQ}>{item.q}</p>
              <div className={styles.faqAnswer}>
                <p className={styles.faqBlur}>{item.a}</p>
                <span className={styles.faqRedactLabel}>[classified &mdash; hover to peek]</span>
              </div>
              <span className={styles.faqStamp}>Classified</span>
            </div>
          ))}
        </div>
        <p className={styles.faqScrollCue}>scroll &rarr;</p>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 8 — FINAL CTA
      ═══════════════════════════════════════════════ */}
      <section className={styles.finalCta}>
        <h2 className={styles.finalHeadline}>
          Stop Googling. Start executing.
        </h2>
        <p className={styles.finalSub}>
          12 courses. 5 tools. One price. Lifetime access.<br />
          Built for AEs and SDRs who want to get better, not just feel better.
        </p>
        <a href="#pricing" className={styles.ctaPrimary}>
          Get Access
        </a>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className={styles.footer}>
        <span style={{ opacity: 0.5 }}>AESDR &copy; {new Date().getFullYear()}</span>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/refund-policy">Refunds</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </footer>
    </main>
    </TeaseGate>
  );
}
