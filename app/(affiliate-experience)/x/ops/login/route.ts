/**
 * POST /x/ops/login — exchange the shared password for the ops cookie.
 * Route handlers ignore layouts, so this is reachable even while the gate
 * is showing.
 */
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { opsPassword, opsCookieValue, OPS_COOKIE } from "../../../_lib/ops-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const pw = String(form.get("password") || "");
  const expected = opsPassword();
  const origin = new URL(req.url).origin;

  // AUDIT (R3-AF-11): constant-time compare so the password can't be
  // recovered byte-by-byte via response timing. Mirrors isOpsAuthed() in
  // _lib/ops-auth.ts. timingSafeEqual requires equal-length buffers, so
  // gate on length first (a length difference is not itself secret).
  const a = Buffer.from(pw);
  const b = Buffer.from(expected || "");
  const passwordOk =
    !!expected && a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!passwordOk) {
    return NextResponse.redirect(`${origin}/x/ops?e=1`, { status: 303 });
  }

  const jar = await cookies();
  jar.set(OPS_COOKIE, opsCookieValue(expected), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/x",
    maxAge: 60 * 60 * 12, // 12h
  });
  return NextResponse.redirect(`${origin}/x/ops`, { status: 303 });
}
