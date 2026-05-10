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
    headline: 'Every month, they reset your number to <span class="iris">zero.</span>',
    sub: "And every month, you act surprised. You don’t have a pipeline problem. You have a denial problem. The math has been screaming at you for weeks.",
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
    headline: 'You are not building a career. You are <span class="iris">surviving</span> one.',
    sub: "The next promotion is not coming. Not because you’re bad — because nobody has taught you what good looks like. You’re guessing. Loudly.",
    fontSize: "clamp(36px,7vw,80px)",
  },
  {
    voice: "michael",
    headline:
      "My mom asked about my five-year plan. I said “survive Q3.” She said that’s three months, not five years. I said we don’t really plan past three months in SaaS. She started crying. I started crying. We had pasta.",
    fontSize: "clamp(22px,3.5vw,42px)",
  },
  {
    voice: "rowan",
    ghost: "NOISE",
    headline:
      'The people advising you haven’t carried a bag in a <span class="iris">decade.</span>',
    sub: "“Just add value.” “Be a trusted advisor.” “Crush it.” None of it is actionable. All of it is noise from people who forgot what it feels like to miss.",
    fontSize: "clamp(32px,6vw,72px)",
  },
  {
    voice: "michael",
    headline:
      "LinkedIn told me to “lead with value on every call.” So I told a prospect about a really good taco place near their office. Very detailed review. Salsa rankings. They did not buy. But the tacos are genuinely excellent. I stand by the recommendation.",
    fontSize: "clamp(22px,3.5vw,42px)",
  },
  {
    voice: "rowan",
    ghost: "ALONE",
    headline: 'Your onboarding was a <span class="iris">crime scene.</span>',
    sub: "A week of shadowing. A Gong playlist. A prayer. That is not training. That is abandonment with a Slack channel.",
    fontSize: "clamp(32px,6vw,72px)",
  },
  {
    voice: "michael",
    headline:
      "It’s 11:47pm. I’m watching a YouTube video called “CRUSH Cold Calls in 2024.” The guy has a ring light and a Ferrari poster. I’m taking notes. In my phone. This is my professional development. I have a degree. From a university. With a campus.",
    fontSize: "clamp(22px,3.5vw,42px)",
  },
];
