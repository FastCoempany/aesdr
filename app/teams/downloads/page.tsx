import Link from "next/link";
import styles from "../teams.module.css";

/**
 * /teams/downloads — index of downloadable artifacts.
 *
 * Each artifact is a print-friendly web page (not a binary PDF). Users
 * generate the final PDF via browser print-to-PDF. Per canon §6.1 +
 * decision §13.14: this produces equivalent output with no design
 * tooling required, keeps artifacts version-controlled, stays in sync
 * with site content automatically.
 */

export const metadata = {
  title: "Downloads — AESDR / for Teams",
  description: "Manager guide, completion certificate, partner one-pager, AE/SDR diagnostic instrument. All print-friendly.",
};

const ARTIFACTS = [
  {
    href: "/teams/implementation",
    eyebrow: "ARTIFACT 01 · MANAGER",
    title: "Manager Implementation Guide",
    description:
      "The full 8-week rollout sequence with manager touchpoints, takeaway tools, and common mistakes. Read on web or print-to-PDF.",
    pages: "~12 pages when printed",
  },
  {
    href: "/teams/downloads/certificate",
    eyebrow: "ARTIFACT 02 · CERTIFICATE",
    title: "Completion certificate generator",
    description:
      "Enter AE/SDR name + completion date + program scope. Generates a printable certificate in the AESDR / for Teams brand. One per AE/SDR.",
    pages: "1 page · landscape",
  },
  {
    href: "/teams/downloads/partner-one-pager",
    eyebrow: "ARTIFACT 03 · PARTNER",
    title: "Partner one-pager",
    description:
      "Single-page sales sheet for channel partners. Positioning, partner categories, contact. Designed for printing or PDF-attaching to outbound emails.",
    pages: "1 page · letter portrait",
  },
  {
    href: "/teams/downloads/diagnostic-instrument",
    eyebrow: "ARTIFACT 04 · DIAGNOSTIC",
    title: "AE/SDR diagnostic instrument",
    description:
      "Fully digital. 32 prompts across 8 dimensions with 1–5 response scales. AEs and SDRs fill it in on screen and download responses as a CSV. Administer at week 0 / week 8 and compare deltas.",
    pages: "Digital · download CSV",
  },
];

export default function DownloadsIndex() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Downloads</p>
          <h1 className={styles.heroHeadline}>Four artifacts. All print-friendly.</h1>
          <p className={styles.heroSubhead}>
            Send-able materials for managers, partners, and AEs and SDRs. Each is a web
            page designed to print cleanly to PDF — no separate file to chase, no
            version drift between the website and the PDF.
          </p>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.container}>
          <div className={styles.downloadGrid}>
            {ARTIFACTS.map((a) => (
              <Link key={a.href} href={a.href} className={styles.downloadCard} style={{ textDecoration: "none", color: "inherit" }}>
                <p className={styles.downloadCardEyebrow}>{a.eyebrow}</p>
                <h2 className={styles.downloadCardTitle}>{a.title}</h2>
                <p className={styles.downloadCardDesc}>{a.description}</p>
                <p className={styles.downloadCardEyebrow} style={{ marginTop: "auto", opacity: 0.7 }}>
                  {a.pages}
                </p>
              </Link>
            ))}
          </div>

          <div className={styles.downloadHowto}>
            <strong>About these artifacts:</strong> the manager guide, certificate, and partner
            one-pager are designed to save as PDF — open the artifact, press{" "}
            <strong>Cmd+P</strong> (Mac) or <strong>Ctrl+P</strong> (Windows), choose{" "}
            <strong>Save as PDF</strong> in the destination dropdown, click <strong>Save</strong>.
            The diagnostic instrument is fully digital — fill it in on screen and download a CSV
            of the responses.
          </div>
        </div>
      </section>
    </>
  );
}
