import Anthropic from "@anthropic-ai/sdk";

import type { ArtifactCategory } from "./categories";
import { CATEGORY_META } from "./categories";
import type {
  GateResponse,
  CategoryScore,
  PlaybookSection,
  MirrorConfrontation,
} from "./types";

/* ═══════════════════════════════════════════
   Claude API — Playbook + Mirror extraction
   ═══════════════════════════════════════════

   One API call handles both artifacts.
   Input: all gate responses + category scores.
   Output: structured JSON with playbook sections + mirror confrontations.
═══════════════════════════════════════════ */

const MODEL = "claude-sonnet-4-6";

interface LLMExtractionResult {
  playbook: {
    sections: PlaybookSection[];
  };
  mirror: {
    confrontations: MirrorConfrontation[];
  };
}

/**
 * Call Claude API to extract Playbook sections and Mirror confrontations
 * from the student's gate responses and exercise scores.
 */
export async function extractWithLLM(
  gateResponses: GateResponse[],
  categoryScores: CategoryScore[],
  role: "ae" | "sdr"
): Promise<LLMExtractionResult> {
  const client = new Anthropic();

  const gatesByCategory = groupByCategory(gateResponses);
  const scoresByCategory = Object.fromEntries(
    categoryScores.map((s) => [s.category, s])
  );

  const prompt = buildPrompt(gatesByCategory, scoresByCategory, role);

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
      system: SYSTEM_PROMPT,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown API error";
    throw new Error(`Claude API call failed: ${detail}`);
  }

  const firstBlock = response.content[0];
  if (!firstBlock || firstBlock.type !== "text") {
    throw new Error("Claude API returned unexpected response format");
  }
  const text = firstBlock.text;

  if (text.length > 100_000) {
    throw new Error("LLM response exceeds size limit");
  }

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch?.[1]) {
    throw new Error("LLM returned no parseable JSON");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(jsonMatch[1]);
  } catch {
    throw new Error("LLM returned malformed JSON");
  }

  // Runtime validation of required structure
  const parsed = raw as Record<string, unknown>;
  const playbook = parsed.playbook as Record<string, unknown> | undefined;
  const mirror = parsed.mirror as Record<string, unknown> | undefined;

  if (
    !playbook?.sections ||
    !Array.isArray(playbook.sections) ||
    !mirror?.confrontations ||
    !Array.isArray(mirror.confrontations)
  ) {
    throw new Error("LLM response missing required fields");
  }

  // Validate individual section shapes
  for (const section of playbook.sections) {
    if (
      typeof section !== "object" ||
      !section ||
      typeof (section as Record<string, unknown>).category !== "string" ||
      !Array.isArray((section as Record<string, unknown>).quotes) ||
      !Array.isArray((section as Record<string, unknown>).commitments)
    ) {
      throw new Error("LLM response contains malformed playbook section");
    }
  }

  for (const conf of mirror.confrontations) {
    if (
      typeof conf !== "object" ||
      !conf ||
      typeof (conf as Record<string, unknown>).category !== "string" ||
      typeof (conf as Record<string, unknown>).stat !== "string"
    ) {
      throw new Error("LLM response contains malformed mirror confrontation");
    }
  }

  return raw as LLMExtractionResult;
}

/* ── Input Sanitization ── */

/**
 * Strip characters and patterns that could be used for prompt injection.
 * Removes instruction-like patterns while preserving the student's voice.
 */
function sanitizeUserText(text: string): string {
  return text
    // Remove XML/HTML-like tags that could inject system instructions
    .replace(/<[^>]*>/g, "")
    // Remove markdown heading-like patterns that mimic prompt structure
    .replace(/^#{1,4}\s/gm, "")
    // Collapse excessive whitespace
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 2000); // Cap individual response length
}

/* ── Prompt Construction ── */

