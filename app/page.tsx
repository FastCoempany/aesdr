import Link from "next/link";

import { createClient } from "@/utils/supabase/server";
import { LESSONS } from "@/utils/progress/types";
import type { LessonProgressSummary } from "@/utils/progress/types";

export default async function Dashboard() {
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
    <main className="min-h-screen bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_55%,_#111827_100%)] px-6 py-14 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        {/* Header */}
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-emerald-300/80">
            AESDR Course
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your Lessons
          </h1>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="h-2 w-48 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{
                    width: `${Math.round((completedCount / LESSONS.length) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-sm text-slate-400">
                {completedCount} / {LESSONS.length} completed
              </span>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              <Link href="/login" className="text-emerald-300 hover:text-emerald-200">
                Sign in
              </Link>{" "}
              to save and restore your progress across sessions.
            </p>
          )}
        </header>

        {/* Lesson Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                className={`group relative flex flex-col gap-3 rounded-2xl border p-6 transition-all hover:scale-[1.02] hover:shadow-lg ${
                  isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : isNext
                      ? "border-emerald-400/50 bg-white/[0.04] shadow-[0_0_24px_rgba(16,185,129,0.12)]"
                      : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Lesson {lesson.id}
                  </span>
                  {isCompleted && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Completed
                    </span>
                  )}
                  {!isCompleted && isNext && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                      Up Next
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-semibold leading-snug tracking-tight">
                  {lesson.title}
                </h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  {lesson.subtitle}
                </p>

                {user && !isCompleted && lastScreen > 0 && (
                  <div className="mt-auto pt-2">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                      <span>Progress</span>
                      <span>{screenPct}%</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-500/60 transition-all"
                        style={{ width: `${screenPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {isCompleted && (
                  <div className="pointer-events-none absolute right-4 bottom-4 text-2xl text-emerald-500/40">
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
