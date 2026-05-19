import styles from "../teams.module.css";
import SpecSection from "../_components/SpecSection";
import InlineCTA from "../_components/InlineCTA";

/**
 * /teams/curriculum — the full module + lesson map.
 *
 * Twelve modules, three sub-lessons each = 36 lessons total. Each
 * module gets: theme, three lesson titles, manager-facing learning
 * outcomes, time estimate, "why managers care" line.
 *
 * Buyer-facing reference. Used during walkthroughs and shared with
 * enablement / L&D evaluators who need a curriculum map before
 * approving spend.
 */

export const metadata = {
  title: "Curriculum — AESDR / for Teams",
  description: "Twelve modules, three sub-lessons each. The full curriculum map for first- and second-year SDRs and AEs — including manager-facing learning outcomes per module.",
};

type Lesson = {
  number: string;
  title: string;
};

type Module = {
  number: string;
  theme: string;
  description: string;
  lessons: Lesson[];
  outcomes: string[];
  duration: string;
  managerNote: string;
  /**
   * Optional role flavor — most modules apply equally to both AEs and SDRs
   * and have no flavor set. A few skew one way (e.g., Module 5's "The SDR
   * Playbook"); those carry the flavor so buyers see at a glance which
   * modules land hardest for which role.
   */
  flavor?: "SDR" | "AE";
};

