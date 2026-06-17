import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Live status for one "Run brief" research call. The background job stamps its
 * phase + counts here; the candidate room polls it. Every write is best-effort —
 * if the dossier_runs table isn't there yet (pre-migration), these no-op and the
 * button falls back to a timed "running… → done".
 */

export type DossierRunStatus = "running" | "done" | "failed";

export type DossierRun = {
  id: string;
  pipeline_id: string;
  status: DossierRunStatus;
  phase: string | null;
  searches: number;
  pages_read: number;
  verdict: string | null;
  log: string[];
  error: string | null;
  created_at: string;
  updated_at: string;
  finished_at: string | null;
};

/** Open a run row; returns its id, or null if the table isn't there yet. */
export async function createDossierRun(
  pipelineId: string,
  triggeredBy: string,
): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossier_runs")
      .insert({ pipeline_id: pipelineId, status: "running", phase: "Starting…", triggered_by: triggeredBy })
      .select("id")
      .single();
    if (error) return null;
    return (data?.id as string) ?? null;
  } catch {
    return null;
  }
}

/** Stamp live progress. Best-effort. */
export async function updateDossierRun(
  id: string | null,
  patch: { phase?: string; searches?: number; pages_read?: number },
): Promise<void> {
  if (!id) return;
  try {
    const supabase = createAdminClient();
    await supabase
      .from("dossier_runs")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
  } catch {
    /* best-effort */
  }
}

/** Close the run with its terminal status + the verdict / reason. Best-effort. */
export async function finishDossierRun(
  id: string | null,
  result: {
    status: DossierRunStatus;
    phase?: string;
    verdict?: string;
    error?: string;
    log?: string[];
  },
): Promise<void> {
  if (!id) return;
  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    await supabase
      .from("dossier_runs")
      .update({
        status: result.status,
        phase: result.phase ?? null,
        verdict: result.verdict ?? null,
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

/** Read one run for the room's poll. Null if missing / pre-migration. */
export async function getDossierRun(id: string): Promise<DossierRun | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossier_runs")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return data as DossierRun;
  } catch {
    return null;
  }
}
