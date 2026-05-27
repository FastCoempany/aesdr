import type { Metadata } from "next";
import Link from "next/link";

import AesdrBrand from "@/components/AesdrBrand";
import EmailCaptureForm from "./EmailCaptureForm";

export const metadata: Metadata = {
  title: "The Manager Archetype Map — Free | AESDR",
  description:
    "A free one-page diagnostic for AEs and SDRs: figure out which OS your manager runs on, before you spend a quarter mis-reading them.",
  robots: { index: true, follow: true },
};

const ARCHETYPES = [
  {
    name: "The Coach",
    snapshot: "Asks before telling. Develops you instead of just measuring you.",
    reads_as_competence: ["You came with the question, not the complaint.", "You can name your own gap.", "You tried something before asking."],
    reads_as_threat: ["You wait to be told.", "You bring problems with no attempt attached."],
    weekly_move:
      "End your 1:1 with one decision you made this week, one you're stuck on, and the option you're leaning toward.",
  },
  {
    name: "The Metric Maniac",
    snapshot: "The dashboard is the conversation. Equates activity with output.",
    reads_as_competence: ["Pipeline math that reconciles.", "Activity tied to a specific stage gap.", "Numbers that come with a story."],
    reads_as_threat: ["Vibes-based updates.", "“Working on it.”", "A quiet day with nothing logged."],
    weekly_move:
      "Send a Friday five-line — last week's number, this week's, the gap, what's closing it, what isn't. Lead with the metric they watch most.",
  },
  {
    name: "The Template Tyrant",
    snapshot: "One script, one sequence, one way. No room for your judgment.",
    reads_as_competence: ["You follow the process.", "You bring data on where you deviated and why it worked.", "You ask before going off-script."],
    reads_as_threat: ["Going off-script silently.", "“I just did my own thing.”"],
    weekly_move:
      "When you want to deviate, bring an A/B: “the template gets 4%, my variant got 9% on 40 sends. Can I run it on the next batch?”",
  },
  {
    name: "The Two-Faced Cheerleader",
    snapshot: "Public praise, private criticism. You never quite know where you stand.",
    reads_as_competence: ["You create a paper trail.", "You send written recaps of every 1:1.", "You confirm agreements in writing."],
    reads_as_threat: ["Verbal-only agreements they can reframe later.", "Letting the record stay fuzzy."],
    weekly_move:
      "After every 1:1, send a two-line written recap of what was agreed. Make the record exist.",
  },
  {
    name: "The Ghost",
    snapshot: "Absent. Unavailable. You're coaching yourself.",
    reads_as_competence: ["You operate without hand-holding.", "Self-managed pipeline.", "You escalate only what genuinely needs them."],
    reads_as_threat: ["Constant pings.", "Needing them in every decision.", "Anything that requires them to be present."],
    weekly_move:
      "Send one async update they can read in 30 seconds, ending with one specific question and a deadline. Make engaging with you cheap.",
  },
];

