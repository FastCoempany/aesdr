export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/cron-auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendTowerDigest } from "@/lib/partner-alerts";

/**
 * Almanac — the daily standup. Runs once at 11:00 UTC (≈07:00 ET). Counts the
 * things waiting on a gesture in the tower, mails the digest, and points the
 * operator at /tower (the digest never lists the items themselves — the cockpit
 * does, and that's where the buttons are).
 */
export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  const supabase = createAdminClient();

  const [bright, drafts, workshopsDue] = await Promise.all([
    supabase
      .from("partner_signals")
      .select("id", { count: "exact", head: true })
      .eq("severity", "bright")
      .is("handled_at", null),
    supabase
      .from("partner_outbound_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "ready"),
    supabase
      .from("partner_workshop")
      .select("id", { count: "exact", head: true })
      .in("status", ["scheduled", "reminded"])
      .lte(
        "scheduled_at",
        new Date(Date.now() + 48 * 3600000).toISOString(),
      ),
  ]);

  const counts = {
    brightSignals: bright.count ?? 0,
    draftsAwaiting: drafts.count ?? 0,
    workshopsDue: workshopsDue.count ?? 0,
    // Payouts UI not built yet — reserved for the ledger wiring step.
    payoutsReady: 0,
  };

  const sent = await sendTowerDigest(counts);

  return NextResponse.json({ ...counts, digestSent: sent });
}
