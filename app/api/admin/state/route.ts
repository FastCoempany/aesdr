export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { extractAllDomains } from "@/lib/partnerships/email-finder";

/**
 * TEMPORARY read-only state dump — admin only. One paste gives the assistant the
 * whole picture: every agent lever's on/off + model, and every affiliate
 * candidate's email-find state. No writes, no credits spent. Hit:
 *
 *   /api/admin/state
 *
 * Delete alongside the other debug routes once the pipeline is settled.
 */

export async function GET() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: switches } = await supabase
    .from("agent_switches")
    .select("agent, enabled, model");

  const { data: rows } = await supabase
    .from("partner_pipeline")
    .select("id, name, status, found_email, found_email_status, email_checked_at, contact_path, handle, why_fit, dossier_brief")
    .eq("motion", "affiliate")
    .order("status", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(80);

  const candidates = (rows ?? []).map((r) => {
    const own = (r.dossier_brief as { own_domain?: string } | null)?.own_domain ?? null;
    const domains = extractAllDomains(r.contact_path as string | null, r.handle as string | null, r.why_fit as string | null);
    return {
      name: r.name,
      status: r.status,
      found_email: r.found_email ?? null,
      status_label: r.found_email_status ?? null,
      checked: Boolean(r.email_checked_at),
      own_domain: own,
      record_domains: domains,
      contact_path: typeof r.contact_path === "string" ? r.contact_path.slice(0, 100) : null,
    };
  });

  const byStatus: Record<string, number> = {};
  for (const c of candidates) byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;

  return NextResponse.json(
    {
      note: "Read-only state dump. Paste this whole payload back.",
      levers: switches ?? "agent_switches unreadable (migration not applied?)",
      counts_by_status: byStatus,
      with_email: candidates.filter((c) => c.found_email).length,
      candidates,
    },
    { status: 200 },
  );
}
