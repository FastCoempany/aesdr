"use client";

import { useState, useMemo } from "react";
import styles from "../../teams.module.css";

/**
 * Interactive certificate generator + live preview.
 *
 * On screen: form on the left, preview on the right.
 * On print: form/print-bar hidden, preview expands to full page.
 *
 * No persistence — values live in client state, regenerated on every
 * render. Manager fills the form, clicks print, saves PDF, done.
 */

const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const generateSerial = () => {
  const ts = Date.now().toString(36).toUpperCase();
  return `AESDR-OL-${ts.slice(-6)}`;
};

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function CertificateGenerator() {
  const [repName, setRepName] = useState("Alex Rivera");
  const [role, setRole] = useState<"SDR" | "AE">("SDR");
  const [completionDate, setCompletionDate] = useState(today());
  const [modulesCompleted, setModulesCompleted] = useState("12 modules · 36 lessons");
  const [orgName, setOrgName] = useState("");
  const [managerName, setManagerName] = useState("");

  const serial = useMemo(() => generateSerial(), []);

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <div className={styles.printBar}>
        <div className={styles.printBarLabel}>
          <span>Certificate generator · live preview to the right</span>
        </div>
        <button onClick={handlePrint} className={styles.printBarBtn}>
          Print / Save as PDF
        </button>
      </div>

      <div className={styles.certWrap}>
        {/* Form */}
        <form
          className={`${styles.form} certForm`}
          onSubmit={(e) => {
            e.preventDefault();
            handlePrint();
          }}
        >
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="cert-name">Rep name</label>
            <input
              id="cert-name"
              type="text"
              value={repName}
              onChange={(e) => setRepName(e.target.value)}
              className={styles.formInput}
              maxLength={80}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="cert-role">Rep role</label>
            <select
              id="cert-role"
              value={role}
              onChange={(e) => setRole(e.target.value as "SDR" | "AE")}
              className={styles.formSelect}
            >
              <option value="SDR">SDR</option>
              <option value="AE">AE</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="cert-date">Completion date</label>
            <input
              id="cert-date"
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="cert-modules">Scope completed</label>
            <input
              id="cert-modules"
              type="text"
              value={modulesCompleted}
              onChange={(e) => setModulesCompleted(e.target.value)}
              className={styles.formInput}
              maxLength={120}
              placeholder="e.g. 12 modules · 36 lessons"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="cert-org">
              Organization{" "}
              <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400, color: "var(--muted)" }}>(optional)</span>
            </label>
            <input
              id="cert-org"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className={styles.formInput}
              maxLength={80}
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="cert-manager">
              Manager name{" "}
              <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400, color: "var(--muted)" }}>(optional)</span>
            </label>
            <input
              id="cert-manager"
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              className={styles.formInput}
              maxLength={80}
            />
          </div>

          <button
            type="submit"
            className={`${styles.ctaPrimary} ${styles.formSubmit}`}
          >
            Print certificate
          </button>
        </form>

        {/* Preview */}
        <div className={styles.certPreview} aria-label="Certificate preview">
          <div className={styles.certHeader}>
            <span>
              <span className={styles.certMark}>AESDR</span>
              <span className={styles.certMarkSuffix}>/ Operating Layer</span>
            </span>
            <span className={styles.certSerial}>{serial}</span>
          </div>

          <p className={styles.certEyebrow}>Certificate of completion</p>

          <p className={styles.certName}>{repName || "—"}</p>

          <p className={styles.certBody}>
            has completed the AESDR / Operating Layer program for{" "}
            <em>{role === "SDR" ? "Sales Development Representatives" : "Account Executives"}</em>
            {orgName ? ` at ${orgName}` : ""} — {modulesCompleted || "the full curriculum"} of behavioral foundations for early-career SaaS sales reps.
          </p>

          <div className={styles.certFooter}>
            <div className={styles.certSignatureCol}>
              <div className={styles.certSignatureValue}>{formatDate(completionDate)}</div>
              <div className={styles.certSignatureLine} />
              <div className={styles.certSignatureLabel}>Date of completion</div>
            </div>
            <div className={styles.certSignatureCol}>
              <div className={styles.certSignatureValue}>{managerName || " "}</div>
              <div className={styles.certSignatureLine} />
              <div className={styles.certSignatureLabel}>Manager signature</div>
            </div>
            <div className={styles.certSignatureCol}>
              <div className={styles.certSignatureValue} style={{ fontStyle: "italic" }}>
                Antaeus Coe
              </div>
              <div className={styles.certSignatureLine} />
              <div className={styles.certSignatureLabel}>AESDR · Operating Layer</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.downloadHowto}>
        <strong>To save:</strong> click <strong>Print certificate</strong> above,
        choose <strong>Save as PDF</strong> as the destination, set orientation
        to <strong>Landscape</strong>, save. The form on the left will be
        hidden in the printed file — only the certificate prints.
      </div>
    </>
  );
}
