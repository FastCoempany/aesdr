import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Live status for one rebuilt sweep. The background research job stamps its
 * phase + counts here as it works; the button polls it. Every write is
 * best-effort — if the scout_sweep_runs table isn't there yet (pre-migration),
 * these no-op and the button falls back to a dumb "running… → done".
 */

export type SweepRunStatus = "running" | "done" | "empty" | "failed";

export type SweepRun = {
  id: string;
  sweep: string;
  status: SweepRunStatus;
  phase: string | null;
  searches: number;
  pages_read: number;
  candidates_found: number;
  seen: number;
  log: string[];
  error: string | null;
  created_at: string;
  updated_at: string;
  finished_at: string | null;
};

/** Open a run row; returns its id, or null if the table isn't there yet. */
export async function createSweepRun(
  sweep: string,
  triggeredBy: string,
): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("scout_sweep_runs")
      .insert({ sweep, status: "running", phase: "Starting…", triggered_by: triggeredBy })
      .select("id")
      .single();
    if (error) return null;
    return (data?.id as string) ?? null;
  } catch {
    return null;
  }
}

/** Stamp live progress (phase + observed tool counts). Best-effort. */
export async function updateSweepRun(
  id: string | null,
  patch: { phase?: string; searches?: number; pages_read?: number; seen?: number },
): Promise<void> {
  if (!id) return;
  try {
    const supabase = createAdminClient();
    await supabase
      .from("scout_sweep_runs")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
  } catch {
    /* best-effort */
  }
}

/** Close the run with its terminal status + final counts. Best-effort. */
export async function finishSweepRun(
  id: string | null,
  result: {
    status: SweepRunStatus;
    candidates_found?: number;
    seen?: number;
    phase?: string;
    error?: string;
    log?: string[];
  },
): Promise<void> {
  if (!id) return;
  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    await supabase
      .from("scout_sweep_runs")
      .update({
        status: result.status,
        candidates_found: result.candidates_found ?? 0,
        seen: result.seen ?? 0,
        phase: result.phase ?? null,
        error: result.error ?? null,
        ...(result.log ? { log: result.log } : {}),
        updated_at: now,
        finished_at: now,
      })
      .eq("id", id);
  } catch {
    /* best-effort */
  }
}

/** Read one run for the button's poll. Null if missing / pre-migration. */
export async function getSweepRun(id: string): Promise<SweepRun | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("scout_sweep_runs")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return data as SweepRun;
  } catch {
    return null;
  }
}
