import fs from "node:fs/promises";
import path from "node:path";

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

const CONTENT_ROOT = path.join(process.cwd(), "..", "content", "lessons", "html");
const TOOLS_ROOT = path.join(process.cwd(), "..", "tools", "standalone-html");

/**
 * Map of lesson ID → array of tool assets associated with that lesson.
 * The slug matches the filename (minus .html) in /tools/standalone-html/.
 */
const TOOL_MAP: Record<string, ToolAsset[]> = {
  "3":  [{ slug: "3.3-aesdr-alignment-contract", title: "AE/SDR Alignment Contract Builder" }],
  "6":  [{ slug: "6.3-idk-framework", title: "\"I Don't Know\" Framework" }],
  "9":  [{ slug: "9.2-time-reclaimed-calculator", title: "Time Reclaimed Calculator" }],
  "10": [{ slug: "10.1-ROI-commission defense tracker", title: "ROI & Commission Defense Tracker" }],
  "12": [{ slug: "12.3-72-hr-strike-plan", title: "72-Hour Strike Plan" }],
};

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
export async function listLessonUnits(lessonId: string): Promise<LessonUnit[]> {
  const paddedId = lessonId.padStart(2, "0");
  const lessonDir = path.join(CONTENT_ROOT, `lesson-${paddedId}`);

  let files: string[];
  try {
    files = await fs.readdir(lessonDir);
  } catch {
    return [];
  }

  const htmlFiles = files
    .filter((f) => f.endsWith(".html"))
    .sort();

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
