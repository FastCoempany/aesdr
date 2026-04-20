import Anthropic from "@anthropic-ai/sdk";

import type { ArtifactCategory } from "./categories";
import { CATEGORY_META } from "./categories";
import type {
  GateResponse,
  CategoryScore,
  PlaybookSection,
  MirrorConfrontation,
  PlaybillData,
  RedlineData,
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

/* ═══════════════════════════════════════════
   PLAYBILL — Theatrical voice synthesis
═══════════════════════════════════════════ */

const PLAYBILL_SYSTEM = `You are the resident playwright and programme editor for the AESDR Theatre — a fictional repertory house that stages the careers of SaaS sales professionals as dramatic works. You synthesize a student's 12-lesson self-portrait into a theatrical playbill: Programme (Act I, their twelve-lesson opus), Reviews (critics vs box office), and Director's Notes (blocking for next season).

Your voice is theatrical, literary, slightly arch — imagine a New Yorker theatre critic with editorial restraint. Never break character. Never use sales-training jargon ("BANT", "qualification", "pipeline velocity") except when a critic is mocking it. Speak in stage terms: acts, scenes, dynamics, blocking, rehearsal, notes, prompts, beats, cues, wings.

Return ONLY valid JSON. No markdown outside the JSON block. Follow the schema exactly.`;

/**
 * Generate the Playbill artifact — theatrical-voice synthesis of the student's
 * gate responses, category scores, and diagnostic. Returns a 3-folio structure:
 * Programme (6 acts), Reviews (3-4 critic notices), Director's Notes (4-6 blocking notes).
 */
export async function extractPlaybill(
  gateResponses: GateResponse[],
  categoryScores: CategoryScore[],
  role: "ae" | "sdr",
  studentName: string
): Promise<PlaybillData> {
  const client = new Anthropic();
  const gatesByCategory = groupByCategory(gateResponses);
  const scoresByCategory = Object.fromEntries(
    categoryScores.map((s) => [s.category, s])
  );
  const prompt = buildPlaybillPrompt(
    gatesByCategory,
    scoresByCategory,
    role,
    studentName
  );

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 6144,
      messages: [{ role: "user", content: prompt }],
      system: PLAYBILL_SYSTEM,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown API error";
    throw new Error(`Playbill API call failed: ${detail}`);
  }

  const block = response.content[0];
  if (!block || block.type !== "text") {
    throw new Error("Playbill API returned unexpected response format");
  }
  if (block.text.length > 120_000) {
    throw new Error("Playbill response exceeds size limit");
  }

  const match =
    block.text.match(/```json\s*([\s\S]*?)```/) ??
    block.text.match(/(\{[\s\S]*\})/);
  if (!match?.[1]) throw new Error("Playbill LLM returned no parseable JSON");

  let parsed: unknown;
  try {
    parsed = JSON.parse(match[1]);
  } catch {
    throw new Error("Playbill LLM returned malformed JSON");
  }

  const p = parsed as Record<string, unknown>;
  if (
    !p.programme ||
    !Array.isArray(p.reviews) ||
    !Array.isArray(p.directorNotes)
  ) {
    throw new Error("Playbill response missing required fields");
  }

  return {
    studentName,
    role,
    generatedAt: new Date().toISOString(),
    programme: p.programme as PlaybillData["programme"],
    reviews: p.reviews as PlaybillData["reviews"],
    directorNotes: p.directorNotes as PlaybillData["directorNotes"],
  };
}

