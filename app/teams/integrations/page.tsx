import styles from "../teams.module.css";
import SpecSection from "../_components/SpecSection";
import InlineCTA from "../_components/InlineCTA";

/**
 * /teams/integrations — what's live, what's planned.
 *
 * Honest state. We don't claim SSO is "available" when it isn't. Anything
 * marked "roadmap" gets built when the first partnership requiring it
 * signs. The honesty is itself a credential — most marketplaces puff up
 * their integration list and burn trust when partners discover the gap.
 */

export const metadata = {
  title: "Integrations — AESDR / Operating Layer",
  description: "What's live now and what's on the roadmap. Honest state, no marketing-grade integration lists.",
};

type Integration = {
  number: string;
  name: string;
  state: "Live" | "Roadmap" | "Custom";
  description: string;
  buildTrigger?: string;
};

const INTEGRATIONS: Integration[] = [
  {
    number: "01",
    name: "Email-based seat provisioning",
    state: "Live",
    description:
      "Partner sends a CSV of seat assignments (rep email + role + manager email). We email each rep individually with a sign-in link, set their manager's account flag for dashboard access, and confirm provisioning by EOD.",
  },
  {
    number: "02",
    name: "Manager dashboard",
    state: "Live",
    description:
      "Manager logs in with their email (set as team admin during provisioning). Sees a live view of every rep on their team: lessons completed, modules in progress, last-activity timestamp, and the diagnostic data once administered. Runs on the existing /admin/teams Supabase-backed surface.",
  },
  {
    number: "03",
    name: "Single Sign-On (SAML 2.0)",
    state: "Roadmap",
    description:
      "Standard SAML 2.0 SP-initiated and IdP-initiated flows. JIT user provisioning from the SAML attribute mapping (email, role, manager-email).",
    buildTrigger:
      "First Custom Enterprise client requiring SSO as a security gate. Estimated build: 1–2 weeks once a real partner is on the other side.",
  },
  {
    number: "04",
    name: "SCORM 1.2 export",
    state: "Roadmap",
    description:
      "Per-lesson SCORM 1.2 packages exportable from the AESDR backend. Importable into any SCORM-compliant LMS (Docebo, LearnUpon, TalentLMS, Moodle, etc.). Includes completion tracking and pass/fail signals.",
    buildTrigger:
      "First LMS partnership signed. The buyer-pull determines whether we need SCORM 1.2 or jump to 2004. Build: 2–3 weeks.",
  },
  {
    number: "05",
    name: "SCORM 2004 export",
    state: "Roadmap",
    description:
      "More granular completion tracking than SCORM 1.2 — sequence + navigation + interaction tracking. Better fit for modern LMS partners.",
    buildTrigger:
      "Same trigger as SCORM 1.2 — built alongside in the same sprint. Per-partner choice on which spec they need.",
  },
  {
    number: "06",
    name: "xAPI (Tin Can) statements",
    state: "Roadmap",
    description:
      "Real-time event statements emitted to a partner's Learning Record Store. Captures behavioral signal more granular than SCORM — e.g., 'rep watched 4 of 5 segments in lesson 3.2', 'rep replayed segment 2 twice'.",
    buildTrigger:
      "First LXP partnership (Docebo's LXP product, 360Learning, etc.). Build: 1–2 weeks given existing event tracking already in place.",
  },
  {
    number: "07",
    name: "LTI 1.3 (Learning Tools Interoperability)",
    state: "Roadmap",
    description:
      "Standard for embedding AESDR inside university and bootcamp LMS systems (Canvas, Moodle, Blackboard, Brightspace). Seat-based authentication via LTI launch parameters.",
    buildTrigger:
      "First university or bootcamp partnership. Build: 2–3 weeks.",
  },
  {
    number: "08",
    name: "REST API for seat provisioning",
    state: "Roadmap",
    description:
      "Programmatic seat creation, manager assignment, and progress query. For resellers and white-label partners managing high-volume seat allocations programmatically rather than via CSV.",
    buildTrigger:
      "First reseller wanting programmatic seat ops. Build: 1 week given the existing internal admin endpoints we already use.",
  },
  {
    number: "09",
    name: "Completion webhook",
    state: "Roadmap",
    description:
      "POST to a partner-supplied URL when a rep completes a module or hits a diagnostic milestone. Used to trigger downstream workflows (enablement platform updates, recruiter notifications, HR system updates).",
    buildTrigger:
      "First enablement-platform partnership where the partner wants AESDR completion to surface inside their dashboard. Build: 3–5 days.",
  },
  {
    number: "10",
    name: "Iframe embed of lessons",
    state: "Custom",
    description:
      "For white-label deals: AESDR lessons embedded as iframes inside the partner's product. Partner controls the chrome (nav, branding, header) while we deliver the lesson content. Domain whitelist required.",
    buildTrigger:
      "First white-label partnership. Build per-partner basis — security review and domain config requires partner-specific scoping.",
  },
];

