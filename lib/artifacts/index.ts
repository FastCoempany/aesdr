/**
 * AESDR Artifact Generation System
 *
 * Auto-generates 3 end-of-course outputs from student data:
 *
 * 1. The Diagnostic — Quantitative scores by category (no LLM)
 * 2. The Playbook — Gate responses organized into a personal operating manual (Claude API)
 * 3. The Mirror — Confrontation pairs: what they said vs what the data says (Claude API)
 *
 * Usage:
 *   POST /api/artifacts — Generate all 3 for the authenticated user
 *   GET  /api/artifacts?type=diagnostic|playbook|mirror — Fetch cached artifact
 */

export { UNIT_CATEGORY_MAP, CATEGORY_META, type ArtifactCategory } from "./categories";
export { generateArtifacts, getCachedArtifact } from "./generate";
export type {
  DiagnosticData,
  PlaybookData,
  MirrorData,
  ArtifactType,
  StoredArtifact,
} from "./types";