const MODULES: Module[] = [
  {
    number: "01",
    theme: "Foundations of a sales career",
    description:
      "AEs and SDRs arrive without the structural scaffolding that holds a sales career together. Module 1 builds it: what good structure looks like, why camaraderie isn't optional, how to actually accept coaching instead of resisting it.",
    lessons: [
      { number: "1.1", title: "Creating Structure" },
      { number: "1.2", title: "Building Real Camaraderie" },
      { number: "1.3", title: "Mastering Coaching" },
    ],
    outcomes: [
      "AEs and SDRs build a weekly cadence that survives bad weeks",
      "AEs and SDRs stop treating peer relationships as transactional",
      "AEs and SDRs learn to receive coaching without ego defense",
    ],
    duration: "~75 min",
    managerNote:
      "AEs and SDRs who finish Module 1 stop treating 1:1s as performance theater. You get more honest feedback in week 4 than in month 3 of an untrained AE/SDR.",
  },
  {
    number: "02",
    theme: "Working dynamics",
    description:
      "The invisible mechanics of the sales floor. Silos, the home office trap, and the ego friction between SDRs and AEs that quietly destroys pipeline.",
    lessons: [
      { number: "2.1", title: "Breaking Down Silos" },
      { number: "2.2", title: "The Ultimate Home Office Setup" },
      { number: "2.3", title: "Unpacking AE Ego and Building Healthy Dynamics" },
    ],
    outcomes: [
      "AEs and SDRs proactively cross silos (Marketing, RevOps, CS) without escalation",
      "AEs and SDRs build a workspace that supports 8-hour focus blocks",
      "AE/SDR pairs name the ego dynamic out loud and de-escalate it",
    ],
    duration: "~85 min",
    managerNote:
      "Module 2 ships the AE/SDR Alignment Contract as a takeaway. We've seen pairs use it to renegotiate handoff expectations within a week.",
  },
  {
    number: "03",
    theme: "Survival fundamentals",
    description:
      "What goes wrong, why it goes wrong, and how to survive AE management when you're the SDR. The most-cited module in user feedback.",
    lessons: [
      { number: "3.1", title: "SDR Performance Pitfalls" },
      { number: "3.2", title: "The Survival Guide for AEs and SDRs" },
      { number: "3.3", title: "Surviving AE Management" },
    ],
    outcomes: [
      "AEs and SDRs recognize the seven SDR breakpoints before they trigger",
      "AE/SDR pairs work the survival framework as a shared language",
      "SDRs handle hostile AE feedback without spiraling",
    ],
    duration: "~90 min",
    managerNote:
      "If you only have time to read one module yourself before rollout, read 3.3. It tells your AEs everything they're doing wrong with their SDRs that they think is normal.",
  },
  {
    number: "04",
    theme: "Navigating the org",
    description:
      "AEs and SDRs work for a manager, inside a culture, on a schedule. Module 4 covers all three: how to read a chaotic SDR manager, how to find purchase in a vague company culture, how to live the async life without dissolving into Slack.",
    lessons: [
      { number: "4.1", title: "Navigating the SDR Manager Madness" },
      { number: "4.2", title: "Simplifying Company Culture" },
      { number: "4.3", title: "Mastering the Async Life" },
    ],
    outcomes: [
      "AEs and SDRs map their manager's archetype and adapt without losing themselves",
      "AEs and SDRs recognize company-culture theater vs. real culture signal",
      "AEs and SDRs protect deep work in async environments — boundaries with Slack, calendar, and after-hours pings",
    ],
    duration: "~80 min",
    managerNote:
      "Ships the Manager Archetype Map as a takeaway tool. Surprisingly diagnostic for managers reading it themselves — most find their own archetype on the list.",
  },
  {
    number: "05",
    theme: "The playbook",
    flavor: "SDR",
    description:
      "What the SDR playbook actually is — and how to become the rep your manager can't replace. The most SDR-focused module in the curriculum; AEs benefit from 5.3 specifically.",
    lessons: [
      { number: "5.1", title: "The SDR Playbook" },
      { number: "5.2", title: "The SDR Playbook — Part 2" },
      { number: "5.3", title: "How to Become Irreplaceable" },
    ],
    outcomes: [
      "SDRs internalize the playbook framework (not the script — the framework)",
      "AEs and SDRs build personal practices that compound across quarters",
      "AEs and SDRs make themselves measurably harder to lose",
    ],
    duration: "~95 min",
    managerNote:
      "Module 5 is the closest AESDR comes to traditional SDR training content. It's still anti-script — but the playbook framework is concrete enough to coach SDRs against. AEs treat 5.3 as the standalone takeaway.",
  },
  {
    number: "06",
    theme: "What the playbook doesn't teach",
    description:
      "Beyond cadences and templates: networking that compounds, knowing just enough about your industry to be useful, and the moves that don't appear in any onboarding deck.",
    lessons: [
      { number: "6.1", title: "Beyond the Sales Playbook" },
      { number: "6.2", title: "Redefining Networking" },
      { number: "6.3", title: "The Power of Knowing Just Enough" },
    ],
    outcomes: [
      "AEs and SDRs build a real network instead of a LinkedIn-likes graph",
      "AEs and SDRs know enough about their buyer's industry to ask good questions",
      "AEs and SDRs stop conflating activity with sophistication",
    ],
    duration: "~80 min",
    managerNote:
      "Helpful for AEs and SDRs who've plateaued at month 6. The 'knowing just enough' framing reframes how they prep for discovery calls.",
  },
  {
    number: "07",
    theme: "Pipeline ownership",
    description:
      "Prospecting isn't the marketing team's problem to solve. Module 7 makes that explicit — and forces AEs and SDRs to confront whether SaaS is actually the career they want.",
    lessons: [
      { number: "7.1", title: "Prospecting Is Your Job Too" },
      { number: "7.2", title: "Why Self-Sourced Meetings Matter Most" },
      { number: "7.3", title: "Is Working in SaaS Even Worth It?" },
    ],
    outcomes: [
      "AEs and SDRs stop blaming inbound volume for pipeline shortfalls",
      "AEs and SDRs run self-sourcing cadences without manager prompting",
      "AEs and SDRs confront the SaaS-career question honestly, before it confronts them",
    ],
    duration: "~85 min",
    managerNote:
      "7.3 is the only place in the curriculum that gives AEs and SDRs explicit permission to quit. Some managers find this uncomfortable. We've kept it — AEs and SDRs respect the honesty and stay longer because of it.",
  },
  {
    number: "08",
    theme: "Hard truths",
    description:
      "The 30% rule, the illusion of potential, and the question every AE/SDR needs to ask but mostly doesn't. The harshest module — buyers should read it before they decide whether AESDR fits their culture.",
    lessons: [
      { number: "8.1", title: "The 30% Rule" },
      { number: "8.2", title: "Stop Chasing the Illusion of Potential" },
      { number: "8.3", title: "Are You the Problem?" },
    ],
    outcomes: [
      "AEs and SDRs apply the 30% rule to their own pipeline filtering",
      "AEs and SDRs stop investing in opportunities driven by their fantasy of the buyer's interest",
      "AEs and SDRs ask 'am I the problem' before assuming the company / manager / territory is",
    ],
    duration: "~75 min",
    managerNote:
      "If your culture is allergic to honest self-assessment, this module will land wrong. Strong fit for orgs that already practice candid 1:1s.",
  },
  {
    number: "09",
    theme: "The tools that ruin you",
    description:
      "CRM hygiene, Slack discipline, and the broader SaaS-sales-tool sprawl that fragments AE/SDR attention. Survival, not optimization.",
    lessons: [
      { number: "9.1", title: "CRM Survival Guide" },
      { number: "9.2", title: "Slack Survival Guide" },
      { number: "9.3", title: "Mastering the SaaS Sales Tools" },
    ],
    outcomes: [
      "AEs and SDRs maintain CRM hygiene without it consuming 40% of their week",
      "AEs and SDRs build Slack boundaries that protect deep work",
      "AEs and SDRs recognize which sales tools earn their place and which are organizational theater",
    ],
    duration: "~85 min",
    managerNote:
      "Ships the CRM Survival Guide as a takeaway. AEs and SDRs reference it during 1:1s for months. We've had managers ask if it's available standalone (it isn't).",
  },
  {
    number: "10",
    theme: "Commission + comp",
    description:
      "The commission myth, why most quotas are arbitrary, and how to live financially through feast-or-famine without breaking. Probably the most-needed module that gets least time in traditional training.",
    lessons: [
      { number: "10.1", title: "Breaking Down the Commission Myth" },
      { number: "10.2", title: "Quotas Are Bullshit" },
      { number: "10.3", title: "Living the Feast-or-Famine Life" },
    ],
    outcomes: [
      "AEs and SDRs understand their own comp plan well enough to spot when it's being changed",
      "AEs and SDRs stop letting quota-attainment anxiety distort their selling behavior",
      "AEs and SDRs build personal financial structures that survive the variable-comp cycle",
    ],
    duration: "~80 min",
    managerNote:
      "10.2 is bracing — it doesn't tell AEs and SDRs quotas don't matter, it tells them why most quota math is arbitrary. Forewarn your RevOps team if they're sensitive about it.",
  },
  {
    number: "11",
    theme: "Off-the-clock",
    description:
      "Selling sober, surviving conference culture, showing up at industry events as a professional rather than a network-spammer. The module that addresses what HR won't.",
    lessons: [
      { number: "11.1", title: "Sober Selling" },
      { number: "11.2", title: "Conference Culture" },
      { number: "11.3", title: "Professional Presence at Events" },
    ],
    outcomes: [
      "AEs and SDRs develop a sober-selling stance whether or not they drink",
      "AEs and SDRs navigate conferences as deliberate work, not vacation-with-business-cards",
      "AEs and SDRs build a credible professional presence at events without performing",
    ],
    duration: "~70 min",
    managerNote:
      "Especially relevant for orgs sending junior AEs and SDRs to Dreamforce, SaaStr, INBOUND, etc. Helpful to read before the conference, not after.",
  },
  {
    number: "12",
    theme: "Life outside work",
    description:
      "SaaS relationships, the home office trap (revisited from a different angle), and the contested final lesson on personal life in a high-output career. Closing module.",
    lessons: [
      { number: "12.1", title: "Leveling Up SaaS Relationships" },
      { number: "12.2", title: "Navigating the Home Office Trap" },
      { number: "12.3", title: "Why SDRs Should Stay Single" },
    ],
    outcomes: [
      "AEs and SDRs build sustainable peer relationships across companies",
      "AEs and SDRs don't let remote-first dissolve into 14-hour days at the same desk",
      "AEs and SDRs confront the personal-life-vs-career tradeoff with both eyes open",
    ],
    duration: "~75 min",
    managerNote:
      "12.3 is the most polarizing lesson in the curriculum. It's not what it sounds like — but the title gets attention. Worth previewing before rollout.",
  },
];

