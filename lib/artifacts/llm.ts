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

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
    system: SYSTEM_PROMPT,
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch?.[1]) {
    throw new Error("LLM returned no parseable JSON");
  }

  const parsed = JSON.parse(jsonMatch[1]) as LLMExtractionResult;

  // Validate structure
  if (!parsed.playbook?.sections || !parsed.mirror?.confrontations) {
    throw new Error("LLM response missing required fields");
  }

  return parsed;
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
      prompt += `> ${r.text}\n\n`;
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
