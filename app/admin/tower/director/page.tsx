import type { Metadata } from "next";
import Link from "next/link";

import styles from "./director.module.css";
import DirectorPlan from "./DirectorPlan";

/**
 * Director's tab — the partnerships 90-day operator playbook, embedded in the
 * Control Tower. Founder-only (admin-gated via the admin layout). The intro is
 * static; the plan itself is the interactive DirectorPlan client component
 * (collapsible weeks/tasks, checkboxes, automation chips, inline links on every
 * file/table/doc/route it references). Plan content lives in plan.ts.
 */

export const metadata: Metadata = {
  title: "Director · Control Tower | AESDR",
  robots: { index: false, follow: false },
};

export default function DirectorPage() {
  return (
    <div className={styles.shell}>
      <p className={styles.eyebrow}>
        <span className={styles.irisText}>Director</span> · Partnerships · 90-day playbook
      </p>
      <h1 className={styles.headline}>You direct the function.<br />The tower runs it.</h1>
      <p className={styles.lede} style={{ maxWidth: 760 }}>
        The calendar above <Link href="/admin/tower" style={{ color: "#8B1A1A", textDecoration: "underline" }}>the warren</Link>.
        Everything folds — open a week, open a task, press what it tells you to press.
        The green <strong style={{ color: "#2E7D32" }}>✓ done</strong> stamps are the audit:
        already true in the world. <em>Checkboxes are yours; progress saves in this
        browser. Every file, table, and page named inside is a link.</em>
      </p>

      <DirectorPlan />
    </div>
  );
}
