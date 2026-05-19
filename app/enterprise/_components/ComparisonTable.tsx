import styles from "../enterprise.module.css";
import type { ReactNode } from "react";

/**
 * Sticky-header comparison table. Used on /enterprise/pricing to compare
 * Team / Custom Enterprise / White-label across feature dimensions.
 *
 * `featured` index highlights one column with ink fill — typically the
 * recommended path.
 */

type Cell = { kind: "text"; value: string } | { kind: "check"; value: boolean };

type Props = {
  /** Column headers. First slot is the row-label column. */
  columns: string[];
  /** Index of the column to highlight (0-based, counting from the data columns, so columns[1] is index 0). */
  featuredColumn?: number;
  /** Each row: first element is the row label, rest are the per-column cells. */
  rows: { label: string; cells: Cell[] }[];
  /** Optional caption above the table. */
  caption?: ReactNode;
};

export default function ComparisonTable({ columns, featuredColumn, rows, caption }: Props) {
  return (
    <div>
      {caption && <p className={styles.bodyMuted}>{caption}</p>}
      <div className={styles.compareTableWrap}>
        <table className={styles.compareTable}>
          <thead>
            <tr>
              {columns.map((col, idx) => {
                const isFeatured = featuredColumn !== undefined && idx === featuredColumn + 1;
                return (
                  <th key={col} className={isFeatured ? "featured" : undefined}>
                    {col}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="rowLabel">{row.label}</td>
                {row.cells.map((cell, idx) => {
                  if (cell.kind === "check") {
                    return (
                      <td
                        key={idx}
                        className={`checkCell ${cell.value ? "checkYes" : "checkNo"}`}
                        aria-label={cell.value ? "Yes" : "No"}
                      >
                        {cell.value ? "✓" : "—"}
                      </td>
                    );
                  }
                  return <td key={idx}>{cell.value}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
