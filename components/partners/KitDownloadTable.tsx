/**
 * Component: KitDownloadTable
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Page 1.4 — /partners/kit"
 * Canon: §6.5 (no decorative icons), §13 (honesty — kit is open, not gated)
 * Five-question check: PASS
 *
 * Three-column download table per spec. Operationally pending PDF rendering
 * pipeline; for Phase 1, links point to the markdown source files in the repo
 * (not a partner-facing render). Per Q3, the dedicated PDF rendering pipeline
 * lands as a follow-on; this component renders the table structure today and
 * the hrefs swap to /partner-kit/[file].pdf paths when PDFs are produced.
 */

type KitFile = {
  name: string;
  description: string;
  href: string;
  format: "pdf" | "md" | "docx" | "svg" | "png" | "pending";
};

type KitCategory = {
  category: string;
  blurb: string;
  files: KitFile[];
};

const KIT: KitCategory[] = [
  {
    category: "Reference Documents",
    blurb: "Read these to understand the brand and the program shape.",
    files: [
      {
        name: "Canon Excerpt for Partners",
        description: "Six sections of AFFILIATE_BRAND_CANON.md — doctrine, voice, banned vocab, lockup, FTC disclosure, honesty discipline.",
        href: "/partner-kit/00-canon-excerpt.pdf",
        format: "pending",
      },
      {
        name: "Positioning Brief (D21)",
        description: "Who AESDR is for, who it isn't for, what we ask of partners, what we do for partners.",
        href: "/partner-kit/D21-positioning-brief.pdf",
        format: "pending",
      },
      {
        name: "Approved + Forbidden Claims (D20)",
        description: "What partners can say about AESDR's outcomes. What they cannot.",
        href: "/partner-kit/D20-claims-sheet.pdf",
        format: "pending",
      },
      {
        name: "Disclosure Language Pack (D19)",
        description: "FTC-compliant disclosure phrasings, by surface (newsletter, social, reel, live, DM).",
        href: "/partner-kit/D19-disclosure-language-pack.pdf",
        format: "pending",
      },
      {
        name: "Pricing & Commission Sheet (D28)",
        description: "List pricing. Commission structure. Never-discount doctrine. Worked example.",
        href: "/partner-kit/D28-pricing-and-promo-sheet.pdf",
        format: "pending",
      },
      {
        name: "Curriculum Map (D31)",
        description: "12 courses. 36 lessons. Real questions on each card.",
        href: "/partner-kit/D31-curriculum-map.pdf",
        format: "pending",
      },
      {
        name: "L&D-Approver Brief (sample)",
        description: "One-page brief for the manager-approval conversation.",
        href: "/partner-kit/L-and-D-approver-brief.pdf",
        format: "pending",
      },
    ],
  },
  {
    category: "Promotional Copy (partner-customizable)",
    blurb: "Pre-cleared templates. Use as-is or submit edits for approval.",
    files: [
      {
        name: "Newsletter Launch Send (09a)",
        description: "Pre-cleared launch newsletter. Bracketed placeholders only.",
        href: "/partner-kit/09a-newsletter-launch.md",
        format: "md",
      },
      {
        name: "Newsletter Reminder Send (09b)",
        description: "Pre-cleared reminder send. Sent 3-5 days before workshop.",
        href: "/partner-kit/09b-newsletter-reminder.md",
        format: "md",
      },
      {
        name: "Podcast / Live Intro Scripts (09c)",
        description: "2-min live workshop intro + 60-sec podcast intro.",
        href: "/partner-kit/09c-podcast-intro-script.md",
        format: "md",
      },
      {
        name: "Six Pre-Cleared Social Posts (09d)",
        description: "LinkedIn / X / Bluesky variants for pre-, during-, post-workshop.",
        href: "/partner-kit/09d-social-pre-approved-posts.md",
        format: "md",
      },
    ],
  },
  {
    category: "Co-Brand Assets",
    blurb: "AESDR × Partner lockup files. Use as supplied.",
    files: [
      {
        name: "Lockup — Horizontal",
        description: "AESDR × [Partner] horizontal lockup, partner mark slot.",
        href: "/partner-kit/02-lockup-horizontal.svg",
        format: "svg",
      },
      {
        name: "Lockup — Stacked",
        description: "AESDR × [Partner] stacked lockup for square placements.",
        href: "/partner-kit/03-lockup-stacked.svg",
        format: "svg",
      },
      {
        name: "Lockup Usage Guide (10d)",
        description: "Color rules, sizing, clearspace, where it goes, where it doesn't.",
        href: "/partner-kit/10d-lockup-usage-guide.pdf",
        format: "pending",
      },
    ],
  },
  {
    category: "Operating Cadence",
    blurb: "What happens in what week of a 30-day pilot.",
    files: [
      {
        name: "30-Day Pilot Operating Cadence (13)",
        description: "Day-by-day. Pre-launch through pilot-close.",
        href: "/partner-kit/13-operating-cadence.pdf",
        format: "pending",
      },
    ],
  },
];

export function KitDownloadTable() {
  return (
    <section
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "64px 24px 0",
      }}
    >
      {KIT.map((cat) => (
        <div key={cat.category} style={{ marginBottom: 64 }}>
          <div
            style={{
              fontFamily: "var(--cond)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 8,
            }}
          >
            {cat.category}
          </div>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: 16,
              color: "var(--muted)",
              marginBottom: 24,
            }}
          >
            {cat.blurb}
          </p>
          <div style={{ borderTop: "1px solid var(--light)" }}>
            {cat.files.map((f) => (
              <article
                key={f.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px",
                  gap: 24,
                  padding: "20px 0",
                  borderBottom: "1px solid var(--light)",
                  alignItems: "center",
                }}
                className="aesdr-kit-row"
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--display)",
                      fontStyle: "italic",
                      fontWeight: 700,
                      fontSize: 19,
                      color: "var(--ink)",
                      marginBottom: 6,
                    }}
                  >
                    {f.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: 14,
                      color: "var(--muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {f.description}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {f.format === "pending" ? (
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                        padding: "8px 14px",
                        border: "1px dashed var(--light)",
                        display: "inline-block",
                      }}
                    >
                      PDF pending
                    </span>
                  ) : (
                    <a
                      href={f.href}
                      download
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--ink)",
                        padding: "8px 14px",
                        border: "1px solid var(--ink)",
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                    >
                      Download {f.format}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
      <p
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 15,
          color: "var(--muted)",
          textAlign: "center",
          padding: "32px 0 0",
          maxWidth: 720,
          margin: "0 auto",
          lineHeight: 1.7,
        }}
      >
        Three files you&rsquo;ll receive after you sign D22, not before: per-partner UTM-tagged tracking links; per-partner co-brand lockup compositions; the partner pilot agreement itself (counsel-reviewed). Reasoning: those three are operationally specific to your pilot, not pre-clearable.
      </p>
    </section>
  );
}
