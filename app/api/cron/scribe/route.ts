export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/cron-auth";
import { isAgentEnabled } from "@/lib/partnerships/agent-switch";
import { createAdminClient } from "@/utils/supabase/admin";
import { canonCheck } from "@/lib/partnerships/canon-mechanical";
import { logPartnerEvent } from "@/lib/partnerships/events";
import {
  renderFirstTouch,
  extractEmail,
  firstTouchIdemKey,
} from "@/lib/partnerships/outreach-templates";

/**
 * Scribe drafter — the deterministic drafting arm. Runs every 15 min and turns
 * enriched pipeline candidates into ready-to-approve drafts in the tower, so
 * the Decisions lane fills itself.
 *
 * Pipeline (all deterministic, no LLM in the loop):
 *   1. Find partner_pipeline rows at status='enriched', motion='affiliate',
 *      voice_fit >= MIN_FIT, that don't already have a first-touch draft.
 *   2. Render a first-touch from the canon template matching their surface,
 *      filling the bespoke top from the fields we have (name, community/show,
 *      the Dossier why-fit).
 *   3. Run the mechanical warden pass (canon-mechanical). A draft with a banned
 *      term OR an unfilled bespoke placeholder is warden_cleared=false and
 *      carries a personalization_note — the operator finishes it in the tower's
 *      inline editor before approving.
 *   4. Write a partner_outbound_queue row at status='ready', tier='cold'.
 *      send_channel='email' when the contact_path has an address courier can
 *      send to; 'manual' otherwise (a DM handle / a form — the operator sends
 *      it by hand and marks it sent).
 *
 * The judgment-heavy scribe/warden subagents stay chat-invoked for bespoke
 * copy and the coach_complement/open_recruit/co_marketing motions; this arm
 * handles the clean affiliate first-touch at volume. The human still approves
 * every send — that gate never moves.
 *
 * Idempotent: idempotency_key = draft:<pipelineId>:first-touch, so a held or
 * already-drafted candidate is never re-drafted (the unique index backstops it).
 */

const BATCH = 10;
const MIN_FIT = Number(process.env.SCRIBE_MIN_VOICE_FIT || 4);

// Draft key lives in outreach-templates (shared with the room's Draft-now
// action) so the two paths can never double-draft the same candidate.
const idemKey = firstTouchIdemKey;

export async function GET(request: Request) {
  const authErr = verifyCronAuth(request);
  if (authErr) return authErr;

  // Master switch — OFF by default. Nothing runs until enabled in the tower.
  if (!(await isAgentEnabled("scribe"))) {
    return NextResponse.json({ disabled: true });
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  // Candidates worth a first-touch.
  const { data: candidates, error: candErr } = await supabase
    .from("partner_pipeline")
    .select("id, name, surface, handle, contact_path, why_fit, voice_fit")
    .eq("status", "enriched")
    .eq("motion", "affiliate")
    .gte("voice_fit", MIN_FIT)
    .order("voice_fit", { ascending: false })
    .limit(BATCH * 3);

  if (candErr) {
    return NextResponse.json({ error: candErr.message }, { status: 500 });
  }
  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ examined: 0, drafted: 0, skipped: 0 });
  }

  // Which of these already have a draft? Dedupe on the deterministic key.
  const keys = candidates.map((c) => idemKey(c.id));
  const { data: existing } = await supabase
    .from("partner_outbound_queue")
    .select("idempotency_key")
    .in("idempotency_key", keys);
  const drafted = new Set((existing ?? []).map((e) => e.idempotency_key));

  let made = 0;
  let skipped = 0;

  for (const c of candidates) {
    if (made >= BATCH) break;
    const key = idemKey(c.id);
    if (drafted.has(key)) {
      skipped++;
      continue;
    }

    const rendered = renderFirstTouch(c);
    const { clean, hits } = canonCheck(`${rendered.subject}\n${rendered.body}`);

    const email = extractEmail(c.contact_path);
    const sendChannel = email ? "email" : "manual";
    const toAddr = email || c.contact_path || c.handle || "(no contact path)";

    // warden_cleared only when the canon gate passes AND nothing bespoke is
    // still a placeholder.
    const wardenCleared = clean && rendered.unfilled.length === 0;
    const noteParts: string[] = [];
    if (rendered.unfilled.length > 0) {
      noteParts.push(`Fill before sending: ${rendered.unfilled.join(", ")}`);
    }
    if (!clean) {
      noteParts.push(
        `Canon flags: ${hits.map((h) => `"${h.term}" (${h.hint})`).join("; ")}`,
      );
    }
    const personalizationNote = noteParts.join(" · ") || null;

    const { error: insErr } = await supabase
      .from("partner_outbound_queue")
      .insert({
        to_addr: toAddr,
        subject: rendered.subject,
        body: rendered.body,
        tier: "cold",
        status: "ready",
        warden_cleared: wardenCleared,
        send_after: nowIso,
        idempotency_key: key,
        related_pipeline_id: c.id,
        drafted_by: `scribe-cron:${rendered.templateId}`,
        draft_source: `scribe-cron:${rendered.templateId}`,
        send_channel: sendChannel,
        personalization_note: personalizationNote,
      });

    if (!insErr) {
      made++;
      await logPartnerEvent({
        pipelineId: c.id as string,
        actor: "scribe",
        kind: "drafted",
        detail: { template: rendered.templateId, warden_cleared: wardenCleared },
      });
    }
  }

  return NextResponse.json({
    examined: candidates.length,
    drafted: made,
    skipped,
  });
}
