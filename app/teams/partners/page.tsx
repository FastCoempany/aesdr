import styles from "../teams.module.css";
import PartnerCategoryBlock from "../_components/PartnerCategoryBlock";
import InlineCTA from "../_components/InlineCTA";

/**
 * /teams/partners — channel partner pitch.
 *
 * Five categories from canon §7. Each rendered identically: title +
 * named example targets, intro paragraph, 4-cell matrix (gap / plugin /
 * integration / revenue). The last category (HR tech marketplaces) is
 * tagged "LONGER-TERM" — honest about sequencing.
 */

export const metadata = {
  title: "Partners — AESDR / Operating Layer",
  description: "Channel partnerships with LMS, sales enablement, sales hiring, fractional RevOps, and HR tech marketplaces.",
};

export default function PartnersPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Channel partnerships</p>
          <h1 className={styles.heroHeadline} style={{ maxWidth: "20ch" }}>
            Your customers hire young salespeople. AESDR is the foundation those salespeople are missing.
          </h1>
          <p className={styles.heroSubhead}>
            If you sell to sales orgs, sales hiring, enablement, RevOps, L&amp;D, or HR — AESDR plugs into a real gap in your customers&apos; day-to-day. Five categories, mapped below. Each with gap / plug-in / integration / revenue clearly laid out.
          </p>
          <div style={{ marginTop: 24 }}>
            <InlineCTA href="/teams/contact?source=partners">Partnership inquiry</InlineCTA>
          </div>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.container}>

          <PartnerCategoryBlock
            title="LMS / LXP platforms"
            examples="Docebo · 360Learning · Absorb · LearnUpon · TalentLMS · Moodle Workplace · Cornerstone OnDemand"
            intro="LMS and LXP platforms sell the delivery vehicle for learning. Their customers (HR / L&D) need actual content. Marketplace strategy depends on third-party providers filling categories the platform doesn't produce in-house. Early-career sales-rep development is one of those gaps."
            matrix={{
              gap: "No native curriculum for first- and second-year SDRs and AEs. Customers ask for it; platforms can't produce it cost-effectively.",
              plugin: "Listed as a category content partner under Sales / Career Development. Reps consume AESDR lessons inside the LMS UX. Manager dashboard runs in parallel.",
              integration: "Initial: SSO + email-based provisioning. Next: SCORM 1.2 / SCORM 2004 / xAPI export — built when the first LMS partnership signs.",
              revenue: "Referral (20% of first-year revenue), reseller margin (60% wholesale), or white-label per-seat wholesale rate.",
            }}
          />

          <PartnerCategoryBlock
            title="Sales enablement platforms"
            examples="Highspot · Mindtickle · Spekit · Allego · Showpad · Seismic"
            intro="Sales enablement platforms manage content, coaching, and analytics for in-seat reps. They don't produce the behavioral foundation that should exist before a rep touches the platform. Their customers want turnkey rep onboarding; the platforms only sell the delivery layer."
            matrix={{
              gap: "Behavioral foundation for the first 6–8 weeks of a rep's role. Reps land in the enablement platform without the survival fundamentals; platforms can't bridge that.",
              plugin: "Pre-onboarding training that runs in weeks 1–8 before reps log into the enablement platform. Co-marketed as 'behavioral foundation + content delivery.'",
              integration: "SSO + completion-event webhook (roadmap). Light integration possible immediately via referral link from enablement platform's onboarding flow.",
              revenue: "Referral (15% of first-year). Bundled enterprise deal: per-seat wholesale, platform marks up in their package.",
            }}
          />

          <PartnerCategoryBlock
            title="Sales hiring & assessment platforms"
            examples="Sales Assembly · Bravado · Aspireship · Uvaro · Victory Lap · RepVue"
            intro="These platforms place reps. Once placed, the reps either succeed or churn fast. Platform reputation depends on placed-rep success. They have no post-placement training arm."
            matrix={{
              gap: "Post-placement ramp acceleration. Hiring orgs absorb the cost of fragile reps; platforms have no leverage to prevent it.",
              plugin: "AESDR included as part of placement package or as a value-add post-hire benefit. 'Hired reps get AESDR access.'",
              integration: "Bulk seat provisioning via API or CSV (available immediately). Co-branded onboarding email to placed reps.",
              revenue: "Wholesale per-seat at ~$99/seat (vs. $249 consumer). Platform absorbs cost or passes to the hiring org.",
            }}
          />

          <PartnerCategoryBlock
            title="Fractional RevOps & outsourced SDR firms"
            tag="(Likely the sharpest early wedge)"
            examples="Memory · Operatus · RevOps.io · CIENCE · MarketStar · Belkins · SalesRoads"
            intro="Fractional firms run junior SDRs across multiple client engagements. They eat the cost of poor SDR performance directly. They need a consistent training spine for their bench. Most train on tools (Outreach, Apollo, Salesloft) but not on the behavioral foundation — their SDRs end up tool-fluent and behavior-fragile."
            matrix={{
              gap: "Internal development spine. Firm's SDR bench is trained on tactics but not on manager dynamics, AE/SDR ego, async survival, the core breakpoints.",
              plugin: "AESDR completion becomes a tier in the firm's internal bench. Junior SDRs work through AESDR before they're assigned to high-value client work.",
              integration: "Bulk seat purchase by the firm. Internal onboarding tracking via manager dashboard.",
              revenue: "Bulk discount on per-seat pricing at scale (50+ SDRs). Reciprocity: AESDR-trained SDRs flow back to these firms when AESDR's Custom Enterprise clients need fractional support.",
            }}
          />

          <PartnerCategoryBlock
            title="HR tech marketplaces"
            tag="(LONGER-TERM)"
            examples="Paycor · Rippling · Gusto · Justworks · ADP Marketplace · BambooHR · Workday"
            intro="Marketplaces have hundreds of apps. Listing without proof is noise. Path becomes real after a handful of Custom Enterprise deals close and we have completion-rate plus retention-lift data to cite. Listing here for sequencing transparency — we'll pursue this only when proof exists."
            matrix={{
              gap: "Category gap under Sales / Early-Career Development. Marketplaces own the HR system of record; AESDR fills a learning-content category they don't produce in-house. Paycor / Listo style capability-extension model.",
              plugin: "Marketplace listing under Learning & Development. Customers add AESDR through their existing Paycor / Rippling / etc. UX.",
              integration: "SSO + employee directory sync (roadmap). Built when the first marketplace conversation generates pull.",
              revenue: "Referral (15–20% of first-year). Marketplace takes their standard cut.",
            }}
          />

        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <h2 className={styles.h2}>Want to talk?</h2>
          <hr className={styles.divider} />
          <p className={styles.body}>
            Best fits send a 2–3 sentence inquiry describing what your platform does and what your customers struggle with at the early-career SDR / AE layer. We respond within 24 business hours.
          </p>
          <p className={styles.body}>
            We&apos;re selective on partnerships in v1 — we&apos;d rather work deeply with three or four well-fit partners than list ourselves across thirty marketplaces. If you&apos;re a fit, we&apos;ll know within the first reply.
          </p>
          <div style={{ marginTop: 24 }}>
            <InlineCTA href="/teams/contact?source=partners">Partnership inquiry</InlineCTA>
          </div>
        </div>
      </section>
    </>
  );
}
