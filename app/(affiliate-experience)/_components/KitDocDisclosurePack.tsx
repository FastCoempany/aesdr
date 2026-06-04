import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import { Icon, type IconName } from "@/components/brand/Icon";
import { CornerBracket, GhostNumeral } from "@/components/brand/BrandAssets";

/**
 * Custom branded view for /x/kit/disclosure-language-pack.
 *
 * Treatment: the page is a specimen sheet of FTC-compliant disclosure
 * copy by surface. The verdict-pose Leponeus carries the seriousness;
 * each surface gets a glyphed card with the exact lift-verbatim language
 * rendered in a mono register so it reads as a code/snippet.
 */
export default function KitDocDisclosurePack() {
  return (
    <div style={{ color: "var(--ink, #1A1A1A)" }}>
      {/* ── Hero ── */}
      <section
        style={{
          background: "var(--cream, #FAF7F2)",
          border: "1px solid var(--ink, #1A1A1A)",
          padding: "36px 36px 34px",
          marginBottom: 56,
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 28,
            alignItems: "center",
          }}
        >
          <div>
            <Eyebrow icon="eye">FTC 16 CFR Part 255</Eyebrow>
            <h2
              style={{
                fontFamily:
                  "var(--display, 'Playfair Display', Georgia, serif)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(26px, 3.2vw, 38px)",
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: "-0.005em",
              }}
            >
              Most programs handwave disclosure. AESDR doesn&rsquo;t.
            </h2>
            <p
              style={{
                fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontSize: 17,
                color: "var(--muted, #6B6B6B)",
                marginTop: 18,
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            >
              If you have a material connection to AESDR — commission, comp,
              free access, anything — you disclose it, in plain language,
              near the recommendation, every time. The rules below aren&rsquo;t
              ours; they&rsquo;re the FTC&rsquo;s. We&rsquo;re just specific
              about how to satisfy them.
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Mascot pose="verdict" size={MASCOT_SIZE.card} />
          </div>
        </div>
      </section>

      {/* ── By surface — the specimen ── */}
      <section style={{ marginBottom: 56 }}>
        <SectionLabel icon="quill">By surface — lift verbatim</SectionLabel>
        <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
          {SURFACES.map((s) => (
            <SurfaceCard key={s.surface} entry={s} />
          ))}
        </div>
      </section>

      {/* ── Rules of thumb — four C's ── */}
      <section style={{ marginBottom: 56 }}>
        <SectionLabel icon="signal">Rules of thumb</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginTop: 22,
          }}
        >
          {[
            { k: "Clear", v: "Language a reasonable reader understands without a glossary." },
            { k: "Conspicuous", v: "Visible without scrolling, hovering, or expanding." },
            { k: "Close", v: "Adjacent to the recommendation, not banished to a footer." },
            { k: "Consistent", v: "The same disclosure on the same surface every time." },
          ].map((r, i) => (
            <div
              key={r.k}
              style={{
                padding: "22px 22px 24px 70px",
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
                  top: -8,
                  left: -8,
                  pointerEvents: "none",
                }}
              >
                <GhostNumeral numeral={`0${i + 1}`} size={110} />
              </div>
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontFamily:
                    "var(--display, 'Playfair Display', Georgia, serif)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 22,
                  marginBottom: 6,
                  letterSpacing: "-0.005em",
                }}
              >
                {r.k}.
              </div>
              <p
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontFamily:
                    "var(--serif, 'Source Serif 4', Georgia, serif)",
                  fontSize: 15,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {r.v}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What happens if you can't disclose ── */}
      <section
        style={{
          marginBottom: 56,
          background: "var(--ink, #1A1A1A)",
          color: "#FAF7F2",
          padding: "32px 36px 34px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "var(--crimson, #8B1A1A)",
          }}
        />
        <Eyebrow icon="warn" tone="dark">
          The fit signal
        </Eyebrow>
        <h3
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(22px, 2.8vw, 28px)",
            lineHeight: 1.3,
            margin: 0,
            letterSpacing: "-0.005em",
          }}
        >
          If you can&rsquo;t or won&rsquo;t disclose, we end the pilot.
        </h3>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 16,
            lineHeight: 1.65,
            margin: "18px 0 0",
            color: "rgba(250, 247, 242, 0.85)",
          }}
        >
          Not a punishment — a fit signal. Disclosure isn&rsquo;t optional
          for affiliates under FTC 16 CFR Part 255, and the brand we&rsquo;re
          building isn&rsquo;t compatible with shortcuts on it.
        </p>
      </section>

      {/* ── What we don't ask ── */}
      <section
        style={{
          padding: "28px 30px 30px",
          background: "var(--cream, #FAF7F2)",
          border: "1px solid var(--ink, #1A1A1A)",
        }}
      >
        <Eyebrow icon="ear">What we don&rsquo;t ask of you</Eyebrow>
        <p
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontStyle: "italic",
            fontSize: 22,
            lineHeight: 1.4,
            margin: 0,
            letterSpacing: "-0.005em",
          }}
        >
          We don&rsquo;t ask you to perform humility about earning the
          commission.
        </p>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 16,
            lineHeight: 1.7,
            margin: "16px 0 0",
            color: "var(--muted, #6B6B6B)",
          }}
        >
          The commission is an honest exchange — you brought the audience,
          we delivered the program, the buyer got fair value at list price.
          The disclosure says exactly that. There&rsquo;s nothing to
          apologize for.
        </p>
      </section>
    </div>
  );
}

