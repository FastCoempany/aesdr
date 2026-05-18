import styles from "../teams.module.css";

/**
 * Sub-logo trio for AESDR / for Teams.
 *
 * Three forms per canon §2.4:
 *   • SubLogoFull — landing hero, footer, marketing surfaces. Default 32px.
 *   • SubLogoCompact — nav bars, breadcrumbs. Default 20px.
 *   • SubLogoTiny — favicons, watermarks, certificate corners. "A·T" monogram.
 *
 * Type-only construction (no icon glyph) to stay consistent with the
 * parent brand's editorial-typographic identity. Iris-shimmer on "AESDR"
 * uses the existing @keyframes shimmer from app/globals.css.
 */

type FullProps = {
  /** AESDR wordmark font-size in px. Suffix scales to 40%. Default 32. */
  size?: number;
  /** Render as <h1> instead of <span>. Use once per page for SEO. */
  as?: "h1" | "span";
};

export function SubLogoFull({ size = 32, as = "span" }: FullProps) {
  const Tag = as;
  const suffixSize = Math.round(size * 0.4);
  return (
    <Tag
      className={styles.subLogoFull}
      style={{ fontSize: size }}
      aria-label="AESDR / for Teams"
    >
      <span className={styles.subLogoAesdr} style={{ fontSize: size }}>
        AESDR
      </span>
      <span className={styles.subLogoSuffix} style={{ fontSize: suffixSize }}>
        <span className={styles.subLogoSlash}>/</span>for Teams
      </span>
    </Tag>
  );
}

type CompactProps = {
  /** AESDR wordmark font-size in px. Default 20. */
  size?: number;
};

export function SubLogoCompact({ size = 20 }: CompactProps) {
  const suffixSize = Math.round(size * 0.6);
  return (
    <span className={styles.subLogoCompact} aria-label="AESDR / Teams">
      <span className={styles.subLogoAesdr} style={{ fontSize: size }}>
        AESDR
      </span>
      <span className={styles.subLogoSuffix} style={{ fontSize: suffixSize }}>
        <span className={styles.subLogoSlash}>/</span>OL
      </span>
    </span>
  );
}

type TinyProps = {
  /** font-size in px. Default 12. */
  size?: number;
};

export function SubLogoTiny({ size = 12 }: TinyProps) {
  return (
    <span
      className={styles.subLogoTinyMark}
      style={{ fontSize: size }}
      aria-label="AESDR for Teams"
    >
      <span className={styles.subLogoTinyA}>A</span>
      <span className={styles.subLogoTinyDot}>·</span>
      <span className={styles.subLogoTinyOl}>OL</span>
    </span>
  );
}
