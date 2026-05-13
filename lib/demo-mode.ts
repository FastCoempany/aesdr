/**
 * Demo-mode feature flag for Browserbase / Arcade / manual recording sessions.
 *
 * When enabled, the entire app renders a synthetic "demo user" view without
 * touching Supabase, Stripe, or analytics. Lets us record clean walkthroughs
 * of every gated surface — landing, dashboard, lessons, reveal — without
 * having to log in, complete coursework, or run real checkout.
 *
 * This module is split into two:
 *   - lib/demo-mode.ts (this file)       — pure constants + the
 *                                           non-async helpers. Safe to
 *                                           import from middleware.
 *   - lib/demo-mode-server.ts            — async `readDemoSession()`
 *                                           that uses next/headers cookies().
 *                                           Server Components only.
 *
 * Kill switches (ordered, first match wins):
 *   1. VERCEL_ENV === "production" AND VERCEL_GIT_COMMIT_REF === "main"
 *      → demo mode HARD DISABLED on production main. Cookie has no effect.
 *   2. DEMO_MODE_KILL === "1" → manual kill switch on any environment.
 *
 * Activation:
 *   - Visit any URL with `?demo=741407`.
 *   - Proxy detects, sets `aesdr_demo=1` cookie (4-hour TTL), strips the
 *     param, redirects back to the same path.
 *
 * Cookie name: `aesdr_demo`. Value: `1`. TTL: 4 hours.
 */

export const DEMO_COOKIE = "aesdr_demo";
export const DEMO_ACTIVATION_CODE = "741407";
export const DEMO_COOKIE_TTL_SECONDS = 60 * 60 * 4; // 4 hours

/**
 * Mock demo session — mid-course state. Lessons 1-6 complete, lesson 7 in
 * progress (1 of 3 units done), 8-12 visible but locked-on-progress in the
 * "what's next" sense (we don't actually lock anything in demo mode).
 *
 * Role: SDR (since SDR-flavored content is the broader audience).
 */
export type DemoSession = {
  isDemo: true;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: "sdr" | "ae";
  };
  /** Lesson IDs (as strings "1".."12") in completed state. */
  lessonsCompleted: string[];
  /** Lesson ID currently in progress. */
  currentLessonId: string;
  /** Units completed within the current lesson (out of 3). */
  currentLessonUnitsCompleted: number;
  /** Has the user unlocked the reveal artifact already? */
  revealUnlocked: boolean;
};

export const MOCK_DEMO_SESSION: DemoSession = {
  isDemo: true,
  user: {
    id: "demo-user-00000000",
    email: "demo@aesdr.com",
    full_name: "Alex Rivera",
    role: "sdr",
  },
  lessonsCompleted: ["1", "2", "3", "4", "5", "6"],
  currentLessonId: "7",
  currentLessonUnitsCompleted: 1,
  revealUnlocked: false,
};

/** Is demo mode allowed in the current environment? */
export function isDemoModeAllowed(): boolean {
  if (process.env.DEMO_MODE_KILL === "1") return false;
  const env = process.env.VERCEL_ENV;
  const branch = process.env.VERCEL_GIT_COMMIT_REF;
  // Production main → demo mode disabled.
  if (env === "production" && branch === "main") return false;
  return true;
}

/**
 * Check a cookie value directly (for use in middleware where we already
 * have the cookie value in hand and can't use `cookies()` from next/headers).
 */
export function isDemoCookieSet(cookieValue: string | undefined): boolean {
  if (!isDemoModeAllowed()) return false;
  return cookieValue === "1";
}
