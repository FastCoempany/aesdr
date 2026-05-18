import Link from "next/link";
import styles from "../teams.module.css";

/**
 * Primary CTA button used inline on pages. Iris-shimmer fill, white text.
 *
 * `variant="secondary"` switches to ghost button (ink outline, no fill).
 * `variant="arrow"` switches to underlined text link with arrow.
 */

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "arrow";
  block?: boolean;
};

export default function InlineCTA({ href, children, variant = "primary", block }: Props) {
  const className =
    variant === "primary"
      ? `${styles.ctaPrimary}${block ? " " + styles.ctaBlock : ""}`
      : variant === "secondary"
        ? `${styles.ctaSecondary}${block ? " " + styles.ctaBlock : ""}`
        : styles.ctaArrow;

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
