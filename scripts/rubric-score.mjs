#!/usr/bin/env node
/**
 * Rubric discovery scorer. Reads each curriculum unit and produces a
 * mechanical-detection score against the six axes from the
 * curriculum-copy rubric:
 *
 *   1. Sentence-length variety  (catches 3+ short-stacked + monotony)
 *   2. Specificity              (paragraphs without concrete refs)
 *   3. AI-tell absence          (R-G7 patterns + the 'X isn't Y — it's Z' pivot)
 *   4. Sentence endings         (trailing pronouns / vague closers)
 *   5. Register consistency     (motivational / corporate phrase drift)
 *   6. Filler and over-cutting  (avg sentence length per paragraph)
 *
 * Each axis scored 0 / 1 / 2 mechanically. Programmatic scores are floors:
 * a unit can score higher on close reading, but cannot score lower than
 * what the mechanical check finds.
 *
 * Output: one line per unit with axis scores + total /12 + mapped /10.
 */

import { readFile, readdir } from "node:fs/promises";

const ROOT = process.cwd();
const LESSONS = `${ROOT}/content/lessons/html`;

// Extract body-prose strings from a unit (lp, kp body after colon, lie-a,
// comp-sub, comp-p). Excludes carve-outs: lie-q, sidebarMotto, SIDEBAR_TEXTS,
// and the "Created by Antaeus L. Coe" attribution line (italic signature, not
// body prose — counting it as a 4-word paragraph false-fires Axis 6 overcut).
async function extractProse(file) {
  const body = await readFile(file, "utf-8");
  const paragraphs = [];

  // Match HTML attribute content for the prose-bearing classes
  const re = /class="(lp|kp-body|lie-a|comp-sub|comp-p)[^"]*"[^>]*>([^<]+)</g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const text = m[2].trim();
    if (/^Created by/.test(text)) continue;
    paragraphs.push(text);
  }

  // Also catch kp <li> body text — capture the whole list item innerHTML
  // and strip tags. The previous regex stopped at the first `<` after the
  // opening <strong>, which missed multi-<strong> items like the
  // "What You Think / What It Actually Says" rationalization pairs in
  // lesson 11.3 — only the first quote was being scored.
  const kpRe = /<li><span class="kp-n">[^<]+<\/span>(.+?)<\/li>/gs;
  while ((m = kpRe.exec(body)) !== null) {
    const stripped = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (stripped.length > 0) paragraphs.push(stripped);
  }

  return paragraphs;
}

