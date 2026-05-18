import styles from "../../teams.module.css";
import PrintButton from "../../_components/PrintButton";

/**
 * /teams/downloads/rep-diagnostic — printable self-administering instrument.
 *
 * All 32 items across the 8 dimensions. Each item has a 1–5 response
 * scale rendered as 5 boxes for the rep to mark. Print orientation:
 * letter portrait. Pages break cleanly between dimensions via
 * `page-break-inside: avoid` on .instrumentSection.
 */

export const metadata = {
  title: "Rep diagnostic instrument — AESDR / for Teams",
  description: "Self-administering before/after diagnostic. 32 items across 8 dimensions, with response scales.",
};

type Dim = {
  number: string;
  name: string;
  role: "SDR" | "AE" | "Both";
  items: string[];
};

const DIMENSIONS: Dim[] = [
  {
    number: "01",
    name: "Outbound activity volume",
    role: "SDR",
    items: [
      "On a typical day, I make my baseline number of dials without needing a manager nudge.",
      "On a typical day, I send my baseline number of outbound emails without needing a manager nudge.",
      "Across the last month, I had fewer than 3 days where my activity dropped meaningfully below my average.",
      "Manager rating: This rep maintains activity volume without prompting.",
    ],
  },
  {
    number: "02",
    name: "Outbound personalization quality",
    role: "SDR",
    items: [
      "My typical outbound email could only have been written for this specific prospect — not template-able.",
      "I spend at least a few minutes researching a prospect before reaching out.",
      "I reference public signal (recent news, hiring, funding, role changes) in most of my outbound touches.",
      "Manager rating: This rep's outbound feels written, not generated.",
    ],
  },
  {
    number: "03",
    name: "Discovery question depth",
    role: "Both",
    items: [
      "On a typical disco, I ask 3+ clarifying questions per topic before moving on.",
      "On a typical disco, I talk less than 40% of the time.",
      "I usually feel I left disco with the buyer's real motivation, not just the stated motivation.",
      "Manager rating: This rep probes past surface answers to reach the actual driver.",
    ],
  },
  {
    number: "04",
    name: "Manager 1:1 engagement",
    role: "Both",
    items: [
      "I arrive at my 1:1 with a clear agenda and proposed talking points.",
      "I push back constructively when I disagree with my manager.",
      "I leave my 1:1 having gotten what I needed.",
      "Manager rating: This rep treats 1:1 as a working session, not performance theater.",
    ],
  },
  {
    number: "05",
    name: "Peer dynamic (AE/SDR alignment, ego friction)",
    role: "Both",
    items: [
      "I trust my paired AE / SDR's read of the buyer.",
      "Our handoffs are clean — I rarely get an opportunity that needs to be re-qualified.",
      "When we disagree, we resolve it directly without manager escalation.",
      "We use a shared written framework for handoff expectations.",
    ],
  },
  {
    number: "06",
    name: "CRM hygiene",
    role: "Both",
    items: [
      "Every active opportunity I own has a next-step date within the next 14 days.",
      "When I move an opportunity to a new stage, it actually meets that stage's definition.",
      "My CRM reflects what's actually happening on my deals — I don't keep a side spreadsheet.",
      "Manager rating: I can forecast from this rep's CRM data without manual cleanup.",
    ],
  },
  {
    number: "07",
    name: "Forecast accuracy",
    role: "AE",
    items: [
      "My month-start commit number is within 20% of my actual closed-won, on average.",
      "When I label a deal 'commit,' it closes by the end of the month at least 80% of the time.",
      "I have a clear-eyed view of which deals are real and which are wishful.",
      "Manager rating: This AE's commit number is reliable.",
    ],
  },
  {
    number: "08",
    name: "Async communication discipline",
    role: "Both",
    items: [
      "I respond to direct Slack DMs within 30 minutes during work hours.",
      "I have at least one 90-minute deep-work block per business day, protected from interruption.",
      "I distinguish urgent messages from urgent-feeling messages.",
      "In the past two weeks, I sent fewer than 5 after-hours or weekend Slack messages.",
    ],
  },
];

