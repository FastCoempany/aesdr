/**
 * /x/landing — the FULL landing experience for an affiliate prospect.
 *
 * Mirrors the real aesdr.com landing (app/page.tsx) so the prospect sees
 * exactly what their audience would see: the cinematic intro, then the whole
 * marketing page — deck stack, "what this is not," the comparison, testimonials,
 * pricing, FAQ, final CTA, footer. At the very bottom, BottomTimer starts the
 * 30s iris countdown that directs them to the kit.
 *
 * Differences from app/page.tsx (deliberate, for this isolated host):
 *  - cinematic is the forked TrackedCinematic (no skip, full typing, tracked)
 *  - no auth nav (no Sign In / Sign Out), no coming-soon GhostButton
 *  - deep links (footer, compare) point at the real aesdr.com so they work
 *    instead of 404ing on the locked experience host
 *  - BottomTimer overlay at the end
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";

import AesdrBrand from "@/components/AesdrBrand";
import PricingTiers from "@/components/PricingTiers";
import ValidationMarquee from "@/components/ValidationMarquee";
import { Icon, type IconName } from "@/components/brand/Icon";
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import {
  CornerBracket,
  GhostNumeral,
  ClassifiedStamp,
  Wordmark,
  TerminalDots,
} from "@/components/brand/BrandAssets";
import styles from "@/app/page.module.css";

import TrackedCinematic from "../../_components/TrackedCinematic";
import StaticLeponeusHero from "../../_components/StaticLeponeusHero";
import BottomTimer from "../../_components/BottomTimer";
import KitTracker from "../../_components/KitTracker";
import PreviewOnlyLink from "../../_components/PreviewOnlyLink";
import PreviewOnlyWrap from "../../_components/PreviewOnlyWrap";

/** Three subtle design-system variants of the same landing shape.
 * Pages at /x/landing/v1, /v2, /v3 each call <LandingShell variant="vX" />.
 * The base /x/landing route renders the default (no variant) — unchanged.
 *
 * v3 explorations: v3a (Saturated Iris), v3b (Architectural Bracket),
 * v3c (Editorial Iris) — three directional variants of the v3 register. */
export type LandingVariant =
  | "default"
  | "v1"
  | "v2"
  | "v3"
  | "v3a"
  | "v3b"
  | "v3c";

const Testimonials = dynamic(() => import("@/components/Testimonials"));
const DeckStack = dynamic(() => import("@/components/DeckStack"));

export const metadata: Metadata = {
  title: "AESDR",
  robots: { index: false, follow: false },
};

/**
 * The seven substantial assets — rendered as a centered framed block so it
 * lands as a deliberate callout, not as a list inside body copy. Mile-glyph
 * bullets to the left of each name, ink frame with quiet iris-edge glow so it
 * stands off the cream surface.
 */