const TOTAL_LESSONS = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
const TOTAL_DURATION_MIN = MODULES.reduce(
  (sum, m) => sum + parseInt(m.duration.replace(/\D/g, ""), 10),
  0,
);

export default function CurriculumPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Curriculum</p>
          <h1 className={styles.heroHeadline}>The 12 modules, mapped.</h1>
          <p className={styles.heroSubhead}>
            Each module is three sub-lessons grouped around a single theme. AEs and SDRs work through them in sequence — typically one module per week over 12 weeks, though AEs and SDRs go faster or slower depending on density of their schedule.
          </p>
          <div className={styles.kpiRow}>
            <div className={styles.kpi}>
              <div className={styles.kpiNumber}>12</div>
              <div className={styles.kpiCaption}>Modules, each a coherent theme</div>
            </div>
            <div className={styles.kpi}>
              <div className={styles.kpiNumber}>{TOTAL_LESSONS}</div>
              <div className={styles.kpiCaption}>Sub-lessons, ~25 min each</div>
            </div>
            <div className={styles.kpi}>
              <div className={styles.kpiNumber}>~{Math.round(TOTAL_DURATION_MIN / 60)}h</div>
              <div className={styles.kpiCaption}>Total run-time across the program</div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.container}>
          <p className={styles.diagPathHint}>
            <strong>One curriculum, both audiences.</strong> AEs and SDRs work
            through the same modules in the same order. A few modules lean toward
            one role — those are tagged with a <strong>role flavor</strong> in the
            meta row (e.g., Module 5 is <strong>SDR-leaning</strong>). Everything
            else applies to both audiences equally.
          </p>
          {MODULES.map((m) => (
            <SpecSection
              key={m.number}
              number={m.number}
              title={m.theme}
              meta={[
                ...(m.flavor
                  ? [{ label: "Role flavor", value: `${m.flavor}-leaning` }]
                  : []),
                { label: "Lessons", value: m.lessons.map((l) => l.number).join(", ") },
                { label: "Duration", value: m.duration },
              ]}
            >
              <p className={styles.bodyMuted} style={{ marginBottom: 16 }}>
                {m.description}
              </p>

              <p className={styles.h4} style={{ marginTop: 8 }}>Lessons in this module</p>
              <ul className={styles.specList}>
                {m.lessons.map((l) => (
                  <li key={l.number}>
                    <strong style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)" }}>
                      {l.number}
                    </strong>
                    {" — "}
                    {l.title}
                  </li>
                ))}
              </ul>

              <p className={styles.h4} style={{ marginTop: 20 }}>Manager-facing outcomes</p>
              <ul className={styles.specList}>
                {m.outcomes.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>

              <div className={styles.specCallout}>
                <strong style={{ fontStyle: "normal", color: "var(--ink)" }}>Why managers care: </strong>
                {m.managerNote}
              </div>
            </SpecSection>
          ))}
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <h2 className={styles.h2}>Want a 5-minute preview of any lesson?</h2>
          <hr className={styles.divider} />
          <p className={styles.body}>
            Book a 30-minute walkthrough and we&apos;ll show you any module or lesson at depth, on your screen, in the actual product. No marketing reel, no edited highlights — the real lesson, exactly as your AEs and SDRs would see it.
          </p>
          <div style={{ marginTop: 20 }}>
            <InlineCTA href="/teams/contact?source=curriculum">Book a walkthrough</InlineCTA>
          </div>
        </div>
      </section>
    </>
  );
}
