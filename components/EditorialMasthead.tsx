/**
 * Newspaper-style nameplate that sits in the top-left corner from t=0,
 * including during the LandingSequence animation. Solves the "what is this
 * site?" problem for paid traffic during the 25-second animation gate.
 *
 * Editorial palette only. "AESDR" reads in --crimson; the rest in --muted.
 */

import styles from "./EditorialMasthead.module.css";

export default function EditorialMasthead() {
  return (
    <div className={styles.masthead} aria-label="AESDR sales survival course">
      <span className={styles.brand}>AESDR</span>
      <span className={styles.sep}>—</span>
      <span className={styles.tag}>Sales Survival Course</span>
      <span className={styles.dot}>·</span>
      <span className={styles.tag}>for early-career AEs &amp; SDRs</span>
    </div>
  );
}
