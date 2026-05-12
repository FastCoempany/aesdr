import type { IconName } from "@/components/brand/Icon";

/**
 * Canonical lesson → icon-glyph mapping.
 *
 * Each of the 12 lessons gets one unique glyph from the 18-icon canon.
 * The mapping mirrors the lesson's content and the badge naming in
 * `aesdr-design-system/brand/synthesis.jsx` (BADGES + ICON_SET):
 *
 *   L01 First Crawl — Diagnosis    → eye        (the first honest look)
 *   L02 Camaraderie — Team          → team       (the obvious one)
 *   L03 Lie Decoded — Manager       → warn       (the manager warning)
 *   L04 Verdict — Commission        → weight     (the balance)
 *   L05 The Fall — Playbook         → fall       (literal)
 *   L06 Beyond the Script           → rep        (improvising / repetition)
 *   L07 Pipeline Read               → signal     (signal strength)
 *   L08 30% Rule / Self-Assessment  → hourglass  (the math, the time)
 *   L09 The Recovery — Burn         → recovery   (literal)
 *   L10 The Long Mile — Exit        → mile       (literal)
 *   L11 Money Spoken                → ledger     (the books)
 *   L12 The Owner — Own It          → lock       (locking it in)
 *
 * Don't reassign without a canon discussion. The pairing is part of the
 * brand's narrative arc — each lesson row on the dashboard / syllabus
 * carries its glyph as a typographic chapter mark.
 */
export const LESSON_ICON: Record<string, IconName> = {
  "1":  "eye",
  "2":  "team",
  "3":  "warn",
  "4":  "weight",
  "5":  "fall",
  "6":  "rep",
  "7":  "signal",
  "8":  "hourglass",
  "9":  "recovery",
  "10": "mile",
  "11": "ledger",
  "12": "lock",
};

/**
 * Returns the canonical icon for a lesson id. Accepts both:
 *   - the dashboard format: "1" .. "12"
 *   - the syllabus format:  "L01" .. "L12"
 * Falls back to `shell` (the foundation glyph) for unknown ids.
 */
export function iconForLesson(lessonId: string | number): IconName {
  const raw = String(lessonId);
  const normalized = raw.replace(/^L0*/i, "") || raw;
  return LESSON_ICON[normalized] ?? "shell";
}
