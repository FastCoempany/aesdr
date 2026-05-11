import type { Pose } from "@/components/brand/Mascot";

/**
 * Canonical lesson → mascot-pose mapping.
 *
 * This is the brand's narrative arc encoded as a constant. Each of the 12
 * lessons has one pose that anchors its emotional theme — derived from
 * the `BADGES` array in `aesdr-design-system/brand/synthesis.jsx`.
 *
 * Do not reassign without a canon discussion. The pose-to-lesson alignment
 * is part of the brand canon (v1.1).
 */
export const LESSON_POSE: Record<string, Pose> = {
  "1":  "doctrine",   // The First Crawl — Diagnosis
  "2":  "doctrine",   // The Camaraderie — Team
  "3":  "verdict",    // The Lie Decoded — Manager
  "4":  "verdict",    // The Verdict — Commission
  "5":  "fall",       // The Fall — Playbook
  "6":  "sprint",     // Beyond the Script
  "7":  "doctrine",   // The Chaos Bridled
  "8":  "doctrine",   // A Pipeline Read
  "9":  "recovery",   // The Recovery — Burn
  "10": "doctrine",   // The Long Mile — Exit
  "11": "verdict",    // The Money Spoken
  "12": "owner",      // The Owner — Own It
};

/**
 * Returns the canonical pose for a lesson id. Falls back to `doctrine`
 * for unknown ids (safe default — `doctrine` is the brand-voice pose).
 */
export function poseForLesson(lessonId: string | number): Pose {
  return LESSON_POSE[String(lessonId)] ?? "doctrine";
}
