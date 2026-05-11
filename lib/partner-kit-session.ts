/**
 * Server-side helper to read + verify the kit session cookie.
 * Returns the resolved token row or null. Logs nothing — callers decide
 * what to log based on the page they're rendering.
 *
 * Admins (ADMIN_EMAILS) bypass the token requirement entirely. When a
 * signed-in admin hits a gated kit route, readKitSession returns a
 * synthetic session marked `isAdmin: true` so the page renders. Callers
 * should skip access-logging when `session.isAdmin === true` to keep the
 * audit log free of founder browsing noise.
 */

import { cookies } from "next/headers";
import {
  KIT_COOKIE_NAME,
  verifyToken,
  resolveToken,
  type ResolvedToken,
} from "./partner-kit-tokens";
import { getAdminContext } from "./admin";

export type KitSession = ResolvedToken & { isAdmin?: boolean };

export async function readKitSession(): Promise<KitSession | null> {
  // Admin bypass — short-circuits the entire token system.
  const { isAdmin, user } = await getAdminContext();
  if (isAdmin) {
    return {
      tid: "__admin__",
      partner_slug: "__admin__",
      partner_label: user?.email ? `Admin (${user.email})` : "Admin",
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      revoked_at: null,
      isAdmin: true,
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(KIT_COOKIE_NAME)?.value;
  if (!token) return null;

  const verified = verifyToken(token);
  if (!verified.ok) return null;

  return resolveToken(verified.tid);
}