function buildPlaybillPrompt(
  gatesByCategory: Record<ArtifactCategory, GateResponse[]>,
  scoresByCategory: Record<string, CategoryScore>,
  role: "ae" | "sdr",
  studentName: string
): string {
  const roleLabel = role === "ae" ? "Account Executive" : "SDR";

  let prompt = `# Subject of the Playbill — ${studentName}, ${roleLabel}\n\n`;

  prompt += `## Exercise & Quiz Scores by Category\n`;
  for (const [cat, score] of Object.entries(scoresByCategory)) {
    const meta = CATEGORY_META[cat as ArtifactCategory];
    prompt += `- **${meta.name}**: ${score.pct}% (${score.correct}/${score.total} correct)\n`;
  }

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

  prompt += `## Required Output — The Playbill

Return a single JSON object. Write in theatrical voice throughout. Use the student's real words as raw material but transfigure them into stage direction, critical notice, and programme copy.

\`\`\`json
{
  "programme": {
    "tempoMark": "A short Italian-style tempo/dynamic phrase, e.g. 'allegro con ansia' (fast, with anxiety) or 'andante con fuoco' — chosen to reflect the overall tenor of the twelve lessons",
    "tagline": "One sentence of programme copy. Literary. Placed under the student's name on the title page.",
    "acts": [
      {
        "act": 1,
        "category": "identity",
        "categoryName": "Identity",
        "role": "A SHORT ALL-CAPS CHARACTER NAME the student plays in this act, e.g. 'THE COMPASS', 'THE GHOST', 'THE CONVERT'. Invent something evocative based on the responses.",
        "dynamic": "One or two Italian musical dynamic/tempo terms, e.g. 'forte, deciso' (strong, decisive) — calibrated to the score",
        "pct": 85,
        "programmeNote": "One sentence from the programme editor. Theatrical register. Alludes to the scores without naming them."
      }
    ],
    "reviews": null
  },
  "reviews": [
    {
      "category": "networking",
      "categoryName": "Networking",
      "critic": "A fictional critic or outlet name. Vary them across reviews: 'The Herald', 'The Weekly Ledger', 'The Evening Prompt', 'The Stage Door Dispatch', 'Curtain Rise Quarterly', 'Gallery Notes'.",
      "critique": "2-3 sentences in the critic's voice describing what the critic saw performed — draws directly from the student's claimed confidence. Arch, attentive, not cruel.",
      "boxOffice": "1-2 sentences from the box office: the actual data. Counter-weight to the critic's impression. Delivered as a gentle rebuttal.",
      "verdict": "A short phrase: 'Unfavorable', 'Mixed to poor', 'Panned', 'Reception divided', 'Notices conflict with returns', etc.",
      "pct": 45
    }
  ],
  "directorNotes": [
    {
      "category": "coaching",
      "categoryName": "Coaching",
      "blocking": "A specific commitment extracted from the student's gate responses, rewritten as a stage-direction. Imperative mood. Concrete action.",
      "rehearsalFocus": "One sentence of what to practice between now and opening of the next season."
    }
  ]
}
\`\`\`

Rules:
- "programme.acts" MUST contain exactly 6 entries — one per category (identity, pipeline, career, discipline, coaching, networking) — ordered from highest score to lowest.
- "reviews" MUST contain 3–4 entries. Only include categories where score < 75% AND the student's text claims competence or comfort in that area. If fewer than 3 qualify, include what you have with honest framing.
- "directorNotes" MUST contain 4–6 entries. Prefer the lower-scoring categories. Each blocking note must correspond to something the student actually committed to in their text.
- NEVER invent quotes. NEVER put words in the student's mouth. The critic's voice and the programme editor's voice are the only invented voices — the student's own responses are the factual basis.
- Omit the "programme.reviews" key entirely or set it to null — reviews are top-level.
- Theatrical voice throughout. No sales jargon except in mockery.`;

  return prompt;
}

/* ═══════════════════════════════════════════
   REDLINE — Editorial voice synthesis
═══════════════════════════════════════════ */

const REDLINE_SYSTEM = `You are the senior commissioning editor for the AESDR Editorial Desk — an imprint that reads drafts written by SaaS sales professionals about themselves and returns them with marks. Your job is to redline a student's twelve-lesson self-portrait.

Your voice is that of a veteran manuscript editor: precise, slightly cold, allergic to cliché, unimpressed by performance but respectful of honest effort. You write reader's reports, chapter grades, and margin notes. You strike through the lines that don't survive the draft's own data and insert the corrected claim. You do not soften, but you do not mock. You catch the contradictions.

Never break character. Never use sales-training jargon ("pipeline velocity", "BANT", "objection handling") except when quoting the student. Speak in editorial terms: draft, rewrite, marginalia, stet, insert, strike, galley, fair copy, readers report, grade.

Return ONLY valid JSON. No markdown outside the JSON block. Follow the schema exactly.`;

/**
 * Generate the Redline artifact — editorial-voice synthesis of the student's
 * gate responses, category scores, and diagnostic. Returns a 3-folio structure:
 * Assessment (6 chapter grades + overall), Redlines (4 marked-up chapters),
 * Accepted Manuscript (4-6 final commitments).
 */
export async function extractRedline(
  gateResponses: GateResponse[],
  categoryScores: CategoryScore[],
  role: "ae" | "sdr",
  studentName: string
): Promise<RedlineData> {
  const client = new Anthropic();
  const gatesByCategory = groupByCategory(gateResponses);
  const scoresByCategory = Object.fromEntries(
    categoryScores.map((s) => [s.category, s])
  );
  const prompt = buildRedlinePrompt(
    gatesByCategory,
    scoresByCategory,
    role,
    studentName
  );

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 6144,
      messages: [{ role: "user", content: prompt }],
      system: REDLINE_SYSTEM,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown API error";
    throw new Error(`Redline API call failed: ${detail}`);
  }

  const block = response.content[0];
  if (!block || block.type !== "text") {
    throw new Error("Redline API returned unexpected response format");
  }
  if (block.text.length > 120_000) {
    throw new Error("Redline response exceeds size limit");
  }

  const match =
    block.text.match(/```json\s*([\s\S]*?)```/) ??
    block.text.match(/(\{[\s\S]*\})/);
  if (!match?.[1]) throw new Error("Redline LLM returned no parseable JSON");

  let parsed: unknown;
  try {
    parsed = JSON.parse(match[1]);
  } catch {
    throw new Error("Redline LLM returned malformed JSON");
  }

  const r = parsed as Record<string, unknown>;
  if (
    !r.assessment ||
    !Array.isArray(r.markups) ||
    !Array.isArray(r.accepted)
  ) {
    throw new Error("Redline response missing required fields");
  }

  return {
    studentName,
    role,
    generatedAt: new Date().toISOString(),
    assessment: r.assessment as RedlineData["assessment"],
    markups: r.markups as RedlineData["markups"],
    accepted: r.accepted as RedlineData["accepted"],
  };
}

