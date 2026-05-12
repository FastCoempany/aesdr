/**
 * Michael's marginalia — 15 hand-written notes for the landing scroll.
 *
 * Voice: dry, reactive, specific. The reader is someone who has been
 * through the lessons and is re-reading the doctrine years later. Not
 * a copywriter performing a voice — a real person leaving notes for
 * themselves in a working copy.
 *
 * Tone references already locked into the brand:
 *   - "What's your actual close rate? Not the one you told your VP."
 *     (existing canon, on the peel card)
 *   - AGENTS.md: "--hand (Caveat, cursive) — Michael's voice / margin
 *     annotations only."
 *
 * NOT in scope:
 *   - inspirational lines  ("you got this!")
 *   - rhetorical flourish  ("the only thing standing between you and…")
 *   - sales copy register  ("transform your career")
 *
 * Each note is anchored to a CSS selector. The AnnotationsLayer
 * positions them via getBoundingClientRect with the offset config.
 */

export type AnnotationSide = "left" | "right";

export interface Annotation {
  /** CSS selector pointing at the element this note is anchored to. */
  anchor: string;
  /** Side of the anchor element to position the note on. */
  side: AnnotationSide;
  /** Vertical offset in px from the anchor's top edge (positive = down). */
  yOffset: number;
  /** Horizontal offset in px from the anchor's edge (positive = away from anchor). */
  xOffset: number;
  /** Width in px — annotations wrap inside this. */
  width: number;
  /** The handwritten note. Keep short — these are reactions, not copy. */
  text: string;
  /** Pen color. Default "crimson" (brand crimson). "ink" for the secondary pen. */
  ink?: "crimson" | "ink";
  /** Optional tilt in degrees (mild — most fall within ±3°). */
  tilt?: number;
  /** Optional underline-target — selector + which words to underline. */
  underline?: { selector: string; words: string }[];
}

export const MICHAEL_NOTES: Annotation[] = [
  // ─── HERO ───
  {
    anchor: '[data-mockup-section="hero"] [alt^="Leponeus"]',
    side: "right",
    yOffset: 18,
    xOffset: 24,
    width: 180,
    text: "yes, that's the shell. don't ask.",
    ink: "ink",
    tilt: -2,
  },
  {
    anchor: '[data-mockup-section="hero"] h1',
    side: "left",
    yOffset: -10,
    xOffset: 28,
    width: 150,
    text: "twelve. not eleven. on purpose.",
    ink: "crimson",
    tilt: 1.5,
  },
  {
    anchor: '[data-mockup-section="hero"] a',
    side: "right",
    yOffset: -4,
    xOffset: 18,
    width: 160,
    text: "the button changed three times. this one stayed.",
    ink: "ink",
    tilt: 3,
  },

  // ─── DECK STACK (12 lessons peel) ───
  {
    anchor: '[data-mockup-section="deckstack"]',
    side: "left",
    yOffset: 88,
    xOffset: 32,
    width: 170,
    text: "peel one. then peel another. it's fine.",
    ink: "ink",
    tilt: -1,
  },
  {
    anchor: '[data-mockup-section="deckstack"]',
    side: "right",
    yOffset: 280,
    xOffset: 24,
    width: 160,
    text: "lesson 5 broke me. read it twice.",
    ink: "crimson",
    tilt: 2,
  },

  // ─── TESTIMONIALS ───
  {
    anchor: '[data-mockup-section="testimonials"]',
    side: "left",
    yOffset: 40,
    xOffset: 28,
    width: 175,
    text: "ask them to their face. then decide.",
    ink: "ink",
    tilt: -2,
  },

  // ─── VALIDATION MARQUEE ───
  {
    anchor: '[data-mockup-section="validation"]',
    side: "right",
    yOffset: 12,
    xOffset: 28,
    width: 180,
    text: "they didn't pay us. we let them call.",
    ink: "crimson",
    tilt: -1.5,
  },

  // ─── PRICING ───
  {
    anchor: '[data-mockup-section="pricing"] h2',
    side: "right",
    yOffset: -8,
    xOffset: 20,
    width: 165,
    text: "yes lifetime. no asterisk.",
    ink: "crimson",
    tilt: 2,
  },
  {
    anchor: '[data-mockup-section="pricing"] [alt^="Leponeus"]',
    side: "left",
    yOffset: 22,
    xOffset: 32,
    width: 175,
    text: "the math is on the wall already.",
    ink: "ink",
    tilt: -2,
  },
  {
    anchor: '[data-mockup-section="pricing"]',
    side: "right",
    yOffset: 380,
    xOffset: 18,
    width: 175,
    text: "team plan paid for itself by week 2. — Marcus said it first.",
    ink: "ink",
    tilt: 1.5,
  },

  // ─── FAQ ───
  {
    anchor: '[data-mockup-section="faq"] h2',
    side: "left",
    yOffset: -4,
    xOffset: 24,
    width: 160,
    text: "questions you didn't ask.",
    ink: "crimson",
    tilt: -2,
  },
  {
    anchor: '[data-mockup-section="faq"]',
    side: "right",
    yOffset: 260,
    xOffset: 18,
    width: 180,
    text: "we tested the refund. it works. — APR 5",
    ink: "ink",
    tilt: 1,
  },

  // ─── FINAL CTA ───
  {
    anchor: '[data-mockup-section="cta"] h2',
    side: "left",
    yOffset: 8,
    xOffset: 32,
    width: 170,
    text: "stop reading. start one lesson.",
    ink: "crimson",
    tilt: -2,
  },

  // ─── CONTENT WARNING ───
  {
    anchor: '[data-mockup-section="warning"]',
    side: "right",
    yOffset: -4,
    xOffset: 22,
    width: 190,
    text: "all of it true. some of it mine.",
    ink: "ink",
    tilt: 2,
  },

  // ─── FOOTER ───
  {
    anchor: '[data-mockup-section="footer"]',
    side: "right",
    yOffset: 4,
    xOffset: 14,
    width: 145,
    text: "—still true 6mo later",
    ink: "ink",
    tilt: -1,
  },
];
