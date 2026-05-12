"use client";

/**
 * LandingMockup — a client-side replica of the cream landing scroll for use
 * in the /preview/* sandbox routes. Replicates app/page.tsx without the
 * Supabase auth dependency or the LandingSequence opener animation, so the
 * full scroll surface is reachable for atmospheric / decorative concepts.
 *
 * Kept intentionally decoupled from the real LandingPage — when production
 * landing changes, this won't auto-update. That's the point: previews are
 * captured snapshots for evaluating a single visual concept at a time.
 */

import dynamic from "next/dynamic";
import Link from "next/link";

import PricingTiers from "@/components/PricingTiers";
import ValidationMarquee from "@/components/ValidationMarquee";
import { Icon, type IconName } from "@/components/brand/Icon";
import { Mascot } from "@/components/brand/Mascot";
import styles from "@/app/page.module.css";

const Testimonials = dynamic(() => import("@/components/Testimonials"));
const DeckStack = dynamic(() => import("@/components/DeckStack"));

const FAQ: { q: string; a: string; icon: IconName }[] = [
  { q: "Is this for me if I’m brand new to sales?",          a: "Yes, it’s actually inspired by you. The curriculum starts with foundational frameworks and builds to advanced execution. If you’re in your first 18 months, you’ll skip years of painful trial-and-error.", icon: "eye"       },
  { q: "Is this just another motivational sales course?",   a: "Nope. No guru stuff. No “crush it” motivation. This is sober, fun, practical training built by people who over the last 10+ years carried bags and managed AEs & SDRs.",                                       icon: "warn"      },
  { q: "What if I want a refund?",                                a: "14-day, no-questions-asked refund. Email hello@aesdr.com and we process it within 3 business days. If it doesn’t deliver value, we don’t want your money.",                                                  icon: "refund"    },
  { q: "How long do I have access?",                              a: "Lifetime. Buy once, access forever. That includes any future updates to the curriculum.",                                                                                                                            icon: "hourglass" },
  { q: "What’s the difference between Individual and Team?", a: "Individual is one seat, one login. Team gives you up to 10 seats — built for sales managers who want their whole team on the same page.",                                                                       icon: "team"      },
  { q: "Is there a community or is this self-paced only?",        a: "Both. The course is self-paced with interactive exercises. You also get access to our Discord community — real AEs & SDRs, real problems, real accountability.",                                                icon: "discord"   },
  { q: "I’ve been in sales for 5+ years. Is this too basic?", a: "Lessons 1–5 cover fundamentals. Lessons 6–12 go deep on prospecting strategy, pipeline math, financial resilience, and career-level relationship building. If you disagree, we refund.",                  icon: "signal"    },
  { q: "Can my company expense this?",                            a: "Of course. We provide a receipt and invoice on purchase. Most L&D budgets cover this easily — especially the Team plan.",                                                                                       icon: "ledger"    },
];

export default function LandingMockup() {
  return (
    <main className={styles.page} data-mockup="landing">
      {/* ─── NAV ─── */}
      <header className={styles.nav}>
        <Link href="/" className={styles.brand} style={{ textDecoration: "none", color: "inherit", fontFamily: "italic 900 18px/1 'Playfair Display', Georgia, serif" }}>
          AESDR
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/login" className={styles.navLink}>Sign In</Link>
          <a href="#pricing" className={styles.navCta}>Get Access</a>
        </div>
      </header>

      {/* ─── STATIC HERO (post-LandingSequence resolution state) ─── */}
      <section
        data-mockup-section="hero"
        style={{
          minHeight: "82vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Mascot pose="doctrine" size={320} priority />
        </div>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 28,
          }}
        >
          12 Interactive Courses · Built by Operators · Not by Course-People
        </p>
        <h1
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "clamp(72px, 14vw, 180px)",
            background: "var(--iris)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent",
            margin: "0 0 12px",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          AESDR
        </h1>
        <p
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontStyle: "italic",
            fontSize: "clamp(20px, 2.5vw, 28px)",
            color: "var(--muted)",
            margin: "0 0 8px",
          }}
        >
          AEs &amp; SDRs rule this world.
        </p>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontStyle: "italic",
            fontSize: "clamp(16px, 1.6vw, 19px)",
            color: "var(--muted)",
            margin: "16px auto 36px",
            maxWidth: 520,
            lineHeight: 1.6,
          }}
        >
          The 12-lesson sales survival course they never gave you.
        </p>
        <a
          href="#pricing"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "14px 28px",
            background: "var(--ink)",
            color: "var(--cream)",
            textDecoration: "none",
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          Get Access
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginLeft: 4 }}>
            <path d="M2 3h8v8" />
            <path d="M7 8l3 3 3-3" />
          </svg>
        </a>
      </section>

      <div aria-hidden="true" style={{ height: "4vh" }} />

      {/* ─── DECK STACK (12 lessons peel) ─── */}
      <div data-mockup-section="deckstack">
        <DeckStack />
      </div>

      {/* ─── TESTIMONIALS ─── */}
      <div data-mockup-section="testimonials">
        <Testimonials />
      </div>

      {/* ─── VALIDATION MARQUEE ─── */}
      <div data-mockup-section="validation">
        <ValidationMarquee />
      </div>

      {/* ─── PRICING ─── */}
      <section id="pricing" className={styles.pricingSection} data-mockup-section="pricing">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Mascot pose="verdict" size={140} />
        </div>
        <p className={styles.sectionLabel}>Pricing</p>
        <h2 className={styles.sectionHeadline}>One price. Lifetime access.</h2>
        <div className={styles.divider} />
        <PricingTiers initialRole={null} />
      </section>

      {/* ─── FAQ ─── */}
      <section className={styles.faqSection} data-mockup-section="faq">
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
              <p className={styles.faqNum} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Icon name={item.icon} size={14} />
                Q{String(i + 1).padStart(2, "0")}
              </p>
              <p className={styles.faqQ}>{item.q}</p>
              <div className={styles.faqAnswer}>
                <p className={styles.faqBlur}>{item.a}</p>
                <span className={styles.faqRedactLabel}>[classified — hover to peek]</span>
              </div>
              <span className={styles.faqStamp}>Classified</span>
            </div>
          ))}
        </div>
        <p className={styles.faqScrollCue}>scroll →</p>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className={styles.finalCta} data-mockup-section="cta">
        <h2 className={styles.finalHeadline}>Stop ChatGPClaudeing. Start&nbsp;executing.</h2>
        <p className={styles.finalSub}>
          12 courses. 5 takeaway tools. One price. Lifetime access.
          Built for AEs and SDRs who want to get better, not just feel better.
        </p>
        <a href="#pricing" className={styles.ctaPrimary}>Get Access</a>
      </section>

      {/* ─── CONTENT WARNING ─── */}
      <div className={styles.contentWarningLine} data-mockup-section="warning">
        <span className={styles.warningLineIcon}>!</span>
        Content Warning — This course contains uncomfortable truths about your pipeline, your apartment, your bar tab, your commission check, and your relationship status. — AESDR — 12 lessons / at your own pace
      </div>

      {/* ─── FOOTER ─── */}
      <footer className={styles.footer} data-mockup-section="footer">
        <span style={{ opacity: 0.5 }}>AESDR © {new Date().getFullYear()}</span>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/refund-policy">Refunds</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </footer>
    </main>
  );
}
