export const dynamic = "force-dynamic";
// One scout sweep: a live-web research call (graceful-stops at ~150s) plus the
// de-dupe/insert. Runs on a route handler with a generous ceiling so the long
// call can never be killed mid-flight the way a blocking Server Action could —
// that platform kill is what surfaced to the client as the turtle page.
export const maxDuration = 300;

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { runSweepAndInsert, isValidSweep } from "@/lib/partnerships/sweep";

/**
 * The sweep trigger. The tower's Sweep buttons POST here (a client fetch), wait
 * for the JSON, and refresh — instead of submitting a Server Action whose POST
 * the platform can hard-kill into an unparseable "unexpected response" error.
 *
 *   POST /api/admin/run-sweep?sweep=communities|newsletters_podcasts|practitioners
 *
 * Always returns JSON: { ok: true, inserted, seen } or { ok: false, error }.
 */
export async function POST(request: Request) {
  const user = await requireAdmin();

  const sweep = new URL(request.url).searchParams.get("sweep") || "";
  if (!isValidSweep(sweep)) {
    return NextResponse.json({ ok: false, error: "Unknown sweep." }, { status: 400 });
  }

  try {
    const { inserted, seen } = await runSweepAndInsert(sweep, user.email ?? "admin");
    return NextResponse.json({ ok: true, inserted, seen });
  } catch (e) {
    // App-level failure (API refusal, empty research, constraint) — hand back a
    // real message with 200 so the client always parses cleanly and shows it
    // inline. Never a thrown 500 that the fetch can't read.
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 200 },
    );
  }
}
