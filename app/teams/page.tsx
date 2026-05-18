import Link from "next/link";
import styles from "./teams.module.css";
import { SubLogoFull } from "./_components/SubLogo";
import KPIStat from "./_components/KPIStat";
import BuyerModeCard from "./_components/BuyerModeCard";
import InlineCTA from "./_components/InlineCTA";

/**
 * /teams — landing.
 *
 * Manager-confident editorial register. Hero with three iris-shimmer
 * stats, the wedge ("junior reps break in predictable ways"), what it
 * is, the four buyer modes, and a closing CTA.
 *
 * Hero stat numbers are sourced from Bridge Group's State of Sales
 * Development report and adjacent industry research. Citation in
 * KPIStat's `source` prop keeps the credentialing visible.
 */
export default function TeamsLanding() {
  return (
    <>
      {/* ── HERO ───────────────────────────────── */}
      <section className={`${styles.hero}`}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>AESDR / OPERATING LAYER</p>
          <h1 className={styles.heroHeadline}>
            The missing behavioral foundation for early-career sales orgs.
          </h1>
          <p className={styles.heroSubhead}>
            The same 12 lessons that 1st- and 2nd-year SDRs and AEs buy on aesdr.com
            — packaged for sales orgs that need their junior reps to mature faster.
          </p>

          <div className={styles.kpiRow}>
            <KPIStat
              value="8.4 mo"
              caption="Average time to full SDR quota attainment"
              source="Bridge Group, 2024"
            />
            <KPIStat
              value="39%"
              caption="First-year SDR voluntary turnover in SaaS"
              source="Bridge Group, 2024"
            />
            <KPIStat
              value="~$115K"
              caption="Fully-loaded cost of recruiting, ramping, and losing one SDR before productivity"
              source="LinkedIn Talent + Bridge Group"
            />
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
            <InlineCTA href="/teams/contact?source=hero">Book a 30-min walkthrough</InlineCTA>
            <InlineCTA href="/teams/curriculum" variant="arrow">
              See the curriculum
            </InlineCTA>
          </div>
        </div>
      </section>

      {/* ── THE WEDGE ──────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <p className={styles.eyebrow}>The wedge</p>
          <h2 className={styles.h2}>Junior SDRs and AEs break in predictable ways.</h2>
          <hr className={styles.divider} />

          <p className={styles.body}>
            Most sales orgs hire reps and expect a manager plus a Highspot library to
            make them productive. It works for some. Most stall, churn, or quit.
          </p>
          <p className={styles.body}>
            The reasons aren&apos;t a mystery. Toxic management, ego dynamics between
            SDRs and AEs, CRM friction, async-life dysfunction, no playbook for the
            first 100 cold dials — these are the same six or seven breakpoints,
            repeated across orgs.
          </p>
          <p className={styles.body}>
            AESDR is 12 lessons, each addressing one of those breakpoints, with a
            takeaway tool the rep keeps. The behavioral foundation that should
            already exist but doesn&apos;t.
          </p>
        </div>
      </section>

      {/* ── WHAT IT IS ─────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionDivider}`}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>What it is</p>
          <h2 className={styles.h2}>Twelve lessons. Five tools. One Discord.</h2>
          <hr className={styles.divider} />

          <div className={styles.cardGrid3}>
            <div className={styles.card}>
              <p className={styles.cardEyebrow}>01 · CURRICULUM</p>
              <h3 className={styles.cardTitle}>12 lessons</h3>
              <p className={styles.cardBody}>
                Survival-grade, field-tested, ~25 minutes each. Interactive — not
                video-and-quiz. Topics span manager dynamics, AE/SDR alignment,
                CRM, async life, and the SDR playbook itself.
              </p>
              <InlineCTA href="/teams/curriculum" variant="arrow">
                Full curriculum map
              </InlineCTA>
            </div>

            <div className={styles.card}>
              <p className={styles.cardEyebrow}>02 · TAKEAWAYS</p>
              <h3 className={styles.cardTitle}>5 tools reps keep</h3>
              <p className={styles.cardBody}>
                The manager archetype map. The AE/SDR alignment contract. The
                72-hour strike plan. The CRM survival guide. The async cadence
                template. Built to live outside the course.
              </p>
            </div>

            <div className={styles.card}>
              <p className={styles.cardEyebrow}>03 · COMMUNITY</p>
              <h3 className={styles.cardTitle}>Untamed Discord</h3>
              <p className={styles.cardBody}>
                Real AEs and SDRs working through the material together. Calm,
                anti-guru, no growth-hack pep talk. Where reps process what
                they&apos;ve learned and find people who&apos;ve seen the same fires.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUR BUYER MODES ──────────────────── */}
      <section className={`${styles.section} ${styles.sectionDivider}`}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>How orgs buy it</p>
          <h2 className={styles.h2}>Four paths in.</h2>
          <hr className={styles.divider} />
          <p className={styles.lede}>
            Same product, four ways to bring it into your org or your platform.
            Pricing details on{" "}
            <Link href="/teams/pricing" style={{ color: "var(--ink)" }}>
              /teams/pricing
            </Link>
            .
          </p>

          <div className={styles.cardGrid2}>
            <BuyerModeCard
              eyebrow="MODE 01"
              title="Direct team seats"
              price="$1,499"
              priceUnit="one-time · up to 10 seats"
              description="Buy a 10-seat pack for your team. Reps see the consumer experience; you get the manager dashboard and progress visibility. Lifetime access for every seat."
              features={[
                "10 seats, any mix of SDR and AE tracks",
                "Manager dashboard + progress tracking",
                "Priority Slack support",
                "Invoice + receipt formatted for L&D reimbursement",
                "14-day refund — same as consumer",
              ]}
              ctaHref="/teams/pricing"
              ctaLabel="Team pricing"
            />

            <BuyerModeCard
              eyebrow="MODE 02"
              title="Custom enterprise"
              ribbon="50+ SEATS"
              featured
              description="Per-seat pricing with manager onboarding, custom rollout sequence, and dedicated Slack channel. For orgs hiring 20+ reps a year or running structured ramp programs."
              features={[
                "Per-seat pricing past 10 seats",
                "Live manager onboarding session",
                "Custom rollout sequence",
                "Dedicated org Slack channel",
                "Optional add-ons: live coaching pods, custom diagnostic administration",
              ]}
              ctaHref="/teams/contact?source=hero-enterprise"
              ctaLabel="Talk to us"
            />

            <BuyerModeCard
              eyebrow="MODE 03"
              title="White-label / co-branded"
              description="For partners packaging AESDR inside their own offering. We deliver the 12 lessons + 5 takeaway tools; you wrap them in your brand. Revenue-share or wholesale pricing."
              features={[
                "Delivery rights to lessons + takeaway tools",
                "Co-branded materials (your logo + AESDR mark with mutual approval)",
                "Per-seat wholesale rate or revenue-share",
                "No exclusivity, no minimums",
              ]}
              ctaHref="/teams/contact?source=hero-whitelabel"
              ctaLabel="Partnership inquiry"
            />

            <BuyerModeCard
              eyebrow="MODE 04"
              title="Marketplace integration"
              description="For LMS, sales enablement, and hiring platforms. AESDR plugs into your existing customer base as the behavioral training your platform doesn't produce. SSO and SCORM on the integration roadmap."
              features={[
                "Listed in your marketplace under sales / L&D categories",
                "SSO + email-based provisioning available now",
                "SCORM, xAPI, LTI on roadmap (built per partner pull)",
                "Referral fee, reseller margin, or wholesale seats",
              ]}
              ctaHref="/teams/partners"
              ctaLabel="See partner categories"
            />
          </div>
        </div>
      </section>

      {/* ── POWERED BY (truthful positioning, just above footer) ── */}
      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
            <SubLogoFull size={32} />
          </div>
          <p className={`${styles.lede} ${styles.center} ${styles.maxLine}`} style={{ margin: "16px auto 0", color: "var(--muted)" }}>
            AESDR / Operating Layer is built on{" "}
            <Link href="/" style={{ color: "var(--ink)" }}>
              aesdr.com
            </Link>
            {" "}— the rep-direct course that 1st- and 2nd-year SDRs and AEs actually use.
            The same 12 lessons, packaged for sales orgs.
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
            <InlineCTA href="/teams/contact?source=footer-cta">
              Book a 30-min walkthrough
            </InlineCTA>
          </div>
        </div>
      </section>
    </>
  );
}
