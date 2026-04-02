import Link from "next/link";
import { redirect } from "next/navigation";

import MarkCompleteButton from "@/components/MarkCompleteButton";
import ProgressSaver from "@/components/ProgressSaver";
import {
  getToolAssetsForLesson,
  listLessonUnits,
} from "@/utils/content/catalog";
import { LESSONS } from "@/utils/progress/types";
import { createClient } from "@/utils/supabase/server";

interface LessonPageProps {
  params: Promise<{
    lessonId: string;
  }>;
  searchParams: Promise<{
    unit?: string;
  }>;
}

export default async function LessonPage({
  params,
  searchParams,
}: LessonPageProps) {
  const { lessonId } = await params;
  const { unit: requestedUnitId } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  const { data: progress, error: progressError } = await supabase
    .from("course_progress")
    .select("is_completed, last_screen, state_data")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (progressError) {
    console.error("Failed to load lesson progress:", progressError);
    throw new Error("Could not load lesson progress.");
  }

  const isCompleted = progress?.is_completed ?? false;
  const lastScreen = progress?.last_screen ?? 0;
  const stateData = (progress?.state_data as Record<string, unknown>) ?? {};
  const savedUnitId =
    typeof stateData.unit === "string" ? stateData.unit : undefined;

  const lesson = LESSONS.find((entry) => entry.id === lessonId);
  const units = await listLessonUnits(lessonId);
  const tools = getToolAssetsForLesson(lessonId);

  const selectedUnit =
    units.find((entry) => entry.unitId === requestedUnitId) ??
    units.find((entry) => entry.unitId === savedUnitId) ??
    units[0];

  const restoreScreen =
    selectedUnit && savedUnitId === selectedUnit.unitId ? lastScreen : 0;

  const iframeSrc = selectedUnit
    ? `/course/${lessonId}/units/${selectedUnit.unitId}${
        restoreScreen > 0 ? `?screen=${restoreScreen}` : ""
      }`
    : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_55%,_#111827_100%)] px-6 py-14 text-white">
      <ProgressSaver lessonId={lessonId} isAuthenticated={true} />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <nav>
          <Link
            href="/"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            &larr; Back to Lessons
          </Link>
        </nav>

        <section className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.38em] text-emerald-300/80">
            AESDR Course
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Lesson {lessonId}
              {lesson ? `: ${lesson.title}` : ""}
            </h1>
            {lesson && (
              <p className="max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                {lesson.subtitle}
              </p>
            )}
          </div>
        </section>

        {!isCompleted && selectedUnit && restoreScreen > 0 && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4">
            <p className="text-sm text-emerald-300">
              Welcome back - your progress was saved in Unit{" "}
              <strong>{selectedUnit.unitId}</strong>, screen{" "}
              <strong>{restoreScreen}</strong>.
            </p>
          </div>
        )}

        <section className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(2,6,23,0.35)] backdrop-blur">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
                Units
              </p>
              {units.length > 0 ? (
                <div className="space-y-3">
                  {units.map((unit) => {
                    const isActive = unit.unitId === selectedUnit?.unitId;

                    return (
                      <Link
                        key={unit.unitId}
                        href={`/course/${lessonId}?unit=${unit.unitId}`}
                        className={`block rounded-2xl border px-4 py-4 transition ${
                          isActive
                            ? "border-emerald-400/50 bg-emerald-500/10 text-white"
                            : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                          Unit {unit.unitId}
                        </p>
                        <p className="mt-2 text-sm leading-6">{unit.title}</p>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm leading-6 text-slate-400">
                  No lesson files were found for this module yet.
                </p>
              )}
            </div>

            {tools.length > 0 && (
              <div className="space-y-3 border-t border-white/10 pt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Related Tools
                </p>
                <div className="space-y-3">
                  {tools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      target="_blank"
                      className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                    >
                      {tool.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <section className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(2,6,23,0.35)] backdrop-blur">
            <div className="flex flex-col gap-3 border-b border-white/10 px-3 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Live Lesson
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {selectedUnit
                    ? `Unit ${selectedUnit.unitId}: ${selectedUnit.title}`
                    : "Lesson content unavailable"}
                </h2>
              </div>
              {selectedUnit && (
                <Link
                  href={iframeSrc ?? "#"}
                  target="_blank"
                  className="text-sm text-emerald-300 transition hover:text-emerald-200"
                >
                  Open unit in a new tab
                </Link>
              )}
            </div>

            {iframeSrc ? (
              <iframe
                key={iframeSrc}
                src={iframeSrc}
                title={`Lesson ${lessonId} unit ${selectedUnit?.unitId}`}
                className="h-[78vh] w-full rounded-2xl border border-white/10 bg-white"
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-slate-400">
                This module is not wired to lesson HTML yet.
              </div>
            )}
          </section>
        </section>

        <section className="flex justify-center border-t border-white/10 pt-8">
          <MarkCompleteButton
            lessonId={lessonId}
            initialIsCompleted={isCompleted}
          />
        </section>
      </div>
    </main>
  );
}
