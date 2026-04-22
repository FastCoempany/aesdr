import dynamic from "next/dynamic";
import Link from "next/link";

import CheckoutButton from "@/components/CheckoutButton";
import GhostButton from "@/components/GhostButton";
import LandingSequence from "@/components/LandingSequence";
import SignOutButton from "@/components/SignOutButton";
import TeaseGate from "@/components/TeaseGate";
import { createClient } from "@/utils/supabase/server";
import styles from "./page.module.css";

const Testimonials = dynamic(() => import("@/components/Testimonials"));

const FAQ = [
  { q: "Is this for me if I\u2019m brand new to sales?", a: "Yes, it\u2019s actually inspired by you. The curriculum starts with foundational frameworks and builds to advanced execution. If you\u2019re in your first 18 months, you\u2019ll skip years of painful trial-and-error." },
  { q: "Is this just\u00a0another motivational sales course?", a: "Nope. No guru stuff. No \u201Ccrush it\u201D motivation. This is sober, fun, practical training built by people who over the last 10+ years carried bags and managed AEs & SDRs." },
  { q: "What if I want a refund?", a: "14-day, no-questions-asked refund. Email hello@aesdr.com and we process it within 3 business days. If it doesn\u2019t deliver value, we don\u2019t want your money." },
  { q: "How long do I have access?", a: "Lifetime. Buy once, access forever. That includes any future updates to the curriculum." },
  { q: "What\u2019s the difference between Individual and Team?", a: "Individual is one seat, one login. Team gives you up to 10 seats \u2014 built for sales managers who want their whole team on the same page." },
  { q: "Is there a community or is this self-paced only?", a: "Both. The course is self-paced with interactive exercises. You also get access to our Discord community \u2014 real AEs & SDRs, real problems, real accountability." },
  { q: "I\u2019ve been in sales for 5+ years. Is this too basic?", a: "Lessons 1\u20135 cover fundamentals. Lessons 6\u201312 go deep on prospecting strategy, pipeline math, financial resilience, and career-level relationship building. If you disagree, we refund." },
  { q: "Can my company expense this?", a: "Of course. We provide a receipt and invoice on purchase. Most L&D budgets cover this easily \u2014 especially the Team plan." },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <TeaseGate>
    <main className={styles.page}>
      <GhostButton />

      {/* ─── NAV ─── */}
      <header className={styles.nav}>
        <Link href="/" className={styles.brand} style={{ textDecoration: "none", color: "inherit" }}>AESDR</Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {isAuthenticated ? (
            <SignOutButton />
          ) : (
            <>
              <Link href="/login" className={styles.navLink}>Sign In</Link>
              <a href="#pricing" className={styles.navCta}>Get Access</a>
            </>
          )}
        </div>
      </header>

      {/* Hero + Confession + Terminal + Zoom */}
      <LandingSequence isAuthenticated={isAuthenticated} />

      <div aria-hidden="true" style={{ height: "15vh" }} />

      <section id="curriculum" className={styles.syllabusTeaser}>
        <p className={styles.sectionLabel}>What you get</p>
        <h2 className={styles.sectionHeadline}>
          12 lessons. One honest curriculum.
        </h2>
        <p className={styles.syllabusTeaserSub}>
          Camaraderie, silos, the 30% rule, commission math, sober selling,
          and the handful of relationships that will outlast this company.
          Peel through every lesson one at a time.
        </p>
        <Link href="/syllabus" className={styles.syllabusTeaserCta}>
          See the full syllabus &rarr;
        </Link>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className={styles.pricingSection}>
        <p className={styles.sectionLabel}>Pricing</p>
        <h2 className={styles.sectionHeadline}>One price. Lifetime access.</h2>
        <div className={styles.divider} />
        <div className={styles.pricingGrid}>
          {/* SDR */}
          <div className={styles.priceCard}>
            <p className={styles.priceTier}>SDR Individual</p>
            <p className={styles.priceAmount}>$249<span className={styles.priceUnit}> / one-time</span></p>
            <ul className={styles.priceFeatures}>
              <li>All 12 courses</li>
              <li>5 interactive tools to takeaway</li>
              <li>Lifetime access</li>
              <li className={styles.discordLine}>Discord community <span className={styles.untamedStamp}>Untamed</span></li>
              <li>Future curriculum updates</li>
              <li>14-day refund guarantee</li>
            </ul>
            <CheckoutButton tier="sdr" label="Buy For Me" className={styles.priceCta} />
          </div>
          {/* AE */}
          <div className={styles.priceCard}>
            <p className={styles.priceTier}>AE Individual</p>
            <p className={styles.priceAmount}>$299<span className={styles.priceUnit}> / one-time</span></p>
            <ul className={styles.priceFeatures}>
              <li>All 12 courses</li>
              <li>5 interactive tools to takeaway</li>
              <li>Lifetime access</li>
              <li className={styles.discordLine}>Discord community <span className={styles.untamedStamp}>Untamed</span></li>
              <li>Future curriculum updates</li>
              <li>14-day refund guarantee</li>
            </ul>
            <CheckoutButton tier="ae" label="Buy For Me" className={styles.priceCta} />
          </div>
          {/* Team */}
          <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
            <div className={styles.priceRibbon}>Org Reimbursement</div>
            <p className={styles.priceTier}>Team</p>
            <p className={styles.priceAmount}>$1,499<span className={styles.priceUnit}> / up to 10 seats</span></p>
            <ul className={styles.priceFeatures}>
              <li>Everything in Individual</li>
              <li>Up to 10 team members</li>
              <li>Admin dashboard</li>
              <li>Team progress tracking</li>
              <li>Priority support</li>
              <li>Invoice + receipt for L&amp;D</li>
            </ul>
            <CheckoutButton tier="team" label="Buy For Us" className={styles.priceCta} />
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className={styles.faqSection}>
        <div className={styles.faqHeader}>
          <p className={styles.faqLabel}>
            <span className={styles.faqLabelIcon}>!</span>
            Questions
          </p>
          <h2 className={styles.faqHeadline}>Frequently Asked</h2>
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

      {/* ═══ FINAL CTA ═══ */}
      <section className={styles.finalCta}>
        <h2 className={styles.finalHeadline}>Stop ChatGPClaudeing. Start&nbsp;executing.</h2>
        <p className={styles.finalSub}>
          12 courses. 5 takeaway tools. One price. Lifetime access.
          Built for AEs and SDRs who want to get better, not just feel better.
        </p>
        {isAuthenticated ? (
          <Link href="/dashboard" className={styles.ctaPrimary}>Continue &rarr;</Link>
        ) : (
          <a href="#pricing" className={styles.ctaPrimary}>Get Access</a>
        )}
      </section>

      {/* Content Warning */}
      <div className={styles.contentWarningLine}>
        <span className={styles.warningLineIcon}>!</span>
        Content Warning &mdash; This course contains uncomfortable truths about your pipeline, your apartment, your bar tab, your commission check, and your relationship status. &mdash; AESDR &mdash; 12 lessons / at your own pace
      </div>

      {/* Footer */}
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
