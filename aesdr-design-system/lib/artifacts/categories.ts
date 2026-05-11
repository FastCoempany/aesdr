/**
 * AESDR Category Mapping
 *
 * Maps each lesson + unit to a thematic category for artifact generation.
 * Each unit's gate responses and exercise scores roll up into these categories.
 *
 * The 6 categories:
 *   pipeline    — Pipeline mechanics, prospecting, deal management
 *   discipline  — Daily habits, WFH boundaries, screen time, async work
 *   networking  — Relationships, networking strategy, industry knowledge
 *   identity    — Self-assessment, professional identity, career ownership
 *   career      — Career honesty, SaaS fit, compensation realities
 *   coaching    — Coaching frameworks, leadership, team dynamics
 */

export type ArtifactCategory =
  | "pipeline"
  | "discipline"
  | "networking"
  | "identity"
  | "career"
  | "coaching";

export interface UnitMapping {
  lessonId: string;
  unitIndex: number; // 1, 2, or 3
  category: ArtifactCategory;
  label: string; // Human-readable description for prompts
}

/**
 * Every unit in the course mapped to its category.
 *
 * lessonId matches course_progress.lesson_id ("1", "2", ... "12").
 * unitId matches the unit file convention ("1", "2", "3").
 *
 * Gate keys in state_data._units[unitId] follow the pattern:
 *   gate_1  → narrative gate (after section 01 content)
 *   gate_3  → narrative gate (after section 02 content)
 *   gate_8  → accountability gate (homework section)
 */
export const UNIT_CATEGORY_MAP: UnitMapping[] = [
  // Course 1: Creating Structure
  { lessonId: "1", unitIndex: 1, category: "coaching",    label: "Onboarding & team structure" },
  { lessonId: "1", unitIndex: 2, category: "coaching",    label: "Building camaraderie & trust" },
  { lessonId: "1", unitIndex: 3, category: "coaching",    label: "Mastering coaching conversations" },

  // Course 2: Breaking Down Silos
  { lessonId: "2", unitIndex: 1, category: "coaching",    label: "Breaking ego & silo mentality" },
  { lessonId: "2", unitIndex: 2, category: "discipline",  label: "Home office environment" },
  { lessonId: "2", unitIndex: 3, category: "coaching",    label: "Cross-team dynamics" },

  // Course 3: Surviving & Thriving
  { lessonId: "3", unitIndex: 1, category: "career",      label: "SDR/AE pitfalls & survival" },
  { lessonId: "3", unitIndex: 2, category: "career",      label: "Thriving under pressure" },
  { lessonId: "3", unitIndex: 3, category: "identity",    label: "Managing up effectively" },

  // Course 4: Navigating the Workplace
  { lessonId: "4", unitIndex: 1, category: "coaching",    label: "Manager dynamics" },
  { lessonId: "4", unitIndex: 2, category: "coaching",    label: "Company culture decoded" },
  { lessonId: "4", unitIndex: 3, category: "discipline",  label: "Async work & daily structure" },

  // Course 5: The SDR/AE Playbook
  { lessonId: "5", unitIndex: 1, category: "pipeline",    label: "Leveling up your craft" },
  { lessonId: "5", unitIndex: 2, category: "identity",    label: "Standing out from the pack" },
  { lessonId: "5", unitIndex: 3, category: "identity",    label: "Becoming irreplaceable" },

  // Course 6: Beyond the Sales Playbook
  { lessonId: "6", unitIndex: 1, category: "identity",    label: "Continuous learning strategy" },
  { lessonId: "6", unitIndex: 2, category: "networking",  label: "Networking & professional value" },
  { lessonId: "6", unitIndex: 3, category: "networking",  label: "Industry knowledge strategy" },

  // Course 7: Prospecting & Pipeline
  { lessonId: "7", unitIndex: 1, category: "pipeline",    label: "Self-sourced pipeline" },
  { lessonId: "7", unitIndex: 2, category: "pipeline",    label: "Prospecting mechanics" },
  { lessonId: "7", unitIndex: 3, category: "career",      label: "Is SaaS the right career fit" },

  // Course 8: Leadership & Self-Assessment
  { lessonId: "8", unitIndex: 1, category: "coaching",    label: "The 30% rule & team focus" },
  { lessonId: "8", unitIndex: 2, category: "identity",    label: "Real vs fake potential" },
  { lessonId: "8", unitIndex: 3, category: "coaching",    label: "Accountability frameworks" },

  // Course 9: Mastering Your Sales Tools
  { lessonId: "9", unitIndex: 1, category: "pipeline",    label: "Salesforce & CRM hygiene" },
  { lessonId: "9", unitIndex: 2, category: "discipline",  label: "Slack & communication discipline" },
  { lessonId: "9", unitIndex: 3, category: "pipeline",    label: "The SaaS tech stack" },

  // Course 10: Compensation Realities
  { lessonId: "10", unitIndex: 1, category: "career",     label: "Commission structures & OTE" },
  { lessonId: "10", unitIndex: 2, category: "career",     label: "Quota negotiation & advocacy" },
  { lessonId: "10", unitIndex: 3, category: "discipline", label: "Feast-or-famine budgeting" },

  // Course 11: Sober Selling
  { lessonId: "11", unitIndex: 1, category: "discipline", label: "Alcohol & professional presence" },
  { lessonId: "11", unitIndex: 2, category: "networking", label: "Conference behavior & reputation" },
  { lessonId: "11", unitIndex: 3, category: "identity",   label: "Professional identity at events" },

  // Course 12: Relationships & Balance
  { lessonId: "12", unitIndex: 1, category: "networking", label: "SaaS relationships & partnerships" },
  { lessonId: "12", unitIndex: 2, category: "discipline", label: "WFH boundaries & shutdown rituals" },
  { lessonId: "12", unitIndex: 3, category: "career",     label: "Long-term career focus" },
];

/** Category display metadata */
export const CATEGORY_META: Record<
  ArtifactCategory,
  { name: string; displayOrder: number }
> = {
  pipeline:   { name: "Pipeline",        displayOrder: 0 },
  discipline: { name: "Discipline",      displayOrder: 1 },
  networking: { name: "Networking",      displayOrder: 2 },
  identity:   { name: "Identity",        displayOrder: 3 },
  career:     { name: "Career Honesty",  displayOrder: 4 },
  coaching:   { name: "Coaching",        displayOrder: 5 },
};

/** Get all units for a given category */
export function getUnitsForCategory(cat: ArtifactCategory): UnitMapping[] {
  return UNIT_CATEGORY_MAP.filter((u) => u.category === cat);
}

/** Get category for a given lesson + unit */
export function getCategoryForUnit(
  lessonId: string,
  unitIndex: number
): ArtifactCategory | null {
  const found = UNIT_CATEGORY_MAP.find(
    (u) => u.lessonId === lessonId && u.unitIndex === unitIndex
  );
  return found?.category ?? null;
}
