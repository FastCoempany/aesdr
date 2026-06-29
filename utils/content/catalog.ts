import fs from "node:fs/promises";
import path from "node:path";

import { cache } from "react";

/** A single unit (module) within a lesson */
export interface LessonUnit {
  unitId: string;
  title: string;
  filename: string;
}

/** A tool asset linked to a specific lesson */
export interface ToolAsset {
  slug: string;
  title: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "content", "lessons", "html");
const TOOLS_ROOT = path.join(process.cwd(), "tools", "standalone-html");

/**
 * Map of lesson ID → array of tool assets associated with that lesson.
 * The slug matches the filename (minus .html) in /tools/standalone-html/.
 */
const TOOL_MAP: Record<string, ToolAsset[]> = {
  "3":  [{ slug: "3.3-aesdr-alignment-contract", title: "AE/SDR Alignment Contract" }],
  "4":  [
    { slug: "4.1-manager-archetype-map", title: "Manager Archetype Map" },
    { slug: "4.3-async-cadence-template", title: "Async Cadence Template" },
  ],
  "6":  [{ slug: "6.3-idk-framework", title: "\"I Don't Know\" Framework" }],
  "9":  [
    { slug: "9.1-crm-survival-guide", title: "CRM Survival Guide" },
    { slug: "9.2-time-reclaimed-calculator", title: "Time Reclaimed Calculator" },
  ],
  "10": [{ slug: "10.1-ROI-commission-defense-tracker", title: "ROI & Commission Defense Tracker" }],
  // The 72-Hour Strike Plan was relocated to an end-of-course bonus
  // (gated on all twelve lessons complete). See app/tools/[slug]/download
  // /route.ts — slug "bonus-72-hr-strike-plan" with the "ALL" gate. It
  // intentionally no longer appears in any single lesson's tool list.
};
export const BONUS_TOOLS: ToolAsset[] = [
  { slug: "bonus-72-hr-strike-plan", title: "72-Hour Strike Plan" },
];

/**
 * Extract the <title> text from an HTML file's first few lines.
 * Falls back to a generated title if parsing fails.
 */
async function extractTitle(filePath: string, unitId: string): Promise<string> {
  try {
    const handle = await fs.open(filePath, "r");
    const buf = Buffer.alloc(2048);
    await handle.read(buf, 0, 2048, 0);
    await handle.close();
    const head = buf.toString("utf-8");
    const match = head.match(/<title[^>]*>(.*?)<\/title>/i);
    if (match?.[1]) {
      // Strip "AESDR — " prefix if present for cleaner display
      return match[1].replace(/^AESDR\s*[—–-]\s*/i, "").trim();
    }
  } catch {
    // file read failed — fall through to default
  }
  return `Unit ${unitId}`;
}

/**
 * List all units (modules) for a given lesson, sorted by unit number.
 * Reads the lesson directory and maps filenames to unit IDs.
 *
 * File naming conventions:
 *   lesson-01/aesdr_course01_v1.html     → unit 1
 *   lesson-01/aesdr_course01_2_v1.html   → unit 2
 *   lesson-01/aesdr_course01_3_v1.html   → unit 3
 *   lesson-02/aesdr_course02_1_v1.html   → unit 1
 *   lesson-02/aesdr_course02_2_v1.html   → unit 2
 *   etc.
 */
export const listLessonUnits = cache(
  async (lessonId: string): Promise<LessonUnit[]> => {
    const paddedId = lessonId.padStart(2, "0");
    const lessonDir = path.join(CONTENT_ROOT, `lesson-${paddedId}`);

    let files: string[];
    try {
      files = await fs.readdir(lessonDir);
    } catch {
      return [];
    }

    const htmlFiles = files.filter((f) => f.endsWith(".html")).sort();

    const units: LessonUnit[] = [];

    for (const filename of htmlFiles) {
      // Extract unit number from filename
      // Pattern: aesdr_courseXX_v1.html (unit 1 for lesson 01) or aesdr_courseXX_Y_v1.html
      const match = filename.match(/aesdr_course\d+(?:_(\d+))?_v\d+\.html/);
      if (!match) continue;

      const unitId = match[1] ?? "1";
      const filePath = path.join(lessonDir, filename);
      const title = await extractTitle(filePath, unitId);

      units.push({ unitId, title, filename });
    }

    // Sort by unit number
    units.sort((a, b) => Number(a.unitId) - Number(b.unitId));

    return units;
  }
);

/**
 * Get the absolute file path for a specific lesson unit's HTML file.
 * Returns null if the file doesn't exist.
 */
