/**
 * HMAC-signed invite gate for the affiliate EXPERIENCE (/x/welcome → /x/landing
 * → /x/kit).
 *
 * The experience is not an open URL. Access is granted only by /x/access, which
 * validates a prospect slug (or an ops session / the founder preview key) and
 * then issues an HMAC-signed, expiring token as the `aesdr_x` cookie. proxy.ts
 * (edge) and the welcome page (node) verify that token on every request.
 *
 * Because the signing secret (EXPERIENCE_GATE_SECRET) never leaves the server, a
 * token can't be forged or tampered with — the value carries `subject|expiry`
 * plus a signature over them, and any edit breaks the signature. (A genuine,
 * unexpired token can still be replayed verbatim if copied — HMAC stops
 * manufacture, not sharing; bind to session/IP or shorten the window to stop
 * replay.)
 *
 * All crypto uses the Web Crypto API (`crypto.subtle`), which exists in BOTH the
 * edge middleware and the node route handler / server component, so there's a
 * single implementation and NO Node-only imports — this file stays edge-safe.
 *
 * Fail-closed: with no EXPERIENCE_GATE_SECRET set, signing returns null and
 * verification fails, so nothing is granted and the kit walls everyone (like the
 * /x/ops "Not configured" gate). Set the secret to arm it.
 */
export const EXPERIENCE_COOKIE = "aesdr_x";
export const EXPERIENCE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days — matches the attribution window

function toB64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// A fresh ArrayBuffer-backed view of the UTF-8 bytes. TS 5.7 distinguishes
// Uint8Array<ArrayBuffer> from Uint8Array<ArrayBufferLike>, and SubtleCrypto's
// BufferSource params reject the latter — wrapping in new Uint8Array() pins it.
function enc(s: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new TextEncoder().encode(s));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/**
 * Issue a signed token for `subject` (the prospect slug, or "ops" / "preview"
 * for founder grants). Returns null when no secret is configured — the caller
 * treats that as "cannot grant" (fail-closed).
 */
export async function signExperienceToken(
  subject: string,
): Promise<string | null> {
  const secret = process.env.EXPERIENCE_GATE_SECRET;
  if (!secret) return null;
  const exp = Date.now() + EXPERIENCE_MAX_AGE * 1000;
  const payload = toB64url(enc(`${subject}|${exp}`));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc(payload));
  return `${payload}.${toB64url(new Uint8Array(sig))}`;
}

/**
 * Verify a token's signature + expiry. Returns the subject on success, else null
 * (bad signature, tampered, expired, malformed, or no secret configured).
 */
export async function verifyExperienceToken(
  token: string | undefined | null,
): Promise<string | null> {
  const secret = process.env.EXPERIENCE_GATE_SECRET;
  if (!secret || !token) return null;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);

  let valid: boolean;
  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret),
      fromB64url(sigB64),
      enc(payload),
    );
  } catch {
    return null;
  }
  if (!valid) return null;

  let decoded: string;
  try {
    decoded = new TextDecoder().decode(fromB64url(payload));
  } catch {
    return null;
  }
  const sep = decoded.lastIndexOf("|");
  if (sep <= 0) return null;
  const subject = decoded.slice(0, sep);
  const exp = Number(decoded.slice(sep + 1));
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  return subject || null;
}
