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
 *   - AFFILIATE_BRAND_CANON.md (describes partner-side banned vocab)
 *   - content/partner-kit/banned-vocabulary.md
 *   - any file with "canon" in the path
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
  { pattern: /\brep\b/gi, hint: "founder rule: 'rep' banned; use AE / SDR" },
  { pattern: /\breps\b/gi, hint: "founder rule: 'reps' banned; use AEs and SDRs" },
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
  /^AFFILIATE_BRAND_CANON\.md$/,
  /content\/partner-kit\/banned-vocabulary\.md$/,
  /\.test\.(md|mdx)$/,
];

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
        hits.push({
          file: rel,
          line: i + 1,
          col: m.index + 1,
          match: m[0],
          hint,
        });
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