function SubstantialAssetsList() {
  const named = [
    "The AE/SDR Alignment Contract",
    "The ROI & Commission Defense Tracker",
    "The 72-Hour Strike Plan",
  ];
  return (
    <div
      style={{
        position: "relative",
        maxWidth: 540,
        margin: "26px auto 22px",
        padding: 4,
        borderRadius: 12,
        background:
          "linear-gradient(var(--cream, #FAF7F2), var(--cream, #FAF7F2)) padding-box, var(--iris) border-box",
        backgroundSize: "100% 100%, 300% 100%",
        border: "1px solid transparent",
        boxShadow:
          "0 0 18px rgba(255, 0, 110, 0.10), 0 0 36px rgba(139, 92, 246, 0.08), 0 24px 48px -22px rgba(26, 26, 26, 0.18)",
      }}
    >
      <ul
        style={{
          listStyle: "none",
          padding: "20px 28px",
          margin: 0,
          background: "var(--cream, #FAF7F2)",
          borderRadius: 10,
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 12,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {named.map((name) => (
          <li
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontStyle: "italic",
              fontSize: 18,
              lineHeight: 1.4,
              color: "var(--ink, #1A1A1A)",
              fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            }}
          >
            <Icon
              name="mile"
              size={20}
              style={{
                color: "var(--crimson, #8B1A1A)",
                flexShrink: 0,
                strokeWidth: 2,
              }}
            />
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

const FAQ: { q: string; a: ReactNode; icon: IconName }[] = [
  { q: "Is this for me if I’m brand new to sales?",          a: "Yes, it’s actually inspired by you. The curriculum starts with the fundamentals and ends with harder material. If you’re in your first 18 months, you’ll skip years of painful trial-and-error.", icon: "eye"       },
  { q: "Is this just another motivational sales course?",   a: "Nope — no guru routines and no motivational performance built into the format; this is sober, fun, practical training built by people who carried bags and managed AEs and SDRs over the last 10+ years on real teams.",                                       icon: "warn"      },
  { q: "What if I want a refund?",                                a: "14-day, no-questions-asked refund. Email hello@aesdr.com and we process it within 3 business days. If it doesn’t deliver value, we don’t want your money.",                                                  icon: "refund"    },
  { q: "Is this a subscription? How long do I get access?",    a: "Not a subscription. One-time purchase. No renewal, no expiration date. Every future update we ship to the curriculum is included at no extra charge. If we ever shut AESDR down, every active customer gets a final downloadable bundle of the lessons they’d completed.",            icon: "hourglass" },
  { q: "Why does the page ask AE or SDR?",                        a: "So we can show you the right courses, copy, and pricing for your path. AE and SDR paths share the foundation but diverge on the role-specific lessons — pipeline math, cold outbound, and manager 1:1s all read differently depending on which side of the deal you're on. Pick once and we remember it. You can switch anytime; the curriculum reorders to your selection.",                                       icon: "signal"    },
  { q: "What’s the difference between Individual and Team?", a: "Individual is one seat, one login. Team is for sales managers rolling out training across an actual team — manager dashboard, mixed AE/SDR tracks, invoice formatted for L&D. Team pricing isn't on the page because every team's shape is different — email hello@aesdr.com and we'll quote it after a five-minute conversation about team size.",                                                                       icon: "team"      },
  { q: "Is there a community or is this self-paced only?",        a: "Self-paced. AESDR is the kind of thing you come back to in year three when the comp plan changes — not a live community you check into. There's an alumni room that opens when you finish all twelve courses — but it's a course bonus, not what you're paying for.",                                                icon: "hourglass" },
  { q: "I’ve been in sales for 5+ years. Is this too basic?", a: "Courses 1–5 cover fundamentals. Courses 6–12 work through prospecting strategy, pipeline math, financial resilience, and the relationships that pay off five years out. If you disagree, we refund.",                  icon: "signal"    },
  { q: "Can my company expense this?",                            a: "Of course. We provide a receipt and invoice on purchase. Most L&D budgets cover this easily — especially the Team plan.",                                                                                       icon: "ledger"    },
  { q: "How is this different from Sales Assembly or Pavilion?", a: <>Different product entirely. Those are senior-AE peer networks &mdash; you&rsquo;re paying for the room and the people in it. AESDR is the lessons and the work, something you come back to in year three. If you want the network, those are excellent. If you want a framework you can hand to a new SDR on Monday morning, this one. Full breakdown <PreviewOnlyLink target="/compare" style={{ color: "var(--crimson)", textDecoration: "underline", cursor: "pointer" }}>here</PreviewOnlyLink>.</>,                                                                                  icon: "team"      },
  { q: "Why not just use Bravado, r/sales, or LinkedIn?",         a: "Those are good for the random thread when you have a specific live problem. AESDR is structured — Lesson 8 is the 30% rule, Lesson 10 is the comp-plan teardown, Lesson 12 is the relationship graph. You don’t have to phrase your problem correctly to find the answer; the curriculum sequences it. Plus role-conditional content across 18 of the 36 sub-lessons, which a community can’t deliver.", icon: "signal"    },
  { q: "I’ve been reading Sales Hacker and RepVue for a year. Different?", a: "Three differences. Structure — a reading list doesn’t sequence what compounds. Vendor independence — the free content is sponsored by tools, so the tools lessons are quietly compromised. AESDR isn’t sponsored by any of them, so nothing’s shaped to sell you software. And what you keep — you don’t take a Sales Hacker post into your 1:1 with a bad manager next week. You take the AE/SDR Alignment Contract.",         icon: "eye"       },
  { q: "Should I take Aspireship or Uvaro instead?",              a: "Different audience. Those are bootcamps for people trying to break into sales — they place you, coach you through ramp, sometimes share first-year commission. AESDR assumes the seat is already yours. If you’re three months from your first SDR interview, take a bootcamp. If you’re three months into the job and the ramp is harder than anyone warned you about, this one.",                                          icon: "warn"      },
];

export function LandingShell({ variant = "default" }: { variant?: LandingVariant }) {
  return (
    <main className={styles.page}>
      <KitTracker event="landing_viewed" props={{ variant }} />

      {/* ─── NAV ─── */}
      <header className={styles.nav}>
        <AesdrBrand className={styles.brand} style={{ textDecoration: "none", color: "inherit" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a href="#pricing" className={styles.navCta}>Get Access</a>
        </div>
      </header>

      {/* ─── Variant intro band (subtle brand-system reinforcement directly
              under the nav). Default renders nothing. ─── */}
      <VariantIntroBand variant={variant} />

      {/* Variant indicator badge — only on the variant pages, top-right
          so the reviewer always knows which one they're looking at. */}
      <VariantBadge variant={variant} />

      {/* Default route: full cinematic. Variants: static hero (skips the
          typing playback so design review isn't disrupted). */}
      {variant === "default" ? <TrackedCinematic /> : <StaticLeponeusHero />}

      {/* Sneak-peek video — id="post-animation" gives the kit's KitNav
          knob a real anchor to land on, so 'back to landing' skips the
          cinematic and drops the prospect into the post-typing experience. */}
      <section id="post-animation" className={styles.sneakPeekSection}>
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

      {/* What this is NOT */}
      <VariantSectionAnchor variant={variant} numeral="01" label="Honesty" icon="eye" />
      <section className={styles.notSection} style={{ position: "relative" }}>
        <VariantSectionBackdrop variant={variant} numeral="01" />
        {variant === "default" && <p className={styles.sectionLabel}>Honesty</p>}
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

      {/* Comparison */}
      <VariantSectionAnchor variant={variant} numeral="02" label="How this compares" icon="weight" />
      <section className={styles.compareSection}>
        {variant === "default" && <p className={styles.sectionLabel}>How this compares</p>}
        <h2 className={styles.compareHeadline}>
          Four shapes of sales training. <em>Pick the one that fits.</em>
        </h2>
        <div className={styles.compareGrid}>
          <div className={styles.compareCol} aria-label="AESDR — this product">
            <p className={styles.compareLabel}>AESDR</p>
            <p className={styles.comparePrice}>$249 &amp; $299 · one-time (team licensing on request)</p>
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
              <strong>Fits:</strong>&nbsp;AEs and SDRs in their first 2 years or so
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
              <strong>Fits:</strong>&nbsp;AEs and SDRs looking for emotional lift
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
              <strong>Fits:</strong>&nbsp;AEs and SDRs whose schedules are open
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
              <strong>Fits:</strong>&nbsp;Nobody really chooses this one — you do
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
          <PreviewOnlyLink
            target="/compare"
            style={{ color: "var(--crimson)", textDecoration: "underline", cursor: "pointer" }}
          >
            We named each one →
          </PreviewOnlyLink>
        </p>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Validation */}
      <ValidationMarquee />

      {/* ═══ PRICING ═══ — wrapped to intercept the checkout buttons */}
      <VariantSectionAnchor variant={variant} numeral="03" label="Pricing" icon="refund" />
      <PreviewOnlyWrap>
        <section id="pricing" className={styles.pricingSection}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Mascot pose="verdict" size={MASCOT_SIZE.banner} />
          </div>
          {variant === "default" && <p className={styles.sectionLabel}>Pricing</p>}
          <h2 className={styles.sectionHeadline}>One price. Yours when you buy it.</h2>
          <div className={styles.divider} />
          <PricingTiers initialRole={null} />
        </section>
      </PreviewOnlyWrap>

      {/* ═══ FAQ ═══ */}
      <VariantSectionAnchor variant={variant} numeral="04" label="Questions" icon="warn" />
      <section className={styles.faqSection}>
        <div className={styles.faqHeader}>
          {variant === "default" && (
            <p className={styles.faqLabel}>
              <span className={styles.faqLabelIcon}>!</span>
              Questions
            </p>
          )}
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
                <span className={styles.faqRedactLabel} aria-hidden="true">[classified &mdash; hover to reveal]</span>
              </div>
              <span className={styles.faqStamp} aria-hidden="true">Classified</span>
            </div>
          ))}
        </div>
        <p className={styles.faqScrollCue}>scroll &rarr;</p>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <VariantSectionAnchor variant={variant} numeral="05" label="Begin" icon="mile" />
      <section
        className={styles.finalCta}
        style={
          variant === "v3"
            ? {
                position: "relative",
                border: "1px solid rgba(139, 26, 26, 0.18)",
                margin: "0 5vw",
                borderRadius: 6,
              }
            : { position: "relative" }
        }
      >
        <h2 className={styles.finalHeadline}>Stop ChatGPClaudeing. Start&nbsp;executing.</h2>
        <p className={styles.finalSub}>
          12 courses, plus a pack of substantial assets you&rsquo;ll keep:
        </p>
        <SubstantialAssetsList />
        <p className={styles.finalSub} style={{ marginTop: 0 }}>
          ... and 5 more ridiculously valuable assets that&rsquo;ll sweeten up
          your day-to-day, your AE/SDR dynamic, and your value to yourself in
          this business.
        </p>
        {/* "We can't stress enough" wrapped in editorial corner brackets per the
            design canon — same brackets used throughout the kit heroes. Quiet
            ink at ~22% opacity so they frame the line without competing with
            the Playfair display register. */}
        <div
          style={{
            position: "relative",
            maxWidth: 660,
            margin: "0 auto 32px",
            padding: "26px 38px 8px",
          }}
        >
          <CornerBracket
            position="tl"
            size={26}
            color="rgba(26,26,26,0.22)"
            style={{ position: "absolute", top: 4, left: 4 }}
          />
          <CornerBracket
            position="tr"
            size={26}
            color="rgba(26,26,26,0.22)"
            style={{ position: "absolute", top: 4, right: 4 }}
          />
          <CornerBracket
            position="bl"
            size={26}
            color="rgba(26,26,26,0.22)"
            style={{ position: "absolute", bottom: -8, left: 4 }}
          />
          <CornerBracket
            position="br"
            size={26}
            color="rgba(26,26,26,0.22)"
            style={{ position: "absolute", bottom: -8, right: 4 }}
          />
          <p
            style={{
              fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: 18,
              lineHeight: 1.45,
              color: "var(--ink, #1A1A1A)",
              margin: 0,
              letterSpacing: "-0.005em",
              textAlign: "center",
            }}
          >
            We can&rsquo;t stress enough that this program is built for AEs and SDRs who want to get better at the actual work rather than just feel better about the week ahead.
          </p>
        </div>
        <a href="#pricing" className={styles.ctaPrimary}>Get Access</a>
      </section>

      {/* Content Warning */}
      <div className={styles.contentWarningLine}>
        <span className={styles.warningLineIcon}>!</span>
        Content Warning &mdash; This course contains uncomfortable truths about your pipeline, your apartment, your bar tab, your commission check, and your relationship status. &mdash; AESDR &mdash; 12 courses / at your own pace
      </div>

      {/* Footer — all links intercepted, prospect never leaves the experience */}
      <footer className={styles.footer}>
        <span style={{ opacity: 0.5 }}>AESDR &copy; {new Date().getFullYear()}</span>
        <PreviewOnlyLink target="/terms">Terms</PreviewOnlyLink>
        <PreviewOnlyLink target="/privacy">Privacy</PreviewOnlyLink>
        <PreviewOnlyLink target="/refund-policy">Refunds</PreviewOnlyLink>
        <PreviewOnlyLink target="/research">Research</PreviewOnlyLink>
        <PreviewOnlyLink target="/compare">Compare</PreviewOnlyLink>
        <PreviewOnlyLink target="/about">About</PreviewOnlyLink>
        <PreviewOnlyLink target="/contact">Contact</PreviewOnlyLink>
        <PreviewOnlyLink target="/enterprise" style={{ opacity: 0.7 }}>for sales orgs &rarr;</PreviewOnlyLink>
      </footer>

      {/* The bottom-of-page iris timer that directs to the kit */}
      <BottomTimer />
    </main>
  );
}

/**
 * Thin wrapper for the default /x/landing route. Renders LandingShell with
 * no variant. The three variant pages (v1/v2/v3) each render LandingShell
 * with their own variant prop.
 */
export default function ExperienceLandingPage() {
  return <LandingShell />;
}

/* ─────────────────────────────────────────────────
   Variant decoration helpers — each conditionally renders only when its
   variant is active. Default returns null so the base /x/landing stays
   pixel-identical to the existing build.
   ───────────────────────────────────────────────── */

function VariantBadge({ variant }: { variant: LandingVariant }) {
  if (variant === "default") return null;
  const label = {
    v1: "V1 · Editorial Marginalia",
    v2: "V2 · Stamped Documentary",
    v3: "V3 · Bracketed + Iris",
    v3a: "V3a · Saturated Iris",
    v3b: "V3b · Architectural Bracket",
    v3c: "V3c · Editorial Iris",
  }[variant];
  return (
    <div
      style={{
        position: "fixed",
        top: 14,
        right: 14,
        zIndex: 60,
        background: "var(--ink)",
        color: "#FAF7F2",
        padding: "8px 14px",
        fontFamily: "var(--cond)",
        textTransform: "uppercase",
        letterSpacing: ".2em",
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 2,
        boxShadow: "0 8px 18px rgba(0,0,0,0.22)",
        borderLeft: "3px solid var(--crimson)",
      }}
    >
      {label}
    </div>
  );
}

function VariantIntroBand({ variant }: { variant: LandingVariant }) {
  if (variant === "v1") {
    /* V1 — Editorial Marginalia: dossier-style top band with a thin
       iris hairline, a centered Playfair italic dateline, and a
       quiet "field notes" register that runs as a thin masthead
       under the nav. */
    return (
      <div
        style={{
          padding: "14px 5vw 10px",
          background: "var(--cream)",
          borderBottom: "1px solid var(--light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontSize: 14,
            color: "var(--ink)",
            display: "inline-flex",
            alignItems: "baseline",
            gap: 10,
          }}
        >
          <em style={{ color: "var(--crimson)" }}>Volume I.</em>
          <span style={{ color: "var(--muted)" }}>Field Notes for First-Year Sellers</span>
        </span>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".24em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          §§ 01 — 05
        </span>
      </div>
    );
  }
  if (variant === "v2") {
    /* V2 — Stamped Documentary: heavy ink dossier band. Black plate,
       cream text, TerminalDots punctuation, ClassifiedStamp on the
       right. Reads as a case-file cover. */
    return (
      <div
        style={{
          padding: "12px 5vw",
          background: "var(--ink)",
          color: "#FAF7F2",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: ".24em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          <TerminalDots size={6} color="#FAF7F2" />
          File: AESDR / Course Prospectus / Vol. 01
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#b4455d" }}>Cleared</span>
          <span style={{ color: "#FAF7F2" }}>
            <ClassifiedStamp width={96} height={20} label="Sample" />
          </span>
        </span>
      </div>
    );
  }
  if (variant === "v3") {
    /* V3 — Bracketed + Iris: NO intro band. Per direction the iris
       top-bar and the 'Survival Manual · Edition 12' chip are both
       gone. The v3 register lives entirely in the section anchors. */
    return null;
  }
  return null;
}

function VariantSectionAnchor({
  variant,
  numeral,
  label,
  icon,
}: {
  variant: LandingVariant;
  numeral: string;
  label: string;
  icon: IconName;
}) {
  if (variant === "v1") {
    /* V1 — Editorial Marginalia: a substantial section header band.
       Big Playfair italic numeral on the left, section label in display
       italic centered, iris hairline beneath the whole band. Reads as
       a magazine chapter opener. */
    return (
      <div
        style={{
          padding: "56px 5vw 0",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 24,
        }}
      >
        <span
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: 80,
            lineHeight: 0.9,
            color: "var(--crimson)",
            letterSpacing: "-0.02em",
          }}
        >
          {numeral}
        </span>
        <div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: ".28em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 6,
            }}
          >
            <Icon
              name={icon}
              size={18}
              style={{ color: "var(--crimson)", strokeWidth: 2 }}
            />
            Chapter
          </span>
          <h3
            style={{
              fontFamily: "var(--display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 36,
              margin: 0,
              color: "var(--ink)",
              letterSpacing: "-0.005em",
              lineHeight: 1.1,
            }}
          >
            {label}.
          </h3>
        </div>
        <div
          style={{
            width: 80,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, var(--crimson), transparent)",
          }}
        />
      </div>
    );
  }
  if (variant === "v2") {
    /* V2 — Stamped Documentary: heavy ClassifiedStamp + ink-plate
       chapter divider. Black bar with cream text, TerminalDots,
       stamp marker. Reads as a case-file divider. */
    return (
      <div
        style={{
          margin: "48px 5vw 0",
          background: "var(--ink)",
          color: "#FAF7F2",
          padding: "16px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          borderLeft: "6px solid var(--crimson)",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
          <TerminalDots size={7} color="#FAF7F2" />
          <span
            style={{
              fontFamily: "var(--cond)",
              textTransform: "uppercase",
              letterSpacing: ".24em",
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(250,247,242,0.65)",
            }}
          >
            §{numeral}
          </span>
          <Icon
            name={icon}
            size={20}
            style={{ color: "#b4455d", strokeWidth: 2 }}
          />
          <span
            style={{
              fontFamily: "var(--cond)",
              textTransform: "uppercase",
              letterSpacing: ".18em",
              fontSize: 18,
              fontWeight: 700,
              color: "#FAF7F2",
            }}
          >
            {label}
          </span>
        </span>
        <span style={{ color: "#FAF7F2" }}>
          <ClassifiedStamp width={120} height={22} label="On File" />
        </span>
      </div>
    );
  }
  if (variant === "v3a") {
    /* V3a — Saturated Iris: iris-gradient PLATE behind the entire
       section header. Iris everywhere; the bracket is iris-tinted ink
       at low opacity to keep the frame readable on the gradient. */
    return (
      <div
        style={{
          position: "relative",
          padding: "44px 5vw 0",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            padding: "32px 48px",
            display: "inline-block",
            background: "var(--iris)",
            backgroundSize: "300% 100%",
            animation: "shimmer 5s linear infinite",
            borderRadius: 8,
            boxShadow:
              "0 0 28px rgba(255,0,110,0.22), 0 0 56px rgba(139,92,246,0.18), 0 24px 48px -20px rgba(26,26,26,0.32)",
          }}
        >
          <CornerBracket
            position="tl"
            size={26}
            color="rgba(26,26,26,0.45)"
            thickness={1.5}
            style={{ position: "absolute", top: 8, left: 8 }}
          />
          <CornerBracket
            position="tr"
            size={26}
            color="rgba(26,26,26,0.45)"
            thickness={1.5}
            style={{ position: "absolute", top: 8, right: 8 }}
          />
          <CornerBracket
            position="bl"
            size={26}
            color="rgba(26,26,26,0.45)"
            thickness={1.5}
            style={{ position: "absolute", bottom: 8, left: 8 }}
          />
          <CornerBracket
            position="br"
            size={26}
            color="rgba(26,26,26,0.45)"
            thickness={1.5}
            style={{ position: "absolute", bottom: 8, right: 8 }}
          />
          <span
            style={{
              fontFamily: "var(--display)",
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: 64,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "#FAF7F2",
              display: "inline-block",
              marginRight: 18,
              verticalAlign: "middle",
              textShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            {numeral}
          </span>
          <Icon
            name={icon}
            size={28}
            style={{
              color: "#FAF7F2",
              strokeWidth: 2,
              verticalAlign: "middle",
              marginRight: 14,
            }}
          />
          <span
            style={{
              fontFamily: "var(--cond)",
              textTransform: "uppercase",
              letterSpacing: ".24em",
              fontSize: 20,
              fontWeight: 700,
              color: "#FAF7F2",
              verticalAlign: "middle",
              textShadow: "0 1px 4px rgba(0,0,0,0.18)",
            }}
          >
            {label}
          </span>
        </div>
      </div>
    );
  }
  if (variant === "v3b") {
    /* V3b — Architectural Bracket: lean into the bracket motif. Big
       corner brackets frame the whole header band (40px). Iris reduced
       to JUST the numeral. Everything else is ink/crimson. More
       negative space, more architectural. */
    return (
      <div
        style={{
          padding: "64px 5vw 0",
        }}
      >
        <div
          style={{
            position: "relative",
            padding: "40px 60px",
            margin: "0 auto",
            maxWidth: 720,
            display: "grid",
            gridTemplateColumns: "auto auto auto",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
          }}
        >
          <CornerBracket
            position="tl"
            size={40}
            color="var(--ink)"
            thickness={1.5}
            style={{ position: "absolute", top: 0, left: 0 }}
          />
          <CornerBracket
            position="tr"
            size={40}
            color="var(--ink)"
            thickness={1.5}
            style={{ position: "absolute", top: 0, right: 0 }}
          />
          <CornerBracket
            position="bl"
            size={40}
            color="var(--ink)"
            thickness={1.5}
            style={{ position: "absolute", bottom: 0, left: 0 }}
          />
          <CornerBracket
            position="br"
            size={40}
            color="var(--ink)"
            thickness={1.5}
            style={{ position: "absolute", bottom: 0, right: 0 }}
          />
          <span
            style={{
              fontFamily: "var(--display)",
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: 72,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              background: "var(--iris)",
              backgroundSize: "300% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              animation: "shimmer 5s linear infinite",
            }}
          >
            {numeral}
          </span>
          <Icon
            name={icon}
            size={32}
            style={{
              color: "var(--crimson)",
              strokeWidth: 2,
            }}
          />
          <span
            style={{
              fontFamily: "var(--cond)",
              textTransform: "uppercase",
              letterSpacing: ".22em",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--ink)",
            }}
          >
            {label}
          </span>
        </div>
      </div>
    );
  }
  if (variant === "v3c") {
    /* V3c — Editorial Iris: v1-style chapter-opener layout with iris
       accents. Big iris numeral on the left (instead of crimson),
       'Chapter' mono eyebrow + display-italic label centered, iris
       hairline trailing on the right. Magazine register meets iris. */
    return (
      <div
        style={{
          padding: "56px 5vw 0",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 28,
        }}
      >
        <span
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: 88,
            lineHeight: 0.85,
            letterSpacing: "-0.02em",
            background: "var(--iris)",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            animation: "shimmer 5s linear infinite",
            display: "inline-block",
          }}
        >
          {numeral}
        </span>
        <div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: ".28em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 6,
            }}
          >
            <Icon
              name={icon}
              size={18}
              style={{ color: "var(--crimson)", strokeWidth: 2 }}
            />
            Chapter
          </span>
          <h3
            style={{
              fontFamily: "var(--display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 36,
              margin: 0,
              color: "var(--ink)",
              letterSpacing: "-0.005em",
              lineHeight: 1.1,
            }}
          >
            {label}.
          </h3>
        </div>
        <div
          style={{
            width: 120,
            height: 2,
            background: "var(--iris)",
            backgroundSize: "300% 100%",
            animation: "shimmer 6s linear infinite",
          }}
        />
      </div>
    );
  }
  if (variant === "v3") {
    /* V3 — Bracketed + Iris: full-width iris-gradient bar, big iris
       section number, corner brackets framing the label. High design
       register. */
    return (
      <div
        style={{
          position: "relative",
          padding: "56px 5vw 0",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            padding: "24px 36px",
            display: "inline-block",
          }}
        >
          <CornerBracket
            position="tl"
            size={28}
            color="var(--crimson)"
            thickness={1.5}
            style={{ position: "absolute", top: 0, left: 0 }}
          />
          <CornerBracket
            position="tr"
            size={28}
            color="var(--crimson)"
            thickness={1.5}
            style={{ position: "absolute", top: 0, right: 0 }}
          />
          <CornerBracket
            position="bl"
            size={28}
            color="var(--crimson)"
            thickness={1.5}
            style={{ position: "absolute", bottom: 0, left: 0 }}
          />
          <CornerBracket
            position="br"
            size={28}
            color="var(--crimson)"
            thickness={1.5}
            style={{ position: "absolute", bottom: 0, right: 0 }}
          />
          <span
            style={{
              fontFamily: "var(--display)",
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: 56,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              background: "var(--iris)",
              backgroundSize: "300% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              animation: "shimmer 5s linear infinite",
              display: "inline-block",
              marginRight: 18,
              verticalAlign: "middle",
            }}
          >
            {numeral}
          </span>
          <Icon
            name={icon}
            size={26}
            style={{
              color: "var(--crimson)",
              strokeWidth: 2,
              verticalAlign: "middle",
              marginRight: 14,
            }}
          />
          <span
            style={{
              fontFamily: "var(--cond)",
              textTransform: "uppercase",
              letterSpacing: ".22em",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--ink)",
              verticalAlign: "middle",
            }}
          >
            {label}
          </span>
        </div>
        <div
          style={{
            height: 2,
            background: "var(--iris)",
            backgroundSize: "300% 100%",
            animation: "shimmer 6s linear infinite",
            margin: "12px auto 0",
            maxWidth: 480,
          }}
        />
      </div>
    );
  }
  return null;
}

function VariantSectionBackdrop({
  variant,
  numeral,
}: {
  variant: LandingVariant;
  numeral: string;
}) {
  if (variant === "v3" || variant === "v3a" || variant === "v3c") {
    // V3 family — ghost numeral magazine watermark behind the
    // .notSection. v3a + v3c inherit the same backdrop register so the
    // marginalia feel carries across the variants.
    return (
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -20,
          right: "5vw",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <GhostNumeral numeral={numeral} size={420} />
      </div>
    );
  }
  if (variant === "v3b") {
    // v3b — architectural register. Skip the ghost numeral; the bracket
    // motif carries the section identity instead.
    return null;
  }
  return null;
}
