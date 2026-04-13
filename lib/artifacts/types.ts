import type { ArtifactCategory } from "./categories";

/* ═══════════════════════════════════════════
   Shared types for the 3 generated artifacts
   ═══════════════════════════════════════════ */

/** A single gate response extracted from state_data */
export interface GateResponse {
  lessonId: string;
  unitIndex: number;
  category: ArtifactCategory;
  label: string; // e.g. "Async work & daily structure"
  gateKey: string; // e.g. "gate_1"
  text: string;
  completedAt: string | null;
}

/** Aggregated exercise/quiz accuracy per category */
export interface CategoryScore {
  category: ArtifactCategory;
  name: string;
  correct: number;
  total: number;
  pct: number; // 0-100
}

/* ── Diagnostic ── */

export interface DiagnosticData {
  studentName: string;
  role: "ae" | "sdr";
  cohort: string;
  generatedAt: string;
  categories: CategoryScore[];
  overallPct: number;
  verdict: string; // Generated from score thresholds
}

/* ── Playbook ── */

export interface PlaybookQuote {
  text: string;
  source: string; // e.g. "Lesson 4.3 Gate"
}

export interface PlaybookCommitment {
  text: string;
}

export interface PlaybookSection {
  category: ArtifactCategory;
  categoryName: string;
  title: string; // e.g. "How You Said You'd Run Your Pipeline"
  quotes: PlaybookQuote[];
  commitments: PlaybookCommitment[];
}

export interface PlaybookData {
  studentName: string;
  role: "ae" | "sdr";
  generatedAt: string;
  totalGates: number;
  sections: PlaybookSection[];
}

/* ── Mirror ── */

export interface MirrorConfrontation {
  category: ArtifactCategory;
  categoryName: string;
  quote: PlaybookQuote; // What they said
  stat: string; // e.g. "54%" or "2 / 4"
  statLabel: string; // e.g. "Discipline category accuracy.\nLowest score in your diagnostic."
}

export interface MirrorData {
  studentName: string;
  role: "ae" | "sdr";
  generatedAt: string;
  confrontations: MirrorConfrontation[];
}

/* ── Stored artifact wrapper ── */

export type ArtifactType = "diagnostic" | "playbook" | "mirror";

export interface StoredArtifact {
  id: string;
  user_id: string;
  artifact_type: ArtifactType;
  artifact_data: DiagnosticData | PlaybookData | MirrorData;
  source_hash: string;
  generated_at: string;
}
