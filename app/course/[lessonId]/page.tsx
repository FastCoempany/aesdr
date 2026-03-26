import { redirect } from "next/navigation";

import MarkCompleteButton from "@/components/MarkCompleteButton";
import { createClient } from "@/utils/supabase/server";

interface LessonPageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
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
    .select("is_completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (progressError) {
    console.error("Failed to load lesson progress:", progressError);
    throw new Error("Could not load lesson progress.");
  }

  const isCompleted = progress?.is_completed ?? false;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_55%,_#111827_100%)] px-6 py-14 text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
        <section className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.38em] text-emerald-300/80">
            AESDR Course
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Lesson {lessonId}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              This page is wired to Supabase-backed progress. Replace this
              placeholder with the actual lesson content and keep the completion
              button at the end of the lesson flow.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_20px_80px_rgba(2,6,23,0.35)] backdrop-blur">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
              Lesson Body
            </p>
            <div className="space-y-4 text-slate-200">
              <p>
                Pull your real lesson data into this route or compose it from
                local content modules.
              </p>
              <p>
                The page already knows whether this user has completed the
                lesson, so the initial button state renders correctly with no
                client-side flicker.
              </p>
            </div>
          </div>
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
