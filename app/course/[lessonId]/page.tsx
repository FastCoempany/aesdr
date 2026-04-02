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
    <main
      className="min-h-screen px-6 py-0"
      style={{ background: "var(--bg-main)" }}
    >
      <ProgressSaver lessonId={lessonId} isAuthenticated={true} />

      {/* Top nav */}
      <nav
        className="sticky top-0 z-50 -mx-6 flex items-center justify-between border-b px-[5%] py-5"
        style={{
          borderColor: "var(--line)",
          background: "rgba(2,6,23,0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="flex items-center gap-3"
          style={{
            fontFamily: "var(--cond)",
            fontSize: "18px",
            fontWeight: 800,
            letterSpacing: ".2em",
            textTransform: "uppercase" as const,
          }}
        >
          <Link href="/">
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
          </Link>
        </div>
        <Link
          href="/"
          style={{
            fontFamily: "var(--cond)",
            fontWeight: 600,
            fontSize: "13px",
            letterSpacing: ".1em",
            textTransform: "uppercase" as const,
            color: "var(--text-muted)",
          }}
        >
          &larr; Back to Lessons
        </Link>
      </nav>

      <div
        className="mx-auto w-full max-w-6xl py-10"
        style={{ color: "var(--text-main)" }}
      >
        {/* Lesson header */}
        <header className="mb-8 space-y-4">
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
            }}
          >
            Lesson {lessonId}
          </p>
          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: "clamp(28px, 4vw, 48px)",
              lineHeight: ".95",
              color: "var(--text-main)",
            }}
          >
            {lesson ? lesson.title : `Lesson ${lessonId}`}
          </h1>
          {lesson && (
            <p
              style={{
                fontFamily: "var(--serif)",
                fontSize: "18px",
                color: "var(--text-muted)",
                maxWidth: "600px",
              }}
            >
              {lesson.subtitle}
            </p>
          )}
        </header>

        {/* Restored progress notice */}
        {!isCompleted && selectedUnit && restoreScreen > 0 && (
          <div
            className="mb-8 px-5 py-4"
            style={{
              borderLeft: "3px solid var(--theme)",
              background: "rgba(16,185,129,0.05)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--serif)",
                fontSize: "15px",
                color: "var(--theme)",
              }}
            >
              Welcome back — your progress was saved in Unit{" "}
              <strong>{selectedUnit.unitId}</strong>, screen{" "}
              <strong>{restoreScreen}</strong>.
            </p>
          </div>
        )}

        {/* Main layout: sidebar + iframe */}
        <section className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside
            className="space-y-6 p-6"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--line)",
            }}
          >
            <div className="space-y-4">
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "9px",
                  letterSpacing: ".24em",
                  textTransform: "uppercase" as const,
                  color: "var(--text-muted)",
                }}
              >
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
                        className="relative block px-4 py-4 transition"
                        style={{
                          background: isActive ? "rgba(16,185,129,0.08)" : "transparent",
                          borderLeft: isActive ? "3px solid var(--amber)" : "3px solid transparent",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "9px",
                            letterSpacing: ".14em",
                            textTransform: "uppercase" as const,
                            color: isActive ? "var(--amber)" : "var(--text-muted)",
                          }}
                        >
                          Unit {unit.unitId}
                        </p>
                        <p
                          className="mt-2"
                          style={{
                            fontFamily: "var(--cond)",
                            fontSize: "13px",
                            fontWeight: 700,
                            letterSpacing: ".04em",
                            textTransform: "uppercase" as const,
                            lineHeight: "1.4",
                            color: isActive ? "var(--text-main)" : "var(--text-muted)",
                          }}
                        >
                          {unit.title}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "14px",
                    color: "var(--text-muted)",
                  }}
                >
                  No lesson files were found for this module yet.
                </p>
              )}
            </div>

            {/* Related tools */}
            {tools.length > 0 && (
              <div
                className="space-y-4 pt-6"
                style={{ borderTop: "1px solid var(--line)" }}
              >
                <p
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "9px",
                    letterSpacing: ".24em",
                    textTransform: "uppercase" as const,
                    color: "var(--text-muted)",
                  }}
                >
                  Related Tools
                </p>
                <div className="space-y-3">
                  {tools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      target="_blank"
                      className="block px-4 py-4 transition"
                      style={{
                        border: "1px solid var(--line)",
                        fontFamily: "var(--cond)",
                        fontSize: "12px",
                        fontWeight: 600,
                        letterSpacing: ".04em",
                        textTransform: "uppercase" as const,
                        color: "var(--text-muted)",
                      }}
                    >
                      {tool.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Iframe content area */}
          <section
            className="space-y-5 p-5"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--line)",
            }}
          >
            <div
              className="flex flex-col gap-3 border-b px-3 pb-5 sm:flex-row sm:items-end sm:justify-between"
              style={{ borderColor: "var(--line)" }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "9px",
                    letterSpacing: ".24em",
                    textTransform: "uppercase" as const,
                    color: "var(--text-muted)",
                  }}
                >
                  Live Lesson
                </p>
                <h2
                  className="mt-2"
                  style={{
                    fontFamily: "var(--cond)",
                    fontSize: "20px",
                    fontWeight: 700,
                    letterSpacing: ".04em",
                    textTransform: "uppercase" as const,
                    color: "var(--text-main)",
                  }}
                >
                  {selectedUnit
                    ? `Unit ${selectedUnit.unitId}: ${selectedUnit.title}`
                    : "Lesson content unavailable"}
                </h2>
              </div>
              {selectedUnit && (
                <Link
                  href={iframeSrc ?? "#"}
                  target="_blank"
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "10px",
                    letterSpacing: ".1em",
                    textTransform: "uppercase" as const,
                    color: "var(--theme)",
                  }}
                >
                  Open in new tab
                </Link>
              )}
            </div>

            {iframeSrc ? (
              <iframe
                key={iframeSrc}
                src={iframeSrc}
                className="w-full border-0"
                style={{
                  minHeight: "80vh",
                  background: "var(--bg-card)",
                }}
                title={
                  selectedUnit
                    ? `Unit ${selectedUnit.unitId}: ${selectedUnit.title}`
                    : "Lesson content"
                }
              />
            ) : (
              <div
                className="flex items-center justify-center py-20"
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "16px",
                  color: "var(--text-muted)",
                }}
              >
                Select a unit from the sidebar to begin.
              </div>
            )}
          </section>
        </section>

        {/* Completion button */}
        <section
          className="mt-10 flex justify-center pt-8"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <MarkCompleteButton
            lessonId={lessonId}
            initialIsCompleted={isCompleted}
          />
        </section>
      </div>
    </main>
  );
}