const SYSTEM_PROMPT = `You are an analysis engine for AESDR, a professional development course for SaaS sales professionals (AEs and SDRs). Your job is to extract structured data from a student's free-text gate responses and match them against their exercise performance scores.

You must return ONLY valid JSON — no commentary, no markdown outside the JSON block. Follow the exact schema requested.

Rules for extraction:
- PLAYBOOK: Extract the student's own commitments and strongest quotes. Do NOT rewrite their words — preserve their voice, including informal language. Only lightly clean up typos. Group by the 6 categories.
- MIRROR: Find the most direct contradictions between what the student claimed and their actual scores. Pick the quote where the gap between self-perception and data is widest. Maximum 4 confrontations — only include categories where there's a genuine gap (score below 75% AND the student's text claims strength in that area).
- For each playbook section title, use active language: "How You Said You'd...", "The Discipline You Committed To", "Who You Said You'd Become", etc.
- Commitments should be actionable bullet points extracted from the student's text — things they said they'd DO, not things they observed.`;

function buildPrompt(
  gatesByCategory: Record<ArtifactCategory, GateResponse[]>,
  scoresByCategory: Record<string, CategoryScore>,
  role: "ae" | "sdr"
): string {
  const roleLabel = role === "ae" ? "Account Executive" : "SDR";

  let prompt = `# Student Data — ${roleLabel}\n\n`;

  // Category scores summary
  prompt += `## Exercise & Quiz Scores by Category\n`;
  for (const [cat, score] of Object.entries(scoresByCategory)) {
    const meta = CATEGORY_META[cat as ArtifactCategory];
    prompt += `- **${meta.name}**: ${score.pct}% (${score.correct}/${score.total} correct)\n`;
  }

  // Gate responses by category
  prompt += `\n## Gate Responses by Category\n\n`;
  for (const [cat, responses] of Object.entries(gatesByCategory)) {
    const meta = CATEGORY_META[cat as ArtifactCategory];
    if (responses.length === 0) continue;

    prompt += `### ${meta.name}\n`;
    for (const r of responses) {
      prompt += `**Lesson ${r.lessonId}.${r.unitIndex} — ${r.label} (${r.gateKey})**\n`;
      prompt += `> ${sanitizeUserText(r.text)}\n\n`;
    }
  }

  // Output schema
  prompt += `## Required Output

Return a single JSON object with this exact structure:

\`\`\`json
{
  "playbook": {
    "sections": [
      {
        "category": "pipeline",
        "categoryName": "Pipeline",
        "title": "How You Said You'd Run Your Pipeline",
        "quotes": [
          { "text": "exact quote from student text", "source": "Lesson X.Y Gate" }
        ],
        "commitments": [
          { "text": "actionable commitment extracted from their words" }
        ]
      }
    ]
  },
  "mirror": {
    "confrontations": [
      {
        "category": "discipline",
        "categoryName": "Discipline",
        "quote": { "text": "what they claimed", "source": "Lesson X.Y Gate" },
        "stat": "54%",
        "statLabel": "Discipline category accuracy.\\nDescription of what this means."
      }
    ]
  }
}
\`\`\`

Rules:
- Include a playbook section for EVERY category that has gate responses (up to 6 sections)
- Each section needs 1-3 strongest quotes and 2-4 extracted commitments
- Mirror: maximum 4 confrontations, only where score < 75% AND text claims competence
- If fewer than 2 categories qualify for Mirror, include what you have
- Preserve the student's original voice in quotes — do not polish or rewrite
- All "source" fields must reference the actual lesson and unit number from the data above`;

  return prompt;
}

/* ── Helpers ── */

function groupByCategory(
  responses: GateResponse[]
): Record<ArtifactCategory, GateResponse[]> {
  const groups: Record<ArtifactCategory, GateResponse[]> = {
    pipeline: [],
    discipline: [],
    networking: [],
    identity: [],
    career: [],
    coaching: [],
  };

  for (const r of responses) {
    groups[r.category].push(r);
  }

  return groups;
}
