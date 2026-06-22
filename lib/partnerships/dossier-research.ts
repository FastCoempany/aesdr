import Anthropic from "@anthropic-ai/sdk";

import {
  DOSSIER_SYSTEM,
  DOSSIER_SCHEMA_HINT,
  type DossierBrief,
} from "./anthropic-agents";
import type { ResearchProgress } from "./scout-research";

/**
 * The rebuilt "Run brief" engine — the same two-phase shape as the sweep:
 *
 *   Phase 1 (research, with tools): search for the person, OPEN their site /
 *     About / contact page (web_fetch) to verify a real non-LinkedIn contact,
 *     audience, voice, and conflicts. Accumulates the transcript.
 *   Phase 2 (write-up, NO tools): a separate fast call that emits the brief JSON
 *     from everything gathered — so a long research run never gets cut off
 *     mid-emit and lost (the old single-call dossier returned null on a slow
 *     run; this always writes up what it found).
 *
 * Runs in the background (after()); streams so the room sees live progress.
 */

const TOOLS: Anthropic.Messages.ToolUnion[] = [
  { type: "web_search_20260209", name: "web_search", max_uses: 6 },
  { type: "web_fetch_20260209", name: "web_fetch", max_uses: 4 },
];

const RESEARCH_BUDGET_MS = 110_000;
const EMIT_BUDGET_MS = 35_000;
const MAX_TURNS = 12;
const PROGRESS_THROTTLE_MS = 1_500;

// Per-candidate token ceiling (R4-PERF-2). 6 searches + 4 fetches over up to 12
// turns re-bills the whole transcript each turn; BATCH caps rows, not tokens.
// When cumulative usage crosses this, stop and write up what we have.
const MAX_RUN_TOKENS = 400_000;

// One try per call + a per-request timeout that covers the research budget,
// instead of the SDK's 10-min / 2-retry default that fights our own budget and
// can triple the bill on a stuck call (R5-IC-8).
const ANTHROPIC_OPTS = { maxRetries: 1, timeout: RESEARCH_BUDGET_MS } as const;

const EMIT_INSTRUCTION = `Stop researching now and output the brief. Reply with ONLY a single JSON object — start your reply with { and end it with } — no prose before or after, no markdown fences. You MUST produce it even if your research was thin: in that case set "verdict":"needs_research" and note what's missing in the rationale fields, but still fill EVERY key. ${DOSSIER_SCHEMA_HINT}`;

function phaseFor(searches: number, pagesRead: number): string {
  if (searches === 0 && pagesRead === 0) return "Starting the search…";
  if (pagesRead === 0) return `Searching for them… (${searches} ${searches === 1 ? "search" : "searches"})`;
  return `Reading their site to verify… (${searches} searches, ${pagesRead} read)`;
}

/** Pull the first complete, brace-balanced JSON object out of a reply — robust
 *  to prose or markdown wrapped around it, and to braces inside string values
 *  (it tracks string state). Returns null if there's no balanced object. */
