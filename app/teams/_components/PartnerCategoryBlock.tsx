import styles from "../teams.module.css";

/**
 * One block per partner category on /teams/partners.
 *
 * Structure mirrors the canon §7 spec: category name + example targets
 * in the header, framing paragraph below, then a 4-cell matrix —
 * "Gap they have / How AESDR plugs in / Integration mechanism / Revenue model".
 */

type Props = {
  title: string;
  /** Comma-separated example targets, e.g. "Docebo, 360Learning, Absorb…" */
  examples: string;
  /** One-paragraph framing of what these platforms own and what they don't. */
  intro: string;
  /** The four matrix cells. Each is a single sentence or short paragraph. */
  matrix: {
    gap: string;
    plugin: string;
    integration: string;
    revenue: string;
  };
  /** Optional "longer-term" / "later wedge" tag rendered next to title. */
  tag?: string;
};

export default function PartnerCategoryBlock({ title, examples, intro, matrix, tag }: Props) {
  return (
    <section className={styles.partnerBlock}>
      <div className={styles.partnerBlockHeader}>
        <h2 className={styles.partnerBlockTitle}>
          {title}
          {tag && (
            <span
              style={{
                marginLeft: 12,
                fontFamily: "var(--mono)",
                fontSize: 11,
                letterSpacing: ".15em",
                textTransform: "uppercase",
                color: "var(--muted)",
                verticalAlign: "middle",
                fontStyle: "normal",
              }}
            >
              {tag}
            </span>
          )}
        </h2>
        <p className={styles.partnerBlockExamples}>{examples}</p>
      </div>

      <p className={styles.partnerBlockIntro}>{intro}</p>

      <div className={styles.partnerMatrix}>
        <div className={styles.partnerMatrixCell}>
          <p className={styles.partnerMatrixLabel}>Gap they have</p>
          <p className={styles.partnerMatrixValue}>{matrix.gap}</p>
        </div>
        <div className={styles.partnerMatrixCell}>
          <p className={styles.partnerMatrixLabel}>How AESDR plugs in</p>
          <p className={styles.partnerMatrixValue}>{matrix.plugin}</p>
        </div>
        <div className={styles.partnerMatrixCell}>
          <p className={styles.partnerMatrixLabel}>Integration mechanism</p>
          <p className={styles.partnerMatrixValue}>{matrix.integration}</p>
        </div>
        <div className={styles.partnerMatrixCell}>
          <p className={styles.partnerMatrixLabel}>Revenue model</p>
          <p className={styles.partnerMatrixValue}>{matrix.revenue}</p>
        </div>
      </div>
    </section>
  );
}
