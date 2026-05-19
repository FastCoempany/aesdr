import Link from "next/link";
import styles from "./enterprise.module.css";
import { SubLogoFull } from "./_components/SubLogo";
import KPIStat from "./_components/KPIStat";
import BuyerModeCard from "./_components/BuyerModeCard";
import InlineCTA from "./_components/InlineCTA";

/**
 * /enterprise — landing.
 *
 * Manager-confident editorial register. Hero with three iris-shimmer
 * stats, the problem framing, what AESDR is, four ways to buy, and a
 * closing CTA.
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
          <p className={styles.eyebrow}>AESDR / FOR TEAMS</p>
          <h1 className={styles.heroHeadline}>
            The training your first- and second-year SDRs and AEs should already have.
          </h1>
          <p className={styles.heroSubhead}>
            The same 12 modules that junior SDRs and AEs buy on aesdr.com — packaged
            for sales teams that need their new AEs and SDRs productive faster, with fewer
            of them quitting in month four.
          </p>

          <div className={styles.kpiRow}>
            <KPIStat
              value="51%"
              caption="of AEs hit quota in 2024 — down from 66% in 2022"
              source="Bridge Group SaaS AE Report, 2024"
              sourceUrl="https://blog.bridgegroupinc.com/2024-ae-metrics-compensation-benchmark"
            />
            <KPIStat
              value="1.9 yr"
              caption="median SDR tenure — and only 12–13 months of full productivity per hire"
              source="Bridge Group SDR Metrics Report, 2024"
              sourceUrl="https://blog.bridgegroupinc.com/sales-development-metrics"
            />
            <KPIStat
              value="16%"
              caption="of SDRs get promoted internally per year — down from 34% in 2020"
              source="Bridge Group SDR Metrics Report, 2024"
              sourceUrl="https://blog.bridgegroupinc.com/sales-development-metrics"
            />
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
            <InlineCTA href="/enterprise/contact?source=hero">Book a 30-min walkthrough</InlineCTA>
            <InlineCTA href="/enterprise/curriculum" variant="arrow">
              See the curriculum
            </InlineCTA>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <p className={styles.eyebrow}>The problem</p>
          <h2 className={styles.h2}>Junior SDRs and AEs break in predictable ways.</h2>
          <hr className={styles.divider} />

          <p className={styles.body}>
            Most sales orgs hire AEs and SDRs and expect a manager plus an enablement library
            to make them productive. It works for some. Most stall, churn, or quit
            in the first six months.
          </p>
          <p className={styles.body}>
            The reasons aren&apos;t a mystery. Friction with their manager, ego
            dynamics between SDRs and AEs, CRM hygiene that consumes 40% of their
            week, no playbook for the first 100 cold dials, no idea how to survive
            a bad quarter — these are the same six or seven things, repeated across
            orgs.
          </p>
          <p className={styles.body}>
            AESDR is 12 modules, each addressing one of those things, with a
            takeaway tool the AE/SDR keeps. Real-world training your new AEs and SDRs should
            already have, but rarely do.
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
              <h3 className={styles.cardTitle}>12 modules · 36 lessons</h3>
              <p className={styles.cardBody}>
                Field-tested, ~25 minutes each. Interactive — not video-and-quiz.
                Topics span manager dynamics, AE/SDR alignment, CRM, async-life
                discipline, and the SDR playbook itself.
              </p>
              <InlineCTA href="/enterprise/curriculum" variant="arrow">
                Full curriculum map
              </InlineCTA>
            </div>

            <div className={styles.card}>
              <p className={styles.cardEyebrow}>02 · TAKEAWAYS</p>
              <h3 className={styles.cardTitle}>5 tools AEs and SDRs keep</h3>
              <p className={styles.cardBody}>
                Manager Archetype Map. AE/SDR Alignment Contract. 72-Hour Strike
                Plan (for the week after a bad loss). CRM Survival Guide. Async
                Cadence Template. Built to live outside the course — AEs and SDRs use
                them for years.
              </p>
            </div>

            <div className={styles.card}>
              <p className={styles.cardEyebrow}>03 · COMMUNITY</p>
              <h3 className={styles.cardTitle}>Untamed Discord</h3>
              <p className={styles.cardBody}>
                Real AEs and SDRs working through the material together. No
                &ldquo;crush it&rdquo; energy, no growth-hack pep talk. Where AEs and SDRs
                process what they&apos;ve learned with people who&apos;ve seen the
                same fires.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUR WAYS TO BUY ──────────────────── */}
      <section className={`${styles.section} ${styles.sectionDivider}`}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Ways to buy</p>
          <h2 className={styles.h2}>Four options.</h2>
          <hr className={styles.divider} />
          <p className={styles.lede}>
            Same product, four ways to bring it into your team or your platform.
            Pricing detail on{" "}
            <Link href="/enterprise/pricing" style={{ color: "var(--ink)" }}>
              /enterprise/pricing
            </Link>
            .
          </p>

          <div className={styles.cardGrid2}>
            <BuyerModeCard
              eyebrow="01 · TEAM"
              title="Team seats"
              price="$1,499"
              priceUnit="one-time · up to 10 seats"
              description="Buy a 10-seat pack for your team. AEs and SDRs get the full course; you get the manager dashboard. Lifetime access for every seat."
              features={[
                "10 seats, any mix of SDR and AE tracks",
                "Manager dashboard + progress tracking",
                "Priority Slack support",
                "Invoice + receipt formatted for L&D reimbursement",
                "14-day refund — same as the consumer course",
              ]}
              ctaHref="/enterprise/pricing"
              ctaLabel="Team pricing"
            />

            <BuyerModeCard
              eyebrow="02 · CUSTOM"
              title="Custom enterprise"
              ribbon="25+ SEATS"
              featured
              description="Per-seat pricing with live manager onboarding, a custom rollout calendar, and a dedicated Slack channel. For orgs hiring 20+ AEs and SDRs a year or running structured ramp programs."
              features={[
                "Per-seat pricing past 10 seats",
                "Live manager onboarding session",
                "Custom rollout sequence — we adapt to your calendar",
                "Dedicated org Slack channel",
                "Optional add-ons: live coaching pods, diagnostic administered by our team",
              ]}
              ctaHref="/enterprise/contact?source=hero-enterprise"
              ctaLabel="Talk to us"
            />

            <BuyerModeCard
              eyebrow="03 · WHITE-LABEL"
              title="White-label / co-branded"
              description="For partners packaging AESDR inside their own offering. We deliver the 12 modules + 5 takeaway tools; you wrap them in your brand. Revenue-share or wholesale pricing."
              features={[
                "Delivery rights to modules + takeaway tools",
                "Co-branded materials — your logo + AESDR mark with mutual approval",
                "Per-seat wholesale rate or revenue-share",
                "No exclusivity, no minimums",
              ]}
              ctaHref="/enterprise/contact?source=hero-whitelabel"
              ctaLabel="Partnership inquiry"
            />

            <BuyerModeCard
              eyebrow="04 · MARKETPLACE"
              title="Marketplace integration"
              description="For LMS, sales enablement, and hiring platforms. AESDR plugs into your existing customer base as the early-AE/SDR training your platform doesn't produce. SSO and SCORM on the integration roadmap."
              features={[
                "Listed in your marketplace under sales / L&D categories",
                "SSO + email-based seat provisioning today",
                "SCORM, xAPI, LTI built per partner request",
                "Referral fee, reseller margin, or wholesale seats",
              ]}
              ctaHref="/enterprise/channel"
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
            AESDR / Enterprise is built on{" "}
            <Link href="/" style={{ color: "var(--ink)" }}>
              aesdr.com
            </Link>
            {" "}— the course that junior SDRs and AEs pay for out of their own pocket.
            The same 12 modules, packaged for the orgs that hire them.
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
            <InlineCTA href="/enterprise/contact?source=footer-cta">
              Book a 30-min walkthrough
            </InlineCTA>
          </div>
        </div>
      </section>
    </>
  );
}