function firstBalancedObject(s: string): string | null {
  const start = s.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '"') {
      inStr = true;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

/** Pull the JSON object out of the reply and coerce it to a brief — tolerant of
 *  prose wrapping, markdown fences, and trailing commas. */
function extractBrief(text: string): DossierBrief | null {
  const noFences = text.replace(/```(?:json)?/gi, "");
  const raw = firstBalancedObject(noFences);
  if (!raw) return null;
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    try {
      // Last-ditch: strip trailing commas the model sometimes leaves.
      obj = JSON.parse(raw.replace(/,(\s*[}\]])/g, "$1")) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
  const conflict = (["none", "soft", "hard", "unknown"] as const).includes(obj.conflict as never)
    ? (obj.conflict as DossierBrief["conflict"])
    : "unknown";
  const verdict = (["reach_out", "skip", "needs_research"] as const).includes(obj.verdict as never)
    ? (obj.verdict as DossierBrief["verdict"])
    : "needs_research";
  return {
    audience_est: typeof obj.audience_est === "number" ? obj.audience_est : null,
    cadence_note: str(obj.cadence_note),
    voice_fit: typeof obj.voice_fit === "number" ? obj.voice_fit : 3,
    voice_fit_rationale: str(obj.voice_fit_rationale),
    conflict,
    conflict_note: str(obj.conflict_note),
    contact_path: str(obj.contact_path),
    first_touch_angle: str(obj.first_touch_angle),
    verdict,
    own_domain: typeof obj.own_domain === "string" ? obj.own_domain : null,
  };
}

/**
 * Research ONE candidate and write up the brief. Streams; reports live progress
 * via onProgress (throttled). Returns the brief, or null if it couldn't produce
 * one even from the write-up pass (caller marks the run failed).
 */
export async function runDossierResearch(
  args: {
    name: string;
    surface: string | null;
    handle: string | null;
    existingWhyFit: string | null;
  },
  model: string,
  onProgress?: (p: ResearchProgress) => void,
): Promise<DossierBrief | null> {
  const c = new Anthropic(ANTHROPIC_OPTS);
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Candidate: ${args.name}\nSurface: ${args.surface ?? "(unknown)"}\nHandle: ${args.handle ?? "(unknown)"}\nWhat we know: ${args.existingWhyFit ?? "(nothing yet)"}\n\nResearch them with your tools — search, then OPEN their site / About / contact page to verify.`,
    },
  ];

  let searches = 0;
  let pagesRead = 0;
  let tokensUsed = 0;
  let lastEmit = 0;
  const report = (phase: string) => onProgress?.({ phase, searches, pagesRead });
  const throttled = () => {
    const now = Date.now();
    if (now - lastEmit < PROGRESS_THROTTLE_MS) return;
    lastEmit = now;
    report(phaseFor(searches, pagesRead));
  };

  // ── Phase 1: research with tools ──
  const researchDeadline = Date.now() + RESEARCH_BUDGET_MS;
  let naturalText = "";
  for (let i = 0; i < MAX_TURNS; i++) {
    const remaining = researchDeadline - Date.now();
    if (remaining <= 0) break;
    // Token budget break — stop and write up once cumulative spend crosses the
    // cap (R4-PERF-2).
    if (tokensUsed >= MAX_RUN_TOKENS) break;

    const stream = c.messages.stream({
      model,
      max_tokens: 2048,
      system: DOSSIER_SYSTEM,
      tools: TOOLS,
      messages,
    });
    const stop = setTimeout(() => stream.abort(), remaining);
    stream.on("streamEvent", (event) => {
      try {
        if (event.type === "content_block_start" && event.content_block.type === "server_tool_use") {
          const name = event.content_block.name;
          if (name === "web_search") searches++;
          else if (name === "web_fetch") pagesRead++;
          throttled();
        }
      } catch {
        /* progress is best-effort */
      }
    });
    let turnText = "";
    stream.on("text", (delta) => {
      turnText += delta;
    });

    try {
      const final = await stream.finalMessage();
      clearTimeout(stop);
      tokensUsed +=
        (final.usage?.input_tokens ?? 0) + (final.usage?.output_tokens ?? 0);
      messages.push({ role: "assistant", content: final.content });
      if (final.stop_reason === "pause_turn") {
        throttled();
        continue;
      }
      naturalText = turnText;
      break;
    } catch {
      clearTimeout(stop);
      break; // research deadline — proceed to the forced write-up
    }
  }

  if (naturalText) {
    const fromNatural = extractBrief(naturalText);
    if (fromNatural) return fromNatural;
  }

  // ── Phase 2: forced write-up (NO tools) ──
  report(`Writing up the brief… (${searches} searches, ${pagesRead} read)`);
  messages.push({ role: "user", content: EMIT_INSTRUCTION });
  let emitText = "";
  try {
    const emitStream = c.messages.stream({ model, max_tokens: 2048, system: DOSSIER_SYSTEM, messages });
    const emitStop = setTimeout(() => emitStream.abort(), EMIT_BUDGET_MS);
    emitStream.on("text", (delta) => {
      emitText += delta;
    });
    try {
      await emitStream.finalMessage();
    } finally {
      clearTimeout(emitStop);
    }
  } catch {
    /* salvage whatever it wrote */
  }
  return extractBrief(emitText);
}
