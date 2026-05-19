import styles from "../enterprise.module.css";
import ChannelCategoryBlock from "../_components/ChannelCategoryBlock";
import InlineCTA from "../_components/InlineCTA";

/**
 * /enterprise/channel — channel partner pitch.
 *
 * Five categories from canon §7. Each rendered identically: title +
 * named example targets, intro paragraph, 4-cell matrix (gap / plugin /
 * integration / revenue). The last category (HR tech marketplaces) is
 * tagged "LONGER-TERM" — honest about sequencing.
 */

export const metadata = {
  title: "Partners — AESDR / Enterprise",
  description: "Channel partnerships with LMS, sales enablement, sales hiring, fractional RevOps, and HR tech marketplaces.",
};

export default function PartnersPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Channel partnerships</p>
          <h1 className={styles.heroHeadline} style={{ maxWidth: "22ch" }}>
            Your customers hire junior salespeople. AESDR is the training those salespeople are missing.
          </h1>
          <p className={styles.heroSubhead}>
            If you sell to sales orgs, sales hiring, enablement, RevOps, L&amp;D, or HR — AESDR fills a gap your customers struggle with: getting first- and second-year AEs and SDRs productive without churning them. Five partner categories, mapped below. Each shows what your customers are missing, how AESDR fits, how we&apos;d integrate, and what you&apos;d earn.
          </p>
          <div style={{ marginTop: 24 }}>
            <InlineCTA href="/enterprise/contact?source=channel">Partnership inquiry</InlineCTA>
          </div>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.container}>

          <ChannelCategoryBlock
            title="LMS / LXP platforms"
            examples="Docebo · 360Learning · Absorb · LearnUpon · TalentLMS · Moodle Workplace · Cornerstone OnDemand"
            intro="Your platform delivers learning. Your customers (HR / L&D) ask for content you don't produce — and sales-AE/SDR development for first- and second-year hires is one of the most-asked categories. AESDR slots into your marketplace as the answer."
            matrix={{
              gap: "No native curriculum for first- and second-year SDRs and AEs. Customers ask for it; platforms can't justify building it themselves.",
              plugin: "Listed in your marketplace under Sales / Career Development. AEs and SDRs consume AESDR modules inside your platform's UX. Manager dashboard runs in parallel.",
              integration: "Today: SSO + email-based provisioning. Next: SCORM 1.2 / SCORM 2004 / xAPI export — built when the first LMS partnership signs.",
              revenue: "Referral (20% of first-year revenue), reseller margin (60% wholesale), or white-label per-seat wholesale rate.",
            }}
          />

          <ChannelCategoryBlock
            title="Sales enablement platforms"
            examples="Highspot · Mindtickle · Spekit · Allego · Showpad · Seismic"
            intro="Your platform manages content, coaching, and analytics for in-seat AEs and SDRs. What it doesn't do — and what your customers ask for — is teach AEs and SDRs the basics of how to function in a sales org before they log in. AESDR is that pre-onboarding layer."
            matrix={{
              gap: "The first 6–8 weeks of a AE/SDR's role. AEs and SDRs land in your platform unprepared for the human side of the work; your platform can't fix what they should already know.",
              plugin: "Pre-onboarding training that runs in weeks 1–8 before AEs and SDRs log into your platform. Co-marketed as 'foundational training + your content delivery.'",
              integration: "SSO + completion-event webhook (roadmap). Light integration possible immediately via referral link from your platform's onboarding flow.",
              revenue: "Referral (15% of first-year). Bundled enterprise deal: per-seat wholesale, you mark up in your package.",
            }}
          />

          <ChannelCategoryBlock
            title="Sales hiring & assessment platforms"
            examples="Sales Assembly · Bravado · Aspireship · Uvaro · Victory Lap · RepVue"
            intro="You place AEs and SDRs. Once placed, those AEs and SDRs either succeed or churn fast — and your platform's reputation rides on that. You have no post-placement training arm to nudge the outcome. AESDR is that arm."
            matrix={{
              gap: "Post-placement ramp acceleration. Hiring orgs pay the cost of AEs and SDRs who don't make it; you have no way to prevent the churn.",
              plugin: "Include AESDR in your placement package or as a post-hire benefit. 'Hired AEs and SDRs get AESDR access.'",
              integration: "Bulk seat provisioning via API or CSV (available today). Co-branded onboarding email to placed AEs and SDRs.",
              revenue: "Wholesale per-seat at ~$99/seat (vs. $249 consumer). You absorb the cost or pass it to the hiring org.",
            }}
          />

          <ChannelCategoryBlock
            title="Fractional RevOps & outsourced SDR firms"
            tag="(Strong fit)"
            examples="Memory · Operatus · RevOps.io · CIENCE · MarketStar · Belkins · SalesRoads"
            intro="You run junior SDRs across multiple client engagements. You eat the cost of poor SDR performance directly. You need consistent training across your bench. Most firms train on tools (Outreach, Apollo, Salesloft) but not on how to actually function in a sales org — your SDRs end up competent on tools but fragile when client work gets hard."
            matrix={{
              gap: "Consistent training across your SDR bench. AEs and SDRs know the tools but haven't been taught how to handle manager friction, AE handoffs, slow weeks, or any of the predictable breakpoints.",
              plugin: "AESDR completion becomes a credential tier on your bench. Junior SDRs work through AESDR before they're assigned to high-value client work.",
              integration: "Bulk seat purchase. Internal onboarding tracking via the manager dashboard.",
              revenue: "Bulk discount on per-seat pricing at scale (50+ SDRs). Reciprocal referrals: AESDR-trained SDRs flow back to you when our Custom Enterprise clients need fractional support.",
            }}
          />

          <ChannelCategoryBlock
            title="HR tech marketplaces"
            tag="(LATER)"
            examples="Paycor · Rippling · Gusto · Justworks · ADP Marketplace · BambooHR · Workday"
            intro="Marketplaces have hundreds of apps. Listing without proof is noise. This becomes a real path after a handful of Custom Enterprise deals close and we have completion + retention data your customers will trust. Listed here so partners know we're sequencing this for later, not skipping it."
            matrix={{
              gap: "A category your marketplace doesn't fill: sales-AE/SDR development for first- and second-year hires. Your customers ask for it; you don't build training in-house.",
              plugin: "Marketplace listing under Learning & Development. Your customers add AESDR through your existing UX.",
              integration: "SSO + employee directory sync (roadmap). Built when the first marketplace conversation is real.",
              revenue: "Referral (15–20% of first-year). Marketplace takes the standard cut.",
            }}
          />

        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <h2 className={styles.h2}>Want to talk?</h2>
          <hr className={styles.divider} />
          <p className={styles.body}>
            Best fits send a 2–3 sentence inquiry describing what your platform does and what your customers struggle with when they hire junior salespeople. We respond within 24 business hours.
          </p>
          <p className={styles.body}>
            We&apos;re selective on partnerships right now — we&apos;d rather work deeply with three or four well-fit partners than list ourselves across thirty marketplaces. If you&apos;re a fit, you&apos;ll know from our first reply.
          </p>
          <div style={{ marginTop: 24 }}>
            <InlineCTA href="/enterprise/contact?source=channel">Partnership inquiry</InlineCTA>
          </div>
        </div>
      </section>
    </>
  );
}
