/**
 * The mechanical warden pass — the deterministic half of brand-fit review.
 *
 * This mirrors the load-bearing entries of scripts/canon-check.mjs (and the
 * eslint no-restricted-syntax CANON_BLOCKLIST) so the scribe drafter cron can
 * gate its own output without an LLM in the loop. It catches the hard-banned
 * vocabulary and the overclaim/price violations — the things that are a
 * mechanical yes/no. It does NOT replace the judgment-heavy `warden` subagent
 * (taste, register, disclosure nuance), which stays chat-invoked for anything
 * bespoke. A clean pass here means "no banned term tripped," not "this is good
 * copy" — that distinction is why the operator still approves every send.
 *
 * KEEP IN SYNC with scripts/canon-check.mjs BLOCKLIST. When that list changes,
 * port the load-bearing additions here.
 */

export type CanonHit = { term: string; hint: string };

// Hard-banned phrases (subset of canon-check.mjs that is unambiguous and likely
// to appear in outreach copy), plus the overclaim/price-accuracy checks the
// warden agent is told to run.
const PATTERNS: Array<{ re: RegExp; hint: string }> = [
  // ── R-G4 manufactured-concept / corporate-speak ──
  { re: /decision[- ]grade/gi, hint: "R-G4: manufactured-concept startup-speak" },
  { re: /\bthe wedge\b/gi, hint: "R-G1/R-G4: gummy abstraction" },
  { re: /\baccount heat\b/gi, hint: "R-G4: NBA-borrowed startup-speak" },
  { re: /\bstep[- ]change\b/gi, hint: "R-G4: name the actual shift" },
  { re: /\btable stakes\b/gi, hint: "R-G4: say what every buyer expects" },
  { re: /\bmasterclass\b/gi, hint: "R-G4: use 'course' or 'lesson'" },
  { re: /\bbest[- ]in[- ]class\b/gi, hint: "R-G4: unevidenced intensifier" },
  { re: /\bworld[- ]class\b/gi, hint: "R-G4: unevidenced intensifier" },
  { re: /\blow[- ]hanging fruit\b/gi, hint: "R-G4: name the specific thing" },
  { re: /\bcircle back\b/gi, hint: "R-G4: say when you'll reply" },
  { re: /\bdeep dive\b/gi, hint: "R-G4: name the topic" },
  { re: /\bthought leadership\b/gi, hint: "R-G4: demonstrate the thinking" },
  { re: /\bvalue[- ]add\b/gi, hint: "R-G4: corporate-speak" },
  { re: /\bsynergy\b/gi, hint: "R-G4: corporate-speak" },
  { re: /\bsynergistic\b/gi, hint: "R-G4: corporate-speak" },
  { re: /\bbest practices\b/gi, hint: "R-G4: name the actual practice" },
  { re: /\breimagine\b/gi, hint: "R-G4: rebuild / re-think instead" },
  { re: /\breinvent\b/gi, hint: "R-G4: rebuild / re-think instead" },
  { re: /\bsurface area\b/gi, hint: "R-G4: name which surface, which area" },
  { re: /\becosystem\b/gi, hint: "R-G4: name the products" },
  { re: /\bflywheel\b/gi, hint: "R-G4: startup trope" },
  {
    re: /(?<!\bthe\s)(?<!\bnext\s)\b(?:level|leveled|leveling|levels)[- ]up\b/gi,
    hint: "R-G4: motivational register; name the specific skill",
  },
  // ── Guru framing (base canon) ──
  { re: /\bcrush it\b/gi, hint: "guru framing banned" },
  { re: /\bcrush your quota\b/gi, hint: "guru framing banned" },
  { re: /\bsmash your number\b/gi, hint: "guru framing banned" },
  { re: /\bgame[- ]chang(?:er|ing)\b/gi, hint: "guru framing banned" },
  { re: /\bsupercharge\b/gi, hint: "guru framing banned" },
  { re: /\bunlock your potential\b/gi, hint: "guru framing banned" },
  // ── Founder rules ──
  { re: /\breps?\b/gi, hint: "founder rule: 'rep'/'reps' banned; use AE / SDR / AEs and SDRs" },
  { re: /\bfuels?\b|\bfueled\b|\bfueling\b/gi, hint: "F.2: gym-bro register; use sustains / runs on" },
  { re: /\bkills?\b|\bkilled\b|\bkilling\b/gi, hint: "F.1: 'kill' as verb banned; use tank / wreck / stall / ruin" },
  // ── Overclaim / outcome guarantees (warden explicit checks) ──
  { re: /\bguarantee(?:d|s)?\b/gi, hint: "overclaim: AESDR promises no outcomes" },
  { re: /\b\d+x\b/gi, hint: "overclaim: '10x'-style multiplier" },
  { re: /\bdouble your (?:income|quota|sales|commission)\b/gi, hint: "overclaim: outcome promise" },
  { re: /\brisk[- ]free\b/gi, hint: "overclaim: implies a guarantee" },
];

// Price-accuracy: outreach must quote the real one-time prices. If a draft
// mentions a dollar price, it must be one of these (or the affiliate rate).
const ALLOWED_PRICES = new Set(["$249", "$299"]);
const PRICE_RE = /\$\d{2,4}(?:\.\d{2})?/g;

/**
 * Run the mechanical canon gate on a draft (subject + body concatenated).
 * Returns { clean, hits }. clean === true means nothing tripped.
 */
export function canonCheck(text: string): { clean: boolean; hits: CanonHit[] } {
  const hits: CanonHit[] = [];
  for (const { re, hint } of PATTERNS) {
    const m = text.match(re);
    if (m) {
      // De-dupe identical matches; report the term as seen.
      const term = m[0];
      if (!hits.some((h) => h.term.toLowerCase() === term.toLowerCase() && h.hint === hint)) {
        hits.push({ term, hint });
      }
    }
  }
  // Price sanity: any $-amount that isn't an allowed price is suspect (the 40%
  // commission rate is a percentage, not a dollar figure, so it's unaffected).
  const prices = text.match(PRICE_RE) || [];
  for (const p of prices) {
    if (!ALLOWED_PRICES.has(p)) {
      hits.push({ term: p, hint: "price accuracy: AESDR is $249 (SDR) / $299 (AE) one-time" });
    }
  }
  return { clean: hits.length === 0, hits };
}
