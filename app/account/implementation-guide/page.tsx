import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import AesdrBrand from "@/components/AesdrBrand";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Implementation guide (solo) | AESDR",
  description:
    "How to actually finish AESDR if you bought it for yourself. Twelve weeks, two windows a week, the moves that work in practice.",
};

interface Week {
  num: string;
  lesson: string;
  title: string;
  estimate: string;
  brief: string;
  move: string;
}

const WEEKS: Week[] = [
  {
    num: "01",
    lesson: "Lesson 01",
    title: "Building real camaraderie",
    estimate: "~22 min",
    brief:
      "Foundation week. Get the operating model in your head before you try to apply anything. Don't take notes — just read.",
    move:
      "After the lesson, text one teammate something specific they helped you with this month. That's the lesson, lived.",
  },
  {
    num: "02",
    lesson: "Lesson 02",
    title: "Breaking down silos",
    estimate: "~24 min",
    brief:
      "The handoff lesson. If you're an SDR, this lands on your AE relationship; if you're an AE, your SE / CSM / SDR.",
    move:
      "Identify the one handoff this week that's been quietly broken. Schedule a fifteen-minute reset with that person.",
  },
  {
    num: "03",
    lesson: "Lesson 03",
    title: "Surviving your manager",
    estimate: "~28 min",
    brief:
      "Probably the highest-leverage lesson for the first eighteen months. The Manager Archetype Map drops in here.",
    move:
      "Print the one-pager. Label your manager. Run the matching weekly move at your next 1:1.",
  },
  {
    num: "04",
    lesson: "Lesson 04",
    title: "Navigating manager madness",
    estimate: "~26 min",
    brief:
      "Companion to Lesson 3. Where the archetype map covers stable behaviour, this covers volatility — bad weeks, escalations, surprise re-orgs.",
    move:
      "Write down the last three times your manager surprised you. Pattern-match before next quarter.",
  },
  {
    num: "05",
    lesson: "Lesson 05",
    title: "The AE / SDR playbook",
    estimate: "~32 min",
    brief:
      "Heaviest lesson by minutes. This is the one to read at the start of a window, not the end.",
    move:
      "Walk one live deal or one live sequence through the framework. Don't try to retrofit your whole pipeline.",
  },
  {
    num: "06",
    lesson: "Lesson 06",
    title: "Beyond the playbook",
    estimate: "~28 min",
    brief:
      "The lesson on what to do when the script runs out and you're live. Pairs well with re-reading Lesson 5 the same week.",
    move:
      "Pick the one in-call moment you flinched at this month. Write the line you wish you'd said.",
  },
  {
    num: "07",
    lesson: "Lesson 07",
    title: "Prospecting & pipeline",
    estimate: "~30 min",
    brief:
      "The math lesson. If you've been doing the job on vibes, this is the one that reframes it.",
    move:
      "Open your last 30 outreach attempts. Categorise the reply / no-reply / bad-reply split. Don't fix it this week — just look at it.",
  },
  {
    num: "08",
    lesson: "Lesson 08",
    title: "The 30% rule",
    estimate: "~24 min",
    brief:
      "Talk-time. Half the AE/SDRs who read this discover they're at 60% talk on calls and don't believe the lesson at first.",
    move:
      "Record one call this week (if comp allows). Listen. Time yourself.",
  },
  {
    num: "09",
    lesson: "Lesson 09",
    title: "CRM survival guide",
    estimate: "~22 min",
    brief:
      "How to make the tool work for you instead of just feeding it. Smaller-scope lesson, faster read.",
    move:
      "Clean one stage of your pipeline this week. One stage. Not all of them.",
  },
  {
    num: "10",
    lesson: "Lesson 10",
    title: "Compensation realities",
    estimate: "~26 min",
    brief:
      "Comp plan, commission math, financial resilience. The lesson most AEs read after their first bad month.",
    move:
      "Run the ROI / commission-defense tool with this lesson&apos;s framing. The math doesn&apos;t lie.",
  },
  {
    num: "11",
    lesson: "Lesson 11",
    title: "Sober selling",
    estimate: "~22 min",
    brief:
      "The uncomfortable lesson. 21+ literal sober, not metaphorical. Read it alone, not in a coffee shop.",
    move:
      "No homework. Just sit with it.",
  },
  {
    num: "12",
    lesson: "Lesson 12",
    title: "Leveling up SaaS relationships",
    estimate: "~26 min",
    brief:
      "The relationship-graph lesson. Includes the 72-hour strike plan as the take-home tool for bad quarters.",
    move:
      "Write down three people you&rsquo;d call if you changed jobs tomorrow. If the list is short, that&rsquo;s the work.",
  },
];

