"use client";

/**
 * Pricing block — extracted from app/page.tsx so it can react to the role
 * choice without making the whole page client-side.
 *
 * When the visitor picks a role (anonymous, via the editorial fork) or arrives
 * authenticated with a `user_metadata.role`, the matching tier card lights up
 * with `.priceCardPersonal` + an iris "Your tier" badge. Coexists with the
 * existing `.priceCardFeatured` (Team) — both modifiers can stack.
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
    <div className={styles.pricingGrid}>
      {/* SDR */}
      <div className={cardClass("sdr")}>
        {role === "sdr" && <div className={styles.priceTierBadge}>Your tier</div>}
        <p className={styles.priceTier}>SDR Individual</p>
        <p className={styles.priceAmount}>
          $249<span className={styles.priceUnit}> / one-time</span>
        </p>
        <ul className={styles.priceFeatures}>
          <li>All 12 courses</li>
          <li>5 interactive tools to takeaway</li>
          <li>Lifetime access</li>
          <li className={styles.discordLine}>
            Discord community <span className={styles.untamedStamp}>Untamed</span>
          </li>
          <li>Future curriculum updates</li>
          <li>14-day refund guarantee</li>
        </ul>
        <CheckoutButton tier="sdr" label="Buy For Me" className={styles.priceCta} selectedRole={role ?? undefined} />
      </div>

      {/* AE */}
      <div className={cardClass("ae")}>
        {role === "ae" && <div className={styles.priceTierBadge}>Your tier</div>}
        <p className={styles.priceTier}>AE Individual</p>
        <p className={styles.priceAmount}>
          $299<span className={styles.priceUnit}> / one-time</span>
        </p>
        <ul className={styles.priceFeatures}>
          <li>All 12 courses</li>
          <li>5 interactive tools to takeaway</li>
          <li>Lifetime access</li>
          <li className={styles.discordLine}>
            Discord community <span className={styles.untamedStamp}>Untamed</span>
          </li>
          <li>Future curriculum updates</li>
          <li>14-day refund guarantee</li>
        </ul>
        <CheckoutButton tier="ae" label="Buy For Me" className={styles.priceCta} selectedRole={role ?? undefined} />
      </div>

      {/* Team */}
      <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
        <div className={styles.priceRibbon}>Org Reimbursement</div>
        <p className={styles.priceTier}>Team</p>
        <p className={styles.priceAmount}>
          $1,499<span className={styles.priceUnit}> / up to 10 seats</span>
        </p>
        <ul className={styles.priceFeatures}>
          <li>Everything in Individual</li>
          <li>Up to 10 team members</li>
          <li>Admin dashboard</li>
          <li>Team progress tracking</li>
          <li>Priority support</li>
          <li>Invoice + receipt for L&amp;D</li>
        </ul>
        <CheckoutButton tier="team" label="Buy For Us" className={styles.priceCta} selectedRole={role ?? undefined} />
      </div>
    </div>
  );
}
