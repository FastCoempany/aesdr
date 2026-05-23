#!/usr/bin/env node
/**
 * Canon-check script. Greps for blocklisted phrases across content
 * surfaces ESLint can't reach (markdown, HTML, plain text).
 *
 * Pairs with the no-restricted-syntax rule in eslint.config.mjs that
 * handles .ts/.tsx string-literal + JSX-text bans.
 *
 * Usage:
 *   node scripts/canon-check.mjs              # exit 1 on any hit
 *   node scripts/canon-check.mjs --soft       # exit 0 on any hit (warn only)
 *
 * Skipped surfaces (canon docs that DESCRIBE the banned terms):
 *   - docs/canon-revisions/**
 *   - docs/_audits/**  (audits discuss the banned vocab by name)
 *   - AFFILIATE_BRAND_CANON.md (describes partner-side banned vocab)
 *   - content/affiliate-kit/banned-vocabulary.md
 *   - any file with "canon" in the path
 *
 * Per-line carve-outs (curriculum pedagogical examples, attestations):
 *   - LINE_EXEMPTIONS table below holds specific (file, line, match)
 *     triples. Each suppresses exactly one hit. If the line drifts,
 *     the exemption stops matching and the hit reappears — this is
 *     the intended self-healing behavior.
 *
 * Each pattern is a regex executed case-insensitively. Hits print as
 * `path:line:column  pattern  hint` (parseable by editor jump-to-line).
 */

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();

// Phrases the ESLint rule doesn't cover (markdown / HTML / plain text).
// Keep this in sync with eslint.config.mjs CANON_BLOCKLIST.
const BLOCKLIST = [
  { pattern: /decision[- ]grade/gi, hint: "R-G4: decision-grade is manufactured-concept startup-speak" },
  { pattern: /\bthe wedge\b/gi, hint: "R-G1/R-G4: 'the wedge' is gummy abstraction" },
  { pattern: /\bour wedge\b/gi, hint: "R-G4: 'our wedge' is banned; describe the actual move" },
  { pattern: /\baccount heat\b/gi, hint: "R-G4: NBA-borrowed startup-speak" },
  { pattern: /\bstep[- ]change\b/gi, hint: "R-G4: name the actual shift" },
  { pattern: /\btable stakes\b/gi, hint: "R-G4: say what every buyer expects" },
  { pattern: /\bmasterclass\b/gi, hint: "R-G4: use 'course' or 'lesson'" },
  { pattern: /\bbest[- ]in[- ]class\b/gi, hint: "R-G4: unevidenced marketing intensifier" },
  { pattern: /\bworld[- ]class\b/gi, hint: "R-G4: unevidenced marketing intensifier" },
  { pattern: /\blow[- ]hanging fruit\b/gi, hint: "R-G4: name the specific thing" },
  { pattern: /\bcircle back\b/gi, hint: "R-G4: corporate-speak; say when you'll reply" },
  { pattern: /\bdeep dive\b/gi, hint: "R-G4: corporate-speak; name the topic" },
  { pattern: /\bthought leadership\b/gi, hint: "R-G4: demonstrate the thinking" },
  { pattern: /\bvalue[- ]add\b/gi, hint: "R-G4: corporate-speak" },
  { pattern: /\bsynergy\b/gi, hint: "R-G4: corporate-speak" },
  { pattern: /\bsynergistic\b/gi, hint: "R-G4: corporate-speak" },
  { pattern: /\bbest practices\b/gi, hint: "R-G4: name the actual practice" },
  { pattern: /\bcrush it\b/gi, hint: "base canon: guru framing banned" },
  { pattern: /\bcrush your quota\b/gi, hint: "base canon: guru framing banned" },
  { pattern: /\bsmash your number\b/gi, hint: "base canon: guru framing banned" },
  { pattern: /\breimagine\b/gi, hint: "R-G4: rebuild / re-think instead" },
  { pattern: /\breinvent\b/gi, hint: "R-G4: rebuild / re-think instead" },
  { pattern: /\bAI[- ]tell\b/gi, hint: "(self-reference: this file is fine, but flag elsewhere)" },
  { pattern: /\breims?\b/gi, hint: "(disabled placeholder — kept for stable list ordering)" },
  { pattern: /\brep\b/gi, hint: "founder rule: 'rep' banned; use AE / SDR" },
  { pattern: /\breps\b/gi, hint: "founder rule: 'reps' banned; use AEs and SDRs" },
  // 2026-05-19 founder additions (Appendix F)
  { pattern: /\bfurniture\b/gi, hint: "F.3: 'furniture' banned; name the chair, desk, monitor arm" },
  { pattern: /dial in your tech|dial your tech in/gi, hint: "F.4: 'dial in your tech' is meaningless; name the move" },
  { pattern: /\bfuels?\b|\bfueled\b|\bfueling\b/gi, hint: "F.2: 'fuels' is gym-bro register; use sustains / runs on" },
  { pattern: /\bkills?\b|\bkilled\b|\bkilling\b/gi, hint: "F.1: 'kill' as verb is banned; use tank / wreck / stall / ruin. 'die' stays allowed." },
  // 2026-05-22 mechanical-foundation additions — R-G4 hard-bans previously
  // covered only in the canon doc, now mechanically enforced:
  { pattern: /\bthe ledger\b/gi, hint: "R-G4: 'the ledger' is bookkeeping metaphor; use 'the spreadsheet'" },
  { pattern: /\bour OS\b/g, hint: "R-G4: 'our OS' is startup-pitch trope" },
  { pattern: /\bsurface area\b/gi, hint: "R-G4: 'surface area' is geometry metaphor; say which surface, which area" },
  { pattern: /\becosystem\b/gi, hint: "R-G4: 'ecosystem' is biology metaphor; name the products" },
  { pattern: /\bflywheel\b/gi, hint: "R-G4: 'flywheel' is startup trope (unless naming Bezos/Collins)" },
  // 'level up' as motivational verb. Negative lookbehind skips
  // legitimate hierarchical uses: 'the next level up', 'next level up'.
  { pattern: /(?<!\bthe\s)(?<!\bnext\s)\blevel[- ]up\b/gi, hint: "R-G4: 'level up' is motivational register; name the specific skill" },
];

