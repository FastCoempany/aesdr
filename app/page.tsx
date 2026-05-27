import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";

import AesdrBrand from "@/components/AesdrBrand";
import GhostButton from "@/components/GhostButton";
import LandingSequence from "@/components/LandingSequence";
import PricingTiers from "@/components/PricingTiers";
import SignOutButton from "@/components/SignOutButton";
import ValidationMarquee from "@/components/ValidationMarquee";
import { Icon, type IconName } from "@/components/brand/Icon";
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import { createClient } from "@/utils/supabase/server";
import styles from "./page.module.css";

const Testimonials = dynamic(() => import("@/components/Testimonials"));
const DeckStack = dynamic(() => import("@/components/DeckStack"));

const FAQ: { q: string; a: string; icon: IconName }[] = [
  { q: "Is this for me if I\u2019m brand new to sales?",          a: "Yes, it\u2019s actually inspired by you. The curriculum starts with the fundamentals and ends with harder material. If you\u2019re in your first 18 months, you\u2019ll skip years of painful trial-and-error.", icon: "eye"       },
  { q: "Is this just\u00a0another motivational sales course?",   a: "Nope \u2014 no guru routines and no motivational performance built into the format; this is sober, fun, practical training built by people who carried bags and managed AEs and SDRs over the last 10+ years on real teams.",                                       icon: "warn"      },
  { q: "What if I want a refund?",                                a: "14-day, no-questions-asked refund. Email hello@aesdr.com and we process it within 3 business days. If it doesn\u2019t deliver value, we don\u2019t want your money.",                                                  icon: "refund"    },
  { q: "Is this a subscription? How long do I get access?",    a: "Not a subscription. One-time purchase. No renewal, no expiration date. Every future update we ship to the curriculum is included at no extra charge. If we ever shut AESDR down, every active customer gets a final downloadable bundle of the lessons they’d completed.",            icon: "hourglass" },
  { q: "Why does the page ask AE or SDR?",                        a: "So we can show you the copy and pricing for your role. Pick once and we remember it. You can switch anytime — the underlying program is the same; the role-pick changes which examples and which price you see first.",                                       icon: "signal"    },
  { q: "What\u2019s the difference between Individual and Team?", a: "Individual is one seat, one login. Team is for sales managers rolling out training across an actual team \u2014 manager dashboard, mixed AE/SDR tracks, invoice formatted for L&D. Team pricing isn't on the page because every team's shape is different \u2014 email hello@aesdr.com and we'll quote it after a five-minute conversation about team size.",                                                                       icon: "team"      },
  { q: "Is there a community or is this self-paced only?",        a: "Self-paced. AESDR is the kind of thing you come back to in year three when the comp plan changes — not a live community you check into. There's an alumni room that opens when you finish all twelve courses \u2014 but it's a course bonus, not what you're paying for.",                                                icon: "hourglass" },
  { q: "I\u2019ve been in sales for 5+ years. Is this too basic?", a: "Courses 1\u20135 cover fundamentals. Courses 6\u201312 work through prospecting strategy, pipeline math, financial resilience, and the relationships that pay off five years out. If you disagree, we refund.",                  icon: "signal"    },
  { q: "Can my company expense this?",                            a: "Of course. We provide a receipt and invoice on purchase. Most L&D budgets cover this easily \u2014 especially the Team plan.",                                                                                       icon: "ledger"    },
  { q: "How is this different from Sales Assembly or Pavilion?", a: "Different product entirely. Those are senior-AE peer networks \u2014 you're paying for the room and the people in it. AESDR is the lessons and the work, something you come back to in year three. If you want the network, those are excellent. If you want a framework you can hand to a new SDR on Monday morning, this one. Full breakdown at /compare.",                                                                                  icon: "team"      },
  { q: "Why not just use Bravado, r/sales, or LinkedIn?",         a: "Those are good for the random thread when you have a specific live problem. AESDR is structured \u2014 Lesson 8 is the 30% rule, Lesson 10 is the comp-plan teardown, Lesson 12 is the relationship graph. You don\u2019t have to phrase your problem correctly to find the answer; the curriculum sequences it. Plus role-conditional content across 18 of the 36 sub-lessons, which a community can\u2019t deliver.", icon: "signal"    },
  { q: "I\u2019ve been reading Sales Hacker and RepVue for a year. Different?", a: "Three differences. Structure \u2014 a reading list doesn\u2019t sequence what compounds. Vendor independence \u2014 the free content is sponsored by tools, so the tools lessons are quietly compromised. AESDR isn\u2019t sponsored by any of them, so nothing\u2019s shaped to sell you software. And what you keep \u2014 you don\u2019t take a Sales Hacker post into your 1:1 with a bad manager next week. You take the AE/SDR Alignment Contract.",         icon: "eye"       },
  { q: "Should I take Aspireship or Uvaro instead?",              a: "Different audience. Those are bootcamps for people trying to break into sales \u2014 they place you, coach you through ramp, sometimes share first-year commission. AESDR assumes the seat is already yours. If you\u2019re three months from your first SDR interview, take a bootcamp. If you\u2019re three months into the job and the ramp is harder than anyone warned you about, this one.",                                          icon: "warn"      },
];

