import type { Metadata } from "next";
import Link from "next/link";

import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";
import { LESSONS } from "@/utils/progress/types";

export const metadata: Metadata = {
  title: "Your Lessons | AESDR",
  description: "Access your 12-course AESDR curriculum. Track progress, complete lessons, and download tools.",
};
import type { LessonProgressSummary } from "@/utils/progress/types";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Force password change for users with temp passwords
  if (user?.user_metadata?.needs_password_change) {
    redirect("/account/set-password");
  }

  // Force role selection before accessing courses
  if (user && !user.user_metadata?.role) {
    redirect("/account/select-role");
  }

  let progressMap: Record<string, LessonProgressSummary> = {};

  if (user) {
    const { data } = await supabase
      .from("course_progress")
      .select("lesson_id, is_completed, last_screen")
      .eq("user_id", user.id);

    if (data) {
      for (const row of data) {
        progressMap[row.lesson_id] = row;
      }
    }
  }

  const nextLessonId = LESSONS.find(
    (l) => !progressMap[l.id]?.is_completed
  )?.id;

  const completedCount = LESSONS.filter(
    (l) => progressMap[l.id]?.is_completed
  ).length;

  return (
    <main
      className="min-h-screen px-6 py-0"
      style={{ background: "var(--bg-main)" }}
    >
      {/* Top nav bar */}
      <nav
        aria-label="Main navigation"
        className="sticky top-0 z-50 -mx-6 flex items-center justify-between border-b px-[5%] py-5"
        style={{
          borderColor: "var(--line)",
          background: "rgba(2,6,23,0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="flex items-center gap-3"
          style={{ fontFamily: "var(--cond)", fontSize: "18px", fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase" as const }}
        >
          <span
            style={{
              background: "var(--iris)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "iris 3s linear infinite",
            }}
          >
            AESDR
          </span>
        </div>
        <div
          className="flex items-center gap-6"
          style={{ fontFamily: "var(--cond)", fontWeight: 600, fontSize: "13px", letterSpacing: ".1em", textTransform: "uppercase" as const }}
        >
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/account" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
                Account
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <Link href="/login" style={{ color: "var(--theme)" }}>
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <div className="mx-auto w-full max-w-5xl py-16" style={{ color: "var(--text-main)" }}>
        {/* Welcome banner for brand-new users */}
        {user && completedCount === 0 && !Object.keys(progressMap).length && (
          <div
            className="mb-8"
            style={{
              padding: "20px 24px",
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.15)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--cond)",
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: ".04em",
                textTransform: "uppercase" as const,
                color: "var(--theme)",
                marginBottom: "6px",
              }}
            >
              Welcome to AESDR
            </p>
            <p
              style={{
                fontFamily: "var(--serif)",
                fontSize: "15px",
                color: "var(--text-muted)",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              You have access to all 12 lessons and 5 downloadable tools. Start with Lesson 1 below — it&apos;s marked &quot;Up Next&quot; for you.
            </p>
          </div>
        )}

        {/* Header */}
        <header className="mb-14 space-y-5">
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              letterSpacing: ".3em",
              textTransform: "uppercase" as const,
              color: "var(--theme)",
              display: "inline-block",
              border: "1px solid var(--theme)",
              padding: "4px 12px",
              borderRadius: "2px",
            }}
          >
            12-Course Curriculum
          </p>
          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: "clamp(36px, 5vw, 56px)",
              lineHeight: ".95",
              color: "var(--text-main)",
            }}
          >
            Your Lessons
          </h1>
          {user ? (
            <div className="flex items-center gap-5 pt-2">
              <div
                className="h-[2px] w-32 sm:w-48"
                style={{ background: "var(--bg-card)" }}
              >
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${Math.round((completedCount / LESSONS.length) * 100)}%`,
                    background: "var(--iris)",
                    backgroundSize: "200% 100%",
                    animation: "iris 3s linear infinite",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  letterSpacing: ".1em",
                  textTransform: "uppercase" as const,
                  color: "var(--text-muted)",
                }}
              >
                {completedCount} / {LESSONS.length} completed
              </span>
            </div>
          ) : (
            <p style={{ fontFamily: "var(--serif)", fontSize: "18px", color: "var(--text-muted)" }}>
              <Link href="/login" style={{ color: "var(--theme)" }}>
                Sign in
              </Link>{" "}
              to save and restore your progress across sessions.
            </p>
          )}
        </header>

        {/* Lesson Grid */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LESSONS.map((lesson) => {
            const progress = progressMap[lesson.id];
            const isCompleted = progress?.is_completed ?? false;
            const lastScreen = progress?.last_screen ?? 0;
            const isNext = lesson.id === nextLessonId;
            const screenPct =
              lesson.totalScreens > 1
                ? Math.round(
                    (lastScreen / (lesson.totalScreens - 1)) * 100
                  )
                : 0;

            return (
              <Link
                key={lesson.id}
                href={`/course/${lesson.id}`}
                className="group relative flex flex-col gap-4 p-6 transition-all hover:scale-[1.02]"
                style={{
                  background: isCompleted
                    ? "rgba(16,185,129,0.05)"
                    : isNext
                      ? "var(--bg-card)"
                      : "var(--bg-panel)",
                  border: isCompleted
                    ? "1px solid rgba(16,185,129,0.3)"
                    : isNext
                      ? "1px solid rgba(16,185,129,0.4)"
                      : "1px solid var(--line)",
                  boxShadow: isNext ? "0 0 30px rgba(16,185,129,0.08)" : "none",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "9px",
                      letterSpacing: ".24em",
                      textTransform: "uppercase" as const,
                      color: "var(--text-muted)",
                    }}
                  >
                    Lesson {lesson.id}
                  </span>
                  {isCompleted && (
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "9px",
                        letterSpacing: ".14em",
                        textTransform: "uppercase" as const,
                        color: "var(--theme)",
                      }}
                    >
                      Completed
                    </span>
                  )}
                  {!isCompleted && isNext && (
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "9px",
                        letterSpacing: ".14em",
                        textTransform: "uppercase" as const,
                        color: "var(--amber)",
                      }}
                    >
                      Up Next
                    </span>
                  )}
                </div>

                <h2
                  style={{
                    fontFamily: "var(--cond)",
                    fontSize: "18px",
                    fontWeight: 700,
                    letterSpacing: ".04em",
                    textTransform: "uppercase" as const,
                    lineHeight: "1.3",
                    color: "var(--text-main)",
                  }}
                >
                  {lesson.title}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "15px",
                    color: "var(--text-muted)",
                    lineHeight: "1.5",
                  }}
                >
                  {lesson.subtitle}
                </p>

                {user && !isCompleted && lastScreen > 0 && (
                  <div className="mt-auto pt-2">
                    <div
                      className="flex items-center justify-between"
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "9px",
                        letterSpacing: ".14em",
                        textTransform: "uppercase" as const,
                        color: "var(--text-muted)",
                      }}
                    >
                      <span>Progress</span>
                      <span>{screenPct}%</span>
                    </div>
                    <div
                      className="mt-1 h-[2px]"
                      style={{ background: "var(--bg-card)" }}
                    >
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${screenPct}%`,
                          background: "var(--iris)",
                          backgroundSize: "200% 100%",
                          animation: "iris 3s linear infinite",
                        }}
                      />
                    </div>
                  </div>
                )}

                {isCompleted && (
                  <div
                    className="pointer-events-none absolute right-5 bottom-5 text-xl"
                    style={{ color: "rgba(16,185,129,0.3)" }}
                  >
                    &#10003;
                  </div>
                )}
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
