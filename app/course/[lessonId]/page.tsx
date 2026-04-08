import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import MarkCompleteButton from "@/components/MarkCompleteButton";
import ProgressSaver from "@/components/ProgressSaver";
import { listLessonUnits, getToolAssetsForLesson } from "@/utils/content/catalog";
import { LESSONS } from "@/utils/progress/types";
import { createClient } from "@/utils/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = LESSONS.find((l) => l.id === lessonId);
  return {
    title: lesson ? `Lesson ${lesson.id}: ${lesson.title} | AESDR` : "Lesson | AESDR",
    description: lesson?.subtitle ?? "AESDR course lesson.",
  };
}

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
    redirect("/login");
  }

  // Purchase gate — bypass for founder (GhostButton cookie)
  const cookieStore = await cookies();
  const hasBypass = cookieStore.get("aesdr_bypass")?.value === "1";

  if (!hasBypass) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_email", user.email)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!purchase) {
      redirect("/#pricing");
    }
  }

  const { data: progress, error: progressError } = await supabase
    .from("course_progress")
    .select("is_completed, last_screen, state_data")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (progressError) {
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
    <>
      <ProgressSaver lessonId={lessonId} isAuthenticated={true} />

      {/* Full-screen iframe — course content owns the entire viewport */}
      {iframeSrc ? (
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          sandbox="allow-scripts allow-same-origin allow-forms"
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100dvh",
            border: "none",
            background: "#fff",
          }}
          title={
            selectedUnit
              ? `Unit ${selectedUnit.unitId}: ${selectedUnit.title}`
              : "Lesson content"
          }
        />
      ) : (
        <main
          className="flex h-screen items-center justify-center"
          style={{
            background: "var(--bg-main)",
            fontFamily: "var(--serif)",
            fontSize: "18px",
            color: "var(--text-muted)",
          }}
        >
          No lesson content found for this module.
        </main>
      )}

      {/* Floating controls — top-left: back, top-right: units + complete */}
      <div
        style={{
          position: "fixed",
          top: "12px",
          left: "12px",
          zIndex: 9999,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: ".1em",
            textTransform: "uppercase" as const,
            color: "#fff",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            padding: "8px 12px",
            textDecoration: "none",
            display: "inline-block",
            minHeight: "32px",
            lineHeight: "16px",
          }}
        >
          <span aria-hidden="true">&larr;</span> Lessons
        </Link>
      </div>

      <div
        style={{
          position: "fixed",
          top: "12px",
          right: "12px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          flexWrap: "wrap" as const,
          justifyContent: "flex-end",
          maxWidth: "calc(100vw - 90px)",
          rowGap: "4px",
        }}
      >
        {/* Unit tabs */}
        {units.length > 1 &&
          units.map((unit) => {
            const isActive = unit.unitId === selectedUnit?.unitId;
            return (
              <Link
                key={unit.unitId}
                href={`/course/${lessonId}?unit=${unit.unitId}`}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  letterSpacing: ".1em",
                  textTransform: "uppercase" as const,
                  color: "#fff",
                  background: isActive
                    ? "rgba(0,0,0,0.8)"
                    : "rgba(0,0,0,0.4)",
                  backdropFilter: "blur(8px)",
                  padding: "6px 10px",
                  textDecoration: "none",
                  minWidth: "28px",
                  textAlign: "center" as const,
                  flexShrink: 0,
                }}
              >
                {unit.unitId}
              </Link>
            );
          })}

        <div
          style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            flexShrink: 0,
            lineHeight: "normal",
            display: "flex",
            alignItems: "center",
            overflow: "visible",
          }}
        >
          <MarkCompleteButton
            lessonId={lessonId}
            initialIsCompleted={isCompleted}
          />
        </div>

        {isCompleted &&
          tools.map((tool) => (
            <a
              key={tool.slug}
              href={`/tools/${encodeURIComponent(tool.slug)}/download`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "9px",
                letterSpacing: ".12em",
                textTransform: "uppercase" as const,
                padding: "6px 14px",
                color: "#fff",
                background: "rgba(16,185,129,0.7)",
                backdropFilter: "blur(8px)",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              <span aria-hidden="true">↓</span> Download {tool.title}
            </a>
          ))}
      </div>
    </>
  );
}
