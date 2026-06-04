import Link from "next/link";
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import { Icon, type IconName } from "@/components/brand/Icon";

/**
 * Custom branded view for /x/kit/co-promoting-aesdr.
 *
 * Treatment: the three bright-line rules rendered as numbered editorial
 * stanzas with their own iconography, a callout for the buyer-refund safety
 * line, a pre-cleared vs. needs-review side-by-side, and a closer about
 * not asking affiliates to drop their voice. Verdict-pose Leponeus in the
 * hero — these are operational rules with stakes.
 */
export default function KitDocCoPromoting() {
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
          <Eyebrow icon="weight">Three bright-line rules</Eyebrow>
          <h2
            style={{
              fontFamily:
                "var(--display, 'Playfair Display', Georgia, serif)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(26px, 3.2vw, 36px)",
              lineHeight: 1.18,
              margin: 0,
              letterSpacing: "-0.005em",
            }}
          >
            What you can say. What you can&rsquo;t. What we ask before you
            publish.
          </h2>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Mascot pose="verdict" size={MASCOT_SIZE.card} />
        </div>
      </section>

      {/* ── The three rules ── */}
      <section style={{ marginBottom: 64 }}>
        <div style={{ display: "grid", gap: 20 }}>
          {RULES.map((r, i) => (
            <Rule key={r.heading} index={i + 1} rule={r} />
          ))}
        </div>
      </section>

      {/* ── Is this safe to recommend? ── */}
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
          <Icon name="refund" size={14} style={{ color: "#b4455d" }} />
          The buyer-refund safety line
        </div>
        <h3
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(22px, 2.6vw, 28px)",
            lineHeight: 1.3,
            margin: 0,
            letterSpacing: "-0.005em",
          }}
        >
          You&rsquo;re not asked to vouch for outcomes neither of us can
          observe. You&rsquo;re asked to vouch for the program existing on
          fair terms.
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
          AESDR has a 14-day, no-questions-asked refund. If a buyer from your
          audience tries it and it doesn&rsquo;t fit, they email a real
          address, a real person processes it, and the money goes back. No
          fight. That&rsquo;s the floor under everything you say about us.
        </p>
      </section>

      {/* ── The lockup callout ── */}
      <section style={{ marginBottom: 56 }}>
        <SectionLabel icon="mile">The lockup</SectionLabel>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 17,
            lineHeight: 1.7,
            margin: "10px 0 16px",
          }}
        >
          Co-branded surfaces (registration page, deck, affiliate-specific
          email) carry the <strong>AESDR × Affiliate</strong> lockup.
          Placement, color, and clearspace rules live in the Lockup Usage
          Rules. The actual lockup files arrive after the partnership
          agreement is signed — they&rsquo;re built to your mark, so
          they&rsquo;re affiliate-specific.
        </p>
        <Link
          href="/x/kit/lockup-usage"
          style={{
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".18em",
            fontSize: 12,
            color: "var(--ink, #1A1A1A)",
            textDecoration: "none",
            borderBottom: "2px solid var(--crimson, #8B1A1A)",
            paddingBottom: 2,
          }}
        >
          Open the lockup rules →
        </Link>
      </section>

      {/* ── Pre-cleared vs needs review ── */}
      <section style={{ marginBottom: 56 }}>
        <SectionLabel icon="hourglass">
          What&rsquo;s pre-cleared, what needs review
        </SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            marginTop: 22,
          }}
        >
          <Split
            kind="pre-cleared"
            icon="signal"
            body="Language directly lifted from the kit pages and your promotional copy templates (sent to you after signing)."
          />
          <Split
            kind="needs review"
            icon="eye"
            body="Anything you've reworded, anything ad-hoc paid placement, anything ephemeral (stories, lives, reels not in the agreed plan). 48-hour round."
          />
        </div>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 16,
            fontStyle: "italic",
            color: "var(--muted, #6B6B6B)",
            margin: "22px 0 0",
            lineHeight: 1.6,
          }}
        >
          When in doubt, send a draft. We&rsquo;d rather review one extra
          piece than ask you to delete a published one.
        </p>
      </section>

      {/* ── We won't ask you to drop your voice ── */}
      <section
        style={{
          padding: "28px 30px 30px",
          background: "var(--cream, #FAF7F2)",
          border: "1px solid var(--ink, #1A1A1A)",
        }}
      >
        <Eyebrow icon="ear">What we won&rsquo;t ask of you</Eyebrow>
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
          We won&rsquo;t ask you to drop your voice. The reason your audience
          trusts you is that you sound like yourself.
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
          The kit gives you the language to lift, the rules to clear, and
          the bright lines not to cross — everything in between is yours.
        </p>
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
        margin: "0 0 6px",
      }}
    >
      <Icon name={icon} size={14} />
      {children}
    </h2>
  );
}

