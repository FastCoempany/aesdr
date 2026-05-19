import type { Metadata } from "next";
import Link from "next/link";

import AesdrBrand from "@/components/AesdrBrand";

export const metadata: Metadata = {
  title: "Sample Lesson — Surviving Your Manager | AESDR",
  description:
    "A free preview from Lesson 3 (Surviving & Thriving). The full takeaway is gated; the body is not.",
  robots: { index: true, follow: true },
};

const PROMPTS = [
  {
    n: "01",
    label: "Friday afternoon",
    body: "Your manager pings you at 4:47pm with “quick sync?” You have a 5pm with a prospect. What do you do — and what do you tell each of them?",
  },
  {
    n: "02",
    label: "Monday morning",
    body: "Pipeline review. Your number is short. You have one deal you privately think won't close this quarter. Do you forecast it in or out?",
  },
  {
    n: "03",
    label: "Wednesday",
    body: "Your manager skips your 1:1 for the third week running. They didn't reschedule. Do you bring it up, or quietly stop scheduling them?",
  },
];

const ARCHETYPES = [
  {
    name: "The Coach",
    tell: "asks more questions than they answer",
    fail: "may under-direct when you need a verdict",
  },
  {
    name: "The Operator",
    tell: "owns the dashboard, runs the QBR off it",
    fail: "may mistake your activity for your competence",
  },
  {
    name: "The Closer",
    tell: "joins your calls and takes them over",
    fail: "may forget you need reps to actually grow",
  },
  {
    name: "The Ghost",
    tell: "skips 1:1s, copy-pastes feedback, vanishes",
    fail: "may surface only when something is wrong",
  },
];

export default function PreviewPage() {
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
          href="/#pricing"
          style={{
            fontFamily: "var(--cond)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            color: "#fff",
            background: "var(--crimson)",
            padding: "10px 20px",
            textDecoration: "none",
          }}
        >
          Get full access
        </Link>
      </header>

      <article
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "64px 24px 96px",
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
          Lesson 03 · Sample · No signup required
        </p>

        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "clamp(36px,5vw,56px)",
            lineHeight: 1.05,
            marginBottom: 16,
          }}
        >
          Surviving Your Manager
        </h1>

        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: 18,
            color: "var(--muted)",
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          A sample from Lesson 3, <em>Surviving &amp; Thriving</em>. The body is open.
          The takeaway tool — the one you'd use on Monday — is the part we charge for.
        </p>

        <div
          style={{
            height: 2,
            width: 60,
            background: "var(--iris)",
            backgroundSize: "300% 100%",
            animation: "iris 4s linear infinite",
            marginBottom: 40,
          }}
        />

        <section style={{ marginBottom: 48 }}>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: ".25em",
              textTransform: "uppercase",
              color: "var(--crimson)",
              marginBottom: 12,
            }}
          >
            The setup
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.75, marginBottom: 16 }}>
            Every AE and SDR has a story about a manager who made the job
            harder. The mistake is to treat that manager as a personality
            problem. They're not. They're an <strong>operating system</strong> —
            a stable set of inputs they reward, outputs they ignore, and signals
            they read as competence or threat.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.75, marginBottom: 16 }}>
            You don't have to like the OS. You do have to know which one you're
            running on. The cheapest mistake in the first 18 months of a sales
            career is matching your behaviour to the wrong manager — pitching a
            Coach like an Operator, ducking a Closer when they want to be in
            the room, escalating to a Ghost who didn't want the alert.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.75 }}>
            This lesson hands you a four-archetype map and three live prompts.
            By the end you can read the OS in a week, not a quarter.
          </p>
        </section>

        <section style={{ marginBottom: 48 }}>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: ".25em",
              textTransform: "uppercase",
              color: "var(--crimson)",
              marginBottom: 16,
            }}
          >
            The four archetypes
          </p>
          <div style={{ display: "grid", gap: 16 }}>
            {ARCHETYPES.map((a) => (
              <div
                key={a.name}
                style={{
                  borderLeft: "3px solid var(--crimson)",
                  paddingLeft: 16,
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--display)",
                    fontStyle: "italic",
                    fontWeight: 700,
                    fontSize: 22,
                    marginBottom: 4,
                  }}
                >
                  {a.name}
                </p>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink)" }}>
                  <strong>Tell:</strong> {a.tell}.{" "}
                  <span style={{ color: "var(--muted)" }}>
                    <strong>Failure mode:</strong> {a.fail}.
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 56 }}>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: ".25em",
              textTransform: "uppercase",
              color: "var(--crimson)",
              marginBottom: 16,
            }}
          >
            Three prompts to run this week
          </p>
          <div style={{ display: "grid", gap: 20 }}>
            {PROMPTS.map((p) => (
              <div
                key={p.n}
                style={{
                  background: "#fff",
                  border: "1px solid var(--light)",
                  padding: "20px 24px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: ".25em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    marginBottom: 6,
                  }}
                >
                  {p.n} · {p.label}
                </p>
                <p style={{ fontSize: 17, lineHeight: 1.65 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Gated takeaway */}
        <section
          data-surface="dark"
          style={{
            position: "relative",
            background: "var(--ink)",
            color: "var(--cream)",
            padding: "40px 32px",
            marginBottom: 32,
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
            The takeaway · Members only
          </p>
          <p
            style={{
              fontFamily: "var(--display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 26,
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            The Manager OS One-Pager
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(250,247,242,0.85)",
              marginBottom: 8,
              filter: "blur(4px)",
              userSelect: "none",
            }}
          >
            A printable single-page diagnostic: identify your manager's
            archetype in 10 minutes, see the three behaviours that read as
            competence to that archetype, and the two that read as threat.
            Includes the Friday five-line email template tuned to each archetype.
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(250,247,242,0.85)",
              marginBottom: 24,
              filter: "blur(4px)",
              userSelect: "none",
            }}
          >
            Plus the escalation script for the Ghost, the de-escalation script
            for the Closer, and the proof-of-work cadence the Operator silently
            grades you on.
          </p>
          <Link
            href="/#pricing"
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
            }}
          >
            Unlock the full lesson
          </Link>
        </section>

        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".18em",
            color: "var(--muted)",
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          12 lessons. 5 takeaway tools. Lifetime access. 14-day refund.
          <br />
          <Link
            href="/free/manager-archetype-map"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            Or grab the free Manager Archetype Map →
          </Link>
        </p>
      </article>
    </main>
  );
}
