import dynamic from "next/dynamic";
import Link from "next/link";

import AesdrBrand from "@/components/AesdrBrand";
import GhostButton from "@/components/GhostButton";
import LandingSequence from "@/components/LandingSequence";
import PricingTiers from "@/components/PricingTiers";
import SignOutButton from "@/components/SignOutButton";
import ValidationMarquee from "@/components/ValidationMarquee";
import { Icon, type IconName } from "@/components/brand/Icon";
import { Mascot } from "@/components/brand/Mascot";
import { createClient } from "@/utils/supabase/server";
import styles from "./page.module.css";

const Testimonials = dynamic(() => import("@/components/Testimonials"));
const DeckStack = dynamic(() => import("@/components/DeckStack"));

const FAQ: { q: string; a: string; icon: IconName }[] = [
  { q: "Is this for me if I\u2019m brand new to sales?",          a: "Yes, it\u2019s actually inspired by you. The curriculum starts with the fundamentals and ends with the harder lessons. If you\u2019re in your first 18 months, you\u2019ll skip years of painful trial-and-error.", icon: "eye"       },
  { q: "Is this just\u00a0another motivational sales course?",   a: "Nope. No guru routines. No motivational performance. This is sober, fun, practical training built by people who over the last 10+ years carried bags and managed AEs & SDRs.",                                       icon: "warn"      },
  { q: "What if I want a refund?",                                a: "14-day, no-questions-asked refund. Email hello@aesdr.com and we process it within 3 business days. If it doesn\u2019t deliver value, we don\u2019t want your money.",                                                  icon: "refund"    },
  { q: "How long do I have access?",                              a: "Lifetime. Buy once, access forever. That includes any future updates to the curriculum.",                                                                                                                            icon: "hourglass" },
  { q: "What\u2019s the difference between Individual and Team?", a: "Individual is one seat, one login. Team gives you up to 10 seats \u2014 built for sales managers who want their whole team on the same page.",                                                                       icon: "team"      },
  { q: "Is there a community or is this self-paced only?",        a: "Both. The course is self-paced with interactive exercises. You also get access to our Discord community \u2014 real AEs & SDRs, real problems, real accountability.",                                                icon: "discord"   },
  { q: "I\u2019ve been in sales for 5+ years. Is this too basic?", a: "Lessons 1\u20135 cover fundamentals. Lessons 6\u201312 work through prospecting strategy, pipeline math, financial resilience, and the relationships that pay off five years out. If you disagree, we refund.",                  icon: "signal"    },
  { q: "Can my company expense this?",                            a: "Of course. We provide a receipt and invoice on purchase. Most L&D budgets cover this easily \u2014 especially the Team plan.",                                                                                       icon: "ledger"    },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const metadataRole = user?.user_metadata?.role;
  const initialRole: "ae" | "sdr" | null =
    metadataRole === "ae" || metadataRole === "sdr" ? metadataRole : null;

  return (
    <main className={styles.page}>
      <GhostButton />

      {/* ─── NAV ─── */}
      <header className={styles.nav}>
        <AesdrBrand className={styles.brand} style={{ textDecoration: "none", color: "inherit" }} />
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
      <LandingSequence initialRole={initialRole} />

      {/* Sneak-peek video — fills the cream void before the deck stack */}
      <section className={styles.sneakPeekSection}>
        <div className={styles.sneakPeekVideoWrap}>
          <video
            className={styles.sneakPeekVideo}
            src="/leponeus-sneak-peek.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="AESDR curriculum sneak peek"
          />
        </div>
      </section>

      <DeckStack />

      {/* What this is NOT — preempt the wrong-shaped buyer before pricing. */}
      <section className={styles.notSection}>
        <p className={styles.sectionLabel}>Honesty</p>
        <h2 className={styles.notHeadline}>What this is <em>not</em>.</h2>
        <div className={styles.notGrid}>
          <div className={styles.notCard}>
            <p className={styles.notCardLabel}>Not</p>
            <p className={styles.notCardTitle}>A motivation playlist.</p>
            <p className={styles.notCardBody}>
              No motivational performance, no morning-routine porn, no quotes
              over sunsets. If you came to feel better about the job, the
              refund is faster than the first lesson.
            </p>
          </div>
          <div className={styles.notCard}>
            <p className={styles.notCardLabel}>Not</p>
            <p className={styles.notCardTitle}>A LinkedIn certification.</p>
            <p className={styles.notCardBody}>
              No badge, no &ldquo;Verified Top 1% Closer&rdquo; profile
              ornament, no certificate you can put on your wall and skip the
              work. The receipt is real outcomes, not vanity.
            </p>
          </div>
          <div className={styles.notCard}>
            <p className={styles.notCardLabel}>Not</p>
            <p className={styles.notCardTitle}>A live cohort or coaching call.</p>
            <p className={styles.notCardBody}>
              Self-paced, interactive HTML lessons. No scheduled calls,
              no group Slack pressure, no Tuesday-night webinars. Your
              calendar stays yours.
            </p>
          </div>
          <div className={styles.notCard}>
            <p className={styles.notCardLabel}>Not</p>
            <p className={styles.notCardTitle}>A short-cut around the volume.</p>
            <p className={styles.notCardBody}>
              We hand you the operating manual. You still have to make the
              calls, run the demos, take the no&rsquo;s. Nothing here gets
              you out of the volume.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison — anchor AESDR against the three other shapes a buyer
          might consider. Not bash-the-competitor — just shape clarity. */}
      <section className={styles.compareSection}>
        <p className={styles.sectionLabel}>How this compares</p>
        <h2 className={styles.compareHeadline}>
          Four shapes of sales training. <em>Pick the one that fits.</em>
        </h2>
        <div className={styles.compareGrid}>
          <div className={styles.compareCol} aria-label="AESDR — this product">
            <p className={styles.compareLabel}>AESDR</p>
            <p className={styles.comparePrice}>$249–$1,499 · one-time</p>
            <ul className={styles.compareList}>
              <li>12 self-paced interactive lessons</li>
              <li>5 takeaway tools you use on the job</li>
              <li>Lifetime access</li>
              <li>14-day refund, no questions</li>
              <li>Built by AEs and SDRs who carried bags</li>
              <li>No live calls, no weekly homework</li>
            </ul>
            <p className={styles.compareFitFor}>
              <strong>Fits:</strong> AEs and SDRs in their first 18 months
              who want the operating manual, not motivation.
            </p>
          </div>

          <div className={styles.compareColMuted} aria-label="Motivational sales courses">
            <p className={styles.compareLabel}>Motivational courses</p>
            <p className={styles.comparePrice}>$50–$2,000 · sometimes a subscription</p>
            <ul className={styles.compareList}>
              <li>Video lectures, sometimes a workbook</li>
              <li>Energy is the product</li>
              <li>Outcomes hard to measure</li>
              <li>Refund usually 7-day window</li>
              <li>Built by speakers / personalities</li>
              <li>Often pairs with a paid coaching upsell</li>
            </ul>
            <p className={styles.compareFitFor}>
              <strong>Fits:</strong> AEs and SDRs looking for emotional lift
              before a big week. Not what we&rsquo;re selling.
            </p>
          </div>

          <div className={styles.compareColMuted} aria-label="Live cohort programs">
            <p className={styles.compareLabel}>Live cohort programs</p>
            <p className={styles.comparePrice}>$800–$5,000 · 4–8 weeks</p>
            <ul className={styles.compareList}>
              <li>Scheduled live sessions, Slack community</li>
              <li>Cohort accountability is the moat</li>
              <li>High completion among committed attendees</li>
              <li>Refund typically pro-rated</li>
              <li>Built around instructor availability</li>
              <li>Calendar-heavy by design</li>
            </ul>
            <p className={styles.compareFitFor}>
              <strong>Fits:</strong> AEs and SDRs whose schedules are open
              and who need cohort pressure to finish. Different motion than ours.
            </p>
          </div>

          <div className={styles.compareColMuted} aria-label="Employer-provided LMS training">
            <p className={styles.compareLabel}>Employer LMS training</p>
            <p className={styles.comparePrice}>Free to you · org pays</p>
            <ul className={styles.compareList}>
              <li>Embedded in your company&rsquo;s LMS</li>
              <li>Generic content; mandatory completion</li>
              <li>Built for compliance, not craft</li>
              <li>No refund — it&rsquo;s an HR ask</li>
              <li>Updated rarely; vintage 2019 content common</li>
              <li>Disappears when you leave the org</li>
            </ul>
            <p className={styles.compareFitFor}>
              <strong>Fits:</strong> Nobody, really. Do it because you have
              to. Then come here for the part the LMS skipped.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Validation — companies whose GTM teams validated AESDR */}
      <ValidationMarquee />

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className={styles.pricingSection}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Mascot pose="verdict" size={420} />
        </div>
        <p className={styles.sectionLabel}>Pricing</p>
        <h2 className={styles.sectionHeadline}>One price. Lifetime access.</h2>
        <div className={styles.divider} />
        <PricingTiers initialRole={initialRole} />
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
              <p className={styles.faqNum} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Icon name={item.icon} size={14} />
                Q{String(i + 1).padStart(2, "0")}
              </p>
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
        <a href="#pricing" className={styles.ctaPrimary}>Get Access</a>
      </section>

      {/* Content Warning */}
      <div className={styles.contentWarningLine}>
        <span className={styles.warningLineIcon}>!</span>
        Content Warning &mdash; This course contains uncomfortable truths about your pipeline, your apartment, your bar tab, your commission check, and your relationship status. &mdash; AESDR &mdash; 12 courses / at your own pace
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <span style={{ opacity: 0.5 }}>AESDR &copy; {new Date().getFullYear()}</span>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/refund-policy">Refunds</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/enterprise" style={{ opacity: 0.7 }}>for sales orgs &rarr;</Link>
      </footer>
    </main>
  );
}
