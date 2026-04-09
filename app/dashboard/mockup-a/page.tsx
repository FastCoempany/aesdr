import type { Metadata } from "next";
import Link from "next/link";

import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";
import { LESSONS } from "@/utils/progress/types";
import type { LessonProgressSummary } from "@/utils/progress/types";

export const metadata: Metadata = {
  title: "Dashboard — Option A | AESDR",
};

const BRIEFINGS: Record<string, { line: string; directive: string }> = {
  "1": {
    line: "Most reps fail in their first 90 days. Not because they lack talent — because nobody gave them a structure worth following.",
    directive: "Your structure starts here.",
  },
  "2": {
    line: "You closed the deal. Marketing sourced the lead. Customer Success inherited the mess. Nobody talked to each other. Sound familiar?",
    directive: "Learn to break the walls down.",
  },
  "3": {
    line: "Your manager gave you a Gong playlist and called it coaching. That's not development — that's delegation.",
    directive: "Build what they won't give you.",
  },
  "4": {
    line: "You've been staring at the dialer for seven minutes. The call takes forty-five seconds. Do the math on what fear is actually costing you.",
    directive: "Pick up the phone.",
  },
  "5": {
    line: "Your last sequence had a 2% reply rate. That's not a market problem. That's a message problem.",
    directive: "Fix the message.",
  },
  "6": {
    line: "\"We're happy with our current vendor.\" You froze. They hung up. That objection has a playbook. You just never learned it.",
    directive: "Learn it now.",
  },
  "7": {
    line: "You have 47 \"opportunities\" in your pipeline. Eleven of them are real. You don't have a pipeline problem — you have a honesty problem.",
    directive: "Get honest about your numbers.",
  },
  "8": {
    line: "You asked \"what keeps you up at night\" and thought that was discovery. It wasn't. It was a cliche wearing a question mark.",
    directive: "Ask questions that actually matter.",
  },
  "9": {
    line: "You worked 11 hours yesterday. Four of them were selling. The rest was admin theater. You're not overworked — you're misallocated.",
    directive: "Reclaim your time.",
  },
  "10": {
    line: "They changed your comp plan in Q3. You found out in an email. By Q4 you were underwater. This keeps happening because you let it.",
    directive: "Protect your earnings.",
  },
  "11": {
    line: "One thread. One champion. One prayer. That's not a deal strategy — that's a lottery ticket.",
    directive: "Multi-thread or die.",
  },
  "12": {
    line: "You've done the reading. You've done the exercises. Now it's time to execute a plan that doesn't forgive procrastination.",
    directive: "72 hours. No excuses.",
  },
};

export default async function MockupA() {
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
  const briefing = BRIEFINGS[currentLesson.id] || BRIEFINGS["1"];
  const isFirstTime = completedCount === 0;

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-main)" }}
    >
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-[5%] py-5"
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

      {/* Full viewport centered content */}
      <div
        className="flex flex-col items-center justify-center px-6"
        style={{ minHeight: "calc(100vh - 65px)" }}
      >
        <div className="w-full max-w-2xl text-center" style={{ color: "var(--text-main)" }}>

          {/* Status line */}
          {completedCount > 0 && (
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "40px",
              }}
            >
              {completedCount} of {LESSONS.length} completed
            </p>
          )}

          {/* Lesson number */}
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              letterSpacing: ".3em",
              textTransform: "uppercase",
              color: "var(--theme)",
              marginBottom: "24px",
            }}
          >
            {isFirstTime ? "Begin" : `Lesson ${currentLesson.id}`}
          </p>

          {/* Lesson title */}
          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: "clamp(36px, 6vw, 64px)",
              lineHeight: ".95",
              color: "var(--text-main)",
              marginBottom: "32px",
            }}
          >
            {currentLesson.title}
          </h1>

          {/* Briefing text */}
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(17px, 2.2vw, 21px)",
              lineHeight: "1.8",
              color: "var(--text-muted)",
              maxWidth: "540px",
              margin: "0 auto 48px",
            }}
          >
            {briefing.line}
          </p>

          {/* Single CTA */}
          <Link
            href={`/course/${currentLesson.id}`}
            style={{
              display: "inline-block",
              fontFamily: "var(--cond)",
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              padding: "18px 48px",
              background: "var(--text-main)",
              color: "var(--bg-main)",
              textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            {isFirstTime ? briefing.directive : `Continue — ${briefing.directive}`}
          </Link>

          {/* Subtle progress indicator (dots) */}
          {completedCount > 0 && (
            <div
              className="flex items-center justify-center gap-2 mt-16"
            >
              {LESSONS.map((l) => (
                <div
                  key={l.id}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: progressMap[l.id]?.is_completed
                      ? "var(--theme)"
                      : l.id === currentLesson.id
                        ? "var(--text-main)"
                        : "var(--line)",
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
