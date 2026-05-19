import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Consumer brand-voice canon: R-G4 manufactured-concept blocklist.
// Each phrase here surfaces as a lint warning when it appears in a
// string literal or JSX text node inside app/** or components/**.
//
// Only phrases that don't false-positive on legitimate technical
// English are hard-banned. Soft-banned terms (the move, pressure,
// unlock, leverage, scale, north star, source of truth, playbook,
// ecosystem) live in canon only — see
// docs/canon-revisions/2026-05-19-language-patch-supplement.md §R-G4.
const CANON_BLOCKLIST = [
  { pattern: "decision-grade", note: "decision-grade is R-G4 manufactured-concept startup-speak" },
  { pattern: "the wedge", note: "'the wedge' is gummy R-G1 abstraction; name what wedges what" },
  { pattern: "our wedge", note: "'our wedge' is R-G4 banned; describe the actual move" },
  { pattern: "account heat", note: "'account heat' is R-G4 NBA-borrowed startup-speak" },
  { pattern: "step-change", note: "'step-change' is R-G4; name the actual shift" },
  { pattern: "table stakes", note: "'table stakes' is R-G4; say what every buyer expects" },
  { pattern: "masterclass", note: "'masterclass' over-claims; use 'course' or 'lesson'" },
  { pattern: "best-in-class", note: "'best-in-class' is an unevidenced marketing intensifier" },
  { pattern: "world-class", note: "'world-class' is an unevidenced marketing intensifier" },
  { pattern: "low-hanging fruit", note: "'low-hanging fruit' is corporate-speak; name the specific thing" },
  { pattern: "circle back", note: "'circle back' is corporate-speak; say when you'll reply" },
  { pattern: "deep dive", note: "'deep dive' is corporate-speak; name the topic" },
  { pattern: "thought leadership", note: "'thought leadership' is R-G4; demonstrate the thinking" },
  { pattern: "value-add", note: "'value-add' is R-G4 corporate-speak" },
  { pattern: "value add", note: "'value add' is R-G4 corporate-speak" },
  { pattern: "synergy", note: "'synergy' is R-G4 corporate-speak" },
  { pattern: "synergistic", note: "'synergistic' is R-G4 corporate-speak" },
  { pattern: "best practices", note: "'best practices' is R-G4; name the actual practice" },
  { pattern: "crush it", note: "'crush it' is base-canon-banned guru framing" },
  { pattern: "crush your quota", note: "'crush your quota' is base-canon-banned" },
  { pattern: "smash your number", note: "'smash your number' is base-canon-banned" },
  // 2026-05-19 founder additions (Appendix F of the supplement):
  { pattern: "furniture", note: "F.3: 'furniture' is banned; name the chair, desk, monitor arm" },
  { pattern: "dial in your tech", note: "F.4: 'dial in your tech' is meaningless; name the specific move" },
  { pattern: "dial your tech in", note: "F.4: same as above" },
  // "fuels" / "fueled" / "fueling" as verbs in motivational prose.
  // Word-boundary regex catches the verb forms without tripping on
  // "fuel" as a literal noun (e.g. fuel costs in a different context).
  { pattern: "\\bfuels\\b", note: "F.2: 'fuels' is gym-bro register; use sustains / runs on" },
  { pattern: "\\bfueled\\b", note: "F.2: same as fuels" },
  { pattern: "\\bfueling\\b", note: "F.2: same as fuels" },
  // "kill" / "kills" / "killed" / "killing" as verbs meaning destroy/ruin.
  // Word-boundary so it doesn't trip on "skill" or "killer" (though
  // "killer" as a metaphor is also borderline). 'die' / 'dies' stays
  // explicitly allowed per founder direction.
  { pattern: "\\bkill\\b", note: "F.1: 'kill' as verb is banned; use tank / wreck / stall / ruin" },
  { pattern: "\\bkills\\b", note: "F.1: same as kill" },
  { pattern: "\\bkilled\\b", note: "F.1: same as kill" },
  { pattern: "\\bkilling\\b", note: "F.1: same as kill" },
  // "rep" as a standalone word — banned per founder direction.
  // Use \b word boundaries via the regex so this doesn't trip on
  // "report", "replay", "represent", "Stripe", etc.
  { pattern: "\\brep\\b", note: "'rep' is banned; use AE / SDR / 'AEs and SDRs'" },
  { pattern: "\\breps\\b", note: "'reps' is banned; use 'AEs and SDRs'" },
];

// Build the no-restricted-syntax option array. One entry per phrase,
// matching string literals + JSX text. Case-insensitive.
function buildCanonRules() {
  return CANON_BLOCKLIST.flatMap((b) => {
    const re = b.pattern.startsWith("\\b") ? b.pattern : b.pattern.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const message = `Canon (R-G4): ${b.note}. See docs/canon-revisions/2026-05-19-language-patch-supplement.md`;
    return [
      { selector: `Literal[value=/${re}/i]`, message },
      { selector: `JSXText[value=/${re}/i]`, message },
      { selector: `TemplateElement[value.raw=/${re}/i]`, message },
    ];
  });
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Documentation snapshots / Figma scaffold (not runtime code):
    "design-canon/**",
    "design-canon-seed/**",
    "tools/design-seed/**",
    "**/*.figma.ts",
  ]),
  // Relax strict type rules in e2e tests — Playwright page/window globals
  // are inherently `any`-shaped and forcing specific types adds noise.
  {
    files: ["tests/**/*.ts", "tests/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "off",
    },
  },
  // Brand-voice blocklist for buyer-facing code surfaces.
  // Excludes lib/ (helpers, not buyer-facing strings) and tests.
  // Also excludes meta-reference surfaces that legitimately quote
  // banned vocabulary as their core function: the disqualification
  // page lists what gets you rejected; the partner-side play game
  // teaches recognising bad copy vs canon-aligned copy.
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    ignores: [
      "app/**/*.test.{ts,tsx}",
      "components/**/*.test.{ts,tsx}",
      "app/partners/who-we-dont-work-with/**",
      "components/partners/PlayGame.tsx",
    ],
    rules: {
      "no-restricted-syntax": ["warn", ...buildCanonRules()],
    },
  },
]);

export default eslintConfig;
