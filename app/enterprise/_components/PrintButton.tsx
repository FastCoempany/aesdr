"use client";

import styles from "../enterprise.module.css";

/**
 * Print button for download pages. Small client island so the rest of
 * each download page can stay as a server component.
 *
 * Renders a print bar with the page title and a print/save button. The
 * print bar hides via @media print so it doesn't appear in the PDF.
 */

export default function PrintButton({
  label,
  format,
}: {
  label: string;
  /** Human-readable hint about expected print format, e.g. "letter portrait · 1 page". */
  format?: string;
}) {
  return (
    <div className={styles.printBar}>
      <div className={styles.printBarLabel}>
        <span>{label}{format ? ` · ${format}` : ""}</span>
      </div>
      <button
        type="button"
        onClick={() => window.print()}
        className={styles.printBarBtn}
      >
        Print / Save as PDF
      </button>
    </div>
  );
}
