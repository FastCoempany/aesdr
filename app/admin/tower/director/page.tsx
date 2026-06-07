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
      <div className={styles.introGrid}>
        <p className={styles.lede}>
          This is the calendar above the cockpit. Open it on Monday to see what the
          week needs. Open it on Day 47 to see whether you&rsquo;re on the line. <em>The
          90-day arc is yours; the daily execution moved into the tower so you
          don&rsquo;t have to remember it.</em>
        </p>
        <p className={styles.lede}>
          Every step is tagged: <span className={`${styles.tag} ${styles.you}`}>YOU</span> means
          a real human moment (click-by-click follows); <span className={`${styles.tag} ${styles.tower}`}>TOWER</span> means
          you act inside <Link href="/admin/tower" style={{ color: "#8B1A1A", textDecoration: "underline" }}>the cockpit</Link>;{" "}
          <span className={`${styles.tag} ${styles.auto}`}>AUTO</span> means a cron handles it;
          and <span className={styles.tag}>DONE</span> means it was Week-1 setup, now permanent.
          A <span className={styles.autoChip}>Can be fully automated</span> chip means it&rsquo;s wired and ready — but <strong>nothing runs until you flip its lever</strong> in the tower&rsquo;s <Link href="/admin/tower" style={{ color: "#8B1A1A", textDecoration: "underline" }}>Agent Controls</Link>. Every agent is paused by default; you start each one by hand, and the drafting agents only ever produce drafts you approve.
          Check off tasks as you go — progress saves in this browser. Every file, table, doc, and page named below is a link, and every dark command block is click-to-copy.
        </p>
      </div>

      <DirectorPlan />
    </div>
  );
}
