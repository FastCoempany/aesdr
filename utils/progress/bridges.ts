/**
 * Lesson-to-lesson narrative bridges.
 *
 * Two sentences per transition. Each bridge names what just landed
 * (the module just completed) and what's next (the module about to
 * start). They connect 12 modules into one arc instead of 12 articles.
 *
 * Originally authored in app/course/[lessonId]/complete/page.tsx as
 * NARRATIVE_BRIDGES; lifted into this canonical location on 2026-05-23
 * so the dashboard's just-closed-module recognition block can render
 * the same line a user just saw on /course/[N]/complete.
 *
 * Voice: founder register, concrete anchors (the floor, the conference,
 * the tools, the comp letter, the dinner table). No "journey,"
 * "mindset," "blueprint," "leverage" — and no AI-tell phrasing per the
 * brand-voice canon (R-G1 through R-G8).
 *
 * No bridge from module 12 — the all-complete surface handles
 * close-out.
 */
export const BRIDGE_TO_NEXT: Record<string, string> = {
  "1":
    "Course 1 built structure with your manager. Course 2 expands that structure across the floor — silos, home office, AE-SDR friction.",
  "2":
    "Course 2 mapped the floor's hidden dynamics. Course 3 is the survival kit for when those dynamics turn against you.",
  "3":
    "Course 3 was about surviving the worst weeks. Course 4 is about navigating the everyday — the manager, the culture, the async-life.",
  "4":
    "Course 4 read the rooms you sit in. Course 5 is the playbook for what to do once you're in them.",
  "5":
    "Course 5 gave you the playbook. Course 6 is what the playbook leaves out — the networking, the curiosity, the moves nobody coaches.",
  "6":
    "Course 6 expanded your toolkit beyond the playbook. Course 7 forces the harder question: is prospecting your job too?",
  "7":
    "Course 7 confronted whose pipeline this really is. Course 8 confronts who's responsible when it breaks.",
  "8":
    "Course 8 made you the variable. Course 9 takes a hard look at the tools that quietly ruin you.",
  "9":
    "Course 9 audited the tools. Course 10 audits the comp plan — and what the math actually says about your year.",
  "10":
    "Course 10 was the financial math. Course 11 is the off-the-clock math — selling sober, conferences, professional presence.",
  "11":
    "Course 11 was about who you are at the conference. Course 12 is about who you are on the other 350 days.",
};

/**
 * Returns the bridge sentence shown after completing `lessonId`,
 * pointing the reader at the next module. Returns null for module 12
 * (no next module) and for any lessonId outside 1-11.
 */
export function bridgeAfter(lessonId: string): string | null {
  return BRIDGE_TO_NEXT[lessonId] ?? null;
}
