import styles from "../teams.module.css";
import SpecSection from "../_components/SpecSection";
import InlineCTA from "../_components/InlineCTA";

/**
 * /teams/procurement — procurement-readiness one-pager.
 *
 * The single page a champion sends to their internal security / legal /
 * L&D team to unblock a Team-tier purchase. Frames AESDR honestly: what
 * we are, what we aren't, what we'll do under NDA, what's roadmap. Per
 * audit H.15.2 + H.6.4.
 */

export const metadata = {
  title: "Procurement — AESDR / for Teams",
  description:
    "What your security, legal, and L&D teams need to clear an AESDR / for Teams purchase. Honest state, no marketing-grade compliance puffery.",
  robots: { index: true, follow: true },
};

interface Item {
  number: string;
  title: string;
  state: "Live" | "Available on request" | "Roadmap" | "N/A";
  body: string;
}

const SECURITY: Item[] = [
  {
    number: "01",
    title: "Data hosting",
    state: "Live",
    body:
      "All AE / SDR data is stored in Supabase (Postgres) hosted on AWS us-east-1. Provisioned through the Supabase managed offering; we do not operate our own datacenter. Row-level security is enabled on every table that holds learner or org data.",
  },
  {
    number: "02",
    title: "Encryption in transit / at rest",
    state: "Live",
    body:
      "TLS 1.2+ for every connection (Vercel edge + Supabase pooler). At-rest data is encrypted by AWS RDS-managed Postgres with AES-256. Service-role keys are scoped to specific server functions and never shipped to the browser.",
  },
  {
    number: "03",
    title: "Authentication",
    state: "Live",
    body:
      "Email + password via Supabase Auth, with password hashing handled by Supabase (bcrypt). Passwords have a minimum 8-char rule and a 'temp password forces change on first login' flow for invited seats.",
  },
  {
    number: "04",
    title: "SSO (SAML 2.0)",
    state: "Roadmap",
    body:
      "We build SAML when the first procurement conversation requires it. Standard SP-initiated + IdP-initiated flows, JIT provisioning via attribute mapping. Estimated build: 1–2 weeks once your security team is on the other side.",
  },
  {
    number: "05",
    title: "Logging & audit",
    state: "Live",
    body:
      "Server-side event log (purchases, lesson completions, admin actions, partner-kit access). Retained 24 months. Available on request as a CSV export for any tenant covered under a Custom Enterprise agreement.",
  },
  {
    number: "06",
    title: "Vulnerability management",
    state: "Live",
    body:
      "Dependency auditing on every CI run. Critical CVE patches are deployed within 7 days, high within 30. Sentry monitors production for unhandled errors; PostHog and Vercel Analytics monitor performance.",
  },
  {
    number: "07",
    title: "Subprocessors",
    state: "Live",
    body:
      "Stripe (payments), Resend (transactional email), Supabase (database + auth), Vercel (hosting), Upstash (rate limiting), Sentry (error monitoring), PostHog (product analytics). Full list with purpose-of-use available on request.",
  },
];

const LEGAL: Item[] = [
  {
    number: "08",
    title: "Data Processing Agreement (DPA)",
    state: "Available on request",
    body:
      "Standard mutual DPA available for any Team-tier or Custom Enterprise purchase. GDPR Article 28 + UK addendum compliant. Signed within 5 business days of request.",
  },
  {
    number: "09",
    title: "Terms of Service",
    state: "Live",
    body:
      "Public terms at /terms. For Team / Custom Enterprise: a separate Master Services Agreement is available; we mark up your standard MSA or use our short form, both work.",
  },
  {
    number: "10",
    title: "Refund / cancellation",
    state: "Live",
    body:
      "Individual tier: 14-day, no-questions-asked refund. Team tier: 30 days, full refund of unused seats. Custom Enterprise: pro-rated cancellation per the executed agreement.",
  },
  {
    number: "11",
    title: "Privacy policy / data subject rights",
    state: "Live",
    body:
      "Public policy at /privacy. AE / SDR data is portable on request (CSV export of progress, role, study window, completion timestamps); deletable on request (full row removal within 30 days). Manager-tier admins can view aggregate progress for their team only.",
  },
  {
    number: "12",
    title: "Independent security audit / SOC 2",
    state: "Roadmap",
    body:
      "SOC 2 Type I is not yet completed. We're at an early stage where the operational cost of the audit exceeds the value to current customers; we build toward it when the first enterprise opportunity requires it. Honest state.",
  },
];

