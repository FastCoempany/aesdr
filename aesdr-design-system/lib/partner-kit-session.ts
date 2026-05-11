/**
 * Server-side helper to read + verify the kit session cookie.
 * Returns the resolved token row or null. Logs nothing — callers decide
 * what to log based on the page they're rendering.
 */

import { cookies } from "next/headers";
import {
  KIT_COOKIE_NAME,
  verifyToken,
  resolveToken,
  type ResolvedToken,
} from "./partner-kit-tokens";

export async function readKitSession(): Promise<ResolvedToken | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(KIT_COOKIE_NAME)?.value;
  if (!token) return null;

  const verified = verifyToken(token);
  if (!verified.ok) return null;

  return resolveToken(verified.tid);
}
