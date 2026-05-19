import styles from "../enterprise.module.css";
import SpecSection from "../_components/SpecSection";
import InlineCTA from "../_components/InlineCTA";

/**
 * /enterprise/implementation — manager rollout guide.
 *
 * Week-by-week structure for rolling AESDR across a team. Written for
 * managers who haven't bought yet — gives them enough detail to know
 * what they're committing to and whether it'll work for their culture.
 *
 * This page IS the Manager Implementation Guide. Print-friendly via
 * CSS print styles in enterprise.module.css. PR 4 ships the PDF version.
 */

export const metadata = {
  title: "Implementation guide — AESDR / Enterprise",
  description: "How to roll AESDR out across your sales team. Week-by-week sequence, manager touchpoints, common mistakes.",
};

export default function ImplementationPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Implementation guide</p>
          <h1 className={styles.heroHeadline}>How to roll AESDR out across your team.</h1>
          <p className={styles.heroSubhead}>
            Read this before you decide whether to buy. The whole guide is on this page — no form-gating, no &ldquo;contact sales for full details.&rdquo; If the rollout doesn&apos;t fit your operating culture, you should know that now.
          </p>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <p className={styles.eyebrow}>Before you start</p>
          <h2 className={styles.h2}>What rollout assumes about you.</h2>
          <hr className={styles.divider} />
          <ul className={styles.bulletList}>
            <li>
              You&apos;ll read the curriculum in parallel with your AEs and SDRs. Not all 36 lessons, but at least the modules they&apos;re currently working through.
            </li>
            <li>
              You&apos;ll hold weekly 1:1s with each AE/SDR where AESDR is on the agenda for ~5 minutes. Just enough to ask &ldquo;what landed&rdquo; and &ldquo;what felt wrong.&rdquo;
            </li>
            <li>
              You won&apos;t treat completion as the goal. The goal is AE/SDR behavior change, measured by the diagnostic (week 0 / week 8). AEs and SDRs who race to finish but don&apos;t change behavior have wasted the program.
            </li>
            <li>
              You&apos;ll let AEs and SDRs who push back push back. Some lessons (8.x, 10.x, 12.3) are deliberately provocative. AEs and SDRs who hate them often have the most to learn from them.
            </li>
          </ul>
          <p className={styles.bodyMuted} style={{ marginTop: 16 }}>
            If any of those four feel implausible for your team culture, talk to us before buying. Some orgs aren&apos;t fits — we&apos;d rather catch that now.
          </p>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>The 8-week sequence</p>
          <h2 className={styles.h2}>Week by week.</h2>
          <hr className={styles.divider} />

          <SpecSection
            number="00"
            title="Week 0 — Before kickoff"
            meta={[{ label: "Time", value: "~3 hours, manager-led" }]}
          >
            <ul className={styles.bulletList}>
              <li>Administer the diagnostic — self-report instrument to each AE/SDR, manager rating sheet for yourself (per-AE/SDR). ~30 min per AE/SDR, ~30 min for your ratings.</li>
              <li>Run a 30-min team announcement. Say: &ldquo;We&apos;re bringing AESDR in. Here&apos;s why. Here&apos;s what I expect from you. Here&apos;s what I will and won&apos;t enforce.&rdquo;</li>
              <li>Identify two AEs and SDRs in advance: the AE/SDR who needs the most support, and the AE/SDR most likely to evangelize. Plan extra check-ins with the first; let the second carry social energy.</li>
              <li>Block the eight weekly 1:1 slots for AESDR-specific discussion. Five minutes each, embedded in your existing 1:1.</li>
            </ul>
            <div className={styles.specCallout}>
              <strong style={{ fontStyle: "normal", color: "var(--ink)" }}>Common skip: </strong>
              Managers skip the team announcement and just send a Slack message. Don&apos;t. The 30-minute live framing is worth 4 weeks of compliance theater.
            </div>
          </SpecSection>

          <SpecSection
            number="01"
            title="Weeks 1–2 — Foundations"
            meta={[
              { label: "Modules", value: "01 Foundations · 02 Working dynamics" },
              { label: "Lessons", value: "1.1, 1.2, 1.3, 2.1, 2.2, 2.3" },
              { label: "AE/SDR time", value: "~3 hrs over the two weeks" },
            ]}
          >
            <p className={styles.bodyDense} style={{ marginBottom: 12 }}>
              The structure-building foundation. AEs and SDRs learn to run their own
              weeks, build peer relationships, and accept coaching. Module 2
              introduces the AE/SDR Alignment Contract as the first takeaway
              tool.
            </p>
            <p className={styles.h4}>Manager touchpoints this fortnight</p>
            <ul className={styles.bulletList}>
              <li>Week 1 1:1: ask each AE/SDR &ldquo;What surprised you in 1.1 Creating Structure?&rdquo; Listen, don&apos;t coach.</li>
              <li>Week 2 1:1: ask each AE/SDR pair to bring their AE/SDR Alignment Contract to the joint pod meeting. Discuss as a team.</li>
              <li>End of week 2: 15-min team retro. &ldquo;What from Modules 1–2 is changing how you&apos;re working?&rdquo;</li>
            </ul>
          </SpecSection>

          <SpecSection
            number="02"
            title="Weeks 3–4 — Survival fundamentals"
            meta={[
              { label: "Modules", value: "03 Survival · 04 Navigating the org" },
              { label: "Lessons", value: "3.1, 3.2, 3.3, 4.1, 4.2, 4.3" },
              { label: "AE/SDR time", value: "~3 hrs over the two weeks" },
            ]}
          >
            <p className={styles.bodyDense} style={{ marginBottom: 12 }}>
              The most-cited modules in user feedback. Module 3 covers the seven SDR breakpoints and what surviving AE management looks like in practice. Module 4 builds out the Manager Archetype Map.
            </p>
            <p className={styles.h4}>Manager touchpoints this fortnight</p>
            <ul className={styles.bulletList}>
              <li>Pre-read 3.3 (Surviving AE Management) yourself, before AEs and SDRs do. Some content will feel personal. It&apos;s not — but you&apos;ll want to have processed it before you discuss it.</li>
              <li>Week 4 1:1: ask &ldquo;Which manager archetype am I, based on 4.1?&rdquo; If you don&apos;t have a stomach for this question, skip it — but it&apos;s the most diagnostic 30 seconds you&apos;ll spend.</li>
              <li>First peer-discussion session: 30-min team discussion at end of week 4. Topic: &ldquo;Where in the org are we still in survival mode?&rdquo;</li>
            </ul>
          </SpecSection>

          <SpecSection
            number="03"
            title="Weeks 5–6 — Playbook + beyond"
            meta={[
              { label: "Modules", value: "05 The playbook · 06 What the playbook doesn't teach" },
              { label: "Lessons", value: "5.1, 5.2, 5.3, 6.1, 6.2, 6.3" },
              { label: "AE/SDR time", value: "~3.5 hrs over the two weeks" },
            ]}
          >
            <p className={styles.bodyDense} style={{ marginBottom: 12 }}>
              The closest AESDR comes to traditional SDR training. Module 5 is the framework AEs and SDRs will coach against for the rest of their career. Module 6 builds out networking + curiosity skills the playbook leaves out.
            </p>
            <p className={styles.h4}>Manager touchpoints this fortnight</p>
            <ul className={styles.bulletList}>
              <li>Week 5 1:1: ask &ldquo;What from 5.3 (Becoming Irreplaceable) would actually make you harder to lose if you started this week?&rdquo; Then make a plan to start it this week.</li>
              <li>Week 6 1:1: pull one of the lessons-by-name into normal coaching. Don&apos;t make AESDR a separate sidebar — integrate.</li>
              <li>Mid-program &ldquo;what&apos;s stuck&rdquo; review: 30-min team discussion at end of week 6. Topic: &ldquo;What from weeks 1–6 hasn&apos;t landed yet? What are we resisting?&rdquo;</li>
            </ul>
          </SpecSection>

          <SpecSection
            number="04"
            title="Weeks 7–8 — Pipeline + hard truths + tools"
            meta={[
              { label: "Modules", value: "07 Pipeline ownership · 08 Hard truths · 09 The tools that ruin you" },
              { label: "Lessons", value: "7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 9.1, 9.2, 9.3" },
              { label: "AE/SDR time", value: "~4.5 hrs over the two weeks" },
            ]}
          >
            <p className={styles.bodyDense} style={{ marginBottom: 12 }}>
              The harshest stretch. 7.3 gives AEs and SDRs explicit permission to question whether SaaS is right for them. 8.x asks them whether they&apos;re the problem. 9.x ships the CRM Survival Guide as a permanent takeaway tool.
            </p>
            <p className={styles.h4}>Manager touchpoints this fortnight</p>
            <ul className={styles.bulletList}>
              <li>Brace for one or two AEs and SDRs to surface &ldquo;maybe I&apos;m not cut out for this.&rdquo; Take it seriously. Some of those AEs and SDRs need to leave; some need to be reassured. The conversation matters either way.</li>
              <li>Week 8 1:1: re-administer the diagnostic. Compare against week 0. Spend the 1:1 discussing the delta, not the lessons themselves.</li>
              <li>End of week 8: 60-min team wrap-up. Topic: &ldquo;What did we learn? What are we doing differently? Which two AEs and SDRs changed the most, and what did they do?&rdquo;</li>
            </ul>
            <div className={styles.specCallout}>
              <strong style={{ fontStyle: "normal", color: "var(--ink)" }}>Note about modules 10–12: </strong>
              The 8-week structured rollout covers modules 1–9. Modules 10–12 (commission/comp, off-the-clock, life outside work) are best worked through individually over the following months, not in cohort format. AEs and SDRs engage with them when relevant — they&apos;re standalone enough to be self-paced.
            </div>
          </SpecSection>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <p className={styles.eyebrow}>Five takeaway tools</p>
          <h2 className={styles.h2}>What AEs and SDRs walk out with.</h2>
          <hr className={styles.divider} />
          <p className={styles.body}>
            AESDR ships five tools that live outside the course. AEs and SDRs keep them, use them, modify them, share them with peers. Each one comes from a specific lesson but works standalone.
          </p>
          <ul className={styles.bulletList}>
            <li>
              <strong>Manager Archetype Map.</strong> Eight manager archetypes,
              what they value, what they reward, what they punish. From Lesson 4.1.
            </li>
            <li>
              <strong>AE/SDR Alignment Contract.</strong> A two-page working
              agreement between paired SDR and AE. Handoff expectations, escalation
              triggers, mutual commitments. From Module 2.
            </li>
            <li>
              <strong>72-Hour Strike Plan.</strong> A structured recovery plan for
              the week after a major deal loss or quota miss. From Lesson 3.2.
            </li>
            <li>
              <strong>CRM Survival Guide.</strong> A working manual for
              maintaining clean CRM without consuming 40% of the week. From
              Lesson 9.1.
            </li>
            <li>
              <strong>Async Cadence Template.</strong> Daily / weekly / monthly
              rhythms for managing Slack, email, deep-work blocks. From Module 4.
            </li>
          </ul>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <p className={styles.eyebrow}>Common mistakes</p>
          <h2 className={styles.h2}>What managers get wrong.</h2>
          <hr className={styles.divider} />
          <ul className={styles.bulletList}>
            <li>
              <strong>Treating it like compliance training.</strong> Forcing AEs and SDRs to
              finish modules by Friday stalls engagement and produces clicked-through
              completion without behavior change. The goal is change, not completion.
            </li>
            <li>
              <strong>Skipping the manager&apos;s parallel reading.</strong> AEs and SDRs notice
              when their manager hasn&apos;t read the lessons they&apos;re discussing. It
              creates a knowledge gap that costs you authority for the rest of the
              program.
            </li>
            <li>
              <strong>Pushing AEs and SDRs to finish in 4 weeks.</strong> The 8-week design
              isn&apos;t arbitrary — it&apos;s spaced repetition. AEs and SDRs need time between
              lessons to apply, fail, reflect, then apply again. Compressing it
              defeats the curriculum&apos;s mechanism.
            </li>
            <li>
              <strong>Running peer discussions before week 4.</strong> The team
              hasn&apos;t built trust yet. The first peer discussion lands hollow.
              Start them at end of week 4, after Module 3 (Survival) has given
              AEs and SDRs a shared language.
            </li>
            <li>
              <strong>Tracking only completion.</strong> Completion is necessary,
              not sufficient. Track behavior change via the diagnostic. If AEs and SDRs
              are completing without diagnostic delta, something is wrong with
              how you&apos;re running the rollout, not with the curriculum.
            </li>
            <li>
              <strong>Holding AEs and SDRs who push back accountable for compliance.</strong>{" "}
              AEs and SDRs who push back hardest on lessons 8.x are often the AEs and SDRs with the
              most to learn from them. Let the resistance happen. Coach the
              resistance separately, in 1:1.
            </li>
          </ul>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <h2 className={styles.h2}>Ready to scope a rollout?</h2>
          <hr className={styles.divider} />
          <p className={styles.body}>
            Best fit calls cover three things: your team composition (SDR/AE mix, tenure distribution, recent hires), your manager culture (how 1:1s actually run today, what you can and can&apos;t enforce), and your timeline (when AEs and SDRs need to be productive). 30 minutes is enough to know whether AESDR is a fit or not.
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <InlineCTA href="/enterprise/contact?source=implementation">Scope a rollout</InlineCTA>
            <InlineCTA href="/enterprise/diagnostic" variant="arrow">
              Read the diagnostic spec
            </InlineCTA>
            <InlineCTA href="/enterprise/downloads/certificate" variant="arrow">
              Certificate generator
            </InlineCTA>
          </div>
          <p className={styles.bodyMuted} style={{ marginTop: 20, fontSize: 14 }}>
            This page is the implementation guide. Press{" "}
            <strong style={{ color: "var(--ink)" }}>Cmd+P</strong> /{" "}
            <strong style={{ color: "var(--ink)" }}>Ctrl+P</strong> to save it as a PDF —
            the nav and CTAs collapse out automatically, you get a printable manager guide.
          </p>
        </div>
      </section>
    </>
  );
}
