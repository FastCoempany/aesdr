import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import { Icon } from "@/components/brand/Icon";

/**
 * Custom branded view for /x/kit/approved-claims.
 *
 * Treatment: pull-quotes for the pre-cleared phrasings (each rendered as
 * editorial verbatim, with a small `quill` glyph as the attribution mark),
 * a three-card "walked back" panel with crimson rails, the senior-AE/SDR
 * fundamentals addage as its own callout block, and the kit's standard
 * doctrine-pose Leponeus in the hero.
 */
export default function KitDocApprovedClaims() {
  return (
    <div style={{ color: "var(--ink, #1A1A1A)" }}>
      {/* ── Hero ── */}
      <section
        style={{
          background: "var(--cream, #FAF7F2)",
          border: "1px solid var(--ink, #1A1A1A)",
          padding: "36px 36px 34px",
          marginBottom: 56,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 28,
          alignItems: "center",
        }}
      >
        <div>
          <Eyebrow icon="quill">Pre-cleared phrasings</Eyebrow>
          <h2 style={leadH}>
            Lift these verbatim, or adapt while keeping the factual claim
            intact.
          </h2>
          <p style={leadP}>
            The spirit is plainness — describe what AESDR is, not what AESDR
            will do for someone who hasn&rsquo;t done the work yet.
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Mascot pose="doctrine" size={MASCOT_SIZE.card} />
        </div>
      </section>

      {/* ── The verbatim pull-quotes ── */}
      <section style={{ marginBottom: 56 }}>
        <SectionLabel icon="quill">Verbatim — clear any audience</SectionLabel>
        <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
          {VERBATIM.map((q, i) => (
            <PullQuote key={i} text={q} />
          ))}
        </div>
      </section>

      {/* ── The new addage: senior fundamentals ── */}
      <section
        style={{
          marginBottom: 56,
          background: "var(--ink, #1A1A1A)",
          color: "#FAF7F2",
          padding: "36px 36px 34px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background:
              "linear-gradient(90deg, var(--crimson, #8B1A1A), #b4455d, #8B5CF6)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".24em",
            fontSize: 11,
            color: "#b4455d",
            marginBottom: 12,
          }}
        >
          <Icon name="recovery" size={14} style={{ color: "#b4455d" }} />
          Also pre-cleared — the senior audience
        </div>
        <h3
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(22px, 2.6vw, 30px)",
            lineHeight: 1.25,
            margin: 0,
            letterSpacing: "-0.005em",
          }}
        >
          &ldquo;AESDR isn&rsquo;t only for the first-two-year AE or SDR.
          It&rsquo;s equally for the senior operator who got promoted past
          the fundamentals and wants to come back to the operating discipline
          they skipped the first time. We don&rsquo;t sell mastery —{" "}
          <em>we sell the floor under it</em>.&rdquo;
        </h3>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 16,
            lineHeight: 1.6,
            margin: "18px 0 0",
            color: "rgba(250, 247, 242, 0.78)",
          }}
        >
          Lift this verbatim or rework it for your audience. Use it whenever
          you&rsquo;re recommending AESDR to a senior list and the
          first-2-year framing would feel off.
        </p>
      </section>

      {/* ── Plain facts ── */}
      <section style={{ marginBottom: 56 }}>
        <SectionLabel icon="ledger">
          Plain facts — phrase them however fits your voice
        </SectionLabel>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "22px 0 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {FACTS.map((f) => (
            <li
              key={f}
              style={{
                padding: "16px 18px 16px 20px",
                borderLeft: "3px solid var(--crimson, #8B1A1A)",
                background: "var(--cream, #FAF7F2)",
                fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontSize: 15,
                lineHeight: 1.55,
              }}
            >
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Three walked-back categories ── */}
      <section style={{ marginBottom: 56 }}>
        <SectionLabel icon="warn">Claims that get walked back</SectionLabel>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 16,
            color: "var(--muted, #6B6B6B)",
            margin: "8px 0 22px",
            lineHeight: 1.6,
          }}
        >
          Three categories of claim to avoid — don&rsquo;t write copy that
          implies any of them.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {WALKED_BACK.map((w) => (
            <article
              key={w.heading}
              style={{
                border: "1px solid var(--ink, #1A1A1A)",
                padding: "22px 22px 24px",
                background: "var(--cream, #FAF7F2)",
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
              <h3
                style={{
                  fontFamily:
                    "var(--display, 'Playfair Display', Georgia, serif)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 20,
                  margin: "4px 0 10px",
                  letterSpacing: "-0.005em",
                }}
              >
                {w.heading}
              </h3>
              <p
                style={{
                  fontFamily:
                    "var(--serif, 'Source Serif 4', Georgia, serif)",
                  fontSize: 15,
                  lineHeight: 1.6,
                  margin: 0,
                  color: "var(--ink, #1A1A1A)",
                }}
              >
                {w.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Approval workflow CTA ── */}
      <section
        style={{
          padding: "26px 28px 28px",
          border: "1px solid var(--light, #E8E4DF)",
          background: "var(--cream, #FAF7F2)",
        }}
      >
        <Eyebrow icon="eye">When a draft is between buckets</Eyebrow>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 17,
            lineHeight: 1.7,
            margin: "10px 0 0",
          }}
        >
          Send it through the approval workflow before publishing. A 48-hour
          approval round is cheaper than asking us to walk back a published
          claim — for both of us.
        </p>
      </section>
    </div>
  );
}

const leadH: React.CSSProperties = {
  fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
  fontStyle: "italic",
  fontWeight: 700,
  fontSize: "clamp(24px, 3vw, 34px)",
  lineHeight: 1.2,
  margin: 0,
  letterSpacing: "-0.005em",
};

const leadP: React.CSSProperties = {
  fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
  fontSize: 17,
  fontStyle: "italic",
  color: "var(--muted, #6B6B6B)",
  margin: "14px 0 0",
  lineHeight: 1.6,
};

function Eyebrow({
  icon,
  children,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  children: React.ReactNode;
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
        color: "var(--crimson, #8B1A1A)",
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
  icon: React.ComponentProps<typeof Icon>["name"];
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
        margin: "0 0 6px",
      }}
    >
      <Icon name={icon} size={14} />
      {children}
    </h2>
  );
}

