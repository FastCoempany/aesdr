/**
 * Top-left nameplate that sits in the corner from t=0, including during the
 * LandingSequence animation. Solves the "what is this site?" problem for paid
 * traffic during the typing-animation gate.
 *
 * Simplified to the iris-shimmer wordmark only (founder direction 2026-05-10).
 * A mascot icon is in development and will sit alongside it.
 */

import styles from "./EditorialMasthead.module.css";

export default function EditorialMasthead() {
  return (
    <div className={styles.masthead} aria-label="AESDR">
      <span className={`${styles.brand} ${styles.iris}`}>AESDR</span>
    </div>
  );
}
