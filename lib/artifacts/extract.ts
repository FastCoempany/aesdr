import crypto from "node:crypto";

import { UNIT_CATEGORY_MAP } from "./categories";
import type { GateResponse, CategoryScore } from "./types";
import { CATEGORY_META } from "./categories";
import type { ArtifactCategory } from "./categories";

/** Shape of a gate entry within unit state_data */
interface GateEntry {
  completed?: boolean;
  value?: string;
  completedAt?: string;
}

/** Shape of the _extra field within each unit's state_data */
interface ExtraData {
  exerciseScores?: Record<string, { correct: number; total: number }>;
  quizScore?: { correct: number; total: number };
}

/** Shape of a single unit's state_data (inside the _units namespace) */
interface UnitStateData {
  unit?: string;
  _extra?: ExtraData;
  [key: string]: unknown; // gate_1, gate_3, gate_8, etc.
}

/** Shape of the full state_data column from course_progress */
interface StateData {
  unit?: string;
  _units?: Record<string, UnitStateData>;
  _extra?: ExtraData;
  [key: string]: unknown; // top-level flat gates for iframe restore compat
}

/**
 * Shape of a course_progress row from Supabase.
 * state_data contains _units: { "1": { gate_1: {...}, ... }, "2": {...} }
 */
export interface ProgressRow {
  lesson_id: string;
  is_completed: boolean;
  state_data: StateData;
}

/* ═══════════════════════════════════════════
   Extract gate responses from all progress rows
   ═══════════════════════════════════════════ */

/**
 * Extract all completed gate text responses across all lessons and units.
 * Returns them tagged with category and source metadata.
 */
export function extractGateResponses(rows: ProgressRow[]): GateResponse[] {
  const responses: GateResponse[] = [];

  for (const row of rows) {
    const stateData: StateData = row.state_data ?? {};
    const units = stateData._units ?? {};

    // Also check top-level gates (for rows saved before the merge update)
    const unitKeys = Object.keys(units);
    if (unitKeys.length === 0) {
      // Legacy format: gates at top level, unit from stateData.unit
      const unitId = stateData.unit ?? "1";
      extractGatesFromUnit(row.lesson_id, unitId, stateData, responses);
    } else {
      for (const [unitId, unitData] of Object.entries(units)) {
        if (unitData && typeof unitData === "object") {
          extractGatesFromUnit(row.lesson_id, unitId, unitData, responses);
        }
      }
    }
  }

  return responses;
}

function extractGatesFromUnit(
  lessonId: string,
  unitId: string,
  unitData: UnitStateData,
  out: GateResponse[]
): void {
  const unitIndex = parseInt(unitId, 10);
  if (isNaN(unitIndex)) return;
  const mapping = UNIT_CATEGORY_MAP.find(
    (m) => m.lessonId === lessonId && m.unitIndex === unitIndex
  );
  if (!mapping) return;

  // Find all gate_ keys in the unit data
  for (const [key, val] of Object.entries(unitData)) {
    if (!key.startsWith("gate_")) continue;
    if (typeof val !== "object" || !val) continue;
    const gate = val as GateEntry;
    if (!gate.completed || !gate.value?.trim()) continue;

    out.push({
      lessonId,
      unitIndex,
      category: mapping.category,
      label: mapping.label,
      gateKey: key,
      text: gate.value.trim(),
      completedAt: gate.completedAt ?? null,
    });
  }
}

/* ═══════════════════════════════════════════
   Extract exercise/quiz scores per category
   ═══════════════════════════════════════════ */

/**
 * Aggregate exercise and quiz accuracy by category.
 *
 * The _extra field in each unit's state_data contains:
 *   _extra.exerciseScores: { "silo": { correct: 4, total: 6 }, "blame": { correct: 3, total: 4 }, ... }
 *   _extra.quizScore: { correct: 3, total: 4 }
 *
 * We sum correct/total across all units within each category.
 */
export function extractCategoryScores(rows: ProgressRow[]): CategoryScore[] {
  const buckets: Record<ArtifactCategory, { correct: number; total: number }> = {
    pipeline: { correct: 0, total: 0 },
    discipline: { correct: 0, total: 0 },
    networking: { correct: 0, total: 0 },
    identity: { correct: 0, total: 0 },
    career: { correct: 0, total: 0 },
    coaching: { correct: 0, total: 0 },
  };

  for (const row of rows) {
    const stateData: StateData = row.state_data ?? {};
    const units = stateData._units ?? {};

    const unitEntries: [string, UnitStateData][] = Object.keys(units).length > 0
      ? Object.entries(units)
      : [[stateData.unit ?? "1", stateData as UnitStateData]];

    for (const [unitId, unitData] of unitEntries) {
      if (!unitData || typeof unitData !== "object") continue;

      const unitIndex = parseInt(unitId, 10);
      const mapping = UNIT_CATEGORY_MAP.find(
        (m) => m.lessonId === row.lesson_id && m.unitIndex === unitIndex
      );
      if (!mapping) continue;

      const extra = unitData._extra;
      if (!extra) continue;

      const bucket = buckets[mapping.category];

      // Sum exercise scores
      if (extra.exerciseScores) {
        for (const score of Object.values(extra.exerciseScores)) {
          bucket.correct += score.correct ?? 0;
          bucket.total += score.total ?? 0;
        }
      }

      // Sum quiz scores
      if (extra.quizScore) {
        bucket.correct += extra.quizScore.correct ?? 0;
        bucket.total += extra.quizScore.total ?? 0;
      }
    }
  }

  return Object.entries(buckets)
    .map(([cat, { correct, total }]) => ({
      category: cat as ArtifactCategory,
      name: CATEGORY_META[cat as ArtifactCategory].name,
      correct,
      total,
      pct: total > 0 ? Math.round((correct / total) * 100) : 0,
    }))
    .sort(
      (a, b) =>
        CATEGORY_META[a.category].displayOrder -
        CATEGORY_META[b.category].displayOrder
    );
}

/* ═══════════════════════════════════════════
   Hash for cache invalidation
   ═══════════════════════════════════════════ */

/**
 * Generate a hash of all progress data plus user metadata to detect when
 * artifacts need regeneration. If the hash matches the stored artifact's
 * source_hash, we skip re-generation.
 *
 * Includes role so that switching AE↔SDR invalidates cached artifacts.
 */
export function hashProgressData(rows: ProgressRow[], role?: string): string {
  const normalized = rows
    .map((r) => ({
      lesson_id: r.lesson_id,
      state_data: r.state_data,
    }))
    .sort((a, b) => a.lesson_id.localeCompare(b.lesson_id, undefined, { numeric: true }));

  return crypto
    .createHash("sha256")
    .update(JSON.stringify({ rows: normalized, role: role ?? "" }))
    .digest("hex")
    .slice(0, 16);
}