function Rule({
  index,
  rule,
}: {
  index: number;
  rule: { heading: string; body: React.ReactNode; icon: IconName };
}) {
  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 28,
        padding: "26px 28px 28px",
        background: "var(--cream, #FAF7F2)",
        border: "1px solid var(--light, #E8E4DF)",
        position: "relative",
        alignItems: "start",
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
          gap: 10,
          minWidth: 64,
        }}
      >
        <div
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: 44,
            lineHeight: 1,
            color: "var(--crimson, #8B1A1A)",
            letterSpacing: "-0.02em",
          }}
        >
          {String(index).padStart(2, "0")}
        </div>
        <Icon
          name={rule.icon}
          size={20}
          style={{ color: "var(--ink, #1A1A1A)" }}
        />
      </div>
      <div>
        <h3
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 22,
            margin: "0 0 10px",
            letterSpacing: "-0.005em",
          }}
        >
          {rule.heading}
        </h3>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 16,
            lineHeight: 1.65,
            margin: 0,
            color: "var(--ink, #1A1A1A)",
          }}
        >
          {rule.body}
        </p>
      </div>
    </article>
  );
}

function Split({
  kind,
  icon,
  body,
}: {
  kind: string;
  icon: IconName;
  body: string;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--light, #E8E4DF)",
        padding: "22px 22px 24px",
        background: "var(--cream, #FAF7F2)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".2em",
          fontSize: 11,
          color: "var(--crimson, #8B1A1A)",
          marginBottom: 12,
        }}
      >
        <Icon name={icon} size={14} />
        {kind}
      </div>
      <p
        style={{
          fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
          fontSize: 15,
          lineHeight: 1.6,
          margin: 0,
          color: "var(--ink, #1A1A1A)",
        }}
      >
        {body}
      </p>
    </div>
  );
}

const RULES: Array<{
  heading: string;
  body: React.ReactNode;
  icon: IconName;
}> = [
  {
    heading: "Disclose every time.",
    icon: "eye",
    body: (
      <>
        Material connection (commission, comp, free access) gets disclosed
        near the recommendation, in plain language. Full templates by surface
        live in the Disclosure Language Pack.
      </>
    ),
  },
  {
    heading: "Don't promise outcomes we don't deliver.",
    icon: "warn",
    body: (
      <>
        AESDR is a curriculum, not a placement service. We don&rsquo;t
        guarantee promotions, hiring, certification, or quota attainment.
        If you&rsquo;re not sure whether a phrase crosses the line, ask
        before publishing — that&rsquo;s faster than asking us to
        retroactively walk it back.
      </>
    ),
  },
  {
    heading: "Don't offer pricing your audience can't actually get.",
    icon: "refund",
    body: (
      <>
        The price is the price. $249 SDR Individual, $299 AE Individual.
        Team licensing is quoted per team through hello@aesdr.com and
        isn&rsquo;t affiliate-attributable. There are no codes, no
        affiliate-stack discounts, no flash promotions. Don&rsquo;t write
        copy that implies otherwise.
      </>
    ),
  },
];
