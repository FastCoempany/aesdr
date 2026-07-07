import { createAdminClient } from "@/utils/supabase/admin";
import { logEvent } from "@/lib/events";

/**
 * The daily agent-spend ledger behind the tower's meter and the $10 wall.
 *
 * Founder decision 2026-07-07: the cost ceiling is $10 all around — per run
 * (enforced inside the research loops) AND per UTC day across all agents
 * (enforced here, at every trigger point). Spend rows live in the `events`
 * append log as `agent_spend`, written by the research engines' onCostUsd
 * hooks, so the meter needs no new table.
 */

export const DAILY_WALL_USD = 10;

export async function logAgentSpend(args: {
  agent: string;
  usd: number;
  pipelineId?: string | null;
}): Promise<void> {
  const usd = Math.round(args.usd * 100) / 100;
  if (!Number.isFinite(usd) || usd <= 0) return;
  await logEvent("agent_spend", {
    agent: args.agent,
    usd,
    pipeline_id: args.pipelineId ?? null,
  });
}

function utcMidnightIso(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
}

/** Sum of today's (UTC) agent spend. Throws only if the ledger can't be read. */
export async function getTodaySpendUsd(): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select("props")
    .eq("event_type", "agent_spend")
    .gte("occurred_at", utcMidnightIso())
    .limit(1000);
  if (error) {
    // 42P01 = relation does not exist — the ledger lives in the `events`
    // table (20260519_events.sql), which is hand-applied like every
    // migration here. Name the exact fix instead of a vague failure.
    if (error.code === "42P01") {
      throw new Error(
        "The events table is missing in this database — run supabase/migrations/20260519_events.sql in the Supabase SQL editor, then retry.",
      );
    }
    throw new Error(`spend ledger read failed: ${error.message}`);
  }
  let total = 0;
  for (const row of data ?? []) {
    const usd = (row.props as { usd?: unknown } | null)?.usd;
    if (typeof usd === "number" && Number.isFinite(usd)) total += usd;
  }
  return Math.round(total * 100) / 100;
}

/** BetterContact credits burned today (one per found email). Best-effort. */
export async function getTodayEmailCredits(): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("partner_events")
      .select("id", { count: "exact", head: true })
      .eq("kind", "email_found")
      .gte("at", utcMidnightIso())
      .not("detail->>email", "is", null);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * The wall itself. FAILS CLOSED: if the ledger can't be read we refuse to
 * spend, same posture as the email suppression gate. The per-run $10 cap
 * inside the research loop still bounds any single run that slips through.
 */
export async function assertUnderDailyWall(): Promise<void> {
  let spent: number;
  try {
    spent = await getTodaySpendUsd();
  } catch (e) {
    // Fail closed, but say WHY — a hidden cause turns a one-SQL fix into a
    // mystery. (First field sighting 2026-07-07: the events table itself was
    // never applied in prod.)
    const why = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Refusing to spend — the ledger couldn't be read (fail-closed). ${why.slice(0, 220)}`,
    );
  }
  if (spent >= DAILY_WALL_USD) {
    throw new Error(
      `The $${DAILY_WALL_USD} daily wall is hit ($${spent.toFixed(2)} spent today). It resets at midnight UTC.`,
    );
  }
}
