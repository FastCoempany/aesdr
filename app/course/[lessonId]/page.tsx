import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ProgressSaver from "@/components/ProgressSaver";
import SaveExitButton from "@/components/SaveExitButton";
import { listLessonUnits, getToolAssetsForLesson } from "@/utils/content/catalog";
import { LESSONS } from "@/utils/progress/types";
import { createClient } from "@/utils/supabase/server";
import { verifyPaidAccess } from "@/utils/access/verifyAccess";
import { readDemoSession } from "@/lib/demo-mode-server";

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
  const demoSession = await readDemoSession();

  const {
    data: { user: realUser },
    error: authError,
  } = await supabase.auth.getUser();

  // Demo mode short-circuits the login redirect and synthesises a user
  // with role pre-selected so the lesson renders without account setup.
  const user = demoSession
    ? {
        id: demoSession.user.id,
        email: demoSession.user.email,
        user_metadata: {
          role: demoSession.user.role,
          full_name: demoSession.user.full_name,
        },
      }
    : realUser;

  if (!demoSession && (authError || !realUser)) {
    redirect("/login");
  }

  // Force password change for users with temp passwords (skipped in demo)
  if (!demoSession && realUser?.user_metadata?.needs_password_change) {
    redirect("/account/set-password");
  }

  // Force role selection before accessing courses (skipped in demo)
  if (!demoSession && !realUser?.user_metadata?.role) {
    redirect("/account/select-role");
  }

  const userRole: string = user!.user_metadata.role as string;

  // Purchase gate — bypass for founder (GhostButton cookie)
  const cookieStore = await cookies();
  const hasBypass = cookieStore.get("aesdr_bypass")?.value === "1";

  // Parallelize: access check + progress fetch both depend on user.id only.
  // Demo sessions resolve both to synthetic values without touching Supabase.
  const [hasAccess, progressResult] = demoSession
    ? [
        true as boolean,
        {
          data: {
            is_completed: demoSession.lessonsCompleted.includes(lessonId),
            last_screen:
              demoSession.currentLessonId === lessonId
                ? demoSession.currentLessonUnitsCompleted
                : demoSession.lessonsCompleted.includes(lessonId)
                  ? 999
                  : 0,
            state_data: {} as Record<string, unknown>,
          },
          error: null as null | Error,
        },
      ]
    : await Promise.all([
        hasBypass ? Promise.resolve(true) : verifyPaidAccess(supabase, realUser!),
        supabase
          .from("course_progress")
          .select("is_completed, last_screen, state_data")
          .eq("user_id", realUser!.id)
          .eq("lesson_id", lessonId)
          .maybeSingle(),
      ]);

  if (!hasAccess) {
    redirect("/login?reason=no_purchase");
  }

  const { data: progress, error: progressError } = progressResult;
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
    ? (() => {
        const params = new URLSearchParams();
        if (restoreScreen > 0) params.set("screen", String(restoreScreen));
        params.set("role", userRole);
        // Pass demo flag through to the iframe so the lesson route handler
        // can inject the gating-bypass script into the served HTML.
        if (demoSession) params.set("demo", "1");
        const qs = params.toString();
        return `/course/${lessonId}/units/${selectedUnit.unitId}${qs ? `?${qs}` : ""}`;
      })()
    : null;

  return (
    <>
      <ProgressSaver lessonId={lessonId} isAuthenticated={true} savedStateData={stateData} />

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
            zIndex: 1,
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

      {/* Floating controls — top-left: back, top-right: tool downloads */}
      <div
        style={{
          position: "fixed",
          top: "12px",
          left: "12px",
          zIndex: 9999,
        }}
      >
        <SaveExitButton />
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
                padding: "14px 16px",
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
