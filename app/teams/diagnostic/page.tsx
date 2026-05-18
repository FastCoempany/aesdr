import Link from "next/link";
import styles from "../teams.module.css";
import SpecSection from "../_components/SpecSection";
import InlineCTA from "../_components/InlineCTA";

/**
 * /teams/diagnostic — AE/SDR behavior diagnostic spec.
 *
 * Eight dimensions of early-career AE/SDR behavior. Each rendered as a spec
 * section with: what it measures, why it matters, sample instrument
 * items, and what changes typically look like.
 *
 * Currently administered manually as part of Custom Enterprise rollout.
 * Self-service version is on the roadmap; this page is honest about
 * that state.
 */

export const metadata = {
  title: "Diagnostic — AESDR / for Teams",
  description: "How to measure behavior change in early-career SDRs and AEs. Eight dimensions, sample items, expected deltas.",
};

type Dimension = {
  number: string;
  name: string;
  role: "SDR" | "AE" | "Both";
  what: string;
  why: string;
  sampleItems: string[];
  typicalDelta: string;
};

const DIMENSIONS: Dimension[] = [
  {
    number: "01",
    name: "Outbound activity volume",
    role: "SDR",
    what: "Sustained activity output over a rolling 4-week window. Dials, emails, social touches — counted, not weighted.",
    why: "Volume alone doesn't sell, but AEs and SDRs below threshold can't possibly hit quota regardless of skill. Identifies the floor.",
    sampleItems: [
      "Average dials per business day, rolling 4 weeks (self-reported + verified via CRM/dialer)",
      "Average outbound emails per business day, same window",
      "Days per month where activity dropped below 50% of personal average — diagnostic of burnout / coasting",
      "Manager rating: 1–5 scale on whether AE/SDR maintains baseline activity without prompting",
    ],
    typicalDelta: "AEs and SDRs starting below their team's 50th percentile typically lift 30–60% on dials and 20–40% on emails within 6 weeks. AEs and SDRs already at or above median move less — Module 1 (Structure) is the primary lift driver.",
  },
  {
    number: "02",
    name: "Outbound personalization quality",
    role: "SDR",
    what: "Per-touch quality — not just whether the email used the prospect's first name. Did the AE/SDR reference something specific to the buyer's role / company / recent activity?",
    why: "Personalization is the only thing that survives volume scaling. AEs and SDRs who learn this in month 2 compound; AEs and SDRs who don't plateau at month 6.",
    sampleItems: [
      "Manager-graded sample of 10 recent outbound emails, scored 1–5 on personalization specificity",
      "Self-rating: 'My typical outbound email could only have been written for this specific prospect' (1–5)",
      "Time spent on prospect research per touch (self-reported median minutes)",
      "Use of public signal (news, hiring, funding, role changes) — count per 20 touches",
    ],
    typicalDelta: "Most lift comes from Module 6 (Beyond the Playbook) and Module 7 (Pipeline Ownership). 15–25% improvement in manager-graded scores typical over 8 weeks.",
  },
  {
    number: "03",
    name: "Discovery question depth",
    role: "Both",
    what: "On qualified calls, the AE/SDR's discovery sequence — how many clarifying questions per topic, how often they probe past the first answer, how much they listen vs. talk.",
    why: "Junior AEs and SDRs interrogate to qualify; experienced AEs and SDRs interrogate to understand. The gap is bridgeable with structured practice.",
    sampleItems: [
      "Call-recording review: average questions per topic before moving on (1–2 = shallow, 3+ = deep)",
      "Talk/listen ratio on discovery calls (target: under 40% AE/SDR talk-time on disco)",
      "Manager rating: 'AE/SDR probed past surface answers to reach the actual driver' (1–5)",
      "Self-rating: 'I usually feel I left disco with the buyer's real motivation, not just the stated motivation' (1–5)",
    ],
    typicalDelta: "AEs see 20–30% improvement on talk/listen ratio after Module 5 (The Playbook) + Module 6. SDRs typically don't run deep disco; their improvement shows in qualification accuracy, not disco depth.",
  },
  {
    number: "04",
    name: "Manager 1:1 engagement",
    role: "Both",
    what: "Quality of the weekly 1:1 with the AE/SDR's manager. Does the AE/SDR show up with their own agenda? Do they push back when they disagree? Do they ask for specific coaching?",
    why: "1:1s are the single biggest leverage point in a AE/SDR's first year. AEs and SDRs who treat them as performance theater get coached badly; AEs and SDRs who run them as working sessions accelerate.",
    sampleItems: [
      "Manager rating: 'AE/SDR arrives with a clear agenda and proposed talking points' (1–5)",
      "Manager rating: 'AE/SDR pushes back constructively when we disagree' (1–5)",
      "Self-rating: 'I leave 1:1s having gotten what I needed' (1–5)",
      "Frequency of AE/SDR-initiated coaching requests in the past month (count)",
    ],
    typicalDelta: "Module 1 (Foundations) ships strongest lift here. Managers consistently report 'less performance theater, more honest signal' within 2–3 weeks of AE/SDR completing Module 1.3 (Mastering Coaching).",
  },
  {
    number: "05",
    name: "Peer dynamic (AE/SDR alignment, ego friction)",
    role: "Both",
    what: "The working relationship between the SDR and their paired AE. Friction, handoff quality, mutual respect, ego dynamics.",
    why: "This is the most-cited break-point in user feedback. AEs and SDRs quit over bad AE/SDR relationships more often than over bad managers.",
    sampleItems: [
      "Paired survey: each rates the other 1–5 on 'trustworthy handoff partner'",
      "Count of escalations to manager triggered by AE/SDR friction in the past month",
      "Self-rating: 'I respect my AE's / SDR's read of the buyer' (1–5)",
      "Use of the AE/SDR Alignment Contract (yes / no / partial)",
    ],
    typicalDelta: "Module 2 (Working Dynamics) + Module 3 (Survival) lift this most. Pairs who name the ego dynamic out loud — using the framing from Lesson 2.3 — typically see paired-survey scores improve by 1+ point within 4 weeks.",
  },
  {
    number: "06",
    name: "CRM hygiene",
    role: "Both",
    what: "Quality of CRM data the AE/SDR maintains: next-step accuracy, opportunity stage discipline, contact role tagging, activity logging consistency.",
    why: "Bad CRM data corrupts every downstream signal — forecast, manager coaching, peer handoff, marketing attribution. Most AEs and SDRs treat CRM as compliance; AESDR reframes it as personal leverage.",
    sampleItems: [
      "Audit: % of opportunities with next-step date within the next 14 days",
      "Audit: % of stage-changes in the past month that align with stage-definition criteria",
      "Self-rating: 'My CRM reflects what's actually happening on my deals' (1–5)",
      "Manager rating: 'I can forecast from this AE/SDR's data without manual cleanup' (1–5)",
    ],
    typicalDelta: "Module 9 (The Tools That Ruin You) is the unlock here. AEs and SDRs who complete 9.1 (CRM Survival Guide) typically see manager-rated forecasting quality improve from 2.5 → 3.5 on average within a month.",
  },
  {
    number: "07",
    name: "Forecast accuracy",
    role: "AE",
    what: "AE-only dimension. How close the AE's monthly forecast lands to actual closed-won by EOM.",
    why: "Forecast accuracy compounds: an AE who's reliably accurate gets earlier intervention budget, more strategic deal support, better territory. An AE who's habitually optimistic gets none of that.",
    sampleItems: [
      "Variance: (forecast at start of month) ÷ (actual closed-won at EOM) — track rolling 6 months",
      "Stage-accuracy: % of deals at 'commit' stage at month-start that closed by EOM",
      "Self-rating: 'I have a clear-eyed view of which deals are real' (1–5)",
      "Manager rating: 'This AE's commit number is reliable' (1–5)",
    ],
    typicalDelta: "Module 8 (Hard Truths) — especially 8.1 (The 30% Rule) — is the lift. Variance typically tightens 15–25% over 8 weeks for AEs whose pre-program variance was >30%.",
  },
  {
    number: "08",
    name: "Async communication discipline",
    role: "Both",
    what: "How the AE/SDR uses Slack, email, Notion / docs. Do they protect deep work? Do they batch responses? Do they distinguish urgent from theatrical urgency?",
    why: "AEs and SDRs drown in async noise. The ones who develop discipline early outpace the ones who don't — not because they work less, but because they spend their hours on the right things.",
    sampleItems: [
      "Self-reported average Slack DM response time during work hours (target: under 30 min for direct DMs, batch-style for channels)",
      "Self-rating: 'I have at least one 90-minute deep-work block per business day' (1–5)",
      "Manager rating: 'This AE/SDR distinguishes urgent from urgent-feeling' (1–5)",
      "Audit: number of after-hours / weekend Slack messages sent in past 2 weeks (a tell for boundary erosion)",
    ],
    typicalDelta: "Module 4 (Navigating the Org) + Module 9 (The Tools That Ruin You) drive most of the lift. Subtle but durable — improvements show up at month 3, not week 3.",
  },
];