// File extensions we scan.
const EXTS = new Set([".md", ".mdx", ".html", ".txt"]);

// Directories to skip outright.
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "out",
  "build",
  "design-canon",
  "design-canon-seed",
  "tools/design-seed",
]);

// File-path patterns to skip — canon docs that legitimately mention
// the banned terms because they describe them.
const SKIP_FILE_PATTERNS = [
  /docs\/canon-revisions\//,
  /docs\/_audits\//,
  /^AFFILIATE_BRAND_CANON\.md$/,
  /^AESDR_ENTERPRISE_CANON\.md$/,
  /content\/affiliate-kit\/banned-vocabulary\.md$/,
  /content\/aesdr-internal\/00-canon-excerpt\.md$/,
  /content\/aesdr-internal\/D20-claims-sheet\.md$/,
  /docs\/affiliate\/D20-claims-sheet\.md$/,
  /docs\/affiliate\/kit-template\/00-canon-excerpt\.md$/,
  /\.github\/pull_request_template\.md$/,
  /^AGENTS\.md$/,
  /^www\.aesdr\.com-\d{8}T\d{6}\.html$/,
  /\.test\.(md|mdx)$/,
];

// Per-line exemptions — specific (file, line, matched-text) triples that
// are documented canonical carve-outs (curriculum pedagogical examples,
// attestations per Appendix E-P3, etc.). Each entry suppresses exactly
// one hit; if the line drifts, the exemption stops matching and the
// hit comes back — that is the intended self-healing behavior.
//
// Add new exemptions only with a `reason` that names the canon section
// or appendix that authorizes the carve-out.
const LINE_EXEMPTIONS = [
  {
    file: "content/lessons/html/lesson-01/aesdr_course01_v1.html",
    line: 1656,
    match: "kills",
    reason: "Appendix E-P3 attest-text carve-out: 'complacency kills careers' is the AE/SDR's own attestation in the Day-4 debrief gate. The banned-verb register is intentional — this is the student writing what they actually feel, not the brand voice.",
  },
  {
    file: "content/lessons/html/lesson-09/aesdr_course09_2_v1.html",
    line: 1602,
    match: "circle back",
    reason: "Pedagogical example: the section teaches AEs/SDRs to replace 'Let's circle back' with direct deadline-driven Slack messages. Quoting the banned phrase to refute it is the lesson's point.",
  },
  {
    file: "content/lessons/html/lesson-09/aesdr_course09_2_v1.html",
    line: 1841,
    match: "circle back",
    reason: "Pedagogical example: same Slack-discipline section, gate prompt template showing before-and-after rewrites of vague messages. The 'Before: Let's circle back on this.' is the negative example the student replaces.",
  },
];

function isExempt(rel, lineNum, matchedText) {
  return LINE_EXEMPTIONS.some(
    (ex) =>
      ex.file === rel &&
      ex.line === lineNum &&
      ex.match.toLowerCase() === matchedText.toLowerCase(),
  );
}

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full);
    if (entry.isDirectory()) {
      if ([...SKIP_DIRS].some((d) => rel === d || rel.startsWith(d + "/"))) continue;
      out.push(...(await walk(full)));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (!EXTS.has(ext)) continue;
      if (SKIP_FILE_PATTERNS.some((re) => re.test(rel))) continue;
      out.push(full);
    }
  }
  return out;
}

async function scan(file) {
  const rel = path.relative(ROOT, file);
  let body;
  try {
    body = await readFile(file, "utf-8");
  } catch {
    return [];
  }
  const lines = body.split("\n");
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { pattern, hint } of BLOCKLIST) {
      pattern.lastIndex = 0;
      let m;
      while ((m = pattern.exec(line)) !== null) {
        if (!isExempt(rel, i + 1, m[0])) {
          hits.push({
            file: rel,
            line: i + 1,
            col: m.index + 1,
            match: m[0],
            hint,
          });
        }
        if (pattern.lastIndex === m.index) pattern.lastIndex++;
      }
    }
  }
  return hits;
}

async function main() {
  const soft = process.argv.includes("--soft");
  const files = await walk(ROOT);
  let total = 0;
  for (const file of files) {
    const hits = await scan(file);
    for (const h of hits) {
      console.log(`${h.file}:${h.line}:${h.col}  "${h.match}"  ${h.hint}`);
      total++;
    }
  }
  if (total === 0) {
    console.log("canon-check: clean");
    process.exit(0);
  }
  console.log(`\ncanon-check: ${total} hits across ${files.length} files`);
  process.exit(soft ? 0 : 1);
}

main().catch((err) => {
  console.error("canon-check failed:", err);
  process.exit(2);
});