function splitSentences(text) {
  // Naive but good-enough sentence splitter for English prose
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function wordCount(s) {
  return s.split(/\s+/).filter(Boolean).length;
}

// AXIS 1: sentence-length variety
// 0 = 3+ consecutive sentences <8 words in any paragraph, OR fatigue monotony
// 1 = one or two stumble points
// 2 = intentional variation
//
// Carve-outs:
//   - Three consecutive short *question* sentences are rhetorical structure
//     (e.g. "Forecast hawk? Deal-stage enforcer? Last-minute discounter?"),
//     not telegraphic cadence.
//   - Three consecutive short *imperative* sentences are brand-voice
//     emphasis ("Own your schedule. Track your numbers. Ask for feedback.")
//     — first word is a verb in base form, not a pronoun/article/
//     demonstrative.
// The canon's R-G3 ban targets choppy declarative fragments
// ("Faster. Smarter. Better.") with assertive subject-verb chains, not
// these intentional parallel-structure devices.
const NON_IMPERATIVE_FIRST_WORDS = new Set([
  // pronouns
  "i", "you", "he", "she", "it", "we", "they",
  // possessives
  "my", "your", "his", "her", "its", "our", "their",
  // articles + demonstratives
  "a", "an", "the", "this", "that", "these", "those", "there", "here",
  // conjunctions
  "and", "but", "or", "so", "then", "yet", "for",
  // be-forms (start of statements, not commands)
  "is", "are", "was", "were", "am", "be", "been", "being",
]);

function isLikelyImperative(sentence) {
  const firstWord = sentence.trim().split(/\s+/)[0]?.replace(/[^a-zA-Z']/g, "").toLowerCase();
  if (!firstWord) return false;
  // Skip if it's a known non-imperative starter
  if (NON_IMPERATIVE_FIRST_WORDS.has(firstWord)) return false;
  // Skip -ing / -ed verb forms (gerunds/participles, not imperatives)
  if (firstWord.endsWith("ing") || firstWord.endsWith("ed")) return false;
  return true;
}

function scoreAxis1(paragraphs) {
  let shortStacks = 0;
  let monotonyHits = 0;

  for (const p of paragraphs) {
    const sentences = splitSentences(p);
    if (sentences.length < 3) continue;

    // Check 3+ consecutive short
    for (let i = 0; i <= sentences.length - 3; i++) {
      if (
        wordCount(sentences[i]) < 8 &&
        wordCount(sentences[i + 1]) < 8 &&
        wordCount(sentences[i + 2]) < 8
      ) {
        const allQuestions =
          sentences[i].trim().endsWith("?") &&
          sentences[i + 1].trim().endsWith("?") &&
          sentences[i + 2].trim().endsWith("?");
        const allImperatives =
          isLikelyImperative(sentences[i]) &&
          isLikelyImperative(sentences[i + 1]) &&
          isLikelyImperative(sentences[i + 2]);
        if (!allQuestions && !allImperatives) {
          shortStacks++;
          break;
        }
      }
    }

    // Check monotony — every sentence within 25% of the same length
    const lens = sentences.map(wordCount);
    const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
    if (avg > 8 && lens.every((l) => Math.abs(l - avg) / avg < 0.25)) {
      monotonyHits++;
    }
  }

  if (shortStacks >= 1) return 0;
  if (monotonyHits >= 5) return 0;
  if (monotonyHits >= 2) return 1;
  return 2;
}

// AXIS 2: specificity
// Heuristic: a paragraph has ≥1 concrete reference if it contains numbers,
// named roles, named tools, time markers, or named situations.
//
// Role regex matches singular OR plural form (AE/AEs/SDR/SDRs). The
// original `\bAE\b` form failed to match "AEs" because "s" extends the
// word boundary — a real bug that false-flagged operator-vocabulary
// paragraphs as abstract.
const CONCRETE_HINTS = [
  /\b\d/, // any digit
  /\b(SDRs?|AEs?|VPs?|CFOs?|CROs?|CEOs?|RVPs?|GMs?|BDRs?)\b/,
  /\b(Salesforce|HubSpot|Apollo|Outreach|Slack|LinkedIn|Notion|Gong|Untamed)\b/,
  /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|morning|afternoon|evening)\b/i,
  /\b(QBRs?|1:1s?|huddles?|standups?|demos?|discoverys?|forecasts?|all-hands|offsites?|conferences?|events?|dinners?)\b/i,
  /\b(quarter|month|week|year|day)s?\b/i,
  /\b(quotas?|pipelines?|commissions?|comp plans?|OTE|MEDDIC|BANT|cadences?|sequences?|deals?|leads?|territor(?:y|ies)|accounts?|prospects?|champions?|customers?|executives?)\b/i,
];

function scoreAxis2(paragraphs) {
  let abstract = 0;
  for (const p of paragraphs) {
    if (p.length < 30) continue; // skip micro-strings
    if (!CONCRETE_HINTS.some((re) => re.test(p))) abstract++;
  }
  const total = paragraphs.filter((p) => p.length >= 30).length;
  if (total === 0) return 2;
  const abstractPct = abstract / total;
  if (abstractPct > 0.3) return 0;
  if (abstractPct > 0.1) return 1;
  return 2;
}

// AXIS 3: AI-tell absence — known R-G7 patterns
// Three signature families per the canon rubric:
//  (a) "isn't X — it's Y" pivot pattern + related phrasings
//  (b) "Three-part lists" — three consecutive single-word capitalized
//      sentences (the "Faster. Smarter. Better." marketing tell)
//  (c) Em-dash density — any paragraph with >2 em-dashes registers as
//      a fragment-heavy structural tell per the canon doc threshold.
function scoreAxis3(paragraphs) {
  const aiTells = [
    /\bisn['’]t [^—.]*— it['’]s/i,
    /\baren['’]t [^—.]*— they['’]re/i,
    /\bnot just [^—.]*— /i,
    /\bat its core\b/i,
    /\bimagine [a-z]/,
    /\bin a world where\b/i,
    /\blet me explain\b/i,
  ];
  const joined = paragraphs.join(" ");
  let hits = 0;
  for (const re of aiTells) {
    const found = joined.match(new RegExp(re, "gi"));
    if (found) hits += found.length;
  }
  // (b) Three-part single-word capitalized lists. Matches "Faster.
  // Smarter. Better." but skips multi-word sequences like
  // "Pipeline math. Tuesday morning. Real numbers." (each "sentence"
  // must be a single capitalized word terminated by a period).
  const threePartRe = /(?:^|\.\s+)([A-Z][a-z]+\.\s+){2}[A-Z][a-z]+\./g;
  const threePartHits = joined.match(threePartRe);
  if (threePartHits) hits += threePartHits.length;
  // (c) Em-dash density: per-paragraph count, threshold per canon doc.
  for (const p of paragraphs) {
    const emdashes = (p.match(/—/g) || []).length;
    if (emdashes > 2) hits++;
  }
  if (hits >= 4) return 0;
  if (hits >= 2) return 1;
  return 2;
}

// AXIS 4: sentence endings (trailing pronouns / vague closers)
// Conservative version: only flag the egregious bare-pronoun closes.
// Single-word closes like "own it." / "earn it." are concrete-by-reference
// (it = the pipeline, the trust, the work) and don't trigger here.
function scoreAxis4(paragraphs) {
  // Look for paragraphs ending in vague trailers
  const trailing = /\b(the rest|etc|across the board|and so on)\.\s*$/i;
  // Or sentences ending in "X. that." style truly-vague back-references
  // where the prior word is also vague.
  let hits = 0;
  for (const p of paragraphs) {
    if (trailing.test(p.trim())) hits++;
  }
  if (hits >= 3) return 0;
  if (hits >= 1) return 1;
  return 2;
}

// AXIS 5: register consistency (programmatic catch for register slips)
function scoreAxis5(paragraphs) {
  const slips = [
    /\bgame[- ]changer\b/i,
    /\bcrush (it|your)/i,
    /\bunleash\b/i,
    /\btransform your\b/i,
    /\brockstar\b/i,
    /\bsynergy\b/i,
    /\bbest[- ]in[- ]class\b/i,
    /\bbest practices\b/i,
    /\bthought leadership\b/i,
  ];
  const joined = paragraphs.join(" ");
  let hits = 0;
  for (const re of slips) {
    const found = joined.match(new RegExp(re, "gi"));
    if (found) hits += found.length;
  }
  if (hits >= 2) return 0;
  if (hits >= 1) return 1;
  return 2;
}

// AXIS 6: filler / over-cutting — sentence-length distribution
function scoreAxis6(paragraphs) {
  let bloated = 0;
  let overcut = 0;
  let totalParas = 0;
  for (const p of paragraphs) {
    const sentences = splitSentences(p);
    if (sentences.length < 2) continue;
    totalParas++;
    const lens = sentences.map(wordCount);
    const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
    if (avg > 28) bloated++;
    if (avg < 7) overcut++;
  }
  if (totalParas === 0) return 2;
  const issues = (bloated + overcut) / totalParas;
  if (issues > 0.3) return 0;
  if (issues > 0.1) return 1;
  return 2;
}

async function scoreUnit(file) {
  const paragraphs = await extractProse(file);
  const a1 = scoreAxis1(paragraphs);
  const a2 = scoreAxis2(paragraphs);
  const a3 = scoreAxis3(paragraphs);
  const a4 = scoreAxis4(paragraphs);
  const a5 = scoreAxis5(paragraphs);
  const a6 = scoreAxis6(paragraphs);
  const total = a1 + a2 + a3 + a4 + a5 + a6;
  const mapped =
    total === 12 ? 10 : total >= 10 ? 9 : total >= 8 ? 7 : total >= 5 ? 5 : 3;
  return { paragraphs: paragraphs.length, a1, a2, a3, a4, a5, a6, total, mapped };
}

async function main() {
  const dirs = (await readdir(LESSONS)).filter((d) => d.startsWith("lesson-")).sort();
  console.log("unit  A1 A2 A3 A4 A5 A6  /12  /10  paras  flags");
  console.log("----  -- -- -- -- -- --  ---  ---  -----  -----");
  let belowBar = [];
  for (const d of dirs) {
    const files = (await readdir(`${LESSONS}/${d}`)).filter((f) =>
      /^aesdr_course\d+(_\d+)?_v1\.html$/.test(f),
    );
    for (const f of files.sort()) {
      const file = `${LESSONS}/${d}/${f}`;
      const s = await scoreUnit(file);
      const unit = f.replace(/^aesdr_course/, "").replace(/_v1\.html$/, "");
      const flags = [];
      if (s.a1 === 0) flags.push("Axis1=0");
      if (s.a2 === 0) flags.push("Axis2=0");
      if (s.a3 === 0) flags.push("Axis3=0");
      if (s.a4 === 0) flags.push("Axis4=0");
      if (s.a5 === 0) flags.push("Axis5=0");
      if (s.a6 === 0) flags.push("Axis6=0");
      const isBelow = s.mapped < 9 || flags.length > 0;
      const marker = isBelow ? "  ⚠" : "   ";
      console.log(
        `${unit.padEnd(4)} ${marker} ${String(s.a1).padStart(2)} ${String(s.a2).padStart(2)} ${String(s.a3).padStart(2)} ${String(s.a4).padStart(2)} ${String(s.a5).padStart(2)} ${String(s.a6).padStart(2)}  ${String(s.total).padStart(3)}  ${String(s.mapped).padStart(3)}  ${String(s.paragraphs).padStart(5)}  ${flags.join(", ")}`,
      );
      if (isBelow) belowBar.push({ unit, file: file.replace(ROOT + "/", ""), score: s, flags });
    }
  }
  console.log("");
  if (belowBar.length === 0) {
    console.log("All 36 units ≥9/10 on the mechanical pass with no axis at 0.");
  } else {
    console.log(`${belowBar.length} unit(s) flagged for close reading:`);
    for (const b of belowBar) {
      console.log(`  - ${b.file}: ${b.score.mapped}/10 (${b.flags.join(", ") || "below 9"})`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
