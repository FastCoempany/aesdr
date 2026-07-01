/**
 * Invite gate for the affiliate EXPERIENCE (/x/welcome → /x/landing → /x/kit).
 *
 * The experience is not an open URL. A visitor only gets in by arriving on a
 * per-prospect link minted in /x/ops (`/x/access?p=<slug>`), which validates the
 * slug against the roster and drops this cookie. The bare domain and any
 * un-invited deep link hit the "private preview" wall instead.
 *
 * These are PLAIN constants with no imports so the file is safe to pull into the
 * edge middleware (proxy.ts) as well as the /x/access route handler and the
 * /x/welcome server component. The three must agree on the cookie name + value.
 *
 * Scope note: this is distribution control for marketing content, not hardened
 * auth. `EXPERIENCE_GRANT` is an opaque presence marker (it rides in the cookie,
 * so it isn't a secret); its only job is to be un-guessable at a glance so a
 * bare `aesdr_x=1` doesn't waltz in. Grant is only ever set by /x/access after
 * it validates the slug (or an ops session / the founder preview key). Harden to
 * an HMAC-signed token if the threat model ever needs it.
 */
export const EXPERIENCE_COOKIE = "aesdr_x";
export const EXPERIENCE_GRANT = "inv-kx7f2a9v3q";
export const EXPERIENCE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days — matches the attribution window
