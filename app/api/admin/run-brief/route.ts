export const dynamic = "force-dynamic";
// The two-phase research runs in after(); this is the ceiling on that work.
// The POST returns in <1s.
export const maxDuration = 200;

import { NextResponse, after } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { runBriefAndSave } from "@/lib/partnerships/brief";
import { createDossierRun, getDossierRun } from "@/lib/partnerships/dossier-run";

/**
 * "Run brief" trigger + status.
 *
 *   POST /api/admin/run-brief?id=<pipelineId>  → opens a run row, kicks the
 *                                                research off in the background,
 *                                                returns { runId }
 *   GET  /api/admin/run-brief?runId=<id>       → that run's live status (poll)
 *
 * The brief is a ~2-minute research call, so we never make the request wait:
 * after() rides waitUntil to keep the function alive while it works, and the
 * run row carries the live phase + the "why?" reason the room shows.
 */
export async function POST(request: Request) {
  const user = await requireAdmin();

  const id = new URL(request.url).searchParams.get("id") || "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing candidate id." }, { status: 400 });
  }

  const actor = user.email ?? "admin";
  const runId = await createDossierRun(id, actor);

  after(async () => {
    try {
      await runBriefAndSave(id, actor, runId);
    } catch (e) {
      console.error(`[run-brief] ${id} crashed:`, e instanceof Error ? e.message : String(e));
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
  const run = await getDossierRun(runId);
  return NextResponse.json({ ok: true, run: run ?? null });
}
