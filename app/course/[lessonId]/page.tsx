import Link from "next/link";
import { redirect } from "next/navigation";

import MarkCompleteButton from "@/components/MarkCompleteButton";
import ProgressSaver from "@/components/ProgressSaver";
import { listLessonUnits } from "@/utils/content/catalog";
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
    <main className="flex h-screen flex-col" style={{ background: "var(--bg-main)" }}>
      <ProgressSaver lessonId={lessonId} isAuthenticated={true} />

      {/* Minimal top bar — just navigation and unit switcher */}
      <nav
        className="flex shrink-0 items-center justify-between px-5 py-2"
        style={{
          background: "var(--bg-panel)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="flex items-center gap-6">
          <Link
            href="/"
            style={{
              fontFamily: "var(--cond)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase" as const,
              color: "var(--text-muted)",
            }}
          >
            &larr; Lessons
          </Link>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "10px",
              letterSpacing: ".14em",
              textTransform: "uppercase" as const,
              color: "var(--theme)",
            }}
          >
            {lesson ? `${lesson.title}` : `Lesson ${lessonId}`}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Unit tabs */}
          {units.length > 1 && (
            <div className="flex items-center gap-1">
              {units.map((unit) => {
                const isActive = unit.unitId === selectedUnit?.unitId;
                return (
                  <Link
                    key={unit.unitId}
                    href={`/course/${lessonId}?unit=${unit.unitId}`}
                    className="px-3 py-1 transition"
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      letterSpacing: ".1em",
                      textTransform: "uppercase" as const,
                      color: isActive ? "var(--text-main)" : "var(--text-muted)",
                      background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                    }}
                  >
                    {unit.unitId}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Completion state */}
          <MarkCompleteButton
            lessonId={lessonId}
            initialIsCompleted={isCompleted}
          />
        </div>
      </nav>

      {/* Full-screen iframe — the course content IS the page */}
      {iframeSrc ? (
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          className="w-full flex-1 border-0"
          style={{ background: "#fff" }}
          title={
            selectedUnit
              ? `Unit ${selectedUnit.unitId}: ${selectedUnit.title}`
              : "Lesson content"
          }
        />
      ) : (
        <div
          className="flex flex-1 items-center justify-center"
          style={{
            fontFamily: "var(--serif)",
            fontSize: "18px",
            color: "var(--text-muted)",
          }}
        >
          No lesson content found for this module.
        </div>
      )}
    </main>
  );
}