export default function ManagerArchetypeMapPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        color: "var(--ink)",
        fontFamily: "var(--serif)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 5%",
          borderBottom: "1px solid var(--light)",
          background: "rgba(250,247,242,0.95)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <AesdrBrand
          style={{
            textDecoration: "none",
            color: "inherit",
            fontFamily: "var(--display)",
            fontSize: 18,
            fontWeight: 900,
            fontStyle: "italic",
            letterSpacing: ".05em",
            background: "var(--iris)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "iris 3s linear infinite",
          }}
        />
        <Link
          href="/"
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            color: "var(--muted)",
            textDecoration: "none",
          }}
        >
          ← Back
        </Link>
      </header>

      <section
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "64px 24px 32px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".32em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 16,
          }}
        >
          Free · No signup needed to read · PDF on request
        </p>

        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "clamp(36px,6vw,64px)",
            lineHeight: 1.04,
            marginBottom: 24,
          }}
        >
          The Manager <br />
          <span
            style={{
              background: "var(--iris)",
              backgroundSize: "300% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "iris 4s linear infinite",
            }}
          >
            Archetype Map
          </span>
        </h1>

        <p
          style={{
            fontSize: 19,
            lineHeight: 1.7,
            color: "var(--muted)",
            maxWidth: 640,
            marginBottom: 16,
          }}
        >
          Five manager operating systems. What each one reads as competence,
          what each reads as threat, and the one move that works on them this
          week.
        </p>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "var(--ink)",
            maxWidth: 640,
            marginBottom: 0,
          }}
        >
          Built from ten years of carrying a bag and managing AEs and SDRs.
          Use it, don&rsquo;t use it — either way it stays free.
        </p>
      </section>

      <section
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "16px 24px 32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))",
          gap: 24,
        }}
      >
        {ARCHETYPES.map((a, i) => (
          <article
            key={a.name}
            style={{
              background: "#fff",
              border: "1px solid var(--light)",
              padding: "24px 24px 28px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -20,
                right: -8,
                fontFamily: "var(--display)",
                fontSize: 140,
                fontWeight: 900,
                fontStyle: "italic",
                color: "var(--crimson)",
                opacity: 0.06,
                lineHeight: 1,
                pointerEvents: "none",
              }}
            >
              0{i + 1}
            </span>
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: ".25em",
                textTransform: "uppercase",
                color: "var(--crimson)",
                marginBottom: 6,
              }}
            >
              Archetype 0{i + 1}
            </p>
            <h2
              style={{
                fontFamily: "var(--display)",
                fontStyle: "italic",
                fontWeight: 900,
                fontSize: 28,
                marginBottom: 8,
              }}
            >
              {a.name}
            </h2>
            <p
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 16,
                color: "var(--muted)",
                marginBottom: 20,
              }}
            >
              {a.snapshot}
            </p>

            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "var(--ink)",
                marginBottom: 8,
              }}
            >
              Reads as competence
            </p>
            <ul style={{ paddingLeft: 18, marginBottom: 16, lineHeight: 1.65 }}>
              {a.reads_as_competence.map((line) => (
                <li key={line} style={{ fontSize: 15 }}>
                  {line}
                </li>
              ))}
            </ul>

            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "var(--crimson)",
                marginBottom: 8,
              }}
            >
              Reads as threat
            </p>
            <ul style={{ paddingLeft: 18, marginBottom: 16, lineHeight: 1.65 }}>
              {a.reads_as_threat.map((line) => (
                <li key={line} style={{ fontSize: 15 }}>
                  {line}
                </li>
              ))}
            </ul>

            <div
              style={{
                borderTop: "1px solid var(--light)",
                paddingTop: 14,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  letterSpacing: ".22em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 6,
                }}
              >
                This week&rsquo;s move
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.65 }}>{a.weekly_move}</p>
            </div>
          </article>
        ))}
      </section>

      <section
        data-surface="dark"
        style={{
          maxWidth: 720,
          margin: "32px auto",
          padding: "32px 24px",
          background: "var(--ink)",
          color: "var(--cream)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".32em",
            textTransform: "uppercase",
            color: "rgba(250,247,242,0.6)",
            marginBottom: 12,
          }}
        >
          Want it as a PDF for your notebook
        </p>
        <p
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 24,
            lineHeight: 1.2,
            marginBottom: 12,
          }}
        >
          Email me the one-pager. No marketing sequence.
        </p>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: "rgba(250,247,242,0.85)",
            marginBottom: 20,
          }}
        >
          One email, one PDF, no follow-ups unless you reply. We may include a
          single note pointing to the full course — you can ignore it.
        </p>
        <EmailCaptureForm />
      </section>

      <section
        style={{
          maxWidth: 720,
          margin: "0 auto 96px",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".15em",
            color: "var(--muted)",
            marginBottom: 16,
          }}
        >
          This is one of the substantial assets from Course 3 — there are 11 more courses inside the full AESDR program waiting to be worked through.
        </p>
        <Link
          href="/preview"
          style={{
            display: "inline-block",
            fontFamily: "var(--cond)",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            color: "#fff",
            background: "var(--crimson)",
            padding: "14px 28px",
            textDecoration: "none",
            marginRight: 12,
          }}
        >
          See a sample lesson
        </Link>
        <Link
          href="/#pricing"
          style={{
            display: "inline-block",
            fontFamily: "var(--cond)",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            color: "var(--ink)",
            border: "1px solid var(--ink)",
            padding: "14px 28px",
            textDecoration: "none",
          }}
        >
          Full course
        </Link>
      </section>
    </main>
  );
}
