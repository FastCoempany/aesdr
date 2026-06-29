export const dynamic = "force-dynamic";
export const maxDuration = 60; // LLM call can take up to ~30s

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { generateArtifacts, getCachedArtifact } from "@/lib/artifacts/generate";
import type { ArtifactType } from "@/lib/artifacts/types";
import { rateLimit } from "@/lib/rate-limit";
import { LESSONS } from "@/utils/progress/types";

/**
 * P1-8: the artifact API must be gated on course completion, like /reveal —
 * otherwise any logged-in buyer can generate/pull their end-of-course keeper
 * without finishing. Returns true if all twelve lessons are complete or the
 * founder-bypass cookie is set.
 */
async function hasCompletedCourse(
  supabase: SupabaseClient,
  user: User
): Promise<boolean> {
  if (isAdminEmail(user.email)) return true;

  const { data: progress } = await supabase
    .from("course_progress")
    .select("lesson_id, is_completed")
    .eq("user_id", user.id);

  const completedCount = (progress ?? []).filter((r) => r.is_completed).length;
  return completedCount >= LESSONS.length;
}

/**
 * Resolve the student name + role for generation (shared by POST and the
 * GET-on-empty backfill).
 */
async function resolveProfile(supabase: SupabaseClient, user: User) {
  const { data: purchase, error: purchaseErr } = await supabase
    .from("purchases")
    .select("customer_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (purchaseErr) {
    console.error("[artifacts] Purchase lookup failed:", purchaseErr.message);
  }

  const role = (user.user_metadata?.role as "ae" | "sdr") ?? "sdr";
  const name =
    (typeof purchase?.customer_name === "string" ? purchase.customer_name : null) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Student";

  return { name, role, cohort: "01" as const };
}

/**
 * GET /api/artifacts?type=diagnostic|playbill|redline
 *
 * Fetch a single cached artifact. Returns 404 if not generated yet.
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // P1-8: gate on course completion.
    if (!(await hasCompletedCourse(supabase, user))) {
      return NextResponse.json(
        { error: "Finish all twelve courses to unlock your artifacts." },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type") as ArtifactType | null;

    if (!type || !["diagnostic", "playbill", "redline"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Use: diagnostic, playbill, or redline" },
        { status: 400 }
      );
    }

    let artifact = await getCachedArtifact(user.id, type);

    // P0-5: nothing in the app POSTed /api/artifacts, so the cache the pages
    // read was never populated. Now that we've confirmed the course is
    // complete, generate on first read if the artifact is missing, then
    // re-fetch. Rate-limited so a hammered page can't spin up generations.
    if (!artifact) {
      const rl = await rateLimit(`artifacts-gen:${user.id}`, {
        max: 3,
        windowMs: 60 * 60 * 1000,
      });
      if (rl.success) {
        try {
          const profile = await resolveProfile(supabase, user);
          await generateArtifacts({ id: user.id, ...profile });
          artifact = await getCachedArtifact(user.id, type);
        } catch (genErr) {
          Sentry.captureException(genErr, {
            extra: { handler: "GET /api/artifacts", phase: "backfill-generate" },
          });
        }
      }
    }

    if (!artifact) {
      return NextResponse.json(
        { error: "Artifact not ready yet." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      type: artifact.artifact_type,
      data: artifact.artifact_data,
      generatedAt: artifact.generated_at,
    });
  } catch (err) {
    Sentry.captureException(err, { extra: { handler: "GET /api/artifacts" } });
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/artifacts
 *
 * Generate (or regenerate) all end-of-course artifacts for the
 * authenticated user: diagnostic (pure math), playbill (theatrical),
 * and redline (editorial). Uses cache — if progress data hasn't
 * changed, returns cached versions instantly.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // P1-8: gate on course completion (mirror /reveal + the GET above).
    if (!(await hasCompletedCourse(supabase, user))) {
      return NextResponse.json(
        { error: "Finish all twelve courses to unlock your artifacts." },
        { status: 403 }
      );
    }

    // Rate limit: 3 artifact generations per user per hour
    const rl = await rateLimit(`artifacts:${user.id}`, { max: 3, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const profile = await resolveProfile(supabase, user);
    const result = await generateArtifacts({ id: user.id, ...profile });

    return NextResponse.json({
      cached: result.cached,
      artifacts: {
        diagnostic: result.diagnostic,
        playbill: result.playbill,
        redline: result.redline,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    // Distinguish between "not enough data" and actual errors
    if (message.includes("No course progress")) {
      return NextResponse.json({ error: message }, { status: 422 });
    }

    Sentry.captureException(err, { extra: { handler: "POST /api/artifacts" } });
    return NextResponse.json(
      { error: "Artifact generation failed. Please try again later." },
      { status: 500 }
    );
  }
}
