import Link from "next/link";

import CheckoutButton from "@/components/CheckoutButton";
import GhostButton from "@/components/GhostButton";
import LandingSequence from "@/components/LandingSequence";
import TeaseGate from "@/components/TeaseGate";
import Testimonials from "@/components/Testimonials";
import styles from "./page.module.css";

const LESSONS = [
  { num: "01", title: "Building Real Camaraderie", desc: "How to build genuine relationships in sales orgs that actually last" },
  { num: "02", title: "Breaking Down Silos", desc: "Cross-functional alignment that makes your deals move faster" },
  { num: "03", title: "Performance Pitfalls", desc: "The traps that kill sales careers — and how to avoid every one" },
  { num: "04", title: "Navigating Manager Madness", desc: "Surviving toxic managers, bad coaching, and political games" },
  { num: "05", title: "The Sales Playbook", desc: "A real operating system for daily execution — not motivational noise" },
  { num: "06", title: "Beyond the Sales Playbook", desc: "What to do when the playbook breaks and you have to think for yourself" },
  { num: "07", title: "Prospecting & Pipeline", desc: "Building self-sourced pipeline that gives you leverage and career options." },
  { num: "08", title: "The 30% Rule", desc: "The math behind pipeline health that most reps never learn" },
  { num: "09", title: "Salesforce Survival Guide", desc: "CRM hygiene that protects your deals and your credibility" },
  { num: "10", title: "Breaking Down the Commission Myth", desc: "Financial resilience on variable comp — before it breaks you" },
  { num: "11", title: "Sober Selling", desc: "Selling without the guru energy, the hustle porn, or the burnout" },
  { num: "12", title: "Leveling Up SaaS Relationships", desc: "Long-game relationship building that compounds over a career" },
];

const TOOLS = [
  { name: "AE/SDR Alignment Contract", lesson: "03", desc: "Stop the passive-aggressive handoff. Build a real working agreement." },
  { name: "\"I Don't Know\" Framework", lesson: "06", desc: "A structured approach for when you genuinely don't have the answer." },
  { name: "Time Reclaimed Calculator", lesson: "09", desc: "See exactly how many hours you waste on non-selling activity." },
  { name: "ROI & Commission Defense Tracker", lesson: "10", desc: "Prove your value in dollars when comp plans change underneath you." },
  { name: "72-Hour Strike Plan", lesson: "12", desc: "A concrete rescue plan when your quarter is falling apart." },
];

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
          SECTION 3 — WHAT YOU GET (Curriculum)
      ═══════════════════════════════════════════════ */}
      <section id="curriculum" className={styles.curriculumSection}>
        <p className={styles.sectionLabel}>What you get</p>
        <h2 className={styles.sectionHeadline}>
          12 courses. Not 12 PDFs.<br />
          <span className={styles.headlineMuted}>Interactive lessons with real frameworks you&apos;ll actually use.</span>
        </h2>

        <div className={styles.lessonGrid}>
          {LESSONS.map((l) => (
            <div key={l.num} className={styles.lessonCard}>
              <span className={styles.lessonNum}>{l.num}</span>
              <div>
                <p className={styles.lessonTitle}>{l.title}</p>
                <p className={styles.lessonDesc}>{l.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 4 — TOOLS (Proof of Value)
      ═══════════════════════════════════════════════ */}
      <section className={styles.toolsSection}>
        <p className={styles.sectionLabel}>Included tools</p>
        <h2 className={styles.sectionHeadline}>
          5 downloadable tools you&apos;ll actually open twice.
        </h2>

        <div className={styles.toolsGrid}>
          {TOOLS.map((t, i) => (
            <div key={i} className={styles.toolCard}>
              <div className={styles.toolBadge}>Course {t.lesson}</div>
              <p className={styles.toolName}>{t.name}</p>
              <p className={styles.toolDesc}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 5 — TESTIMONIALS
      ═══════════════════════════════════════════════ */}
      <Testimonials />

      {/* ═══════════════════════════════════════════════
          SECTION 6 — PRICING
      ═══════════════════════════════════════════════ */}
      <section id="pricing" className={styles.pricingSection}>
        <p className={styles.sectionLabel}>Pricing</p>
        <h2 className={styles.sectionHeadline}>
          One price. Lifetime access. No upsells.
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
          SECTION 7 — FAQ
      ═══════════════════════════════════════════════ */}
      <section className={styles.faqSection}>
        <p className={styles.sectionLabel}>Questions</p>
        <h2 className={styles.sectionHeadline}>Frequently asked</h2>

        <div className={styles.faqGrid}>
          {FAQ.map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <p className={styles.faqQ}>{item.q}</p>
              <p className={styles.faqA}>{item.a}</p>
            </div>
          ))}
        </div>
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
          Built for reps who want to get better, not just feel better.
        </p>
        <a href="#pricing" className={styles.ctaPrimary}>
          Get Access &mdash; $199
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