function SurfaceCard({
  entry,
}: {
  entry: { surface: string; icon: IconName; lang: string; note?: string };
}) {
  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 24,
        padding: "22px 24px 24px",
        background: "var(--cream, #FAF7F2)",
        border: "1px solid var(--light, #E8E4DF)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 3,
          background: "var(--crimson, #8B1A1A)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          minWidth: 88,
        }}
      >
        <Icon
          name={entry.icon}
          size={24}
          style={{ color: "var(--crimson, #8B1A1A)" }}
        />
        <div
          style={{
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".18em",
            fontSize: 11,
            color: "var(--muted, #6B6B6B)",
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {entry.surface}
        </div>
      </div>
      <div>
        <code
          style={{
            display: "block",
            fontFamily: "var(--mono, 'Space Mono', monospace)",
            fontSize: 14,
            lineHeight: 1.6,
            padding: "14px 16px",
            background: "var(--ink, #1A1A1A)",
            color: "#FAF7F2",
            borderRadius: 2,
            borderLeft: "3px solid var(--crimson, #8B1A1A)",
          }}
        >
          {entry.lang}
        </code>
        {entry.note && (
          <p
            style={{
              fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
              fontStyle: "italic",
              fontSize: 14,
              color: "var(--muted, #6B6B6B)",
              margin: "10px 0 0",
              lineHeight: 1.55,
            }}
          >
            {entry.note}
          </p>
        )}
      </div>
    </article>
  );
}

function Eyebrow({
  icon,
  children,
  tone = "light",
}: {
  icon: IconName;
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
        textTransform: "uppercase",
        letterSpacing: ".24em",
        fontSize: 12,
        color: tone === "dark" ? "#b4455d" : "var(--crimson, #8B1A1A)",
        marginBottom: 12,
      }}
    >
      <Icon name={icon} size={14} />
      {children}
    </div>
  );
}

function SectionLabel({
  icon,
  children,
}: {
  icon: IconName;
  children: React.ReactNode;
}) {
  return (
    <h2
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
        textTransform: "uppercase",
        letterSpacing: ".22em",
        fontSize: 13,
        color: "var(--crimson, #8B1A1A)",
        margin: 0,
      }}
    >
      <Icon name={icon} size={14} />
      {children}
    </h2>
  );
}

const SURFACES: Array<{
  surface: string;
  icon: IconName;
  lang: string;
  note?: string;
}> = [
  {
    surface: "Newsletter / blog",
    icon: "quill",
    lang: "Affiliate disclosure: I earn a commission if you enroll through this link.",
    note: "Place near the link, not in the footer.",
  },
  {
    surface: "Social post / story",
    icon: "signal",
    lang: "#ad or #sponsored near the top of the caption or in the first text frame.",
    note: "Plain text, not buried in 30 hashtags.",
  },
  {
    surface: "Reel / video",
    icon: "cursor",
    lang: "Verbal disclosure within the first 10 seconds AND on-screen text that stays for the duration of the recommendation.",
  },
  {
    surface: "Live workshop",
    icon: "team",
    lang: "Verbal disclosure during the affiliate's intro AND on the registration page.",
  },
  {
    surface: "DM with affiliate link",
    icon: "discord",
    lang: "Heads up — I get a commission if you enroll.",
    note: "One line, in the same message as the link.",
  },
];