export default function IntegrationsPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Integrations</p>
          <h1 className={styles.heroHeadline}>What&apos;s live now. What&apos;s on the way.</h1>
          <p className={styles.heroSubhead}>
            Honest state. Two integrations are live today; eight more are on the
            roadmap and get built when a real partner conversation generates the
            pull. We don&apos;t puff up the list — most marketplaces do, and it
            burns trust the first time a buyer asks for a feature that doesn&apos;t
            exist.
          </p>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>The integration list</p>
          <h2 className={styles.h2}>Ten integrations, sorted by state.</h2>
          <hr className={styles.divider} />

          {INTEGRATIONS.map((i) => (
            <SpecSection
              key={i.number}
              number={i.number}
              title={i.name}
              meta={[
                {
                  label: "State",
                  value: i.state,
                },
              ]}
            >
              <p className={styles.bodyDense} style={{ marginBottom: 12 }}>
                {i.description}
              </p>
              {i.buildTrigger && (
                <div className={styles.specCallout}>
                  <strong style={{ fontStyle: "normal", color: "var(--ink)" }}>
                    Build trigger:{" "}
                  </strong>
                  {i.buildTrigger}
                </div>
              )}
            </SpecSection>
          ))}
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <p className={styles.eyebrow}>How we sequence</p>
          <h2 className={styles.h2}>We don&apos;t build until we have a buyer.</h2>
          <hr className={styles.divider} />
          <p className={styles.body}>
            Most software companies build integration matrices ahead of the partnerships and then can&apos;t get the partnerships. We&apos;re doing the opposite: the partnership conversation comes first, then the integration is built against the partner&apos;s actual constraints.
          </p>
          <p className={styles.body}>
            For partners reading this and worrying about timeline: most of the listed integrations are 1–3 weeks of focused work. None of them require new infrastructure — they require adapter code against systems we already run. If your partnership is real, your integration is fast.
          </p>
        </div>
      </section>

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <p className={styles.eyebrow}>Custom integration</p>
          <h2 className={styles.h2}>Need something not on the list?</h2>
          <hr className={styles.divider} />
          <p className={styles.body}>
            Bring it. If your platform requires a different mechanism than the
            ten above, we&apos;ll scope it during the partnership conversation.
            We&apos;ve built around: enablement-platform progress dashboards,
            recruiter-platform certificate-of-completion endpoints, sales-coaching
            tool integration via Zapier-style triggers, custom analytics pipelines
            for partners running their own LRS. None of those are on the list
            yet because they were one-off — but the path is the same: scope first,
            build second, ship in a week or two.
          </p>
          <div style={{ marginTop: 24 }}>
            <InlineCTA href="/teams/contact?source=integrations">Talk about a custom integration</InlineCTA>
          </div>
        </div>
      </section>
    </>
  );
}
