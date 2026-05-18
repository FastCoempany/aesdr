"use client";

import { useState, useMemo } from "react";
import styles from "../../teams.module.css";

/**
 * Interactive AE/SDR behavior diagnostic instrument.
 *
 * 32 prompts × 5-point scale = 160 possible responses. Fully digital:
 * AE/SDR fills in header (name, role, date, wave), clicks a number 1–5
 * for each prompt, then clicks "Download responses" to get a CSV file.
 *
 * Designed for managers to administer at week 0 + week 8 of an AESDR
 * rollout and compare deltas. Same instrument both waves; user marks
 * the wave at the top.
 */

type Dim = {
  number: string;
  name: string;
  role: "SDR" | "AE" | "Both";
  items: { code: string; prompt: string }[];
};

const DIMENSIONS: Dim[] = [
  {
    number: "01",
    name: "Outbound activity volume",
    role: "SDR",
    items: [
      { code: "01.1", prompt: "On a typical day, I make my baseline number of dials without needing a manager nudge." },
      { code: "01.2", prompt: "On a typical day, I send my baseline number of outbound emails without needing a manager nudge." },
      { code: "01.3", prompt: "Across the last month, I had fewer than 3 days where my activity dropped meaningfully below my average." },
      { code: "01.4", prompt: "Manager rating: This AE/SDR maintains activity volume without prompting." },
    ],
  },
  {
    number: "02",
    name: "Outbound personalization quality",
    role: "SDR",
    items: [
      { code: "02.1", prompt: "My typical outbound email could only have been written for this specific prospect — not template-able." },
      { code: "02.2", prompt: "I spend at least a few minutes researching a prospect before reaching out." },
      { code: "02.3", prompt: "I reference public signal (recent news, hiring, funding, role changes) in most of my outbound touches." },
      { code: "02.4", prompt: "Manager rating: This AE/SDR's outbound feels written, not generated." },
    ],
  },
  {
    number: "03",
    name: "Discovery question depth",
    role: "Both",
    items: [
      { code: "03.1", prompt: "On a typical disco, I ask 3+ clarifying questions per topic before moving on." },
      { code: "03.2", prompt: "On a typical disco, I talk less than 40% of the time." },
      { code: "03.3", prompt: "I usually feel I left disco with the buyer's real motivation, not just the stated motivation." },
      { code: "03.4", prompt: "Manager rating: This AE/SDR probes past surface answers to reach the actual driver." },
    ],
  },
  {
    number: "04",
    name: "Manager 1:1 engagement",
    role: "Both",
    items: [
      { code: "04.1", prompt: "I arrive at my 1:1 with a clear agenda and proposed talking points." },
      { code: "04.2", prompt: "I push back constructively when I disagree with my manager." },
      { code: "04.3", prompt: "I leave my 1:1 having gotten what I needed." },
      { code: "04.4", prompt: "Manager rating: This AE/SDR treats 1:1 as a working session, not performance theater." },
    ],
  },
  {
    number: "05",
    name: "Peer dynamic (AE/SDR alignment, ego friction)",
    role: "Both",
    items: [
      { code: "05.1", prompt: "I trust my paired AE / SDR's read of the buyer." },
      { code: "05.2", prompt: "Our handoffs are clean — I rarely get an opportunity that needs to be re-qualified." },
      { code: "05.3", prompt: "When we disagree, we resolve it directly without manager escalation." },
      { code: "05.4", prompt: "We use a shared written framework for handoff expectations." },
    ],
  },
  {
    number: "06",
    name: "CRM hygiene",
    role: "Both",
    items: [
      { code: "06.1", prompt: "Every active opportunity I own has a next-step date within the next 14 days." },
      { code: "06.2", prompt: "When I move an opportunity to a new stage, it actually meets that stage's definition." },
      { code: "06.3", prompt: "My CRM reflects what's actually happening on my deals — I don't keep a side spreadsheet." },
      { code: "06.4", prompt: "Manager rating: I can forecast from this AE/SDR's CRM data without manual cleanup." },
    ],
  },
  {
    number: "07",
    name: "Forecast accuracy",
    role: "AE",
    items: [
      { code: "07.1", prompt: "My month-start commit number is within 20% of my actual closed-won, on average." },
      { code: "07.2", prompt: "When I label a deal 'commit,' it closes by the end of the month at least 80% of the time." },
      { code: "07.3", prompt: "I have a clear-eyed view of which deals are real and which are wishful." },
      { code: "07.4", prompt: "Manager rating: This AE's commit number is reliable." },
    ],
  },
  {
    number: "08",
    name: "Async communication discipline",
    role: "Both",
    items: [
      { code: "08.1", prompt: "I respond to direct Slack DMs within 30 minutes during work hours." },
      { code: "08.2", prompt: "I have at least one 90-minute deep-work block per business day, protected from interruption." },
      { code: "08.3", prompt: "I distinguish urgent messages from urgent-feeling messages." },
      { code: "08.4", prompt: "In the past two weeks, I sent fewer than 5 after-hours or weekend Slack messages." },
    ],
  },
];

