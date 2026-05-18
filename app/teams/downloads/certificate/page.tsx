import styles from "../../teams.module.css";
import CertificateGenerator from "./CertificateGenerator";

export const metadata = {
  title: "Completion certificate — AESDR / Operating Layer",
  description: "Generate a printable AESDR / Operating Layer completion certificate. Live preview, print to PDF.",
};

export default function CertificatePage() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>Downloads · Artifact 02</p>
        <h1 className={styles.heroHeadline} style={{ fontSize: "clamp(32px, 5vw, 56px)" }}>
          Completion certificate.
        </h1>
        <p className={styles.heroSubhead}>
          Fill in the rep details on the left; preview updates live on the right.
          Print to PDF for distribution, or print directly to paper if your org
          still hands these out at all-hands.
        </p>
        <hr className={styles.divider} />

        <CertificateGenerator />
      </div>
    </section>
  );
}
