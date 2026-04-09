import type { Metadata } from "next";
import Link from "next/link";

import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";
import { LESSONS } from "@/utils/progress/types";
import type { LessonProgressSummary } from "@/utils/progress/types";

export const metadata: Metadata = {
  title: "Dashboard — Option C | AESDR",
};

const MISSION_BRIEFS: Record<string, { objective: string; intel: string }> = {
  "1": {
    objective: "Establish your operating structure before the chaos sets in.",
    intel: "Most reps improvise their first 90 days. The ones who survive don't.",
  },
  "2": {
    objective: "Identify and eliminate cross-functional friction points.",
    intel: "Your deal velocity is capped by your worst internal relationship.",
  },
  "3": {
    objective: "Build a self-coaching framework that doesn't require a manager.",
    intel: "The reps who develop fastest are the ones who stopped waiting for feedback.",
  },
  "4": {
    objective: "Execute cold calls without the performance anxiety.",
    intel: "Confidence isn't a personality trait. It's a repeatable process.",
  },
  "5": {
    objective: "Design multi-channel sequences that earn replies.",
    intel: "Your prospects get 147 emails a day. Yours needs to be the one they open.",
  },
  "6": {
    objective: "Deploy structured responses to the 7 most common objections.",
    intel: "Every objection is a buying signal disguised as rejection.",
  },
  "7": {
    objective: "Audit your pipeline and remove everything that isn't real.",
    intel: "A clean pipeline is a forecast you can defend in front of your VP.",
  },
  "8": {
    objective: "Run discovery calls that surface real pain, not rehearsed answers.",
    intel: "Bad discovery is the #1 reason deals stall in Stage 3.",
  },
  "9": {
    objective: "Reclaim 2+ hours of selling time per day.",
    intel: "CRM admin, internal meetings, Slack threads — your calendar is lying to you about how much you sell.",
  },
  "10": {
    objective: "Build financial resilience against comp plan changes.",
    intel: "Variable comp is a feature, not a bug. But only if you plan for the variance.",
  },
  "11": {
    objective: "Multi-thread into accounts with 3+ stakeholders.",
    intel: "Single-threaded deals have a 14% close rate. Multi-threaded: 41%.",
  },
  "12": {
    objective: "Execute a 72-hour strike plan to rescue your quarter.",
    intel: "Everything you've learned collapses into three days of focused execution.",
  },
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function MockupC() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let progressMap: Record<string, LessonProgressSummary> = {};
  if (user) {
    const { data } = await supabase
      .from("course_progress")
      .select("lesson_id, is_completed, last_screen")
      .eq("user_id", user.id);
    if (data) {
      for (const row of data) progressMap[row.lesson_id] = row;
    }
  }

  // Dev preview: no auth required, shows fresh-user state
  const isPreview = !user;

  const completedCount = LESSONS.filter((l) => progressMap[l.id]?.is_completed).length;
  const currentLesson = LESSONS.find((l) => !progressMap[l.id]?.is_completed) || LESSONS[0];
  const brief = MISSION_BRIEFS[currentLesson.id] || MISSION_BRIEFS["1"];
  const lastCompleted = [...LESSONS].reverse().find((l) => progressMap[l.id]?.is_completed);
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || (isPreview ? "Rep" : null);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-main)" }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-[5%] py-5"
        style={{ borderBottom: "1px solid var(--line)", background: "rgba(2,6,23,0.9)", backdropFilter: "blur(10px)" }}
      >
        <span style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase" }}>
          <span style={{ background: "var(--iris)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "iris 3s linear infinite" }}>AESDR</span>
        </span>
        <div className="flex items-center gap-4" style={{ fontFamily: "var(--cond)", fontWeight: 600, fontSize: "13px", letterSpacing: ".1em", textTransform: "uppercase" }}>
          <Link href="/account" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Account</Link>
          {user && <SignOutButton />}
        </div>
      </nav>

      <div className="mx-auto w-full max-w-2xl px-6 py-16" style={{ color: "var(--text-main)" }}>

        {/* Date + greeting */}
        <header className="mb-16">
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "10px",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "12px",
            }}
          >
            {dateStr}
          </p>
          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: "clamp(28px, 4vw, 40px)",
              lineHeight: "1.1",
            }}
          >
            {displayName
              ? `${getGreeting()}, ${displayName}.`
              : `${getGreeting()}.`}
          </h1>
        </header>

        {/* ─── THE BRIEF ─── */}
        <section
          className="mb-12"
          style={{
            border: "1px solid var(--line)",
            background: "var(--bg-panel)",
          }}
        >
          {/* Brief header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid var(--line)" }}
          >
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "var(--theme)",
                margin: 0,
              }}
            >
              Today&apos;s Brief
            </p>
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Lesson {currentLesson.id} of {LESSONS.length}
            </p>
          </div>

          {/* Brief body */}
          <div className="px-6 py-8">
            <p
              style={{
                fontFamily: "var(--cond)",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "8px",
              }}
            >
              Mission
            </p>
            <h2
              style={{
                fontFamily: "var(--cond)",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 700,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                lineHeight: "1.2",
                color: "var(--text-main)",
                marginBottom: "20px",
              }}
            >
              {currentLesson.title}
            </h2>

            <div className="space-y-4 mb-8">
              <div>
                <p
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "9px",
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "var(--theme)",
                    marginBottom: "4px",
                  }}
                >
                  Objective
                </p>
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "16px",
                    lineHeight: "1.6",
                    color: "var(--text-muted)",
                  }}
                >
                  {brief.objective}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "9px",
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "var(--amber)",
                    marginBottom: "4px",
                  }}
                >
                  Intel
                </p>
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "16px",
                    fontStyle: "italic",
                    lineHeight: "1.6",
                    color: "var(--text-muted)",
                  }}
                >
                  {brief.intel}
                </p>
              </div>
            </div>

            <Link
              href={`/course/${currentLesson.id}`}
              style={{
                display: "inline-block",
                fontFamily: "var(--cond)",
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: ".15em",
                textTransform: "uppercase",
                padding: "14px 36px",
                background: "var(--text-main)",
                color: "var(--bg-main)",
                textDecoration: "none",
              }}
            >
              {completedCount === 0 ? "Begin Mission" : "Continue Mission"}
            </Link>
          </div>
        </section>

        {/* ─── STATUS STRIP ─── */}
        <section className="mb-12">
          <div
            className="grid grid-cols-3 gap-px"
            style={{ background: "var(--line)" }}
          >
            {/* Completed */}
            <div className="px-5 py-5" style={{ background: "var(--bg-panel)" }}>
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "9px",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "8px",
                }}
              >
                Completed
              </p>
              <p
                style={{
                  fontFamily: "var(--display)",
                  fontSize: "32px",
                  lineHeight: "1",
                  color: "var(--theme)",
                }}
              >
                {completedCount}
              </p>
            </div>

            {/* Remaining */}
            <div className="px-5 py-5" style={{ background: "var(--bg-panel)" }}>
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "9px",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "8px",
                }}
              >
                Remaining
              </p>
              <p
                style={{
                  fontFamily: "var(--display)",
                  fontSize: "32px",
                  lineHeight: "1",
                  color: "var(--text-main)",
                }}
              >
                {LESSONS.length - completedCount}
              </p>
            </div>

            {/* Last completed */}
            <div className="px-5 py-5" style={{ background: "var(--bg-panel)" }}>
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "9px",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "8px",
                }}
              >
                Last Cleared
              </p>
              <p
                style={{
                  fontFamily: "var(--cond)",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  color: lastCompleted ? "var(--text-main)" : "var(--text-muted)",
                  lineHeight: "1.3",
                }}
              >
                {lastCompleted ? lastCompleted.title : "None yet"}
              </p>
            </div>
          </div>
        </section>

        {/* ─── COMPLETED LOG (only if they've finished anything) ─── */}
        {completedCount > 0 && (
          <section>
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "16px",
              }}
            >
              Mission Log
            </p>
            <div className="flex flex-col" style={{ gap: "1px", background: "var(--line)" }}>
              {LESSONS.filter((l) => progressMap[l.id]?.is_completed).map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/course/${lesson.id}`}
                  className="flex items-center justify-between px-5 py-4"
                  style={{
                    background: "var(--bg-panel)",
                    textDecoration: "none",
                    color: "var(--text-main)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "10px",
                        letterSpacing: ".14em",
                        color: "var(--theme)",
                      }}
                    >
                      {lesson.id.padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--cond)",
                        fontSize: "15px",
                        fontWeight: 600,
                        letterSpacing: ".04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {lesson.title}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "9px",
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      color: "var(--theme)",
                    }}
                  >
                    Review &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
