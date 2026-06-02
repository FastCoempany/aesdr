import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import { Icon, type IconName } from "@/components/brand/Icon";
import {
  ClassifiedStamp,
  CornerBracket,
  GhostNumeral,
  Wordmark,
} from "@/components/brand/BrandAssets";
import KitMarkdownBody from "./KitMarkdownBody";

/**
 * Custom branded view for /x/kit/sample-partnership-agreement.
 *
 * Treatment: the document is the longest in the kit (~245 lines of legal-
 * adjacent prose). Wrap the markdown body in editorial framing instead of
 * rebuilding it as JSX — the legal language is the deliverable. The frame
 * does the work:
 *   • SAMPLE — not for signature watermark stamp at top
 *   • Hero with verdict-pose Leponeus + cornerbrackets
 *   • Ghost AESDR wordmark behind the body
 *   • A clean section index pulled out of the §1–§15 structure
 *   • The full agreement, formatted, in KitMarkdownBody
 */
export default function KitDocSampleAgreement({ html }: { html: string }) {
  return (
    <div style={{ color: "var(--ink, #1A1A1A)", position: "relative" }}>
      {/* ── Hero — verdict-pose Leponeus + sample stamp ── */}
      <section
        style={{
          background: "var(--cream, #FAF7F2)",
          border: "1px solid var(--ink, #1A1A1A)",
          padding: "36px 36px 34px",
          marginBottom: 40,
          position: "relative",
        }}
      >
        <CornerBracket
          position="tl"
          size={24}
          color="rgba(26,26,26,0.22)"
          style={{ position: "absolute", top: 10, left: 10 }}
        />
        <CornerBracket
          position="tr"
          size={24}
          color="rgba(26,26,26,0.22)"
          style={{ position: "absolute", top: 10, right: 10 }}
        />
        <CornerBracket
          position="bl"
          size={24}
          color="rgba(26,26,26,0.22)"
          style={{ position: "absolute", bottom: 10, left: 10 }}
        />
        <CornerBracket
          position="br"
          size={24}
          color="rgba(26,26,26,0.22)"
          style={{ position: "absolute", bottom: 10, right: 10 }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 28,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                color: "var(--crimson, #8B1A1A)",
                marginBottom: 16,
              }}
            >
              <ClassifiedStamp width={180} height={24} label="Sample" />
              <span
                style={{
                  fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
                  textTransform: "uppercase",
                  letterSpacing: ".24em",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Not for signature
              </span>
            </div>
            <h2
              style={{
                fontFamily:
                  "var(--display, 'Playfair Display', Georgia, serif)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(28px, 3.6vw, 42px)",
                lineHeight: 1.12,
                margin: 0,
                letterSpacing: "-0.005em",
              }}
            >
              The deal terms, in plain English. Read them before you apply.
            </h2>
            <p
              style={{
                fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontStyle: "italic",
                fontSize: 17,
                color: "var(--muted, #6B6B6B)",
                marginTop: 18,
                lineHeight: 1.6,
                maxWidth: 640,
              }}
            >
              A written representation of the contract AESDR currently uses.
              The agreement of record is a separate PDF reviewed by counsel
              and counter-signed after affiliate approval — where this
              sample and the executed PDF differ, the executed PDF
              controls. Nothing here is legal advice.
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Mascot pose="verdict" size={MASCOT_SIZE.card} />
          </div>
        </div>
      </section>

      {/* ── Section index — pulled out of the §1-§15 structure ── */}
      <section
        style={{
          marginBottom: 48,
          padding: "26px 28px 28px",
          background: "var(--cream, #FAF7F2)",
          border: "1px solid var(--light, #E8E4DF)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -10,
            right: -20,
            opacity: 0.7,
            pointerEvents: "none",
          }}
        >
          <GhostNumeral numeral="§" size={220} />
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".22em",
            fontSize: 12,
            color: "var(--crimson, #8B1A1A)",
            marginBottom: 16,
          }}
        >
          <Icon name="ledger" size={14} />
          The sections
        </div>
        <ol
          style={{
            position: "relative",
            zIndex: 1,
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "4px 18px",
          }}
        >
          {SECTIONS.map((s) => (
            <li
              key={s.n}
              style={{
                fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontSize: 15,
                lineHeight: 1.6,
                display: "flex",
                gap: 10,
                padding: "5px 0",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--mono, 'Space Mono', monospace)",
                  fontSize: 12,
                  color: "var(--crimson, #8B1A1A)",
                  fontWeight: 700,
                  minWidth: 24,
                }}
              >
                §{s.n}
              </span>
              {s.title}
            </li>
          ))}
        </ol>
      </section>

      {/* ── The agreement itself — markdown body with ghost wordmark behind ── */}
      <section style={{ position: "relative", overflow: "visible" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 24,
            right: -40,
            opacity: 0.35,
            pointerEvents: "none",
            transform: "rotate(-8deg)",
            zIndex: 0,
          }}
        >
          <Wordmark size={180} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <KitMarkdownBody html={html} />
        </div>
      </section>
    </div>
  );
}

const SECTIONS = [
  { n: 1, title: "Parties" },
  { n: 2, title: "Term and termination" },
  { n: 3, title: "What the Affiliate does" },
  { n: 4, title: "What AESDR does" },
  { n: 5, title: "Commission" },
  { n: 6, title: "Payments" },
  { n: 7, title: "Tracking and data" },
  { n: 8, title: "Promotional restrictions" },
  { n: 9, title: "Marks and intellectual property" },
  { n: 10, title: "Confidentiality" },
  { n: 11, title: "Representations and limited warranties" },
  { n: 12, title: "Indemnification" },
  { n: 13, title: "Limitation of liability" },
  { n: 14, title: "Governing law and disputes" },
  { n: 15, title: "General" },
];
