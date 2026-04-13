import { createAdminClient } from "@/utils/supabase/admin";

import {
  extractGateResponses,
  extractCategoryScores,
  hashProgressData,
} from "./extract";
import { generateDiagnostic } from "./diagnostic";
import { extractWithLLM } from "./llm";
import type {
  DiagnosticData,
  PlaybookData,
  MirrorData,
  ArtifactType,
  StoredArtifact,
} from "./types";

/* ═══════════════════════════════════════════
   Artifact Generation Orchestrator
   ═══════════════════════════════════════════

   Entry point for generating all 3 artifacts for a user.
   Handles caching, data extraction, LLM calls, and storage.
═══════════════════════════════════════════ */

interface GenerateResult {
  diagnostic: DiagnosticData;
  playbook: PlaybookData;
  mirror: MirrorData;
  cached: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  role: "ae" | "sdr";
  cohort: string;
}

/**
 * Generate all 3 artifacts for a user.
 *
 * - Checks cache first (source_hash match = skip regeneration)
 * - Diagnostic is pure math (instant)
 * - Playbook + Mirror use one Claude API call
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
  const cachedPlay = cachedMap.get("playbook");
  const cachedMirr = cachedMap.get("mirror");

  const allCached =
    cachedDiag && cachedPlay && cachedMirr &&
    cachedDiag.source_hash === sourceHash &&
    cachedPlay.source_hash === sourceHash &&
    cachedMirr.source_hash === sourceHash;

  if (allCached) {
    return {
      diagnostic: cachedDiag.artifact_data as DiagnosticData,
      playbook: cachedPlay.artifact_data as PlaybookData,
      mirror: cachedMirr.artifact_data as MirrorData,
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

  // 6. Generate Playbook + Mirror (one LLM call)
  const llmResult = await extractWithLLM(gateResponses, categoryScores, user.role);

  const playbook: PlaybookData = {
    studentName: user.name,
    role: user.role,
    generatedAt: new Date().toISOString(),
    totalGates: gateResponses.length,
    sections: llmResult.playbook.sections,
  };

  const mirror: MirrorData = {
    studentName: user.name,
    role: user.role,
    generatedAt: new Date().toISOString(),
    confrontations: llmResult.mirror.confrontations,
  };

  // 7. Store all 3 artifacts (upsert)
  const artifacts: { type: ArtifactType; data: DiagnosticData | PlaybookData | MirrorData }[] = [
    { type: "diagnostic", data: diagnostic },
    { type: "playbook", data: playbook },
    { type: "mirror", data: mirror },
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

  return { diagnostic, playbook, mirror, cached: false };
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