function PullQuote({ text }: { text: string }) {
  return (
    <blockquote
      style={{
        margin: 0,
        padding: "24px 28px 24px 32px",
        background: "var(--cream, #FAF7F2)",
        borderLeft: "4px solid var(--crimson, #8B1A1A)",
        fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
        fontStyle: "italic",
        fontSize: 20,
        lineHeight: 1.5,
        color: "var(--ink, #1A1A1A)",
        position: "relative",
        letterSpacing: "-0.005em",
      }}
    >
      {text}
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: 18,
          bottom: 16,
          color: "var(--crimson, #8B1A1A)",
          opacity: 0.7,
        }}
      >
        <Icon name="quill" size={18} />
      </span>
    </blockquote>
  );
}

const VERBATIM = [
  "AESDR is a 12-course sales survival program for first-1-to-2-year SDRs and AEs in startup SaaS — self-paced and interactive across the whole curriculum. One-time purchase, no subscription.",
  "Built by people who carried bags and managed AEs and SDRs for a decade — not by people who read about it.",
  "$249 SDR Individual, $299 AE Individual. Team licensing is quoted per team and isn't affiliate-attributable. 14-day, no-questions-asked refund.",
  "The operating manual, not the motivation engine.",
  "AESDR doesn't issue certificates, badges, or hiring credentials. The evidence of learning is the operating judgment, not the paper.",
  "Same price every audience, every channel, every affiliate. No promotional codes, no affiliate-stack discounts.",
];

const FACTS = [
  "12 courses + seven substantial assets you keep (among them the AE/SDR alignment contract, the ROI & commission defense tracker, the CRM survival guide, and the end-of-course 72-Hour Strike Plan)",
  "Interactive HTML format, not video lectures",
  "Private alumni room opens to buyers who finish all twelve courses (post-completion only — not a pre-purchase community claim)",
  "Built for first-2-year SDRs and AEs in startup SaaS — and for senior operators returning to fundamentals",
  "14-day, no-questions-asked refund",
  "One-time purchase; every future curriculum update included",
  "Self-paced — start, stop, and resume on your own schedule",
];

const WALKED_BACK = [
  {
    heading: "Outcome guarantees",
    body: 'No "X% of grads get promoted." No "you\'ll close more deals." No income claims of any kind, even soft ones. AESDR is a curriculum; results follow practice, not enrollment.',
  },
  {
    heading: "Credential claims",
    body: "AESDR doesn't issue certificates, doesn't appear on resumes as a qualification, and isn't recognized by hiring managers as a badge. Don't position it as one.",
  },
  {
    heading: "Time-saved claims",
    body: "Don't claim hours-per-week saved or ramp-time reductions. We don't measure those, so neither of us can substantiate them if asked.",
  },
];
