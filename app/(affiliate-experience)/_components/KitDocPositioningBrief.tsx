import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import { Icon, type IconName } from "@/components/brand/Icon";
import { GhostNumeral, CornerBracket } from "@/components/brand/BrandAssets";

/**
 * Custom branded view for /x/kit/positioning-brief.
 *
 * Treatment: the brief reads as a doctrine document — "operating manual,
 * not the motivation engine" is the founder's most-repeated line.
 * Editorial hero with doctrine-pose Leponeus + corner brackets, the three
 * audiences as ledger entries, the three NOT-this audiences as
 * counter-cards with warn-glyph, then the three things-we-always-say as
 * Playfair pull-quotes numbered with ghost numerals behind them.
 */
export default function KitDocPositioningBrief() {
  return (
    <div style={{ color: "var(--ink, #1A1A1A)" }}>
      {/* ── Doctrine hero ── */}
      <section
        style={{
          background: "var(--cream, #FAF7F2)",
          border: "1px solid var(--ink, #1A1A1A)",
          padding: "44px 36px 40px",
          marginBottom: 56,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -20,
            right: -30,
            opacity: 0.85,
            pointerEvents: "none",
          }}
        >
          <GhostNumeral numeral="AESDR" size={420} />
        </div>
        <CornerBracket
          position="tl"
          size={26}
          color="rgba(26,26,26,0.22)"
          style={{ position: "absolute", top: 12, left: 12 }}
        />
        <CornerBracket
          position="tr"
          size={26}
          color="rgba(26,26,26,0.22)"
          style={{ position: "absolute", top: 12, right: 12 }}
        />
        <CornerBracket
          position="bl"
          size={26}
          color="rgba(26,26,26,0.22)"
          style={{ position: "absolute", bottom: 12, left: 12 }}
        />
        <CornerBracket
          position="br"
          size={26}
          color="rgba(26,26,26,0.22)"
          style={{ position: "absolute", bottom: 12, right: 12 }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div>
            <Eyebrow icon="weight">The doctrine</Eyebrow>
            <h2
              style={{
                fontFamily:
                  "var(--display, 'Playfair Display', Georgia, serif)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(34px, 4.6vw, 52px)",
                lineHeight: 1.05,
                margin: 0,
                letterSpacing: "-0.015em",
              }}
            >
              We don&rsquo;t perform expertise. We install it.
            </h2>
            <p
              style={{
                fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontSize: 18,
                color: "var(--muted, #6B6B6B)",
                marginTop: 20,
                lineHeight: 1.6,
                maxWidth: 600,
              }}
            >
              A 12-course sales survival program for first-1-to-2-year SDRs
              and AEs in startup SaaS — self-paced, interactive, one-time
              purchase with no subscription — built by people who carried
              bags and managed AEs and SDRs for 10+ years rather than by
              people who read about it.
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Mascot pose="doctrine" size={MASCOT_SIZE.card} />
          </div>
        </div>
      </section>

      {/* ── Who this is for ── */}
      <section style={{ marginBottom: 56 }}>
        <SectionLabel icon="team">Who this is for</SectionLabel>
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
          {FOR.map((row) => (
            <li
              key={row}
              style={{
                padding: "18px 20px",
                borderLeft: "3px solid var(--crimson, #8B1A1A)",
                background: "var(--cream, #FAF7F2)",
                fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontSize: 15,
                lineHeight: 1.55,
              }}
            >
              {row}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Who this is NOT for ── */}
      <section style={{ marginBottom: 56 }}>
        <SectionLabel icon="warn">Who this is not for</SectionLabel>
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
          {NOT_FOR.map((row) => (
            <li
              key={row}
              style={{
                padding: "18px 20px",
                border: "1px solid var(--ink, #1A1A1A)",
                background: "var(--ink, #1A1A1A)",
                color: "#FAF7F2",
                fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontSize: 15,
                lineHeight: 1.55,
              }}
            >
              {row}
            </li>
          ))}
        </ul>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontStyle: "italic",
            fontSize: 16,
            color: "var(--muted, #6B6B6B)",
            marginTop: 22,
            lineHeight: 1.6,
          }}
        >
          None of those are meant as insults. They&rsquo;re filters that work
          for both sides. We&rsquo;d rather you decline an affiliate
          conversation now than end a pilot in week four with both sides
          disappointed.
        </p>
      </section>

      {/* ── What's in the program ── */}
      <section style={{ marginBottom: 56 }}>
        <SectionLabel icon="mile">What&rsquo;s in the program</SectionLabel>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 17,
            lineHeight: 1.7,
            margin: "12px 0 0",
          }}
        >
          12 courses and seven substantial assets you keep — among them the
          AE/SDR alignment contract, the ROI &amp; commission defense
          tracker, the CRM survival guide, and the end-of-course 72-Hour
          Strike Plan. All delivered as interactive HTML exercises, not
          video lectures. One-time purchase; every future curriculum update
          is included at no additional cost. A private alumni room opens to
          buyers who finish all twelve courses — strictly post-completion,
          not a pre-purchase brand promise. A 14-day no-questions-asked
          refund backs the whole thing.
        </p>
      </section>

      {/* ── Pricing ── */}
      <section style={{ marginBottom: 56 }}>
        <SectionLabel icon="refund">Pricing</SectionLabel>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 17,
            lineHeight: 1.7,
            margin: "12px 0 0",
          }}
        >
          Pricing is at list across consumer Individual tiers —{" "}
          <strong>$249 SDR, $299 AE</strong> — and stays at list across
          every audience, every channel, every affiliate. There are no
          promotional codes to issue or to advertise.
        </p>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 17,
            lineHeight: 1.7,
            margin: "14px 0 0",
            color: "var(--muted, #6B6B6B)",
          }}
        >
          Team licensing is quoted per team after a five-minute conversation
          about team size and segment; it is not affiliate-attributable.
          Enterprise inquiries route through hello@aesdr.com directly, not
          through affiliate tracking.
        </p>
      </section>

      {/* ── The three things we always say ── */}
      <section style={{ marginBottom: 36 }}>
        <SectionLabel icon="quill">Three things we&rsquo;ll always say</SectionLabel>
        <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
          {ALWAYS_SAY.map((s, i) => (
            <div
              key={s}
              style={{
                position: "relative",
                overflow: "hidden",
                padding: "26px 28px 28px 110px",
                background: "var(--cream, #FAF7F2)",
                border: "1px solid var(--light, #E8E4DF)",
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: -10,
                  left: -10,
                  pointerEvents: "none",
                }}
              >
                <GhostNumeral numeral={`0${i + 1}`} size={140} />
              </div>
              <p
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontFamily:
                    "var(--display, 'Playfair Display', Georgia, serif)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 19,
                  lineHeight: 1.45,
                  margin: 0,
                  letterSpacing: "-0.005em",
                }}
              >
                {s}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Eyebrow({
  icon,
  children,
}: {
  icon: IconName;
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
        marginBottom: 14,
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

const FOR = [
  "First-1-to-2-year SDRs and AEs in startup SaaS — feast-or-famine income, ramp pressure, real chaos.",
  "Career-switchers in their first SaaS sales role.",
  "SDR managers buying for ramp acceleration on junior hires.",
  "AEs and SDRs frustrated by broken tools, bloated CRMs, and shifting goalposts.",
];

const NOT_FOR = [
  "Anyone looking for motivation.",
  "Anyone hunting LinkedIn-friendly badges, certifications, or recruiter clout.",
  "AEs and SDRs with 8+ years in the seat who aren't open to a re-look at fundamentals.",
  "Anyone whose primary distribution motion is sponsored carousels.",
];

const ALWAYS_SAY = [
  "12 courses, seven substantial assets, $249 SDR / $299 AE Individual, 14-day refund.",
  "We don't perform expertise. We install it.",
  "We say out loud who shouldn't buy. Honesty is not a tone here — it's a competitive position.",
];