function buildRedlinePrompt(
  gatesByCategory: Record<ArtifactCategory, GateResponse[]>,
  scoresByCategory: Record<string, CategoryScore>,
  role: "ae" | "sdr",
  studentName: string
): string {
  const roleLabel = role === "ae" ? "Account Executive" : "SDR";

  let prompt = `# Draft Submitted — ${studentName}, ${roleLabel}\n\n`;

  prompt += `## Exercise & Quiz Scores by Category\n`;
  for (const [cat, score] of Object.entries(scoresByCategory)) {
    const meta = CATEGORY_META[cat as ArtifactCategory];
    prompt += `- **${meta.name}**: ${score.pct}% (${score.correct}/${score.total} correct)\n`;
  }

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

  prompt += `## Required Output — The Redline

Return a single JSON object. Write in editorial voice throughout. Use the student's actual words verbatim in "struckClaim" and "draftOpening" fields (lightly cleaned of typos). The editor voice surrounds those words — it does not replace them.

\`\`\`json
{
  "assessment": {
    "readersReport": "3-4 sentences. The editor's overall framing, written as a reader's report. Cite the strength (upper chapters) and the weakness (which chapters require rewrite). Second-person, addressed to the author.",
    "overallGrade": "A single letter grade: 'A-', 'B+', 'C', 'C-', 'D+', etc. — calibrated to the mean of category scores.",
    "overallVerdict": "One sentence. The final editor's verdict.",
    "chapters": [
      {
        "chapter": 1,
        "category": "identity",
        "categoryName": "Identity",
        "grade": "A letter grade calibrated to this category's score",
        "verdict": "One sentence of reader's report on this chapter. Editor voice. Do not restate the score in the sentence — the score lives in its own field.",
        "pct": 85
      }
    ]
  },
  "markups": [
    {
      "chapter": 4,
      "category": "discipline",
      "categoryName": "Discipline",
      "draftOpening": "The student's honest admission sentence, taken verbatim from their gate responses (lightly cleaned). This is the first sentence the editor LEAVES IN — the part of their draft that survives unchanged.",
      "marginNote": "Editor's handwritten margin note responding to the honest part. 1 short sentence. Encouraging but clipped: 'Honest. Keep reading.' or 'The only true line in the chapter.'",
      "struckClaim": "The self-deceiving line from the student's draft — something they claim about themselves that their scores contradict. Must be taken verbatim or near-verbatim from their actual gate responses.",
      "insertedTruth": "The corrected version the editor inserts. First-person, written as if the student had been honest from the start. Must reference the actual data (percentage, specific metric) that contradicts the struck line.",
      "scoreAnnotation": "Formatted as 'X% — [Category] Score'",
      "scoreNote": "1 short sentence. The editor's comment on the score. Example: '\"Usually\" is the word people use when they mean \"sometimes\".'",
      "pct": 62
    }
  ],
  "accepted": [
    {
      "category": "discipline",
      "categoryName": "Discipline",
      "commitment": "1-2 sentences written in the student's first-person voice as a final, revised commitment. Specific. Actionable. Time-bound where possible. This is what survives the redline — the version they are choosing to become."
    }
  ]
}
\`\`\`

Rules:
- "assessment.chapters" MUST contain exactly 6 entries — one per category (identity, pipeline, career, discipline, coaching, networking) — ordered from highest score to lowest.
- "markups" MUST contain exactly 4 entries. Select the 4 categories with the widest gap between what the student claimed and what the scores showed. Must be the lower-scoring categories. Each markup must be grounded in an actual gate response — do not fabricate what the student said.
- "accepted" MUST contain 4–6 entries. Prefer the categories that were redlined, plus any commitments the student explicitly made in gate responses. First-person voice.
- NEVER invent claims the student didn't make. The struckClaim must echo something they actually wrote. If no self-deceiving line is available for a low-scoring category, omit that markup.
- The editor voice is precise, slightly cold, allergic to cliché. The student voice (in draftOpening, struckClaim, accepted.commitment) is first-person and their words.
- No sales jargon except when quoting the student. The editor speaks like an editor.`;

  return prompt;
}
