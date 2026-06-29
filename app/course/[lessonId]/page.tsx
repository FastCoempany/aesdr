import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ProgressSaver from "@/components/ProgressSaver";
import SaveExitButton from "@/components/SaveExitButton";
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import { listLessonUnits, getToolAssetsForLesson } from "@/utils/content/catalog";
import { LESSONS } from "@/utils/progress/types";
import { createClient } from "@/utils/supabase/server";
import { verifyPaidAccess } from "@/utils/access/verifyAccess";

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

  // Force password change for users with temp passwords
  if (user.user_metadata?.needs_password_change) {
    redirect("/account/set-password");
  }

  // Force role selection before accessing courses
  if (!user.user_metadata?.role) {
    redirect("/account/select-role");
  }

  const userRole: string = user.user_metadata.role;

  // Purchase gate — bypass for founder (GhostButton cookie)
  const cookieStore = await cookies();
  const hasBypass = cookieStore.get("aesdr_bypass")?.value === "1";

  // Parallelize: access check + progress fetch both depend on user.id only.
  const [hasAccess, progressResult] = await Promise.all([
    hasBypass ? Promise.resolve(true) : verifyPaidAccess(supabase, user),
    supabase
      .from("course_progress")
      .select("is_completed, last_screen, state_data")
      .eq("user_id", user.id)
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

  // Per-unit completion bookkeeping written by /api/progress/complete (P0-7).
  const unitsComplete =
    (stateData._unitsComplete as Record<string, boolean> | undefined) ?? {};

  const lesson = LESSONS.find((entry) => entry.id === lessonId);
  const units = await listLessonUnits(lessonId);
  const tools = getToolAssetsForLesson(lessonId);

  // Unit selection: explicit ?unit= wins; else resume the last-saved unit;
  // else the first unfinished unit; else unit 1.
  const firstUnfinished = units.find((u) => !unitsComplete[u.unitId]);
  const selectedUnit =
    units.find((entry) => entry.unitId === requestedUnitId) ??
    units.find((entry) => entry.unitId === savedUnitId) ??
    firstUnfinished ??
    units[0];

  const selectedIndex = selectedUnit
    ? units.findIndex((u) => u.unitId === selectedUnit.unitId)
    : -1;
  // The unit to advance to when this unit's terminal CTA fires. Null on the
  // last unit (the CTA then keeps its original /dashboard target).
  const nextUnit =
    selectedIndex >= 0 && selectedIndex < units.length - 1
      ? units[selectedIndex + 1]
      : null;

  // Per-unit restore screen: read from the unit's own blob (_units[id]._screen)
  // when available, else the row-level last_screen if this is the saved unit.
  const unitBlob =
    (stateData._units as Record<string, Record<string, unknown>> | undefined)?.[
      selectedUnit?.unitId ?? ""
    ];
  const unitScreen =
    typeof unitBlob?._screen === "number" ? (unitBlob._screen as number) : 0;
  const restoreScreen =
    unitScreen > 0
      ? unitScreen
      : selectedUnit && savedUnitId === selectedUnit.unitId
        ? lastScreen
        : 0;

  const iframeSrc = selectedUnit
    ? (() => {
        const params = new URLSearchParams();
        if (restoreScreen > 0) params.set("screen", String(restoreScreen));
        params.set("role", userRole);
        const qs = params.toString();
        return `/course/${lessonId}/units/${selectedUnit.unitId}${qs ? `?${qs}` : ""}`;
      })()
    : null;

  return (
    <>
      <ProgressSaver
        lessonId={lessonId}
        isAuthenticated={true}
        savedStateData={stateData}
        unitId={selectedUnit?.unitId}
        unitCount={units.length}
        nextUnitId={nextUnit?.unitId ?? null}
      />

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
            background: "var(--cream)",
            fontFamily: "var(--serif)",
            fontSize: "18px",
            color: "var(--muted)",
          }}
        >
          No lesson content found for this course.
        </main>
      )}

      {/* Save & Exit — top-left, aligned with the lesson's own topbar
          band (which carries the "Section N · progress" indicator on
          the opposite right side). */}
      <div
        style={{
          position: "fixed",
          top: 9,
          left: 12,
          zIndex: 9999,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <SaveExitButton />
        {/* "Stuck?" surface — H.3.2. Opens a mailto with the lesson +
            screen prefilled so the founder gets actionable context. */}
        <a
          href={`mailto:hello@aesdr.com?subject=${encodeURIComponent(
            `Stuck on Lesson ${lessonId}${selectedUnit ? ` · Unit ${selectedUnit.unitId}` : ""}`
          )}&body=${encodeURIComponent(
            `Hey,\n\nStuck on Lesson ${lessonId}${selectedUnit ? `, Unit ${selectedUnit.unitId} (${selectedUnit.title})` : ""}, around screen ${restoreScreen || 1}.\n\nWhat's tripping me up:\n\n[one sentence]\n\nThanks.`
          )}`}
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "rgba(107,107,107,0.7)",
            textDecoration: "none",
            padding: "8px 10px",
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(250,247,242,0.85)",
          }}
        >
          Stuck?
        </a>
      </div>

      {/* Center: Leponeus + AESDR iris-shimmer wordmark. Sized to fit
          inside the ~50px lesson-topbar band so it sits on the same
          horizontal line as Save & Exit (left) and the lesson's own
          progress indicator (right). */}
      <div
        style={{
          position: "fixed",
          top: 6,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Mascot pose="doctrine" size={MASCOT_SIZE.inline} priority />
        <span
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: 22,
            lineHeight: 1,
            letterSpacing: ".04em",
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

      {/* Unit stepper — AUDIT (P0-7). The product is sold as three sub-units
          per lesson, but the player loaded only one and marked the lesson
          complete after it. This makes units 2 & 3 reachable and shows which
          are done. A unit is openable once the previous one is complete (or
          it's already complete, or the lesson is). Pinned bottom-center, clear
          of Save&Exit (top-left), the wordmark (top-center) and the tool
          downloads (top-right). */}
      {units.length > 1 && selectedUnit && (
        <nav
          aria-label="Lesson units"
          style={{
            position: "fixed",
            bottom: 14,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            background: "rgba(250,247,242,0.92)",
            border: "1px solid rgba(0,0,0,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginRight: 4,
            }}
          >
            Units
          </span>
          {units.map((u, i) => {
            const done = !!unitsComplete[u.unitId] || isCompleted;
            const prevDone = i === 0 || !!unitsComplete[units[i - 1].unitId];
            const isSelected = u.unitId === selectedUnit.unitId;
            // Openable: already done, currently selected, the first unit, the
            // unit right after a completed one, or the whole lesson is done.
            const openable = isCompleted || done || isSelected || prevDone;
            const label = `${i + 1}`;

            const sharedStyle: React.CSSProperties = {
              fontFamily: "var(--cond)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".06em",
              width: 30,
              height: 30,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: isSelected
                ? "2px solid var(--crimson)"
                : done
                  ? "1px solid var(--crimson)"
                  : "1px solid var(--light)",
              background: done ? "var(--crimson)" : "transparent",
              color: done ? "#fff" : isSelected ? "var(--crimson)" : "var(--muted)",
              textDecoration: "none",
            };

            return openable ? (
              <Link
                key={u.unitId}
                href={`/course/${lessonId}?unit=${u.unitId}`}
                aria-current={isSelected ? "step" : undefined}
                title={`Unit ${u.unitId}: ${u.title}`}
                style={sharedStyle}
              >
                {done ? "✓" : label}
              </Link>
            ) : (
              <span
                key={u.unitId}
                aria-disabled="true"
                title={`Unit ${u.unitId} — finish the previous unit first`}
                style={{ ...sharedStyle, opacity: 0.45, cursor: "not-allowed" }}
              >
                {label}
              </span>
            );
          })}
        </nav>
      )}

      {/* Tool downloads — only on completed lessons. Pinned to the
          right, below the lesson's topbar (which carries the
          progress bar in that horizontal position). */}
      {isCompleted && tools.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 80,
            right: 12,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap" as const,
            justifyContent: "flex-end",
            maxWidth: "calc(100vw - 24px)",
            rowGap: 4,
          }}
        >
          {tools.map((tool) => (
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
                background: "rgba(139,26,26,0.7)",
                backdropFilter: "blur(8px)",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              <span aria-hidden="true">↓</span> Download {tool.title}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
