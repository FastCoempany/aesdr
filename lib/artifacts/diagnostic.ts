import type { CategoryScore, DiagnosticData } from "./types";

/**
 * Generate the Diagnostic artifact from category scores.
 * Pure math — no LLM needed.
 */
export function generateDiagnostic(
  scores: CategoryScore[],
  studentName: string,
  role: "ae" | "sdr",
  cohort: string
): DiagnosticData {
  const totalCorrect = scores.reduce((sum, s) => sum + s.correct, 0);
  const totalQuestions = scores.reduce((sum, s) => sum + s.total, 0);
  const overallPct =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const verdict = buildVerdict(scores, overallPct, role);

  return {
    studentName,
    role,
    cohort,
    generatedAt: new Date().toISOString(),
    categories: scores,
    overallPct,
    verdict,
  };
}

/**
 * Build a data-driven verdict paragraph from scores.
 * Identifies top 2 strengths and bottom 2 weaknesses.
 */
function buildVerdict(
  scores: CategoryScore[],
  overallPct: number,
  role: "ae" | "sdr"
): string {
  const sorted = [...scores].sort((a, b) => b.pct - a.pct);
  const strengths = sorted.slice(0, 2);
  const weaknesses = sorted.slice(-2).reverse();

  const roleLabel = role === "ae" ? "AE" : "SDR";

  // Opening based on overall
  let opening: string;
  if (overallPct >= 85) {
    opening = `Overall ${overallPct}% accuracy across all exercises. Strong execution across the board.`;
  } else if (overallPct >= 70) {
    opening = `Overall ${overallPct}% accuracy. Solid foundation with clear areas to sharpen.`;
  } else if (overallPct >= 55) {
    opening = `Overall ${overallPct}% accuracy. Honest work — but the gaps are real and they're costing you.`;
  } else {
    opening = `Overall ${overallPct}% accuracy. The data doesn't lie. There's significant ground to cover.`;
  }

  // Strengths
  const strengthLines = strengths
    .filter((s) => s.pct > 0)
    .map((s) => `${s.name} at ${s.pct}%`)
    .join(" and ");

  const strengthText = strengthLines
    ? `Your strongest categories: ${strengthLines}.`
    : "";

  // Weaknesses
  const weakLines = weaknesses
    .filter((s) => s.total > 0)
    .map((s) => {
      if (s.pct < 50) {
        return `${s.name} scored ${s.pct}% — this isn't a growth area, it's a blind spot`;
      }
      if (s.pct < 70) {
        return `${s.name} at ${s.pct}% — functional but exposed under pressure`;
      }
      return `${s.name} at ${s.pct}% — room to tighten`;
    });

  const weakText =
    weakLines.length > 0
      ? `The data exposes: ${weakLines.join(". ")}.`
      : "";

  // Closing based on pattern
  const lowestPct = weaknesses[0]?.pct ?? overallPct;
  let closing: string;
  if (lowestPct < 50) {
    closing = `As an ${roleLabel}, the skill might be there. The daily execution isn't. Yet.`;
  } else if (lowestPct < 70) {
    closing = `The foundation is real. Close the gaps before they close your quarter.`;
  } else {
    closing = `Solid across the board. Now maintain it under pressure — that's the real test.`;
  }

  return [opening, strengthText, weakText, closing]
    .filter(Boolean)
    .join(" ");
}
