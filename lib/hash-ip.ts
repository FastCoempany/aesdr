import crypto from "node:crypto";

/**
 * Single source of truth for IP pseudonymization (R5-PI-8).
 *
 * Every call site that stores an `ip_hash` (req-meta, free-lead capture,
 * affiliate apply, enterprise contact, affiliate click attribution) MUST go
 * through here so the algorithm and salt are identical everywhere — otherwise
 * the same visitor hashes to different values across tables and de-dup breaks.
 *
 * HMAC-SHA-256 keyed on a REQUIRED `IP_HASH_SALT`. There is deliberately NO
 * committed default: a predictable salt makes the (small) IP space trivially
 * brute-forceable, defeating the whole point of pseudonymizing. If the salt is
 * unset we return null and store nothing rather than persist a guessable hash.
 *
 * Output is 32 hex chars (128 bits) — ample collision resistance for de-dup.
 */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT;
  if (!salt) return null;
  return crypto.createHmac("sha256", salt).update(ip).digest("hex").slice(0, 32);
}
