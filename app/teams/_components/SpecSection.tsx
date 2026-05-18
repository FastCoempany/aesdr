import styles from "../teams.module.css";
import type { ReactNode } from "react";

/**
 * Numbered spec section. Used on /teams/curriculum (one per lesson),
 * /teams/diagnostic (one per dimension), /teams/implementation (one per
 * week), /teams/integrations (one per integration).
 *
 * Renders as: [01] Title — meta row — body. Editorial-meets-spec-doc
 * aesthetic; numbered, dense, structured.
 */

type Props = {
  /** Two-digit number, zero-padded, e.g. "01", "03.2". Renders in mono. */
  number: string;
  title: string;
  /** Inline meta items shown beneath the title — e.g. "25 min", "Outcome: ...". */
  meta?: { label: string; value: string }[];
  children: ReactNode;
};

export default function SpecSection({ number, title, meta, children }: Props) {
  return (
    <section className={styles.specSection}>
      <header className={styles.specHeader}>
        <span className={styles.specNumber}>{number}</span>
        <h2 className={styles.specTitle}>{title}</h2>
      </header>
      {meta && meta.length > 0 && (
        <div className={styles.specMeta}>
          {meta.map((m) => (
            <span key={m.label} className={styles.specMetaItem}>
              {m.label}: <strong>{m.value}</strong>
            </span>
          ))}
        </div>
      )}
      <div className={styles.specBody}>{children}</div>
    </section>
  );
}