export default function DiagnosticPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Diagnostic</p>
          <h1 className={styles.heroHeadline}>How to know it&apos;s working.</h1>
          <p className={styles.heroSubhead}>
            A before/after diagnostic for measuring AE/SDR behavior change. Eight dimensions, administered at week 0 and week 8. Built for managers who need to justify the investment without inventing a number.
          </p>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <p className={styles.eyebrow}>How it works</p>
          <h2 className={styles.h2}>Three components.</h2>
          <hr className={styles.divider} />
          <ul className={styles.bulletList}>
            <li>
              <strong>Self-report.</strong> AE/SDR completes the instrument at week 0
              (before starting AESDR) and again at week 8 (end of program). ~30
              minutes each, online form.
            </li>
            <li>
              <strong>Manager rating.</strong> Manager rates the AE/SDR on the same
              dimensions, at the same two points. Done independently of the AE/SDR&apos;s
              self-report — surfaces gaps where AE/SDR and manager see things
              differently.
            </li>
            <li>
              <strong>Activity audit.</strong> For a few dimensions (CRM hygiene,
              outbound volume, forecast variance), we pull data from your existing
              systems (CRM export, dialer report, forecast log). Manager-supplied.
            </li>
          </ul>
          <div className={styles.specCallout}>
            Currently administered manually as part of the Custom Enterprise
            rollout — founder runs the instrument with you. Self-service
            instrument with auto-scoring is on the roadmap; built when the first
            Custom Enterprise rollout asks for it as a self-serve tool.
          </div>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>The eight dimensions</p>
          <h2 className={styles.h2}>What gets measured.</h2>
          <hr className={styles.divider} />

          {DIMENSIONS.map((d) => (
            <SpecSection
              key={d.number}
              number={d.number}
              title={d.name}
              meta={[
                { label: "Role", value: d.role },
              ]}
            >
              <p className={styles.h4} style={{ marginTop: 8 }}>What it measures</p>
              <p className={styles.bodyDense} style={{ marginBottom: 16 }}>{d.what}</p>

              <p className={styles.h4} style={{ marginTop: 16 }}>Why it matters</p>
              <p className={styles.bodyDense} style={{ marginBottom: 16 }}>{d.why}</p>

              <p className={styles.h4} style={{ marginTop: 16 }}>Sample instrument items</p>
              <ul className={styles.specList}>
                {d.sampleItems.map((item) => (
                  <li key={item}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink)" }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <div className={styles.specCallout}>
                <strong style={{ fontStyle: "normal", color: "var(--ink)" }}>
                  Typical delta over 6–8 weeks:{" "}
                </strong>
                {d.typicalDelta}
              </div>
            </SpecSection>
          ))}
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <h2 className={styles.h2}>What changes typically look like.</h2>
          <hr className={styles.divider} />
          <p className={styles.body}>
            Honest framing: orgs report 30–60% lifts on the activity-volume dimensions, 15–25% on the quality dimensions, 1+ point on the relationship/manager-rating scales. Some dimensions move fast (activity, 1:1 engagement, CRM hygiene); some take longer than 8 weeks (forecast accuracy, async discipline, peer-pair dynamics in heavily-broken pairs).
          </p>
          <p className={styles.body}>
            We don&apos;t publish a single &ldquo;average lift&rdquo; number across all dimensions. It would be marketing-grade dishonest — your numbers depend on where AEs and SDRs start, how strong your manager culture is, and which dimensions you actually invest in measuring.
          </p>
          <p className={styles.body}>
            The diagnostic is partly the measurement instrument and partly a forcing function. Orgs that administer it consistently report better outcomes than orgs that don&apos;t — because measuring the dimension makes the dimension visible to both AE/SDR and manager.
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <InlineCTA href="/teams/contact?source=diagnostic">Talk about diagnostic administration</InlineCTA>
            <InlineCTA href="/teams/downloads/diagnostic-instrument" variant="arrow">
              Printable instrument
            </InlineCTA>
          </div>
          <p className={styles.bodyMuted} style={{ marginTop: 16, fontSize: 14 }}>
            Need the printable self-administering version?{" "}
            <Link href="/teams/downloads/diagnostic-instrument" style={{ color: "var(--ink)", textDecoration: "underline" }}>
              /teams/downloads/diagnostic-instrument
            </Link>{" "}
            — all 32 prompts with 1–5 scales, ready to print or save as PDF.
          </p>
        </div>
      </section>
    </>
  );
}
