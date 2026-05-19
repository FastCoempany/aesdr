import Link from "next/link";
import styles from "../enterprise.module.css";

/**
 * One of the four buyer-mode cards on /enterprise landing. Also reused on
 * /enterprise/pricing as the tier card. Pass `featured` for the highlighted
 * (iris-shimmer border) tier.
 */

type Props = {
  /** Small mono label above title. e.g. "OPTION 01" or "10 SEATS". */
  eyebrow?: string;
  title: string;
  /** Optional price/figure displayed prominently. */
  price?: string;
  priceUnit?: string;
  /** Body description. */
  description: string;
  /** Bulleted feature list. */
  features?: string[];
  /** CTA destination. */
  ctaHref: string;
  ctaLabel: string;
  /** Iris-shimmer border treatment + slight lift. Reserve for one card per grid. */
  featured?: boolean;
  /** Small ribbon at top-left of card. Pairs well with `featured`. */
  ribbon?: string;
};

export default function BuyerModeCard({
  eyebrow,
  title,
  price,
  priceUnit,
  description,
  features,
  ctaHref,
  ctaLabel,
  featured,
  ribbon,
}: Props) {
  return (
    <div className={featured ? `${styles.card} ${styles.cardFeatured}` : `${styles.card} ${styles.cardHover}`}>
      {ribbon && <div className={styles.cardRibbon}>{ribbon}</div>}
      {eyebrow && <p className={styles.cardEyebrow}>{eyebrow}</p>}
      <h3 className={styles.cardTitle}>{title}</h3>
      {price && (
        <p className={styles.cardPrice}>
          {price}
          {priceUnit && <span className={styles.cardPriceUnit}> {priceUnit}</span>}
        </p>
      )}
      <p className={styles.cardBody}>{description}</p>
      {features && features.length > 0 && (
        <ul className={styles.specList}>
          {features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
      <Link href={ctaHref} className={`${styles.ctaPrimary} ${styles.ctaBlock} ${styles.cardCta}`}>
        {ctaLabel}
      </Link>
    </div>
  );
}
