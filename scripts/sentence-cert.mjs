#!/usr/bin/env node
// Sentence-cadence certification harness for curriculum lessons.
// Strips HTML -> visible prose, measures per-unit sentence-length distribution.
// Purpose: certify Axis 1 (sentence-length variety) + Axis 6 (not bloated /
// not over-pruned) from docs/canon-revisions/2026-05-19-curriculum-copy-rubric.md.
// Directional, repeatable. Run: node scripts/sentence-cert.mjs

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = "content/lessons/html";

function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/\s+/g, " ")
    .trim();
}

// Split into sentences on terminal punctuation followed by space/EOL.
function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z"'(—])/)
    .map((s) => s.trim())
    .filter((s) => /[A-Za-z]/.test(s));
}

function words(s) {
  return s.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

function analyze(text) {
  const sents = sentences(text);
  const lens = sents.map(words).filter((n) => n > 0);
  const total = lens.length;
  const wordCount = lens.reduce((a, b) => a + b, 0);
  const avg = wordCount / total;
  const over25 = lens.filter((n) => n > 25).length;
  const over28 = lens.filter((n) => n > 28).length;
  const under8 = lens.filter((n) => n < 8).length;
  // longest run of consecutive <8-word sentences (telegraphic chain proxy)
  let run = 0,
    maxRun = 0;
  for (const n of lens) {
    if (n < 8) {
      run++;
      maxRun = Math.max(maxRun, run);
    } else run = 0;
  }
  const sd = Math.sqrt(
    lens.reduce((a, b) => a + (b - avg) ** 2, 0) / total
  );
  return {
    wordCount,
    sentences: total,
    avg,
    sd,
    pctOver25: (100 * over25) / total,
    pctOver28: (100 * over28) / total,
    pctUnder8: (100 * under8) / total,
    maxShortRun: maxRun,
  };
}

const dirs = readdirSync(ROOT).filter((d) => d.startsWith("lesson-"));
const rows = [];
let grandWords = 0;
for (const d of dirs.sort()) {
  for (const f of readdirSync(join(ROOT, d)).filter((f) => f.endsWith(".html")).sort()) {
    const text = strip(readFileSync(join(ROOT, d, f), "utf8"));
    const m = analyze(text);
    grandWords += m.wordCount;
    // Certification verdict per rubric Axis 1 + Axis 6:
    //  BLOAT  if avg > 25 (Axis 6: "every sentence over 25 words")
    //  CHOPPY if a 3+ run of sub-8-word sentences exists (Axis 1 telegraphic)
    const flags = [];
    if (m.avg > 25) flags.push("BLOAT");
    if (m.avg > 28) flags.push("BLOAT+");
    if (m.maxShortRun >= 3) flags.push("choppy-run");
    if (m.sd < 6) flags.push("low-variety");
    rows.push({ unit: f.replace(/aesdr_|_v1\.html|course/g, "").replace(/_/g, "."), ...m, verdict: flags.length ? flags.join(",") : "PASS" });
  }
}

const pad = (s, n) => String(s).padEnd(n);
const num = (x, n = 1) => x.toFixed(n);
console.log(
  pad("unit", 10),
  pad("words", 7),
  pad("sents", 6),
  pad("avg", 6),
  pad("sd", 5),
  pad("%>25", 6),
  pad("%>28", 6),
  pad("shRun", 6),
  "verdict"
);
for (const r of rows) {
  console.log(
    pad(r.unit, 10),
    pad(r.wordCount, 7),
    pad(r.sentences, 6),
    pad(num(r.avg), 6),
    pad(num(r.sd), 5),
    pad(num(r.pctOver25), 6),
    pad(num(r.pctOver28), 6),
    pad(r.maxShortRun, 6),
    r.verdict
  );
}
const fail = rows.filter((r) => r.verdict !== "PASS");
const bloat = rows.filter((r) => r.avg > 25);
console.log("\n— summary —");
console.log("total prose words:", grandWords);
console.log("units:", rows.length, "| PASS:", rows.length - fail.length, "| flagged:", fail.length);
console.log("bloated (avg>25):", bloat.length, "| choppy-run(>=3):", rows.filter((r) => r.maxShortRun >= 3).length);
console.log("corpus avg words/sentence:", num(grandWords / rows.reduce((a, r) => a + r.sentences, 0), 2));
