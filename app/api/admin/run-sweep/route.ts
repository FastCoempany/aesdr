export const dynamic = "force-dynamic";
// The agentic research loop (search + fetch, many steps) runs in after(); this
// is the ceiling on that background work. The POST itself returns in <1s.
export const maxDuration = 300;

import { NextResponse, after } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { runSweepAndInsert, isValidSweep } from "@/lib/partnerships/sweep";
import { createSweepRun, getSweepRun } from "@/lib/partnerships/sweep-run";

/**
 * Sweep trigger + status.
 *
 *   POST /api/admin/run-sweep?sweep=…   → opens a run row, kicks the research
 *                                          off in the background, returns { runId }
 *   GET  /api/admin/run-sweep?runId=…   → that run's live status (button polls)
 *
 * The research is a ~4-minute loop, so we never make the request wait for it:
 * after() rides waitUntil to keep the function alive while it works, and the
 * run row carries the live phase + counts the button shows.
 */
export async function POST(request: Request) {
  const user = await requireAdmin();

  const sweep = new URL(request.url).searchParams.get("sweep") || "";
  if (!isValidSweep(sweep)) {
    return NextResponse.json({ ok: false, error: "Unknown sweep." }, { status: 400 });
  }

  const actor = user.email ?? "admin";
  const runId = await createSweepRun(sweep, actor);

  after(async () => {
    // runSweepAndInsert closes the run row itself (done/empty/failed); this
    // catch is a backstop so a thrown error never leaves it stuck on "running".
    try {
      await runSweepAndInsert(sweep, actor, runId);
    } catch (e) {
      console.error(`[run-sweep] ${sweep} crashed:`, e instanceof Error ? e.message : String(e));
    }
  });

  return NextResponse.json({ ok: true, runId, started: true });
}

export async function GET(request: Request) {
  await requireAdmin();
  const runId = new URL(request.url).searchParams.get("runId") || "";
  if (!runId) {
    return NextResponse.json({ ok: false, error: "Missing runId." }, { status: 400 });
  }
  const run = await getSweepRun(runId);
  if (!run) {
    // Pre-migration or unknown id — tell the button to stop polling gracefully.
    return NextResponse.json({ ok: true, run: null });
  }
  return NextResponse.json({ ok: true, run });
}
