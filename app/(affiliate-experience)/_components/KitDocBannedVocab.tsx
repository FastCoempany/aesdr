/* eslint-disable no-restricted-syntax -- This page LISTS the R-G4 banned
   vocabulary as its entire subject matter. The canon-enforcement ESLint
   rule (eslint.config.mjs, no-restricted-syntax) flags those exact strings
   in JSX literals as banned — which is precisely the policy this page
   documents. Disabling at file scope is the only place this exemption is
   semantically correct. */
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import { Icon, type IconName } from "@/components/brand/Icon";

/**
 * Custom branded view for /x/kit/banned-vocabulary.
 *
 * Visual treatment per the user direction: heavy editorial, the fall-pose
 * Leponeus (fractured shell — the literal motif of the page's argument),
 * banned words rendered with red strikethrough in a typographic specimen
 * sheet, with the "Why this matters" sitting alongside as commentary. Not a
 * list, a register.
 */
export default function KitDocBannedVocab() {
  return (
    <div style={{ color: "var(--ink, #1A1A1A)" }}>
      {/* ── Hero ── */}
      <section
        style={{
          background: "var(--cream, #FAF7F2)",
          border: "2px solid var(--ink, #1A1A1A)",
          padding: "44px 36px 40px",
          marginBottom: 64,
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
                letterSpacing: ".24em",
                fontSize: 12,
                color: "var(--crimson, #8B1A1A)",
                marginBottom: 14,
              }}
            >
              The words that break the register
            </div>
            <h2
              style={{
                fontFamily:
                  "var(--display, 'Playfair Display', Georgia, serif)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(30px, 4vw, 44px)",
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: "-0.005em",
              }}
            >
              The audience has been getting sold to in this register for their
              entire career. They can spot it in 30 seconds.
            </h2>
            <p
              style={{
                fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontSize: 17,
                fontStyle: "italic",
                color: "var(--muted, #6B6B6B)",
                marginTop: 18,
                lineHeight: 1.6,
              }}
            >
              The moment they do, the credibility of the recommendation
              collapses. The shell cracks. We keep the words below off any
              surface bearing the AESDR mark.
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Mascot pose="fall" size={MASCOT_SIZE.card} />
          </div>
        </div>
      </section>

      {/* ── The four registers ── */}
      <section style={{ marginBottom: 64 }}>
        <SectionLabel>Four registers, all out</SectionLabel>
        <div style={{ display: "grid", gap: 22, marginTop: 22 }}>
          {REGISTERS.map((reg) => (
            <article
              key={reg.heading}
              style={{
                border: "1px solid var(--light, #E8E4DF)",
                padding: "26px 28px 28px",
                background: "var(--cream, #FAF7F2)",
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
                  display: "grid",
                  gridTemplateColumns: "200px 1fr",
                  gap: 28,
                  alignItems: "start",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily:
                        "var(--cond, 'Barlow Condensed', sans-serif)",
                      textTransform: "uppercase",
                      letterSpacing: ".22em",
                      fontSize: 11,
                      color: "var(--muted, #6B6B6B)",
                      marginBottom: 6,
                    }}
                  >
                    <Icon
                      name={reg.icon}
                      size={14}
                      style={{ color: "var(--crimson, #8B1A1A)" }}
                    />
                    Register
                  </div>
                  <h3
                    style={{
                      fontFamily:
                        "var(--display, 'Playfair Display', Georgia, serif)",
                      fontStyle: "italic",
                      fontWeight: 700,
                      fontSize: 24,
                      margin: 0,
                      lineHeight: 1.2,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {reg.heading}
                  </h3>
                  <p
                    style={{
                      fontFamily:
                        "var(--serif, 'Source Serif 4', Georgia, serif)",
                      fontSize: 14,
                      color: "var(--muted, #6B6B6B)",
                      lineHeight: 1.55,
                      margin: "10px 0 0",
                      fontStyle: "italic",
                    }}
                  >
                    {reg.why}
                  </p>
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    alignContent: "flex-start",
                  }}
                >
                  {reg.words.map((w) => (
                    <li
                      key={w}
                      style={{
                        fontFamily:
                          "var(--mono, 'Space Mono', monospace)",
                        fontSize: 13,
                        padding: "5px 10px",
                        background: "rgba(139, 26, 26, 0.06)",
                        color: "var(--ink, #1A1A1A)",
                        textDecoration: "line-through",
                        textDecorationColor: "var(--crimson, #8B1A1A)",
                        textDecorationThickness: 2,
                      }}
                    >
                      &ldquo;{w}&rdquo;
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── The "rep" rule, separated for emphasis ── */}
      <section style={{ marginBottom: 64 }}>
        <SectionLabel>The one-word rule</SectionLabel>
        <div
          style={{
            background: "var(--ink, #1A1A1A)",
            color: "#FAF7F2",
            padding: "32px 36px 34px",
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 28,
            alignItems: "center",
            marginTop: 18,
          }}
        >
          <div
            style={{
              fontFamily:
                "var(--display, 'Playfair Display', Georgia, serif)",
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: "clamp(40px, 7vw, 72px)",
              lineHeight: 0.95,
              letterSpacing: "-0.01em",
              textDecoration: "line-through",
              textDecorationColor: "#b4455d",
              textDecorationThickness: 4,
            }}
          >
            rep
          </div>
          <div>
            <p
              style={{
                fontFamily:
                  "var(--serif, 'Source Serif 4', Georgia, serif)",
                fontSize: 17,
                lineHeight: 1.6,
                margin: 0,
                color: "#FAF7F2",
              }}
            >
              The word <em>rep</em> is banned. Always write <strong>AE</strong>
              , <strong>SDR</strong>, or <strong>AEs and SDRs</strong>. This
              is founder direction:{" "}
              <em>
                &ldquo;rep is a passive naming convention to me; we use AE
                and/or SDR.&rdquo;
              </em>
            </p>
          </div>
        </div>
      </section>

      {/* ── Why it's out — single paragraph treatment ── */}
      <section
        style={{
          marginBottom: 56,
          borderLeft: "4px solid var(--crimson, #8B1A1A)",
          padding: "8px 0 8px 26px",
        }}
      >
        <SectionLabel>The pattern under all of them</SectionLabel>
        <p
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontStyle: "italic",
            fontSize: 22,
            lineHeight: 1.4,
            margin: "10px 0 16px",
            color: "var(--ink, #1A1A1A)",
            letterSpacing: "-0.005em",
          }}
        >
          Each phrase rewards saying-not-doing. Each suggests a
          feeling-state matters more than an operating-state. Each comes
          loaded with context the audience has already filed under
          &ldquo;performative.&rdquo;
        </p>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 16,
            lineHeight: 1.65,
            margin: 0,
            color: "var(--muted, #6B6B6B)",
          }}
        >
          AESDR wins by being plain, specific, and operationally true.
          Anything that performs expertise rather than installs it works
          against that — including in copy an Affiliate writes about us.
        </p>
      </section>

      {/* ── What we ask ── */}
      <section style={{ marginBottom: 36 }}>
        <SectionLabel>What we ask</SectionLabel>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 17,
            lineHeight: 1.7,
            margin: "10px 0 0",
          }}
        >
          If a piece of Affiliate copy uses any of the above and AESDR&rsquo;s
          mark is on it, we&rsquo;ll ask for an edit before publishing. Refusal
          is rare, but it does end pilots — Affiliate-fit and buyer-fit are the
          same fit here, and the register is the canary.
        </p>
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontSize: 16,
            lineHeight: 1.65,
            margin: "16px 0 0",
            color: "var(--muted, #6B6B6B)",
            fontStyle: "italic",
          }}
        >
          If you&rsquo;re already writing in a register that wouldn&rsquo;t
          trigger any of these naturally, this whole page is a no-op. You read
          it, nodded, moved on. That&rsquo;s a strong fit signal both ways.
        </p>
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
        margin: "0 0 6px",
      }}
    >
      {children}
    </h2>
  );
}

