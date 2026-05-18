import styles from "../../teams.module.css";
import PrintButton from "../../_components/PrintButton";

/**
 * /teams/downloads/partner-one-pager — single-page printable.
 *
 * Compressed version of /teams/partners for attaching to outbound emails
 * or handing to a partner in a conversation. Letter portrait, fits on
 * one page when printed.
 */

export const metadata = {
  title: "Partner one-pager — AESDR / for Teams",
  description: "Single-page partner brief. Positioning, partner categories, contact.",
};

const CATEGORIES = [
  {
    name: "LMS / LXP platforms",
    examples: "Docebo, 360Learning, Absorb, LearnUpon, Moodle Workplace",
  },
  {
    name: "Sales enablement",
    examples: "Highspot, Mindtickle, Spekit, Allego, Showpad, Seismic",
  },
  {
    name: "Sales hiring & assessment",
    examples: "Sales Assembly, Bravado, Aspireship, Uvaro, Victory Lap",
  },
  {
    name: "Fractional RevOps & outsourced SDR",
    examples: "Memory, Operatus, CIENCE, MarketStar, Belkins, SalesRoads",
  },
];

export default function PartnerOnePagerPage() {
  return (
    <section className={styles.section} style={{ paddingTop: 24 }}>
      <div className={styles.container} style={{ maxWidth: 880 }}>
        <PrintButton label="Partner one-pager" format="letter portrait · 1 page" />

        <article className={styles.onepageContainer}>
          {/* Header */}
          <header className={styles.onepageHeader}>
            <span>
              <span className={styles.certMark}>AESDR</span>
              <span className={styles.certMarkSuffix}>/ for Teams</span>
            </span>
            <span className={styles.certSerial}>Partner brief · 2026</span>
          </header>

          {/* Hero */}
          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: 26,
              fontWeight: 900,
              fontStyle: "italic",
              lineHeight: 1.15,
              color: "var(--ink)",
              margin: "0 0 8px",
              maxWidth: "26ch",
            }}
          >
            The training your first- and second-year SDRs and AEs should already have.
          </h1>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: 14,
              lineHeight: 1.5,
              color: "var(--muted)",
              margin: "0 0 16px",
              maxWidth: "60ch",
            }}
          >
            Twelve modules, 36 sub-lessons. Built on aesdr.com — the course junior SDRs
            and AEs pay for out of their own pocket. Packaged for sales orgs and channel
            partners who already serve the SDR/AE audience but don&apos;t produce the
            training their customers ask for.
          </p>

          {/* Three stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
              margin: "14px 0",
            }}
          >
            <div className={styles.onepageStat}>
              <div className={styles.onepageStatNum}>8.4 mo</div>
              <div className={styles.onepageStatCaption}>SDR ramp time, current avg</div>
            </div>
            <div className={styles.onepageStat}>
              <div className={styles.onepageStatNum}>39%</div>
              <div className={styles.onepageStatCaption}>First-year SDR turnover, SaaS</div>
            </div>
            <div className={styles.onepageStat}>
              <div className={styles.onepageStatNum}>$115K</div>
              <div className={styles.onepageStatCaption}>Cost of one failed SDR hire</div>
            </div>
          </div>

          {/* What it is */}
          <h2 className={styles.onepageH2}>What it is</h2>
          <p className={styles.onepageBody}>
            12 modules × 3 sub-lessons (36 total, ~16 hours run-time). Five takeaway tools
            AEs and SDRs keep (manager archetype map, AE/SDR alignment contract, 72-hour strike plan,
            CRM survival guide, async cadence template). Eight-dimension before/after
            diagnostic for measuring behavior change. Discord community.
          </p>

          {/* Partner categories */}
          <h2 className={styles.onepageH2}>Who we partner with</h2>
          <div className={styles.onepageCategoryList}>
            {CATEGORIES.map((c) => (
              <div key={c.name} className={styles.onepageCategory}>
                <strong>{c.name}</strong>
                <span>{c.examples}</span>
              </div>
            ))}
          </div>

          {/* Revenue model */}
          <h2 className={styles.onepageH2}>Partnership models</h2>
          <p className={styles.onepageBody}>
            <strong>Referral:</strong> 15–20% of first-year revenue on qualified leads.{" "}
            <strong>Reseller:</strong> 60% wholesale, partner sets retail.{" "}
            <strong>White-label:</strong> Co-branded delivery, per-seat wholesale.{" "}
            <strong>Marketplace listing:</strong> Standard marketplace cut. Custom terms
            scoped during partnership conversation. No exclusivity, no minimums.
          </p>

          {/* Integrations */}
          <h2 className={styles.onepageH2}>Integrations</h2>
          <p className={styles.onepageBody}>
            <strong>Live:</strong> email-based seat provisioning, manager dashboard.{" "}
            <strong>Roadmap:</strong> SSO (SAML 2.0), SCORM 1.2 / SCORM 2004, xAPI, LTI 1.3,
            REST API, completion webhook, iframe embed. Built per-partnership in 1–3 weeks
            when the conversation is real.
          </p>

          {/* Contact */}
          <div className={styles.onepageContact}>
            <span>Inquiries</span>
            <span>
              <a href="mailto:hello@aesdr.com?subject=%5B%2Fteams%5D%20Partnership">
                hello@aesdr.com
              </a>
              {" · "}
              aesdr.com/teams
            </span>
          </div>
        </article>

        <div className={styles.downloadHowto}>
          <strong>To save:</strong> click <strong>Print / Save as PDF</strong> above, set
          orientation to <strong>Portrait</strong>, paper size <strong>Letter</strong> (or
          A4 in EU markets). The print stylesheet hides the AESDR site nav, footer, and
          print bar — you get a clean one-page PDF.
        </div>
      </div>
    </section>
  );
}
