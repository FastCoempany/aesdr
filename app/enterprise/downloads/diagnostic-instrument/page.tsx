import styles from "../../enterprise.module.css";
import DiagnosticInstrument from "./DiagnosticInstrument";

/**
 * /enterprise/downloads/diagnostic-instrument — fully digital, downloadable.
 *
 * Page is a server component holding metadata + intro. The interactive
 * instrument is a client component that handles state, radio inputs,
 * live per-dimension averages, and CSV download.
 *
 * No printing. The AE/SDR fills it in on screen and downloads the
 * results as a CSV. Manager reviews; compare WK0 → WK8 for delta.
 */

export const metadata = {
  title: "AE/SDR diagnostic instrument — AESDR / Enterprise",
  description: "Digital self-administering before/after diagnostic. 32 items across 8 dimensions. Download responses as CSV.",
};

export default function DiagnosticInstrumentPage() {
  return (
    <section className={styles.section} style={{ paddingTop: 24 }}>
      <div className={styles.container} style={{ maxWidth: 960 }}>
        {/* Intro */}
        <p className={styles.eyebrow}>Downloads · Artifact 04</p>
        <h1 className={styles.heroHeadline} style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>
          AE/SDR behavior diagnostic.
        </h1>
        <p className={styles.heroSubhead}>
          32 prompts across 8 dimensions of early-career AE/SDR behavior. Each item rates on a
          1–5 scale: <strong style={{ color: "var(--ink)" }}>1 = strongly disagree</strong>,{" "}
          <strong style={{ color: "var(--ink)" }}>3 = neutral</strong>,{" "}
          <strong style={{ color: "var(--ink)" }}>5 = strongly agree</strong>. Some items are
          self-rated by the AE/SDR; manager-rated items are labeled.
        </p>
        <p className={styles.bodyMuted} style={{ marginTop: 12 }}>
          Administer at <strong>Week 0</strong> (before starting AESDR) and again at{" "}
          <strong>Week 8</strong> (end of program). Compare the deltas — that&apos;s where the
          signal is. Download your responses as a CSV at the end; managers compile WK0/WK8 files
          and analyze in their tool of choice.
        </p>
        <hr className={styles.divider} />

        <DiagnosticInstrument />

        <div className={styles.downloadHowto} style={{ marginTop: 32 }}>
          <strong>How this works:</strong> fill in your name, role, date, and wave at the top.
          Click a number 1–5 for each prompt — your progress updates live. When done, click{" "}
          <strong>Download responses (CSV)</strong> to save a file you can send to your manager
          or use for your own records. Nothing is sent to a server, nothing is stored —
          everything stays in your browser and the CSV is yours. Spec for what each dimension
          measures is on <strong>/enterprise/diagnostic</strong>.
        </div>
      </div>
    </section>
  );
}