export const metadata: Metadata = {
  title: "AESDR — Sales training for first- and second-year AEs and SDRs",
};

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
              This isn&rsquo;t the genre where someone gets you hyped for the
              week &mdash; no morning-routine speeches, no quotes over a sunset,
              no performance. If you&rsquo;re here to feel better about the job
              instead of getting better at it, this is the wrong shelf, and
              that&rsquo;s genuinely fine.
            </p>
          </div>
          <div className={styles.notCard}>
            <p className={styles.notCardLabel}>Not</p>
            <p className={styles.notCardTitle}>A LinkedIn certification.</p>
            <p className={styles.notCardBody}>
              There&rsquo;s no badge for your profile, no &ldquo;Top 1%
              Closer&rdquo; certificate for the wall &mdash; nothing you can wave
              around instead of doing the job. The point was never the
              credential. It&rsquo;s that you actually get better.
            </p>
          </div>
          <div className={styles.notCard}>
            <p className={styles.notCardLabel}>Not</p>
            <p className={styles.notCardTitle}>A live cohort or coaching call.</p>
            <p className={styles.notCardBody}>
              You go through the lessons on your own time, and they&rsquo;re
              interactive &mdash; not a video you half-watch. No scheduled
              calls, no group-Slack guilt, no Tuesday-night webinar. Your
              calendar stays yours.
            </p>
          </div>
          <div className={styles.notCard}>
            <p className={styles.notCardLabel}>Not</p>
            <p className={styles.notCardTitle}>A skip button for the grind.</p>
            <p className={styles.notCardBody}>
              We can show you how the job actually works. We can&rsquo;t do the
              job for you &mdash; you still have to make the calls, run the
              demos, and eat the no&rsquo;s. Nothing here gets you out of the
              actual work.
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
            <p className={styles.comparePrice}>$249–$299 · one-time (team licensing on request)</p>
            <ul className={styles.compareList}>
              <li>12 interactive courses &mdash; not videos you sit through</li>
              <li>
                You keep{" "}
                <span className={styles.artifactName}>The Alignment Contract</span>,{" "}
                <span className={styles.artifactName}>The Manager Archetype Map</span>,{" "}
                <span className={styles.artifactName}>The ROI &amp; Commission Defense Tracker</span>{" "}
                &mdash; and four more like them
              </li>
              <li>Separate tracks for AEs and SDRs &mdash; the content forks to your seat</li>
              <li>14-day refund, no questions</li>
              <li>Built by people who carried bags &mdash; AEs, SDRs, and the managers and VPs who led them</li>
              <li>Worked against your real accounts, pipeline, and comp plan &mdash; not &ldquo;imagine a prospect named Bob&rdquo;</li>
            </ul>
            <p className={styles.compareFitFor}>
              <strong>Fits:</strong> AEs and SDRs in their first 2 years or so
              who want to get better at the actual work &mdash; not get hyped
              for the week.
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
              before a big week — which isn&rsquo;t what we&rsquo;re selling here.
            </p>
          </div>

          <div className={styles.compareColMuted} aria-label="Live cohort programs">
            <p className={styles.compareLabel}>Live cohort programs</p>
            <p className={styles.comparePrice}>$800–$5,000 · 4–8 weeks</p>
            <ul className={styles.compareList}>
              <li>Scheduled live sessions, Slack community</li>
              <li>Cohort accountability is the selling point</li>
              <li>High completion among committed attendees</li>
              <li>Refund typically pro-rated</li>
              <li>Built around instructor availability</li>
              <li>Calendar-heavy by design</li>
            </ul>
            <p className={styles.compareFitFor}>
              <strong>Fits:</strong> AEs and SDRs whose schedules are open
              and who need cohort pressure to finish — a different motion
              than the one this product is designed around.
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
              <strong>Fits:</strong> Nobody really chooses this one — you do
              it because you have to for HR, and then you come back here for
              the part the LMS skipped entirely.
            </p>
          </div>
        </div>
        <p
          style={{
            textAlign: "center",
            marginTop: 32,
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 15,
            color: "var(--muted)",
            lineHeight: 1.6,
          }}
        >
          Wondering how AESDR sits next to Sales Assembly, Bravado, Aspireship,
          Sales Hacker, or the rest?{" "}
          <Link
            href="/compare"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            We named each one →
          </Link>
        </p>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Validation — companies whose GTM teams validated AESDR */}
      <ValidationMarquee />

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className={styles.pricingSection}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Mascot pose="verdict" size={MASCOT_SIZE.banner} />
        </div>
        <p className={styles.sectionLabel}>Pricing</p>
        <h2 className={styles.sectionHeadline}>One price. Yours when you buy it.</h2>
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
            <div
              key={i}
              className={styles.faqItem}
              tabIndex={0}
              role="group"
              aria-label={`Frequently asked question ${i + 1}: ${item.q}`}
            >
              <p className={styles.faqNum} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Icon name={item.icon} size={14} aria-hidden />
                Q{String(i + 1).padStart(2, "0")}
              </p>
              <p className={styles.faqQ}>{item.q}</p>
              <div className={styles.faqAnswer}>
                <p className={styles.faqBlur}>{item.a}</p>
                <span className={styles.faqRedactLabel} aria-hidden="true">[classified &mdash; hover or focus to peek]</span>
              </div>
              <span className={styles.faqStamp} aria-hidden="true">Classified</span>
            </div>
          ))}
        </div>
        <p className={styles.faqScrollCue}>scroll &rarr;</p>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className={styles.finalCta}>
        <h2 className={styles.finalHeadline}>Stop ChatGPClaudeing. Start&nbsp;executing.</h2>
        <p className={styles.finalSub}>
          12 courses, plus the assets you keep — The Alignment Contract, The
          ROI &amp; Commission Defense Tracker, the 72-Hour Strike Plan, and the
          rest. Built for AEs and SDRs who want to get better at the actual
          work rather than just feel better about the week ahead.
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
        <Link href="/research">Research</Link>
        <Link href="/compare">Compare</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/enterprise" style={{ opacity: 0.7 }}>for sales orgs &rarr;</Link>
      </footer>
    </main>
  );
}
