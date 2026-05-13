import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ProgressSaver from "@/components/ProgressSaver";
import SaveExitButton from "@/components/SaveExitButton";
import { Mascot } from "@/components/brand/Mascot";
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

      {/* Iframe offset by 48px from top so the floating Save & Exit
          (left) and tool-download (right) controls have their own
          band above the lesson content. Prevents the buttons from
          overlapping the "COURSE N" chip / lesson title that lives
          at the top of the lesson HTML. */}
      {iframeSrc ? (
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          sandbox="allow-scripts allow-same-origin allow-forms"
          style={{
            position: "fixed",
            top: 48,
            left: 0,
            width: "100vw",
            height: "calc(100dvh - 48px)",
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

      {/* Unified course-page header bar — sits in the 48px band above
          the iframe. Center: Leponeus + AESDR brand. Right: tool
          downloads (if lesson complete) + Save & Exit. */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          zIndex: 9999,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "0 12px",
          background: "var(--cream)",
          borderBottom: "1px solid var(--light)",
        }}
      >
        {/* Left spacer — keeps the center column truly centered */}
        <div />

        {/* Center: Leponeus + AESDR brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Mascot pose="doctrine" size={36} priority />
          <span
            style={{
              fontFamily: "var(--display)",
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: 20,
              letterSpacing: ".04em",
              background: "var(--iris)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AESDR
          </span>
        </div>

        {/* Right: tool downloads (only on completed lessons) + Save & Exit */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
            flexWrap: "wrap" as const,
            rowGap: 4,
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
                  padding: "8px 12px",
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
          <SaveExitButton />
        </div>
      </header>
    </>
  );
}