const REGISTERS: ReadonlyArray<{
  heading: string;
  why: string;
  icon: IconName;
  words: string[];
}> = [
  {
    heading: "Sales-floor motivation",
    icon: "warn",
    why: "What every cold-call coach has been saying for fifteen years. The audience tunes it out before the second word.",
    words: [
      "Crush it",
      "Crushing it",
      "Crush your number",
      "Smash your number",
      "Hit it out of the park",
      "Unleash",
      "Unlock your potential",
      "Mindset",
      "Rise and grind",
      "Grindset",
      "Hustle culture",
      "Sales superstar",
      "Rockstar",
      "Ninja",
      "Wizard",
      "Game-changer",
    ],
  },
  {
    heading: "Corporate-speak",
    icon: "ledger",
    why: "The register of internal Slack channels nobody reads. Designed to take up space without committing to a position.",
    words: [
      "Thought leader",
      "Thought leadership",
      "Lead with value",
      "Trusted advisor",
      "Synergy",
      "Synergistic",
      "Leverage (as a verb)",
      "Scale (the motion)",
      "Best practices",
      "Best-in-class",
      "World-class",
      "Ecosystem",
      "Value-add",
      "Circle back",
      "Deep dive",
      "Low-hanging fruit",
      "At the end of the day",
    ],
  },
  {
    heading: "Startup-speak",
    icon: "signal",
    why: "Inherited from a thousand pitch decks. Sounds like position-taking, contains no actual position.",
    words: [
      "Decision-grade",
      "The wedge",
      "The move",
      "Account heat",
      "Step-change",
      "Table stakes",
      "Operating system (as marketing noun)",
      "Reimagine",
      "Reinvent",
      "Transform (as marketing verb)",
    ],
  },
  {
    heading: "Style markers + AI-tells",
    icon: "cursor",
    why: "Phrases that read as ChatGPT scaffolding or stock copy. Land instantly as written-by-machine.",
    words: [
      "Amazing",
      "Incredible",
      "Empower",
      "Empowerment",
      "Masterclass",
      "🚀 💪 🔥 (hype emojis)",
      "Let me explain",
      "Here's the thing",
      "At its core",
    ],
  },
];
