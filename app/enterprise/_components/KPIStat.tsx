import styles from "../enterprise.module.css";

/**
 * Big iris-shimmer stat block. Three-up on hero, or stand-alone for
 * inline data callouts.
 *
 * Caption is required (the data without a label is useless). Source is
 * optional but encouraged — citing the source is itself a credential
 * signal on a B2B surface. When `sourceUrl` is provided alongside
 * `source`, the citation becomes a real link out to the underlying
 * report.
 */

type Props = {
  /** The number itself. Pre-formatted (e.g., "8.4 mo", "39%", "$115K"). */
  value: string;
  /** What the number measures, in one short line. */
  caption: string;
  /** Optional cite (publication + year). Renders below caption in mono. */
  source?: string;
  /** Optional URL — when provided, source renders as a real hyperlink. */
  sourceUrl?: string;
};

export default function KPIStat({ value, caption, source, sourceUrl }: Props) {
  const body = (
    <>
      <div className={styles.kpiNumber}>
        {value}
        {sourceUrl && <span className={styles.kpiCite} aria-hidden="true"> ↗</span>}
      </div>
      <div className={styles.kpiCaption}>{caption}</div>
    </>
  );
  return (
    <div className={styles.kpi}>
      {sourceUrl ? (
        <a
          className={styles.kpiLink}
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={source ? `Source: ${source}` : undefined}
          aria-label={source ? `${value} — ${caption}. Source: ${source}, opens in a new tab` : undefined}
        >
          {body}
        </a>
      ) : (
        body
      )}
    </div>
  );
}