export default function RepDiagnosticPage() {
  return (
    <section className={styles.section} style={{ paddingTop: 24 }}>
      <div className={styles.container} style={{ maxWidth: 900 }}>
        <PrintButton label="Rep diagnostic instrument" format="letter portrait · ~6 pages" />

        <div className={styles.onepageContainer} style={{ maxWidth: "none", padding: "0 clamp(8px, 2vw, 24px)" }}>
          {/* Header */}
          <header className={styles.onepageHeader} style={{ marginBottom: 24 }}>
            <span>
              <span className={styles.certMark}>AESDR</span>
              <span className={styles.certMarkSuffix}>/ for Teams</span>
            </span>
            <span className={styles.certSerial}>Diagnostic v1.0</span>
          </header>

          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: 28,
              fontWeight: 900,
              fontStyle: "italic",
              lineHeight: 1.1,
              color: "var(--ink)",
              margin: "0 0 12px",
            }}
          >
            Rep behavior diagnostic.
          </h1>

          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: 14,
              lineHeight: 1.55,
              color: "var(--muted)",
              margin: "0 0 16px",
              maxWidth: "70ch",
            }}
          >
            32 prompts across 8 dimensions of early-career rep behavior. Each item rates on a 1–5 scale:
            <strong style={{ color: "var(--ink)" }}> 1 = strongly disagree</strong>{" · "}
            <strong style={{ color: "var(--ink)" }}>3 = neutral</strong>{" · "}
            <strong style={{ color: "var(--ink)" }}>5 = strongly agree</strong>.
            Some items are self-rated by the rep; manager-rated items are labeled. Administer at week 0
            (before starting AESDR) and again at week 8 (end of program). Compare the deltas.
          </p>

          <div
            style={{
              padding: "10px 14px",
              border: "1px solid var(--ink)",
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--muted)",
              margin: "16px 0 24px",
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <span>Name: ________________________________</span>
            <span>Role: SDR / AE</span>
            <span>Date: __________________</span>
            <span>Wave: WK0 / WK8</span>
          </div>

          {/* Eight dimensions */}
          {DIMENSIONS.map((d) => (
            <section key={d.number} className={styles.instrumentSection}>
              <div className={styles.instrumentHeader}>
                <span className={styles.instrumentNumber}>{d.number}</span>
                <h2 className={styles.instrumentTitle}>{d.name}</h2>
                <span className={styles.instrumentRole}>{d.role}</span>
              </div>

              {d.items.map((item, idx) => (
                <div key={idx} className={styles.instrumentItem}>
                  <p className={styles.instrumentPrompt}>
                    <strong style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginRight: 8 }}>
                      {d.number}.{idx + 1}
                    </strong>
                    {item}
                  </p>
                  <div className={styles.instrumentScale}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div key={n} className={styles.instrumentScaleBox}>
                        <div className={styles.instrumentScaleNum}>{n}</div>
                        <div className={styles.instrumentScaleLabel}>
                          {n === 1 ? "Disagree" : n === 3 ? "Neutral" : n === 5 ? "Agree" : " "}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}

          {/* Footer */}
          <div
            style={{
              borderTop: "2px solid var(--ink)",
              marginTop: 24,
              paddingTop: 14,
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: .15,
              color: "var(--muted)",
              textTransform: "uppercase",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <span>Scoring: avg per dimension; track delta WK0 → WK8</span>
            <span>aesdr.com/teams/diagnostic</span>
          </div>
        </div>

        <div className={styles.downloadHowto}>
          <strong>To distribute:</strong> click <strong>Print / Save as PDF</strong> above,
          set orientation to <strong>Portrait</strong>, save. Distribute the PDF to reps;
          they fill in and return. Or print and hand-distribute if your team works on paper.
          Spec for what each dimension measures and why is on{" "}
          <strong>/teams/diagnostic</strong>.
        </div>
      </div>
    </section>
  );
}