export async function getUnitFilePath(
  lessonId: string,
  unitId: string
): Promise<string | null> {
  const units = await listLessonUnits(lessonId);
  const unit = units.find((u) => u.unitId === unitId);
  if (!unit) return null;

  const paddedId = lessonId.padStart(2, "0");
  return path.join(CONTENT_ROOT, `lesson-${paddedId}`, unit.filename);
}

/**
 * Get tool assets associated with a lesson.
 */
export function getToolAssetsForLesson(lessonId: string): ToolAsset[] {
  return TOOL_MAP[lessonId] ?? [];
}

/* ═══════════════════════════════════════════
   Tool completion-gate map (R3-CURR-1 / decision #9)
   ═══════════════════════════════════════════ */

/**
 * The canonical lesson IDs (the twelve courses). Used to validate completion
 * claims and the "finish all twelve" bonus gate.
 */
export const ALL_LESSON_IDS = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
] as const;

/**
 * Map tool slugs to their completion gate. A lesson ID string ("3", "6", …)
 * gates on completion of that single lesson; the literal "ALL" gates on
 * completion of all twelve — used for the end-of-course bonus download.
 *
 * AUDIT (R3-CURR-1 / decision #9): this map was previously private to
 * app/tools/[slug]/download/route.ts, so the two *serve* routes
 * (app/tools/[slug]/route.ts and app/api/tools/[slug]/route.ts) gated on
 * purchase only and opened the bonus immediately. It now lives here as the
 * single source of truth that all three routes consume.
 */
export const TOOL_LESSON_GATE: Record<string, string> = {
  "3.3-aesdr-alignment-contract": "3",
  "4.1-manager-archetype-map": "4",
  "4.3-async-cadence-template": "4",
  "6.3-idk-framework": "6",
  "9.1-crm-survival-guide": "9",
  "9.2-time-reclaimed-calculator": "9",
  "10.1-ROI-commission-defense-tracker": "10",
  "bonus-72-hr-strike-plan": "ALL",
};

/** Whitelist of valid tool slugs (also doubles as path-traversal guard). */
export const ALLOWED_TOOL_SLUGS = new Set(Object.keys(TOOL_LESSON_GATE));

export type ToolGateResult =
  | { ok: true }
  | { ok: false; reason: "unknown_slug" }
  | { ok: false; reason: "incomplete"; message: string };

/**
 * Evaluate the per-lesson completion gate for a tool slug given the set of
 * lesson IDs the user has completed. Pure — callers fetch the completed set
 * (from course_progress) and pass it in. Mirrors the messaging the download
 * route already shipped.
 */
export function evaluateToolGate(
  slug: string,
  completedLessonIds: Set<string>
): ToolGateResult {
  const gate = TOOL_LESSON_GATE[slug];
  if (!gate) return { ok: false, reason: "unknown_slug" };

  if (gate === "ALL") {
    const missing = ALL_LESSON_IDS.filter((id) => !completedLessonIds.has(id));
    if (missing.length === 0) return { ok: true };
    const message =
      missing.length === 1
        ? `Almost there — Lesson ${missing[0]} is the last one before this bonus opens.`
        : `Finish all twelve courses to open this bonus. ${missing.length} left.`;
    return { ok: false, reason: "incomplete", message };
  }

  if (completedLessonIds.has(gate)) return { ok: true };
  return {
    ok: false,
    reason: "incomplete",
    message: `Complete Lesson ${gate} first to download this.`,
  };
}

/* ═══════════════════════════════════════════
   Per-unit screen count (server-side completion evidence)
   ═══════════════════════════════════════════ */

/**
 * Read the number of screens (the `TOTAL` constant) for a lesson unit's HTML
 * file. The lesson engine fires `aesdr:complete` at screen `TOTAL-1`; the
 * completion endpoint uses this to require server-side evidence that the
 * learner actually reached the final screen (R3-CURR-2 / decision #10)
 * instead of trusting the client's word.
 *
 * Cached with React `cache()` so the disk read is shared within a request.
 * Returns null if the file or the constant can't be found.
 */
export const getUnitScreenCount = cache(
  async (lessonId: string, unitId: string): Promise<number | null> => {
    const filePath = await getUnitFilePath(lessonId, unitId);
    if (!filePath) return null;
    try {
      const html = await fs.readFile(filePath, "utf-8");
      const match = html.match(/const\s+TOTAL\s*=\s*(\d+)/);
      if (match?.[1]) return parseInt(match[1], 10);
    } catch {
      // fall through
    }
    return null;
  }
);
