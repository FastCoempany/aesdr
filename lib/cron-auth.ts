import crypto from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Validate cron request authorization.
 * Returns a 401 response if invalid, or null if authorized.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyCronAuth(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron] CRON_SECRET environment variable is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${secret}`;

  // R3-AG-2: compare on byte length, not string length. timingSafeEqual
  // throws (→ unhandled 500) when the two Buffers differ in length, and a
  // multi-byte secret means `String.length` (UTF-16 code units) can disagree
  // with the actual byte length. A wrong-length header must be a clean 401.
  const authBuf = Buffer.from(authHeader ?? "");
  const expectedBuf = Buffer.from(expected);
  if (
    !authHeader ||
    Buffer.byteLength(authHeader) !== Buffer.byteLength(expected) ||
    !crypto.timingSafeEqual(authBuf, expectedBuf)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
