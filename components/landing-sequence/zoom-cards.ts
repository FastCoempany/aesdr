/**
 * Editorial zoom-section content. Cards alternate Rowan (hard truth) and
 * Michael (self-deprecating humor). `<span class="iris">…</span>` markers in
 * `headline` get rewritten to the CSS module's iris class at render time.
 */

export type ZoomCard = {
  voice: "rowan" | "michael";
  ghost?: string;
  headline: string;
  sub?: string;
  fontSize: string;
};

export const ZOOM_CARDS: ZoomCard[] = [
  {
    voice: "rowan",
    ghost: "RESET",
    headline: 'Every month or quarter, they reset your number to <span class="iris">zero.</span>',
    sub: "And every month or quarter, you act surprised. You don’t have a pipeline problem. You have a denial problem. You’ve known your math since day 1.",
    fontSize: "clamp(36px,7vw,80px)",
  },
  {
    voice: "michael",
    headline:
      "My manager asked for a pipeline update. I sent a screenshot of an empty spreadsheet and wrote “minimalist aesthetic.” He did not laugh. HR laughed. But like, in a concerned way.",
    fontSize: "clamp(22px,3.5vw,42px)",
  },
  {
    voice: "rowan",
    ghost: "LOST",
    headline: 'You’re not building a career yet. You’re unfortunately <span class="iris">surviving</span> one.',
    sub: "The next promotion is not coming. Not because you’re bad — because nobody has taught you what good looks like. You’re guessing. And it’s loud. Everyone can hear it.",
    fontSize: "clamp(36px,7vw,80px)",
  },
  {
    voice: "michael",
    headline:
      "My mom asked about my five-year plan. I said “survive Q3.” She said that’s three months, not five years. I said we don’t really plan past three months in SaaS. I started crying. She started crying. We prayed.",
    fontSize: "clamp(22px,3.5vw,42px)",
  },
  {
    voice: "rowan",
    ghost: "NOISE",
    headline:
      'The people advising you haven’t carried a quota in a <span class="iris">decade.</span>',
    sub: "“Just add value.” “Be a trusted advisor.” “Run through walls.” None of it is actionable. All of it is noise from people who forgot what it feels like to miss their number.",
    fontSize: "clamp(32px,6vw,72px)",
  },
  {
    voice: "michael",
    headline:
      "A LinkedIn post told me to “lead with value on every call.” So I told a prospect about a really good taco place near their office. Very detailed review. Spicy salsa rankings. They did not buy. But they said the tacos were unreal.",
    fontSize: "clamp(22px,3.5vw,42px)",
  },
  {
    voice: "rowan",
    ghost: "ALONE",
    headline: 'Your onboarding was a <span class="iris">crime scene.</span>',
    sub: "A week of shadowing. A Gong playlist. A prayer. That is not training. Now you’re abandoned and left with just Slack channels. A Slack and a prayer, if you will.",
    fontSize: "clamp(32px,6vw,72px)",
  },
  {
    voice: "michael",
    headline:
      "It’s 11:47pm. I’m watching a YouTube video called “CRUSH Cold Calls in 2024.” The guy has a ring light and a Ferrari poster. I’m taking notes. In my phone. This is my professional development.",
    fontSize: "clamp(22px,3.5vw,42px)",
  },
];
