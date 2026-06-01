import "server-only";

/**
 * Password gate for the affiliate-experience admin (/x/ops). Deliberately
 * decoupled from production's Supabase admin auth (lib/admin.ts): this
 * environment has no login. Access = knowing the shared secret in the
 * AFFILIATE_OPS_PASSWORD env var. On success we set an httpOnly cookie whose
 * value is a hash of the secret, so the raw password never round-trips again.
 */
import crypto from "node:crypto";
import { cookies } from "next/headers";

export const OPS_COOKIE = "aesdr_ops";

export function opsPassword(): string | null {
  return process.env.AFFILIATE_OPS_PASSWORD || null;
}

export function opsCookieValue(pw: string): string {
  return crypto.createHash("sha256").update(`aesdr-ops:${pw}`).digest("hex");
}

export async function isOpsAuthed(): Promise<boolean> {
  const pw = opsPassword();
  if (!pw) return false;
  const jar = await cookies();
  const c = jar.get(OPS_COOKIE)?.value;
  if (!c) return false;
  const expected = opsCookieValue(pw);
  const a = Buffer.from(c);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
