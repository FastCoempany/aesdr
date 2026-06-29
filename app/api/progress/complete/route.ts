import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import {
  ALL_LESSON_IDS,
  listLessonUnits,
  getUnitScreenCount,
} from "@/utils/content/catalog";
import { generateArtifacts } from "@/lib/artifacts/generate";
import { LESSONS } from "@/utils/progress/types";

export const maxDuration = 60; // artifact generation (LLM) can run on the all-12 completion

const KNOWN_LESSON_IDS = new Set<string>(ALL_LESSON_IDS);

/**
 * Mark a lesson UNIT complete (and, once every unit of the lesson is done,
 * the lesson itself).
 *
 * AUDIT history on this route:
 *  - R3-CURR-2 / decision #10: it used to mark *any* lessonId complete on a
 *    bare client assertion (no validation, no progress check). It now (a)
 *    rejects lessonIds outside the known twelve and (b) requires server-side
 *    evidence — the saved course_progress state shows the learner reached the
 *    unit's final screen — before flipping completion.
 *  - P0-7: completion is now tracked per UNIT. The lesson is only
 *    `is_completed` once all of its units have been finished, so units 2 & 3
 *    can no longer be skipped by finishing unit 1.
 *  - P0-5: when the final lesson is completed (all twelve done), this fires
 *    end-of-course artifact generation so the artifact pages populate.
 *
 * Body: { lessonId: string, unitId?: string, unitCount?: number }
 * `unitId`/`unitCount` are sent by ProgressSaver. When absent (older clients)
 * the lesson is treated as single-unit and the row-level last_screen is used
 * as the evidence source.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit(`progress-complete:${user.id}`, {
    max: 30,
    windowMs: 60 * 1000,
  });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const lessonId = body?.lessonId;

  // R3-CURR-2: validate the lessonId is one of the known twelve.
  if (!lessonId || typeof lessonId !== "string" || !KNOWN_LESSON_IDS.has(lessonId)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Resolve the unit set for this lesson from disk (the source of truth).
  const units = await listLessonUnits(lessonId);
  const unitIds = units.map((u) => u.unitId);
  const totalUnits = unitIds.length > 0 ? unitIds.length : 1;

  const claimedUnitId =
    typeof body?.unitId === "string" && unitIds.includes(body.unitId)
      ? body.unitId
      : unitIds[0] ?? "1";

  // ── Load the current row to (a) read evidence and (b) merge completion ──
  const { data: row, error: readErr } = await supabase
    .from("course_progress")
    .select("last_screen, state_data, is_completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (readErr) {
    return NextResponse.json({ error: "Failed to read progress" }, { status: 500 });
  }

  const stateData: Record<string, unknown> = (row?.state_data as Record<string, unknown>) ?? {};
  const unitsBlob = (stateData._units as Record<string, Record<string, unknown>> | undefined) ?? {};
  const unitState = unitsBlob[claimedUnitId];

  // ── Server-side evidence (decision #10): the learner must have reached
  //    the unit's final screen. The lesson engine fires aesdr:complete at
  //    screen TOTAL-1; we read TOTAL from the unit file and require the saved
  //    screen to be at/after it. We accept evidence from either the per-unit
  //    blob's _screen marker (stamped by ProgressSaver) or the row-level
  //    last_screen (single-unit / legacy rows). ──
  const totalScreens = await getUnitScreenCount(lessonId, claimedUnitId);
  const finalScreenIndex = totalScreens ? totalScreens - 1 : null;

  const unitScreen =
    typeof unitState?._screen === "number" ? (unitState._screen as number) : null;
  const rowScreen = typeof row?.last_screen === "number" ? row.last_screen : null;
  const observedScreen = Math.max(unitScreen ?? 0, rowScreen ?? 0);

  // If we can determine the final screen, require evidence of reaching it.
  // If we can't read TOTAL (file missing), fall back to "a row exists with
  // some progress" rather than blocking the learner outright.
  const reachedFinal =
    finalScreenIndex === null
      ? observedScreen > 0 || !!unitState
      : observedScreen >= finalScreenIndex;

  if (!reachedFinal) {
    return NextResponse.json(
      { error: "Completion evidence not found for this unit." },
      { status: 409 }
    );
  }

  // ── Merge unit-completion bookkeeping into state_data ──
  const unitsComplete: Record<string, boolean> = {
    ...((stateData._unitsComplete as Record<string, boolean> | undefined) ?? {}),
  };
  unitsComplete[claimedUnitId] = true;

  // Also ensure the per-unit blob exists & carries the completion flag so the
  // extractor and the player both see it.
  const nextUnitsBlob: Record<string, Record<string, unknown>> = { ...unitsBlob };
  nextUnitsBlob[claimedUnitId] = {
    ...(nextUnitsBlob[claimedUnitId] ?? {}),
    unitComplete: true,
    completedAt: new Date().toISOString(),
  };

  // AUDIT (adversarial pass 2026-06-29): the merge_lesson_progress RPC rebuilds
  // state_data from the incoming unit only, so top-level `_unitsComplete` is wiped
  // on the next /api/progress save — a prior unit's flag is gone by the time the
  // next unit completes, and no multi-unit lesson could ever finish. The per-unit
  // `_units[id].unitComplete` flag survives the merge, so count completion from
  // EITHER source. (The RPC is also hardened to carry top-level keys forward — see
  // 20260629_merge_lesson_progress_preserve_toplevel.sql.)
  const completedUnitCount = unitIds.filter(
    (id) => unitsComplete[id] === true || nextUnitsBlob[id]?.unitComplete === true,
  ).length;
  const lessonComplete = completedUnitCount >= totalUnits;

  const nextStateData: Record<string, unknown> = {
    ...stateData,
    _units: nextUnitsBlob,
    _unitsComplete: unitsComplete,
  };

  const { error: writeErr } = await supabase.from("course_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      is_completed: lessonComplete,
      completed_at: lessonComplete ? new Date().toISOString() : null,
      state_data: nextStateData,
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (writeErr) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  // ── P0-5: trigger end-of-course artifact generation once the whole course
  //    is finished. We re-read the completion set with the admin client so the
  //    just-written row is reflected, then fire generation if all twelve are
  //    done. Best-effort: a generation failure must not fail the completion
  //    write (the artifact pages also backfill on first load). ──
  let courseComplete = false;
  if (lessonComplete) {
    try {
      const admin = createAdminClient();
      const { data: allRows } = await admin
        .from("course_progress")
        .select("lesson_id, is_completed")
        .eq("user_id", user.id);

      const completedLessons = new Set(
        (allRows ?? []).filter((r) => r.is_completed).map((r) => r.lesson_id)
      );
      courseComplete = ALL_LESSON_IDS.every((id) => completedLessons.has(id));

      if (courseComplete) {
        const { data: purchase } = await admin
          .from("purchases")
          .select("customer_name")
          .eq("user_id", user.id)
          .maybeSingle();

        const role = (user.user_metadata?.role as "ae" | "sdr") ?? "sdr";
        const studentName =
          (typeof purchase?.customer_name === "string" ? purchase.customer_name : null) ??
          (user.user_metadata?.full_name as string | undefined) ??
          user.email?.split("@")[0] ??
          "Student";

        await generateArtifacts({
          id: user.id,
          name: studentName,
          role,
          cohort: "01",
        });
      }
    } catch (err) {
      // Don't fail the completion on a generation error.
      Sentry.captureException(err, {
        extra: { handler: "POST /api/progress/complete", phase: "artifact-generation", userId: user.id },
      });
    }
  }

  revalidatePath("/dashboard");

  return NextResponse.json({
    success: true,
    lessonComplete,
    courseComplete,
    completedUnitCount,
    totalUnits,
    // Surface the lesson-12 sentinel so the client can route to /reveal when
    // the course is finished, instead of always bouncing to /dashboard.
    isFinalLesson: lessonId === LESSONS[LESSONS.length - 1].id,
  });
}
