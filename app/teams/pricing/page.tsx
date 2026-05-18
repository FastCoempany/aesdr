import Link from "next/link";
import styles from "../teams.module.css";
import BuyerModeCard from "../_components/BuyerModeCard";
import ComparisonTable from "../_components/ComparisonTable";
import InlineCTA from "../_components/InlineCTA";

/**
 * /teams/pricing — three tiers + comparison table + FAQ.
 *
 * Team tier is explicitly $1,499 one-time / 10 seats / lifetime —
 * mirrors the consumer pricing (and clears up the misread Bilal had).
 * Custom Enterprise and White-label are "contact us" — pricing
 * conversations happen during walkthrough.
 */

export const metadata = {
  title: "Pricing — AESDR / Operating Layer",
  description: "Team seats, custom enterprise, white-label. Three paths, all starting with a 30-min walkthrough.",
};

export default function PricingPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Pricing</p>
          <h1 className={styles.heroHeadline}>Pricing for sales orgs.</h1>
          <p className={styles.heroSubhead}>
            Three paths. All start with a 30-minute walkthrough so we can scope correctly. No procurement-style pricing pages, no demos-behind-forms, no enterprise tier-gating.
          </p>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.container}>
          <div className={styles.cardGrid3}>
            <BuyerModeCard
              eyebrow="TIER 01 · TEAM"
              title="Team seats"
              price="$1,499"
              priceUnit="one-time · up to 10 seats"
              description="Same product as the consumer course at aesdr.com. Buy a 10-seat pack for your team; reps see the consumer experience; you get manager visibility."
              features={[
                "10 seats, any mix of SDR and AE tracks",
                "Lifetime access for every seat",
                "Manager dashboard + progress tracking",
                "Priority Slack support",
                "Invoice + receipt formatted for L&D",
                "14-day refund — same as consumer",
              ]}
              ctaHref="/teams/contact?source=pricing-team"
              ctaLabel="Talk first, buy after"
            />

            <BuyerModeCard
              eyebrow="TIER 02 · ENTERPRISE"
              title="Custom enterprise"
              ribbon="MOST COMMON 25+"
              featured
              description="Per-seat pricing past 10 seats, with manager onboarding and a custom rollout. For orgs hiring 20+ reps a year or running structured ramp programs."
              features={[
                "Per-seat pricing past 10 seats",
                "Live manager onboarding session",
                "Custom rollout sequence (we adapt the implementation guide to your calendar)",
                "Dedicated org Slack channel",
                "Diagnostic administration support (optional)",
                "Quarterly check-in with founder",
              ]}
              ctaHref="/teams/contact?source=pricing-custom"
              ctaLabel="Scope a custom rollout"
            />

            <BuyerModeCard
              eyebrow="TIER 03 · PARTNER"
              title="White-label / co-branded"
              description="For partners packaging AESDR inside their own offering. We deliver the 12 lessons + 5 takeaway tools; you wrap them in your brand. Revenue-share or wholesale pricing."
              features={[
                "Delivery rights to lessons + takeaway tools",
                "Co-branded materials (your logo + AESDR mark with mutual approval)",
                "Per-seat wholesale rate or revenue-share",
                "No exclusivity, no minimums",
                "Joint partnership management",
              ]}
              ctaHref="/teams/contact?source=pricing-wl"
              ctaLabel="Partnership inquiry"
            />
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionDivider}`}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Side by side</p>
          <h2 className={styles.h2}>What you actually get.</h2>
          <hr className={styles.divider} />

          <ComparisonTable
            columns={["", "Team", "Custom Enterprise", "White-label"]}
            featuredColumn={1}
            rows={[
              { label: "Seat model", cells: [
                { kind: "text", value: "10-seat pack" },
                { kind: "text", value: "Per-seat (10–unlimited)" },
                { kind: "text", value: "Wholesale per-seat" },
              ]},
              { label: "Pricing", cells: [
                { kind: "text", value: "$1,499 one-time" },
                { kind: "text", value: "Per-seat, scoped on call" },
                { kind: "text", value: "Wholesale or rev-share" },
              ]},
              { label: "Access duration", cells: [
                { kind: "text", value: "Lifetime" },
                { kind: "text", value: "Lifetime per seat" },
                { kind: "text", value: "Per partnership terms" },
              ]},
              { label: "Branding", cells: [
                { kind: "text", value: "AESDR-branded" },
                { kind: "text", value: "AESDR-branded" },
                { kind: "text", value: "Your brand + AESDR mark" },
              ]},
              { label: "Manager dashboard", cells: [
                { kind: "check", value: true },
                { kind: "check", value: true },
                { kind: "text", value: "Optional (partner's choice)" },
              ]},
              { label: "Live manager onboarding", cells: [
                { kind: "check", value: false },
                { kind: "check", value: true },
                { kind: "text", value: "Negotiable" },
              ]},
              { label: "Custom rollout sequence", cells: [
                { kind: "check", value: false },
                { kind: "check", value: true },
                { kind: "check", value: true },
              ]},
              { label: "Dedicated Slack channel", cells: [
                { kind: "text", value: "Priority Slack support" },
                { kind: "text", value: "Dedicated org channel" },
                { kind: "text", value: "Dedicated partner channel" },
              ]},
              { label: "Diagnostic administration", cells: [
                { kind: "text", value: "Self-serve (roadmap)" },
                { kind: "text", value: "Founder-administered" },
                { kind: "text", value: "Partner-administered" },
              ]},
              { label: "SSO / SCORM / xAPI", cells: [
                { kind: "text", value: "Roadmap" },
                { kind: "text", value: "Built per partnership" },
                { kind: "text", value: "Built per partnership" },
              ]},
              { label: "14-day refund", cells: [
                { kind: "check", value: true },
                { kind: "check", value: true },
                { kind: "text", value: "Per contract" },
              ]},
              { label: "Contract term", cells: [
                { kind: "text", value: "None — one-time" },
                { kind: "text", value: "Annual or per-cohort" },
                { kind: "text", value: "Negotiated" },
              ]},
            ]}
          />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <p className={styles.eyebrow}>FAQ</p>
          <h2 className={styles.h2}>Common questions, short answers.</h2>
          <hr className={styles.divider} />

          <FAQ q="Is the Team tier the same product as the consumer course?">
            Yes. Identical 12 lessons, identical Discord community, identical takeaway tools. The only difference is the manager dashboard layered on top and the Slack support line.
          </FAQ>

          <FAQ q="Can we get a recurring subscription?">
            Not currently. AESDR is one-time, lifetime by design. Per-seat custom pricing is available for larger orgs but stays one-time per seat. Recurring would change the product&apos;s economic shape and we&apos;re intentional about not doing that yet.
          </FAQ>

          <FAQ q="Do we get a discount for buying multiple 10-seat packs?">
            No discount stacking on the Team tier — list price applies. Past 10 seats, move to Custom Enterprise. The per-seat rate scales down with volume.
          </FAQ>

          <FAQ q="What's the refund policy?">
            14-day, no-questions-asked, identical to the consumer policy. Email{" "}
            <strong>hello@aesdr.com</strong> with subject &ldquo;Refund request&rdquo; and we process within 3 business days. If it doesn&apos;t deliver value, we don&apos;t want your money.
          </FAQ>

          <FAQ q="Can we white-label without revenue share?">
            Possible at a higher wholesale-seat rate. Discussed during walkthrough.
          </FAQ>

          <FAQ q="Do you handle invoicing / PO / NET-30?">
            Invoice and receipt formatted for L&amp;D reimbursement are included on Team tier. Custom Enterprise supports PO, NET-30, and standard procurement workflows. We don&apos;t do enterprise security questionnaires yet — if you need one, that&apos;s a real conversation we&apos;ll have during scope.
          </FAQ>

          <FAQ q="What integrations exist today?">
            Email-based seat provisioning and the manager dashboard. SSO, SCORM, xAPI, LTI are on the roadmap and get built when the first partnership requiring them signs.{" "}
            <Link href="/teams/integrations" style={{ color: "var(--ink)", textDecoration: "underline" }}>
              Full state on the integrations page.
            </Link>
          </FAQ>

          <div style={{ marginTop: 40 }}>
            <InlineCTA href="/teams/contact?source=pricing-faq">Book a 30-min walkthrough</InlineCTA>
          </div>
        </div>
      </section>
    </>
  );
}

function FAQ({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "20px 0", borderTop: "1px solid var(--light)" }}>
      <h3 className={styles.h3} style={{ fontSize: 18, marginBottom: 8 }}>{q}</h3>
      <p className={styles.bodyMuted} style={{ margin: 0 }}>{children}</p>
    </div>
  );
}
