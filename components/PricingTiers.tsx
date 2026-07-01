"use client";

/**
 * Pricing block — extracted from app/page.tsx so it can react to the role
 * choice without making the whole page client-side.
 *
 * When the visitor picks a role (anonymous, via the editorial fork) or arrives
 * authenticated with a `user_metadata.role`, the matching tier card lights up
 * with `.priceCardPersonal` + an iris "Your tier" badge. Coexists with the
 * existing `.priceCardFeatured` (Team) — both modifiers can stack.
 *
 * Per-tier differentiation (taglines + role chips + role-specific feature
 * lines) sits inside the card so all three tiers read as distinct surfaces
 * rather than "same card, three prices". Taglines pull from the brand's
 * survival framing — see variant-a-editorial-split.html and the lesson
 * titles under content/lessons/html/ for the source of those references.
 */

import CheckoutButton from "@/components/CheckoutButton";
import { useRole, type Role } from "@/lib/role";
import styles from "@/app/page.module.css";

type Props = { initialRole?: Role | null };

export default function PricingTiers({ initialRole = null }: Props) {
  const role = useRole(initialRole);

  function cardClass(tier: Role) {
    return role === tier ? `${styles.priceCard} ${styles.priceCardPersonal}` : styles.priceCard;
  }

  return (
    <div
      className={styles.pricingGrid}
      role="region"
      aria-label="Pricing tiers"
      aria-live="polite"
    >
      {/* SDR */}
      <div className={cardClass("sdr")}>
        {role === "sdr" && <div className={styles.priceTierBadge}>Your tier</div>}
        <p className={styles.priceTier}>
          SDR Individual <span className={`${styles.priceRoleChip} ${styles.priceRoleChipSdr}`}>SDR</span>
        </p>
        <p className={styles.priceAmount}>
          $249<span className={styles.priceUnit}> / one-time</span>
        </p>
        <p className={styles.priceTagline}>For the SDR grinding through 80 dials and a 9% reply rate.</p>
        <ul className={styles.priceFeatures}>
          <li>All 12 courses — including <em>The CRM Survival Guide</em> + <em>SDR Performance Pitfalls</em></li>
          <li>Substantial assets you keep: The Alignment Contract, The ROI &amp; Commission Defense Tracker, the 72-Hour Strike Plan, plus more</li>
          <li>One-time purchase. No subscription.</li>
          <li>Future curriculum updates included</li>
          <li>Alumni room access when you finish all twelve</li>
          <li>14-day refund guarantee</li>
        </ul>
        <CheckoutButton tier="sdr" label="Buy For Me" className={styles.priceCta} selectedRole={role ?? undefined} />
      </div>

      {/* AE */}
      <div className={cardClass("ae")}>
        {role === "ae" && <div className={styles.priceTierBadge}>Your tier</div>}
        <p className={styles.priceTier}>
          AE Individual <span className={`${styles.priceRoleChip} ${styles.priceRoleChipAe}`}>AE</span>
        </p>
        <p className={styles.priceAmount}>
          $299<span className={styles.priceUnit}> / one-time</span>
        </p>
        <p className={styles.priceTagline}>For the closer juggling 30 active opps and how to prioritize and close as many as possible.</p>
        <ul className={styles.priceFeatures}>
          <li>All 12 courses — including <em>The Unofficial Manager</em> + <em>AE/SDR Alignment</em></li>
          <li>Substantial assets you keep: The Alignment Contract, The ROI &amp; Commission Defense Tracker, the 72-Hour Strike Plan, plus more</li>
          <li>One-time purchase. No subscription.</li>
          <li>Future curriculum updates included</li>
          <li>Alumni room access when you finish all twelve</li>
          <li>14-day refund guarantee</li>
        </ul>
        <CheckoutButton tier="ae" label="Buy For Me" className={styles.priceCta} selectedRole={role ?? undefined} />
      </div>

      {/* Team */}
      <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
        <div className={styles.priceRibbon}>Org Reimbursement</div>
        <p className={styles.priceTier}>
          Team <span className={`${styles.priceRoleChip} ${styles.priceRoleChipTeam}`}>SDR + AE</span>
        </p>
        <p className={styles.priceAmount}>
          Let&rsquo;s discuss<span className={styles.priceUnit}> / quoted per team</span>
        </p>
        <p className={styles.priceTagline}>For the org rolling out real training, not another LMS module nobody finishes.</p>
        <ul className={styles.priceFeatures}>
          <li>Both SDR + AE tracks — mix any number of seats</li>
          <li>Admin dashboard + team progress tracking</li>
          <li>Priority support (direct Slack channel)</li>
          <li>Invoice + receipt formatted for L&amp;D</li>
          <li>One-time purchase. No subscription.</li>
          <li>14-day refund guarantee</li>
        </ul>
        <a
          href="/enterprise/contact?source=pricing"
          className={styles.priceCta}
          style={{ display: "block", textAlign: "center", textDecoration: "none" }}
        >
          Talk to us →
        </a>
      </div>

      {/* Trust row — under all three tiers. Honest, no fake badges. */}
      <div
        className={styles.trustRow}
        aria-label="Purchase guarantees"
      >
        <span className={styles.trustItem}>
          <span aria-hidden="true">↻</span> 14-day refund · no questions
        </span>
        <span className={styles.trustItem}>
          <span aria-hidden="true">↻</span> One-time purchase
        </span>
        <span className={styles.trustItem}>
          <span aria-hidden="true">✓</span> Stripe-secured checkout
        </span>
        <span className={styles.trustItem}>
          <span aria-hidden="true">€</span> EU / UK GDPR-compliant
        </span>
        <span className={styles.trustItem}>
          <span aria-hidden="true">$</span> Receipt + invoice on purchase
        </span>
      </div>

      {/* Enterprise doorway — signpost to the B2B arm. Deliberately NOT a
          fourth price card: it's a different sell (channel-partner motion,
          procurement, white-label) and shouldn't read as co-equal with the
          consumer tiers above. */}
      <a href="/enterprise?source=pricing" className={styles.enterpriseBand}>
        <div>
          <p className={styles.enterpriseBandLabel}>Teams &amp; Enterprise</p>
          <p className={styles.enterpriseBandTitle}>
            Rolling this out across a department or a whole org?
          </p>
          <p className={styles.enterpriseBandSub}>
            AESDR Enterprise — custom curriculum, white-label, SSO,
            procurement-ready invoicing, and channel partnerships. A different
            conversation than the cards above.
          </p>
        </div>
        <span className={styles.enterpriseBandCta}>See the enterprise offering →</span>
      </a>
    </div>
  );
}
