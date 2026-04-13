export const dynamic = "force-dynamic";
export const maxDuration = 60; // LLM call can take up to ~30s

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateArtifacts, getCachedArtifact } from "@/lib/artifacts/generate";
import type { ArtifactType } from "@/lib/artifacts/types";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/artifacts?type=diagnostic|playbook|mirror
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

    const url = new URL(request.url);
    const type = url.searchParams.get("type") as ArtifactType | null;

    if (!type || !["diagnostic", "playbook", "mirror"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Use: diagnostic, playbook, or mirror" },
        { status: 400 }
      );
    }

    const artifact = await getCachedArtifact(user.id, type);

    if (!artifact) {
      return NextResponse.json(
        { error: "Artifact not generated yet. POST to /api/artifacts to generate." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      type: artifact.artifact_type,
      data: artifact.artifact_data,
      generatedAt: artifact.generated_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/artifacts
 *
 * Generate (or regenerate) all 3 artifacts for the authenticated user.
 * Uses cache — if progress data hasn't changed, returns cached versions instantly.
 *
 * Request body (optional):
 *   { "force": true }  — bypass cache and regenerate
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

    // Rate limit: 3 artifact generations per user per hour
    const rl = rateLimit(`artifacts:${user.id}`, { max: 3, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    // Get user profile for name and role
    const { data: purchase, error: purchaseErr } = await supabase
      .from("purchases")
      .select("customer_name")
      .eq("user_id", user.id)
      .maybeSingle();
    if (purchaseErr) {
      console.error("[artifacts] Purchase lookup failed:", purchaseErr.message);
    }

    // Get role from user metadata
    const role =
      (user.user_metadata?.role as "ae" | "sdr") ?? "sdr";

    const studentName =
      (typeof purchase?.customer_name === "string" ? purchase.customer_name : null) ??
      user.user_metadata?.full_name ??
      user.email?.split("@")[0] ??
      "Student";

    const result = await generateArtifacts({
      id: user.id,
      name: studentName,
      role,
      cohort: "01", // TODO: derive from purchase date or cohort table
    });

    return NextResponse.json({
      cached: result.cached,
      artifacts: {
        diagnostic: result.diagnostic,
        playbook: result.playbook,
        mirror: result.mirror,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    // Distinguish between "not enough data" and actual errors
    if (message.includes("No course progress")) {
      return NextResponse.json({ error: message }, { status: 422 });
    }

    // Log full error server-side, return generic message to client
    console.error("[artifacts] Generation failed:", message);
    return NextResponse.json(
      { error: "Artifact generation failed. Please try again later." },
      { status: 500 }
    );
  }
}