const LD: Item[] = [
  {
    number: "13",
    title: "Format",
    state: "Live",
    body:
      "Twelve self-paced interactive lessons (HTML, not video). Average lesson: ~25 minutes. Total: ~5 hours of structured content. Tooled with five take-home artefacts the learner uses on the job (alignment contract, pipeline math sheet, manager OS one-pager, comp survival map, 72-hour strike plan).",
  },
  {
    number: "14",
    title: "Completion tracking",
    state: "Live",
    body:
      "Per-learner: lesson opens, lesson completions, last-activity timestamp, and a five-dimension diagnostic (administered at start). Manager-tier admins see this aggregated for their roster; individual learners see only their own data.",
  },
  {
    number: "15",
    title: "L&D budget eligibility",
    state: "Live",
    body:
      "Receipt and invoice available immediately on purchase. Recognised under most L&D / professional-development budget categories. We provide a one-paragraph justification document on request, signed and on letterhead.",
  },
  {
    number: "16",
    title: "Custom diagnostic / org-specific tracking",
    state: "Available on request",
    body:
      "For Team / Custom Enterprise: we'll add up to two custom dimensions to the diagnostic (e.g., your sales methodology's named stages) within the existing five-dimension framework. Adds 1 week to provisioning.",
  },
  {
    number: "17",
    title: "Certificate of completion",
    state: "Live",
    body:
      "Each learner receives a named, dated certificate on completing all 12 lessons. PDF download; LinkedIn-shareable. The certificate names the learner only — there's no separate company-issued credential layer.",
  },
];

function group(label: string, eyebrow: string, items: Item[]) {
  return (
    <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.h2}>{label}</h2>
        <hr className={styles.divider} />
        {items.map((i) => (
          <SpecSection
            key={i.number}
            number={i.number}
            title={i.title}
            meta={[{ label: "State", value: i.state }]}
          >
            <p className={styles.bodyDense}>{i.body}</p>
          </SpecSection>
        ))}
      </div>
    </section>
  );
}

export default function ProcurementPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Procurement readiness</p>
          <h1 className={styles.heroHeadline}>
            Send this page to your security, legal, and L&amp;D teams.
          </h1>
          <p className={styles.heroSubhead}>
            One page covering what your reviewers usually ask for &mdash; data
            handling, DPA, refund terms, completion tracking, L&amp;D budget
            eligibility. Honest about what&apos;s live, what&apos;s available
            on request, and what&apos;s on the roadmap. We don&apos;t claim
            certifications we haven&apos;t earned.
          </p>
        </div>
      </section>

      {group(
        "Security & data handling",
        "Security",
        SECURITY
      )}

      {group("Legal & contracts", "Legal", LEGAL)}

      {group("Learning & development", "L&D", LD)}

      <section className={`${styles.sectionTight} ${styles.sectionDivider}`}>
        <div className={styles.containerNarrow}>
          <p className={styles.eyebrow}>Anything missing</p>
          <h2 className={styles.h2}>
            Bring the question. We&apos;ll answer honestly.
          </h2>
          <hr className={styles.divider} />
          <p className={styles.body}>
            If your procurement team needs something we haven&apos;t addressed
            here &mdash; a specific compliance attestation, a custom DPA term,
            an unusual data-residency requirement &mdash; tell us and
            we&apos;ll respond inside three business days with a real answer
            (yes / no / what it would take). We&apos;d rather lose a deal
            on truthful state than win it on a claim we have to walk back.
          </p>
          <div style={{ marginTop: 24 }}>
            <InlineCTA href="/teams/contact?source=procurement">
              Send a procurement question
            </InlineCTA>
          </div>
        </div>
      </section>
    </>
  );
}
