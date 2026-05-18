import styles from "../teams.module.css";

/**
 * Big iris-shimmer stat block. Three-up on hero, or stand-alone for
 * inline data callouts.
 *
 * Caption is required (the data without a label is useless). Source is
 * optional but encouraged — citing the source is itself a credential
 * signal on a B2B surface.
 */

type Props = {
  /** The number itself. Pre-formatted (e.g., "9.1 mo", "39%", "$115K"). */
  value: string;
  /** What the number measures, in one short line. */
  caption: string;
  /** Optional cite (publication + year). Renders below caption in mono. */
  source?: string;
};

export default function KPIStat({ value, caption, source }: Props) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiNumber}>{value}</div>
      <div className={styles.kpiCaption}>{caption}</div>
      {source && <div className={styles.kpiSource}>{source}</div>}
    </div>
  );
}
