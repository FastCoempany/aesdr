import { cookies } from "next/headers";

import {
  DEMO_COOKIE,
  MOCK_DEMO_SESSION,
  type DemoSession,
  isDemoModeAllowed,
} from "./demo-mode";

/**
 * Read the demo session from cookies if active and allowed.
 *
 * SERVER COMPONENTS ONLY — uses `next/headers`. Middleware should use
 * `isDemoCookieSet()` from `./demo-mode` with the cookie value pulled
 * directly off the NextRequest.
 *
 * Returns null if not in demo mode for any reason.
 */
export async function readDemoSession(): Promise<DemoSession | null> {
  if (!isDemoModeAllowed()) return null;
  const cookieStore = await cookies();
  const c = cookieStore.get(DEMO_COOKIE);
  if (!c || c.value !== "1") return null;
  return MOCK_DEMO_SESSION;
}
