import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import { Icon, type IconName } from "@/components/brand/Icon";

/**
 * Custom branded view for /x/kit/pilot-rhythm. Reads like a one-pager promo
 * doc, still in affiliate-facing voice: hero offer line, the 4-week rhythm
 * as a horizontal timeline with iris-gradient milestone markers, a
 * "what AESDR does / what the partner does" split, and the end-of-pilot
 * cut/keep/pause grid.
 */
export default function KitDocPilotRhythm() {
  return (
    <div style={{ color: "var(--ink, #1A1A1A)" }}>
      {/* ── Hero promo block ── */}
      <section
        style={{
          background: "var(--cream, #FAF7F2)",
          border: "2px solid var(--ink, #1A1A1A)",
          padding: "44px 36px 38px",
          marginBottom: 56,
          position: "relative",
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
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 28,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
                textTransform: "uppercase",
                letterSpacing: ".22em",
                fontSize: 12,
                color: "var(--crimson, #8B1A1A)",
                marginBottom: 12,
              }}
            >
              The 30-day shape — at a glance
            </div>
            <h2
              style={{
                fontFamily:
                  "var(--display, 'Playfair Display', Georgia, serif)",
                fontStyle: "italic",
                fontSize: "clamp(28px, 3.8vw, 40px)",
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: "-0.005em",
              }}
            >
              Two sends, one workshop, four weeks. We do the heavy lift; you
              keep the relationship.
            </h2>
            <p
              style={{
                fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontSize: 18,
                color: "var(--muted, #6B6B6B)",
                marginTop: 18,
                lineHeight: 1.55,
              }}
            >
              What a pilot looks like at the week level. The day-by-day
              operating spec ships to you after signing — this is the shape so
              you can decide if it fits before that.
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Mascot pose="sprint" size={MASCOT_SIZE.card} />
          </div>
        </div>
      </section>

      {/* ── Week-by-week timeline ── */}
      <section style={{ marginBottom: 64 }}>
        <SectionLabel>The rhythm</SectionLabel>
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 0,
            marginTop: 22,
            border: "1px solid var(--light, #E8E4DF)",
          }}
        >
          {WEEKS.map((w, i) => (
            <article
              key={w.label}
              style={{
                padding: "26px 22px 26px",
                borderRight:
                  i < WEEKS.length - 1
                    ? "1px solid var(--light, #E8E4DF)"
                    : "none",
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
                  background: w.accent,
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "var(--mono, 'Space Mono', monospace)",
                  fontSize: 11,
                  letterSpacing: ".18em",
                  color: "var(--muted, #6B6B6B)",
                  textTransform: "uppercase",
                }}
              >
                <Icon
                  name={w.icon}
                  size={12}
                  style={{ color: "var(--crimson, #8B1A1A)" }}
                />
                {w.label}
              </div>
              <h3
                style={{
                  fontFamily:
                    "var(--display, 'Playfair Display', Georgia, serif)",
                  fontStyle: "italic",
                  fontSize: 22,
                  margin: "10px 0 12px",
                  letterSpacing: "-0.005em",
                }}
              >
                {w.title}
              </h3>
              <p
                style={{
                  fontFamily:
                    "var(--serif, 'Source Serif 4', Georgia, serif)",
                  fontSize: 15,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {w.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── What we do / what you do ── */}
      <section style={{ marginBottom: 64 }}>
        <SectionLabel>The split</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginTop: 22,
          }}
        >
          <SplitCard
            heading="AESDR runs"
            items={[
              "Build your affiliate-specific registration page",
              "Generate tracking URLs + the AESDR × Affiliate lockup",
              "Pre-cleared promotion copy with bracketed placeholders",
              "The live workshop (60 min + 10–15 Q&A, capped at 75)",
              "The full follow-up sequence + high-intent DM",
              "Net-45 commission accounting + Friday Pilot report",
            ]}
            accent="var(--crimson, #8B1A1A)"
          />
          <SplitCard
            heading="You run"
            items={[
              "Two pre-cleared emails to your audience — newsletter sends, dedicated drops, whatever format you normally use to reach your list",
              "The 30-second intro at the top of the workshop",
              "Light customization inside the [PLACEHOLDER] tokens",
              "Decide cut / keep / pause at the four-week mark",
            ]}
            accent="var(--ink, #1A1A1A)"
          />
        </div>
      </section>

      {/* ── End of pilot grid ── */}
      <section style={{ marginBottom: 24 }}>
        <SectionLabel>What happens at the end</SectionLabel>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 17,
            lineHeight: 1.6,
            margin: "10px 0 22px",
            color: "var(--muted, #6B6B6B)",
            fontStyle: "italic",
          }}
        >
          We part as adults regardless of which one it is.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {ENDINGS.map((e) => (
            <div
              key={e.k}
              style={{
                padding: "22px 22px 24px",
                border: "1px solid var(--ink, #1A1A1A)",
                background: e.bg,
                color: e.fg,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
                  textTransform: "uppercase",
                  letterSpacing: ".24em",
                  fontSize: 11,
                  marginBottom: 10,
                  opacity: 0.75,
                }}
              >
                {e.k}
              </div>
              <p
                style={{
                  fontFamily:
                    "var(--serif, 'Source Serif 4', Georgia, serif)",
                  fontSize: 15,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {e.v}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
        textTransform: "uppercase",
        letterSpacing: ".22em",
        fontSize: 13,
        color: "var(--crimson, #8B1A1A)",
        margin: "0 0 4px",
      }}
    >
      {children}
    </h2>
  );
}

function SplitCard({
  heading,
  items,
  accent,
}: {
  heading: string;
  items: string[];
  accent: string;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--light, #E8E4DF)",
        padding: "26px 26px 28px",
        background: "var(--cream, #FAF7F2)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
          textTransform: "uppercase",
          letterSpacing: ".2em",
          fontSize: 12,
          color: accent,
          marginBottom: 14,
        }}
      >
        {heading}
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {items.map((it) => (
          <li
            key={it}
            style={{
              fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
              fontSize: 15,
              lineHeight: 1.5,
              paddingLeft: 18,
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 8,
                width: 8,
                height: 8,
                background: accent,
              }}
              aria-hidden
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

const WEEKS: ReadonlyArray<{
  label: string;
  title: string;
  body: string;
  accent: string;
  icon: IconName;
}> = [
  {
    label: "Week 0",
    title: "Setup",
    icon: "ledger",
    body:
      "We countersign, build your registration page, generate tracking URLs, render the AESDR × Affiliate lockup, and hand you the kit folder. Everything ready before the promo window opens.",
    accent: "var(--crimson, #8B1A1A)",
  },
  {
    label: "Week 1",
    title: "Promotion",
    icon: "signal",
    body:
      "Two pre-cleared emails to your audience on the agreed dates — standalone newsletter sends in whatever format you normally use. We supply the copy; you customize the placeholders. Workshop registration is live. Mid-week, a short progress report from us.",
    accent: "#b4455d",
  },
  {
    label: "Week 2",
    title: "Workshop",
    icon: "team",
    body:
      "60-min live workshop hosted by AESDR into your audience + 10–15 of Q&A, capped at 75. You introduce; we deliver; the offer at the close is run by us. Replay opens for 72 hours.",
    accent: "#8B5CF6",
  },
  {
    label: "Week 3",
    title: "Nurture",
    icon: "iteration",
    body:
      "We run the full follow-up sequence: same-day attendee, no-show replay, free-vs-structured objection, deadline window, checkout-abandon. High-intent DM where signals warrant. You're hands-off.",
    accent: "#5E3FBF",
  },
  {
    label: "Week 4",
    title: "Close",
    icon: "hourglass",
    body:
      "Attribution window stays open 30 days from registration. At week four we file a cut/keep memo: did this work, is a second pilot worth running? Either way, clean close-out with net-45 commission accounting.",
    accent: "var(--ink, #1A1A1A)",
  },
];

const ENDINGS = [
  {
    k: "Keep",
    v: "We run a second pilot under refreshed terms.",
    bg: "var(--ink, #1A1A1A)",
    fg: "#FAF7F2",
  },
  {
    k: "Cut",
    v: "Close-out note within 48 hours — a real note from me, not a form. The door stays open if either of us wants to revisit later.",
    bg: "var(--cream, #FAF7F2)",
    fg: "var(--ink, #1A1A1A)",
  },
  {
    k: "Pause",
    v: "If the data isn't conclusive, we extend by 14 days to give us a clearer read instead of making a call on partial information.",
    bg: "var(--cream, #FAF7F2)",
    fg: "var(--ink, #1A1A1A)",
  },
];
