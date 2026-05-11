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

export type ArtifactType =
  | "diagnostic"
  | "playbook"
  | "mirror"
  | "playbill"
  | "redline";

export interface StoredArtifact {
  id: string;
  user_id: string;
  artifact_type: ArtifactType;
  artifact_data:
    | DiagnosticData
    | PlaybookData
    | MirrorData
    | PlaybillData
    | RedlineData;
  source_hash: string;
  generated_at: string;
}

/* ═══════════════════════════════════════════
   PLAYBILL — Theatrical voice (3 folios)
   Programme / Reviews / Director's Notes
═══════════════════════════════════════════ */

/** Folio I — Programme (Diagnostic in theatrical voice) */
export interface PlaybillAct {
  act: number; // 1-6
  category: ArtifactCategory;
  categoryName: string;
  /** Character name they play in this act, e.g. "THE CLOSER", "THE GHOST" */
  role: string;
  /** Italian tempo/dynamic term, e.g. "fortissimo", "pianissimo", "agitato" */
  dynamic: string;
  pct: number;
  /** One-line programme note from the house, in theatre-voice */
  programmeNote: string;
}

export interface PlaybillProgramme {
  /** Opera-style subtitle, e.g. "allegro con ansia" */
  tempoMark: string;
  /** One-sentence overall dramatic framing */
  tagline: string;
  acts: PlaybillAct[];
}

/** Folio II — Reviews (Mirror in theatrical voice) */
export interface PlaybillReview {
  category: ArtifactCategory;
  categoryName: string;
  /** Fictional critic/outlet name, e.g. "The Herald", "The Weekly Ledger" */
  critic: string;
  /** What the critic saw — their claim echoed as opening-night response */
  critique: string;
  /** What the box office data actually showed */
  boxOffice: string;
  /** Short verdict: "Mixed", "Unfavorable", "Panned", etc. */
  verdict: string;
  pct: number;
}

/** Folio III — Director's Notes (Playbook in theatrical voice) */
export interface PlaybillDirectorNote {
  category: ArtifactCategory;
  categoryName: string;
  /** The staging direction — the commitment, but in blocking-note voice */
  blocking: string;
  /** What to rehearse between now and next performance */
  rehearsalFocus: string;
}

export interface PlaybillData {
  studentName: string;
  role: "ae" | "sdr";
  generatedAt: string;
  programme: PlaybillProgramme;
  reviews: PlaybillReview[];
  directorNotes: PlaybillDirectorNote[];
}

/* ═══════════════════════════════════════════
   REDLINE — Editorial voice (3 folios)
   Assessment / Redlines / Accepted Manuscript
═══════════════════════════════════════════ */

/** Folio I — Assessment (Diagnostic in editorial voice) */
export interface RedlineChapterGrade {
  chapter: number; // 1-6
  category: ArtifactCategory;
  categoryName: string;
  /** Letter grade: "A", "B+", "C-", "D", etc. */
  grade: string;
  /** One-line reader's-report verdict on this chapter */
  verdict: string;
  pct: number;
}

export interface RedlineAssessment {
  /** Reader's report preamble — editor's overall framing */
  readersReport: string;
  /** Overall grade letter */
  overallGrade: string;
  /** Overall one-sentence verdict */
  overallVerdict: string;
  chapters: RedlineChapterGrade[];
}

/** Folio II — Redlines (Mirror in editorial voice) */
export interface RedlineMarkup {
  chapter: number;
  category: ArtifactCategory;
  categoryName: string;
  /** Opening passage: their honest admission, kept intact */
  draftOpening: string;
  /** Editor's margin note on the honest part */
  marginNote: string;
  /** Self-deceiving sentence that gets struck through */
  struckClaim: string;
  /** The inserted truth from data — what's actually the case */
  insertedTruth: string;
  /** Score annotation (e.g. "62% — Pipeline Score") */
  scoreAnnotation: string;
  /** One-line editor note attached to the score box */
  scoreNote: string;
  pct: number;
}

/** Folio III — Accepted Manuscript (Playbook in editorial voice) */
export interface RedlineAcceptedCommitment {
  category: ArtifactCategory;
  categoryName: string;
  /** The final committed action, written in first-person manuscript voice */
  commitment: string;
}

export interface RedlineData {
  studentName: string;
  role: "ae" | "sdr";
  generatedAt: string;
  assessment: RedlineAssessment;
  markups: RedlineMarkup[];
  accepted: RedlineAcceptedCommitment[];
}