const ALL_ITEMS = DIMENSIONS.flatMap((d) =>
  d.items.map((i) => ({ ...i, dimension: d.number, dimensionName: d.name }))
);

const today = () => new Date().toISOString().slice(0, 10);

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCsv(rows: string[][], filename: string) {
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function DiagnosticInstrument() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"SDR" | "AE">("SDR");
  const [date, setDate] = useState(today());
  const [wave, setWave] = useState<"WK0" | "WK8">("WK0");
  const [responses, setResponses] = useState<Record<string, number>>({});

  const filled = Object.keys(responses).length;
  const total = ALL_ITEMS.length;
  const completion = Math.round((filled / total) * 100);

  const dimensionAverages = useMemo(() => {
    return DIMENSIONS.map((d) => {
      const values = d.items
        .map((i) => responses[i.code])
        .filter((v): v is number => typeof v === "number");
      const avg = values.length > 0
        ? values.reduce((sum, v) => sum + v, 0) / values.length
        : null;
      return { number: d.number, name: d.name, avg, answered: values.length, total: d.items.length };
    });
  }, [responses]);

  function setAnswer(code: string, value: number) {
    setResponses((prev) => ({ ...prev, [code]: value }));
  }

  function handleDownload() {
    const safeName = (name || "anonymous").replace(/[^a-zA-Z0-9-_]/g, "_");
    const filename = `aesdr-diagnostic_${safeName}_${role}_${wave}_${date}.csv`;

    const rows: string[][] = [
      ["AESDR / for Teams — AE/SDR behavior diagnostic"],
      [],
      ["Name", name || "(blank)"],
      ["Role", role],
      ["Date", date],
      ["Wave", wave],
      ["Completion", `${filled}/${total} (${completion}%)`],
      [],
      ["Dimension", "Item code", "Prompt", "Response (1-5)"],
    ];

    for (const d of DIMENSIONS) {
      for (const i of d.items) {
        const r = responses[i.code];
        rows.push([
          `${d.number} ${d.name}`,
          i.code,
          i.prompt,
          r === undefined ? "" : String(r),
        ]);
      }
    }

    rows.push([]);
    rows.push(["Dimension averages"]);
    for (const da of dimensionAverages) {
      rows.push([
        `${da.number} ${da.name}`,
        da.avg === null ? "(no answers)" : da.avg.toFixed(2),
        `${da.answered}/${da.total} answered`,
      ]);
    }

    downloadCsv(rows, filename);
  }

  function handleReset() {
    if (filled === 0 || confirm("Clear all responses and start over?")) {
      setResponses({});
    }
  }

  return (
    <>
      {/* Header — actual editable inputs */}
      <div className={styles.diagHeader}>
        <div className={styles.diagHeaderGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="diag-name">Your name</label>
            <input
              id="diag-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.formInput}
              maxLength={80}
              placeholder="First and last"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="diag-role">Your role</label>
            <select
              id="diag-role"
              value={role}
              onChange={(e) => setRole(e.target.value as "SDR" | "AE")}
              className={styles.formSelect}
            >
              <option value="SDR">SDR</option>
              <option value="AE">AE</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="diag-date">Date</label>
            <input
              id="diag-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="diag-wave">Wave</label>
            <select
              id="diag-wave"
              value={wave}
              onChange={(e) => setWave(e.target.value as "WK0" | "WK8")}
              className={styles.formSelect}
            >
              <option value="WK0">Week 0 — before AESDR</option>
              <option value="WK8">Week 8 — end of program</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress + action bar (sticky top) */}
      <div className={styles.diagActionBar}>
        <div className={styles.diagProgress}>
          <span className={styles.diagProgressLabel}>
            {filled}/{total} answered · {completion}%
          </span>
          <div className={styles.diagProgressTrack}>
            <div
              className={styles.diagProgressFill}
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
        <div className={styles.diagActions}>
          <button
            type="button"
            onClick={handleReset}
            className={styles.ctaSecondary}
            disabled={filled === 0}
            style={{ opacity: filled === 0 ? 0.5 : 1 }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className={styles.ctaPrimary}
            disabled={filled === 0}
            style={{ opacity: filled === 0 ? 0.5 : 1 }}
          >
            Download responses (CSV)
          </button>
        </div>
      </div>

      {/* Eight dimensions */}
      {DIMENSIONS.map((d) => (
        <section key={d.number} className={styles.instrumentSection}>
          <div className={styles.instrumentHeader}>
            <span className={styles.instrumentNumber}>{d.number}</span>
            <h2 className={styles.instrumentTitle}>{d.name}</h2>
            <span className={styles.instrumentRole}>{d.role}</span>
          </div>

          {d.items.map((item) => {
            const selected = responses[item.code];
            return (
              <div key={item.code} className={styles.instrumentItem}>
                <p className={styles.instrumentPrompt}>
                  <strong style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginRight: 8 }}>
                    {item.code}
                  </strong>
                  {item.prompt}
                </p>
                <fieldset className={styles.diagScale} aria-label={`Response for ${item.code}`}>
                  <legend className="visuallyHidden" style={{ position: "absolute", width: 1, height: 1, padding: 0, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
                    {item.prompt}
                  </legend>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const isSelected = selected === n;
                    return (
                      <label
                        key={n}
                        className={`${styles.diagScaleBox} ${isSelected ? styles.diagScaleBoxSelected : ""}`}
                      >
                        <input
                          type="radio"
                          name={item.code}
                          value={n}
                          checked={isSelected}
                          onChange={() => setAnswer(item.code, n)}
                          className={styles.diagScaleInput}
                        />
                        <span className={styles.diagScaleNum}>{n}</span>
                        <span className={styles.diagScaleLabel}>
                          {n === 1 ? "Disagree" : n === 3 ? "Neutral" : n === 5 ? "Agree" : "·"}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              </div>
            );
          })}
        </section>
      ))}

      {/* Summary footer */}
      <div className={styles.diagSummary}>
        <h3 className={styles.h3}>Per-dimension averages</h3>
        <p className={styles.bodyMuted} style={{ fontSize: 14, marginBottom: 12 }}>
          Updates live as you answer. Compare these between WK0 and WK8 to see the delta.
        </p>
        <table className={styles.diagSummaryTable}>
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Answered</th>
              <th>Average</th>
            </tr>
          </thead>
          <tbody>
            {dimensionAverages.map((da) => (
              <tr key={da.number}>
                <td>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginRight: 8 }}>
                    {da.number}
                  </span>
                  {da.name}
                </td>
                <td>{da.answered}/{da.total}</td>
                <td>{da.avg === null ? "—" : da.avg.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleDownload}
            className={styles.ctaPrimary}
            disabled={filled === 0}
            style={{ opacity: filled === 0 ? 0.5 : 1 }}
          >
            Download responses (CSV)
          </button>
          <button
            type="button"
            onClick={handleReset}
            className={styles.ctaSecondary}
            disabled={filled === 0}
            style={{ opacity: filled === 0 ? 0.5 : 1 }}
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
}