export default async function ImplementationGuidePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/implementation-guide");

  const studyWindow = user.user_metadata?.study_window as
    | { day?: string; time?: string; place?: string }
    | undefined;
  const stakeholder = user.user_metadata?.stakeholder as string | null | undefined;
  const role = user.user_metadata?.role === "ae" ? "AE" : "SDR";

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
        <SignOutButton />
      </header>

      <section style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 24px" }}>
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
          Solo implementation · {role} track · ~5 hours total
        </p>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "clamp(32px,5vw,52px)",
            lineHeight: 1.05,
            marginBottom: 16,
          }}
        >
          How to actually finish this.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--muted)", marginBottom: 8 }}>
          The version of this document we have for managers running it on a
          team is at <Link href="/teams/implementation" style={{ color: "var(--crimson)" }}>/teams/implementation</Link>.
          This is the version for you, alone, on a Tuesday morning.
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--muted)" }}>
          Twelve lessons. Two windows a week ≈ six weeks. One window a week
          ≈ twelve weeks. Either ends with you finished. Neither ends with
          you cramming.
        </p>
      </section>

      {/* Your block */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "16px 24px 32px" }}>
        <div
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
              letterSpacing: ".32em",
              textTransform: "uppercase",
              color: "var(--crimson)",
              marginBottom: 8,
            }}
          >
            Your window
          </p>
          {studyWindow?.day && studyWindow.time && studyWindow.place ? (
            <p style={{ fontSize: 16, lineHeight: 1.65, margin: 0 }}>
              <strong>{studyWindow.day.toUpperCase()} · {studyWindow.time}</strong>
              {" "}at <strong>{studyWindow.place}</strong>.
              {stakeholder ? ` You told ${stakeholder}.` : ""} Block it now if you haven&rsquo;t.
            </p>
          ) : (
            <p style={{ fontSize: 16, lineHeight: 1.65, margin: 0 }}>
              You haven&rsquo;t set a window yet.{" "}
              <Link href="/account/onboarding" style={{ color: "var(--crimson)" }}>
                Set one in 60 seconds →
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* Three rules */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "16px 24px 32px" }}>
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
          Three rules
        </p>
        <ol style={{ fontSize: 17, lineHeight: 1.8, paddingLeft: 24 }}>
          <li>
            <strong>Same window, every time.</strong> Don&rsquo;t shop the
            schedule — that&rsquo;s where the curriculum dies.
          </li>
          <li>
            <strong>One lesson per window.</strong> Even when you feel like
            you have momentum for two. Two-lesson days don&rsquo;t stick.
          </li>
          <li>
            <strong>The move counts, not the click-through.</strong> If you
            finished the lesson but didn&rsquo;t do the move, you didn&rsquo;t
            finish the lesson.
          </li>
        </ol>
      </section>

      {/* Twelve weeks */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "16px 24px 32px" }}>
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
          Twelve windows, twelve moves
        </p>
        <div style={{ display: "grid", gap: 16 }}>
          {WEEKS.map((w) => (
            <article
              key={w.num}
              style={{
                background: "#fff",
                border: "1px solid var(--light)",
                padding: "20px 24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 12,
                  marginBottom: 6,
                  flexWrap: "wrap",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: ".25em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    margin: 0,
                  }}
                >
                  {w.num} · {w.lesson}
                </p>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: ".22em",
                    color: "var(--muted)",
                  }}
                >
                  {w.estimate}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--display)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 22,
                  lineHeight: 1.15,
                  marginBottom: 8,
                }}
              >
                {w.title}
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.65, marginBottom: 10 }}>{w.brief}</p>
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  letterSpacing: ".22em",
                  textTransform: "uppercase",
                  color: "var(--crimson)",
                  marginBottom: 4,
                }}
              >
                This week&rsquo;s move
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink)" }}>{w.move}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 720, margin: "0 auto", padding: "16px 24px 96px" }}>
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
          If you fall behind
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--ink)", marginBottom: 10 }}>
          You will. Most people miss two or three weeks across the twelve.
          Don&rsquo;t restart from Lesson 1 — that&rsquo;s the trap. Open the
          dashboard, hit <em>Resume</em>, pick up where you left.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--ink)", marginBottom: 24 }}>
          If life&rsquo;s actually loud — board prep, quota week, family —
          pause the emails from <Link href="/account" style={{ color: "var(--crimson)" }}>your account</Link>{" "}
          for 2-12 weeks. Lifetime access doesn&rsquo;t change.
        </p>
        <Link
          href="/dashboard"
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
          Back to the dashboard →
        </Link>
      </section>
    </main>
  );
}
