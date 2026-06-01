import "server-only";

/**
 * Opaque prospect codes. The code is what rides in the link as ?p=<code> — it
 * gives the prospect's identity away to no one. The real name lives only in the
 * affiliate_prospects.display_name column, visible on the /x/ops dashboard.
 *
 * Alphabet excludes vowels (no accidental words) and ambiguous glyphs
 * (0/o/1/l/i) so a code is safe to read aloud or retype if needed.
 */
import crypto from "node:crypto";

const ALPHABET = "bcdfghjkmnpqrstvwxyz23456789";

export function generateOpaqueCode(len = 8): string {
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}
