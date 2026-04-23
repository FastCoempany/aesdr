import { createAdminClient } from "@/utils/supabase/admin";

import {
  extractGateResponses,
  extractCategoryScores,
  hashProgressData,
} from "./extract";
import { generateDiagnostic } from "./diagnostic";
import { extractPlaybill, extractRedline } from "./llm";
import type {
  DiagnosticData,
  PlaybillData,
  RedlineData,
  ArtifactType,
  StoredArtifact,
} from "./types";

/* ═══════════════════════════════════════════
   Artifact Generation Orchestrator
   ═══════════════════════════════════════════

   Entry point for generating end-of-course artifacts for a user.

   Three artifact types are produced:
   - diagnostic  — quantitative category scores (pure math, no LLM)
   - playbill    — theatrical synthesis (LLM: theatre-critic voice)
   - redline     — editorial synthesis (LLM: manuscript-editor voice)

   The Playbill and Redline are intentionally distinct readings of the
   same source data — one free (the student's pick), one unlocked via
   $40 upsell. Both LLM calls are issued in parallel.
═══════════════════════════════════════════ */

interface GenerateResult {
  diagnostic: DiagnosticData;
  playbill: PlaybillData;
  redline: RedlineData;
  cached: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  role: "ae" | "sdr";
  cohort: string;
}

/**
 * Generate all artifacts for a user.
 *
 * - Checks cache first (matching source_hash for all 3 = skip regeneration)
 * - Diagnostic is pure math (instant)
 * - Playbill and Redline are issued as parallel Claude API calls
 * - Stores results in generated_artifacts table
 */
export async function generateArtifacts(
  user: UserProfile
): Promise<GenerateResult> {
  const supabase = createAdminClient();

  // 1. Fetch all course progress for this user
  const { data: progressRows, error: progressError } = await supabase
    .from("course_progress")
    .select("lesson_id, is_completed, state_data")
    .eq("user_id", user.id);

  if (progressError) {
    throw new Error(`Failed to fetch progress: ${progressError.message}`);
  }

  if (!progressRows || progressRows.length === 0) {
    throw new Error("No course progress found. Complete at least one lesson first.");
  }

  // 2. Compute hash to check cache (includes role so AE↔SDR switch invalidates)
  const sourceHash = hashProgressData(progressRows, user.role);

  // 3. Check for cached artifacts with matching hash
  const { data: cached, error: cacheError } = await supabase
    .from("generated_artifacts")
    .select("artifact_type, artifact_data, source_hash")
    .eq("user_id", user.id);

  if (cacheError) {
    console.error("[artifacts] Cache lookup failed:", cacheError.message);
  }

  const cachedMap = new Map(
    (cached ?? []).map((row: { artifact_type: string; artifact_data: unknown; source_hash: string }) => [
      row.artifact_type,
      row,
    ])
  );

  const cachedDiag = cachedMap.get("diagnostic");
  const cachedPlaybill = cachedMap.get("playbill");
  const cachedRedline = cachedMap.get("redline");

  const allCached =
    cachedDiag && cachedPlaybill && cachedRedline &&
    cachedDiag.source_hash === sourceHash &&
    cachedPlaybill.source_hash === sourceHash &&
    cachedRedline.source_hash === sourceHash;

  if (allCached) {
    return {
      diagnostic: cachedDiag.artifact_data as DiagnosticData,
      playbill: cachedPlaybill.artifact_data as PlaybillData,
      redline: cachedRedline.artifact_data as RedlineData,
      cached: true,
    };
  }

  // 4. Extract data
  const gateResponses = extractGateResponses(progressRows);
  const categoryScores = extractCategoryScores(progressRows);

  if (gateResponses.length === 0) {
    throw new Error("No gate responses found. Complete at least one reflection gate before generating artifacts.");
  }

  // 5. Generate Diagnostic (no LLM)
  const diagnostic = generateDiagnostic(
    categoryScores,
    user.name,
    user.role,
    user.cohort
  );

  // 6. Generate Playbill + Redline in parallel (two independent LLM calls).
  //    They take identical inputs but produce distinct voices, so running
  //    them concurrently roughly halves the end-to-end wait.
  const [playbill, redline] = await Promise.all([
    extractPlaybill(gateResponses, categoryScores, user.role, user.name),
    extractRedline(gateResponses, categoryScores, user.role, user.name),
  ]);

  // 7. Store all artifacts (upsert)
  const artifacts: { type: ArtifactType; data: DiagnosticData | PlaybillData | RedlineData }[] = [
    { type: "diagnostic", data: diagnostic },
    { type: "playbill", data: playbill },
    { type: "redline", data: redline },
  ];

  const upsertErrors: string[] = [];
  for (const artifact of artifacts) {
    const { error: upsertError } = await supabase.from("generated_artifacts").upsert(
      {
        user_id: user.id,
        artifact_type: artifact.type,
        artifact_data: artifact.data,
        source_hash: sourceHash,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,artifact_type" }
    );
    if (upsertError) {
      upsertErrors.push(`${artifact.type}: ${upsertError.message}`);
    }
  }
  if (upsertErrors.length > 0) {
    console.error("[artifacts] Upsert errors:", upsertErrors.join("; "));
  }

  return { diagnostic, playbill, redline, cached: false };
}

/**
 * Fetch a single cached artifact without regenerating.
 * Returns null if not found.
 */
export async function getCachedArtifact(
  userId: string,
  type: ArtifactType
): Promise<StoredArtifact | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("generated_artifacts")
    .select("*")
    .eq("user_id", userId)
    .eq("artifact_type", type)
    .maybeSingle();

  if (error || !data) return null;
  return data as StoredArtifact;
}
