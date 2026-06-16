export const dynamic = "force-dynamic";
// The background research can run the full ~150s; maxDuration is the ceiling on
// the after() work (waitUntil keeps the invocation alive up to here), NOT on the
// request, which returns in well under a second.
export const maxDuration = 300;

import { NextResponse, after } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { runSweepAndInsert, isValidSweep } from "@/lib/partnerships/sweep";

/**
 * The sweep trigger — fire-and-forget. A scout sweep is a ~150s live-web
 * research call, and the platform won't hold a client request open that long:
 * the connection drops around ~90–120s and the in-flight function is torn down
 * before it can write anything (whether it's a Server Action — the turtle — or
 * a route handler awaiting inline — "didn't complete").
 *
 * So we don't make the request wait. We schedule the research with after(),
 * which on Vercel rides waitUntil to keep the invocation alive up to maxDuration
 * AFTER the response is sent, and return immediately. The candidates land in the
 * pipeline when the background work finishes (~1–2 min); the tower reveals them
 * on its next refresh.
 *
 *   POST /api/admin/run-sweep?sweep=communities|newsletters_podcasts|practitioners
 *   → { ok: true, started: true }   (instant)
 */
export async function POST(request: Request) {
  const user = await requireAdmin();

  const sweep = new URL(request.url).searchParams.get("sweep") || "";
  if (!isValidSweep(sweep)) {
    return NextResponse.json({ ok: false, error: "Unknown sweep." }, { status: 400 });
  }

  // Read the actor now (request scope), then hand the long work to after().
  const actor = user.email ?? "admin";
  after(async () => {
    try {
      await runSweepAndInsert(sweep, actor);
    } catch (e) {
      // Surfaces in the function logs; the operator sees "no new candidates"
      // and re-runs. (A status row could make this visible in-UI later.)
      console.error(
        `[run-sweep] ${sweep} failed:`,
        e instanceof Error ? e.message : String(e),
      );
    }
  });

  return NextResponse.json({ ok: true, started: true });
}
