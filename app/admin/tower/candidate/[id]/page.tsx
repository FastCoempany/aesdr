export const dynamic = "force-dynamic";
// Run-brief-now runs a live web_search/web_fetch research loop from this page's
// action. On Vercel Pro the function ceiling is 300s, so we give research real
// room (the loop self-caps at RESEARCH_BUDGET_MS well under this).
export const maxDuration = 100;

import Link from "next/link";
import { notFound } from "next/navigation";

import { createAdminClient } from "@/utils/supabase/admin";
import type { DossierBrief } from "@/lib/partnerships/anthropic-agents";
import { inboxSearchUrl } from "@/lib/partnerships/inbox-link";
import { emailFinderConfigured } from "@/lib/partnerships/email-finder";
import { extractEmail } from "@/lib/partnerships/outreach-templates";
import ContactLinks from "../../ContactLinks";
import TowerButton from "../../TowerButton";
import RunBriefButton from "./RunBriefButton";
import twr from "../../tower.module.css";
import CeramicSendButton from "../../CeramicSendButton";
import {
  rejectSourced,
  reconsiderPassed,
  draftNow,
  findEmailNow,
  useFoundEmail,
  oneClickSend,
  attachEmail,
  holdDraft,
  releaseDraft,
  markManualSent,
  markReplied,
  resumeOutreach,
  editDraft,
} from "../../actions";

/**
 * The room — one page per candidate, the place every name links to. Their
 * brief rendered as a document, their drafts with live actions, their replies,
 * and the timeline of everything that happened, who did it, and when.
 *
 * Reads degrade gracefully: before the 20260612 migration, the structured
 * brief and the event log are absent — the room falls back to the why_fit
 * trail and a timeline synthesized from the tables that do exist.
 */

const INK = "#1A1A1A";
const CRIMSON = "#8B1A1A";
const MUTED = "#6B6B6B";
const LIGHT = "#E8E4DF";
const GREEN = "#2E7D32";
const AMBERISH = "#a14400";
const MONO = "'Space Mono', monospace";
const SERIF = "'Source Serif 4', Georgia, serif";

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type TimelineRow = { at: string; actor: string; label: string };

export default async function CandidateRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; err?: string; tried?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const supabase = createAdminClient();
  const { data: c } = await supabase
    .from("partner_pipeline")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!c) notFound();

  // dossier_brief can hold a finder result before any brief exists — only
  // treat it as a brief when the model's verdict is present.
  const briefRaw = (c.dossier_brief ?? null) as DossierBrief | null;
  const brief = briefRaw?.verdict ? briefRaw : null;
  const foundEmail = briefRaw?.found_email ?? null;
  const hasLegacyBrief = !brief && ((c.why_fit as string | null) ?? "").includes("[dossier]");
  const hasEmail = Boolean(extractEmail(c.contact_path as string | null));

  // Their drafts — every status, not just ready.
  const { data: draftRows } = await supabase
    .from("partner_outbound_queue")
    .select("*")
    .eq("related_pipeline_id", id)
    .order("created_at", { ascending: true });
  const drafts = draftRows ?? [];

  // Delivery stamps for their sent drafts (partner_sent_log, fed by the Resend
  // webhook). Selected defensively: pre-migration the columns don't exist and
  // the proof strip simply shows "delivery pending".
  const deliveryByQueue = new Map<string, { status: string | null; at: string | null }>();
  {
    const sentIds = drafts.filter((d) => d.status === "sent").map((d) => d.id as string);
    if (sentIds.length > 0) {
      const { data: logRows } = await supabase
        .from("partner_sent_log")
        .select("queue_id, delivery_status, delivered_at")
        .in("queue_id", sentIds);
      for (const l of logRows ?? []) {
        deliveryByQueue.set(l.queue_id as string, {
          status: (l.delivery_status as string | null) ?? null,
          at: (l.delivered_at as string | null) ?? null,
        });
      }
    }
  }

  // Their replies.
  const { data: replyRows } = await supabase
    .from("partner_inbound_email")
    .select("from_addr, subject, text_body, classification, received_at")
    .eq("matched_pipeline_id", id)
    .order("received_at", { ascending: true })
    .limit(20);
  const replies = replyRows ?? [];

  // The event log (post-migration), merged with rows synthesized from the
  // tables that always exist — so the timeline never renders empty-wrong.
  const timeline: TimelineRow[] = [];
  {
    const { data: events, error: evErr } = await supabase
      .from("partner_events")
      .select("at, actor, kind, detail")
      .eq("pipeline_id", id)
      .order("at", { ascending: true })
      .limit(200);
    if (!evErr) {
      const SHOWN = new Set(["promoted", "rejected", "reconsidered", "brief_written", "released", "draft_edited", "held", "email_found", "email_used"]);
      for (const e of events ?? []) {
        if (!SHOWN.has(e.kind as string)) continue;
        const d = (e.detail ?? {}) as Record<string, unknown>;
        const label =
          e.kind === "promoted" ? "accepted → research queue"
          : e.kind === "rejected" ? "passed → into the bin"
          : e.kind === "reconsidered" ? `reconsidered → back to ${String(d.to ?? "the pipeline")}`
          : e.kind === "brief_written" ? `research brief written (${String(d.verdict ?? "—")})`
          : e.kind === "email_found" ? (d.email ? `email found — ${String(d.email)} via ${String(d.domain ?? "?")} (${String(d.status ?? "?").toLowerCase()}${d.applied ? "" : ", not auto-used"})` : `email lookup — nothing across ${Array.isArray(d.tried) ? d.tried.length : "all"} domain(s)`)
          : e.kind === "email_used" ? `unverified email accepted — ${String(d.email)}`
          : e.kind === "released" ? "draft released back to ready"
          : e.kind === "held" ? "draft held"
          : "draft edited";
        timeline.push({ at: e.at as string, actor: e.actor as string, label });
      }
    }
  }
  timeline.push({
    at: c.created_at as string,
    actor: (c.source_agent as string | null) ?? "scout",
    label: "entered the pipeline",
  });
  for (const d of drafts) {
    timeline.push({
      at: d.created_at as string,
      actor: (d.drafted_by as string | null) ?? "scribe",
      label: `first-touch drafted — "${d.subject}"`,
    });
    if (d.approved_at) {
      timeline.push({ at: d.approved_at as string, actor: (d.approved_by as string | null) ?? "you", label: "draft approved for send" });
    }
    if (d.sent_at) {
      timeline.push({ at: d.sent_at as string, actor: d.send_channel === "manual" ? "you (by hand)" : "you (Send now)", label: `sent → ${d.to_addr}` });
    }
  }
  for (const r of replies) {
    timeline.push({ at: r.received_at as string, actor: "them", label: `replied — "${r.subject ?? "(no subject)"}"` });
  }
  if (c.first_touch_at && !drafts.some((d) => d.sent_at)) {
    timeline.push({ at: c.first_touch_at as string, actor: "you", label: "first touch sent" });
  }
  timeline.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  // What happens next — derived from stage + brief + drafts.
  const status = c.status as string;
  const vf = (c.voice_fit as number | null) ?? null;
  const hasReadyDraft = drafts.some((d) => d.status === "ready");
  const hasApprovedDraft = drafts.some((d) => d.status === "approved");
  let next = "";
  if (status === "sourced") {
    next = "Waiting on you — Accept or Reject below.";
  } else if (status === "enriched") {
    if (hasReadyDraft || hasApprovedDraft) next = "A draft is in the house — edit it if it needs your hand, then one press of the button sends it.";
    else if (!brief && !hasLegacyBrief)
      next = "Waiting on a research brief — press Run brief now.";
    else
      next = "Brief done — make the fit call above. The score is advisory; you decide who fits.";
  } else if (status === "contacted") {
    next = `First touch out ${timeAgo(c.first_touch_at as string | null)} — follow-up ladder is at step ${c.ladder_step ?? 0}. Replies land here.`;
  } else if (status === "replied") {
    next = "They wrote back — read the reply below; your move.";
  } else if (status === "activated") {
    next = "Live affiliate — their numbers are in /admin/affiliates.";
  } else if (status === "passed" || status === "cold") {
    next = "In the bin — kept exactly as researched, never deleted. Reconsider puts them back.";
  } else {
    next = (c.next_action as string | null) ?? "—";
  }

  // ── The letter's state (founder pick 2026-07-20: the room is
  //    correspondence — verdict as salutation, draft as the body, the ceramic
  //    seal, Leponeus franking the corner over a shimmering Chicago skyline).
  const verdict = brief?.verdict ?? null;
  const liveDraft = drafts.find((d) => d.status === "ready" || d.status === "approved") ?? null;
  const liveManual = liveDraft ? ((liveDraft.send_channel as string | null) ?? "email") === "manual" : false;
  const sentDrafts = drafts.filter((d) => d.status === "sent");
  const parkedDrafts = drafts.filter((d) => d.status === "held" || d.status === "failed");
  const lastSent = sentDrafts[sentDrafts.length - 1] ?? null;
  const inBin = status === "passed" || status === "cold";
  const stampHot = !inBin && verdict === "reach_out" && status === "enriched";

  let salutText = "Your call.";
  let salutColor: string = INK;
  let salutIris = false;
  if (inBin) salutText = "Binned.";
  else if (status === "activated") { salutText = "Live."; salutColor = GREEN; }
  else if (status === "replied") { salutText = "Talking."; salutColor = GREEN; }
  else if (status === "contacted") { salutText = "Waiting."; salutColor = MUTED; }
  else if (status === "enriched" && verdict === "reach_out") { salutText = "Reach out."; salutIris = true; }
  else if (status === "enriched" && verdict === "skip") salutText = "Skip.";

  const conflict = (brief?.conflict as string | null) ?? null;
  const emailChip = (c.found_email as string | null)
    ? { text: `✉ ${((c.found_email_status as string | null) ?? "found").replace(/_/g, " ")}`, cls: (c.found_email_status as string | null) === "deliverable" ? "g" : "warn" }
    : hasEmail
      ? { text: "✉ on file", cls: "g" }
      : { text: "no address — dm / form", cls: "" };

  const noticeMap: Record<string, string> = {
    brief: "Research brief written — it's in the fold below.",
    draft: "The letter is written — it's the body below, yours to edit; the seal sends it.",
    email: "Email attached — the seal now sends for real.",
    email_risky: "BetterContact found an address but flagged it catch-all — it's in the read below; use it only if you trust it.",
    email_none: "BetterContact ran the full waterfall and found nothing deliverable (no credit spent). Paste a different site, or take the manual path.",
  };

  return (
    <main style={{ padding: "8px 0 48px", maxWidth: "760px" }}>
      <p style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: MUTED, margin: "0 0 10px" }}>
        <Link href="/admin/tower" className={twr.lnk}>← the warren</Link>
        {"  ·  "}
        <Link href="/admin/tower/pipeline" className={twr.lnk}>the roster</Link>
      </p>

      {sp.err && <p className={`${twr.lnotice} ${twr.lnoticeErr}`}>that didn&apos;t work — {sp.err}</p>}
      {sp.ok && noticeMap[sp.ok] && <p className={twr.lnotice}>{noticeMap[sp.ok]}</p>}

      {/* ════ THE LETTER ════ */}
      <div className={twr.sheet}>
        {/* The stamp: Leponeus franks the mail. Awake over an iris-lit Chicago
            skyline on a reach-out; asleep over matte clay otherwise. */}
        <span className={`${twr.pstamp} ${stampHot ? twr.pstampHot : ""}`} aria-hidden>
          <span className={twr.pstampSky} />
          <img
            className={twr.pstampLep}
            src={stampHot ? "/mascot/leponeus-verdict-sm.png" : "/mascot/leponeus-rest-sm.png"}
            alt=""
          />
          <span className={twr.pstampCap}>aesdr post</span>
        </span>

        <div className={twr.sheetEyebrow}>
          <span>AESDR · the read</span>
          <span className={twr.sheetTo}>to: {c.name as string} · {status.replace(/_/g, " ")}</span>
        </div>

        {salutIris ? (
          <p className={`${twr.salut} ${twr.wordHotIris}`}>{salutText}</p>
        ) : (
          <p className={twr.salut} style={{ color: salutColor }}>{salutText}</p>
        )}

        <p style={{ fontFamily: MONO, fontSize: "11px", color: MUTED, margin: "0 0 10px" }}>
          {(c.surface as string | null) ?? "—"} · {(c.handle as string | null) ?? "no handle"} · {(c.archetype as string | null) ?? "—"} · aud est. {(c.audience_est as number | null)?.toLocaleString() ?? "unknown"}
        </p>

        <div className={twr.lchips}>
          <span className={`${twr.lchip} ${twr.lchipCall}`}>the call · {verdict ? verdict.replace(/_/g, " ") : status.replace(/_/g, " ")}</span>
          {conflict && (
            <span className={`${twr.lchip} ${conflict === "none" ? twr.lchipG : twr.lchipWarn}`}>conflict · {conflict}</span>
          )}
          <span className={twr.lchip}>voice-fit · {vf ?? "—"}/5</span>
          <span className={`${twr.lchip} ${emailChip.cls === "g" ? twr.lchipG : emailChip.cls === "warn" ? twr.lchipWarn : ""}`}>{emailChip.text}</span>
        </div>

        {conflict && conflict !== "none" && brief?.conflict_note && (
          <p style={{ fontFamily: SERIF, fontSize: "13px", lineHeight: 1.5, color: INK, margin: "0 0 12px", borderLeft: `2px solid ${CRIMSON}`, paddingLeft: "10px" }}>
            {brief.conflict_note}
          </p>
        )}

        {/* ── The body: the letter itself ── */}
        {liveDraft ? (
          <>
            <form action={editDraft}>
              <input type="hidden" name="id" value={liveDraft.id as string} />
              <input
                name="subject"
                defaultValue={liveDraft.subject as string}
                style={{ width: "100%", boxSizing: "border-box", fontFamily: SERIF, fontSize: "15px", fontWeight: 600, padding: "8px 10px", border: `1px solid ${LIGHT}`, color: INK, background: "#fff", marginBottom: "8px" }}
              />
              <textarea
                name="body"
                defaultValue={liveDraft.body as string}
                rows={10}
                style={{ width: "100%", boxSizing: "border-box", fontFamily: SERIF, fontSize: "14px", lineHeight: 1.65, padding: "10px 12px", border: `1px solid ${LIGHT}`, color: INK, background: "#fff", resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "6px", flexWrap: "wrap" }}>
                <TowerButton variant="ghost" pendingLabel="Saving…">Save &amp; re-check canon</TowerButton>
                <span style={{ fontFamily: MONO, fontSize: "10px", color: MUTED }}>
                  {liveDraft.warden_cleared ? "canon clean" : "canon flags — your edit clears them"} · to: {liveDraft.to_addr as string}
                </span>
              </div>
            </form>
            {liveDraft.personalization_note && (
              <p style={{ fontFamily: MONO, fontSize: "11px", lineHeight: 1.5, color: AMBERISH, background: "rgba(161,68,0,.06)", borderLeft: `2px solid ${AMBERISH}`, padding: "8px 10px", margin: "10px 0 0" }}>
                {liveDraft.personalization_note as string}
              </p>
            )}
          </>
        ) : lastSent ? (
          <div className={twr.lbody}>
            <p style={{ fontWeight: 600, margin: "0 0 6px" }}>{lastSent.subject as string}</p>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{lastSent.body as string}</p>
          </div>
        ) : inBin ? (
          <p className={twr.lbody} style={{ fontStyle: "italic", color: MUTED }}>
            Passed {timeAgo(c.updated_at as string | null)}. The bin never expires — everything here is kept exactly as researched.
          </p>
        ) : status === "sourced" ? (
          <p className={twr.lbody} style={{ fontStyle: "italic" }}>
            {((c.why_fit as string | null) ?? "A pre-consolidation row — accept &amp; prepare runs the brief and the address hunt.").slice(0, 280)}
          </p>
        ) : (
          <p className={twr.lbody} style={{ fontStyle: "italic", color: MUTED }}>
            The letter isn&apos;t written yet{verdict === "skip" ? " — and the machine says pass" : ""}. The seal below writes it in one press; nothing sends without another.
          </p>
        )}

        {/* ── The seal: the one move, per state ── */}
        <div className={twr.lseal}>
          {inBin ? (
            <>
              <form action={reconsiderPassed}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="return_to" value={`/admin/tower/candidate/${id}`} />
                <CeramicSendButton resting label="START BUTTON" title="Reconsider" confirmMessage={`Put ${c.name} back into the pipeline? The brief and history are kept.`} />
              </form>
              <p className={twr.lsealCap}>binned — press to reconsider; puts them back exactly as researched.</p>
            </>
          ) : status === "replied" ? (
            <>
              <form action={resumeOutreach}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="return_to" value={`/admin/tower/candidate/${id}`} />
                <CeramicSendButton resting label="START BUTTON" title="Resume outreach" confirmMessage={`Conversation over? This resumes outreach for ${c.name} — the ladder can draft follow-ups again.`} />
              </form>
              <p className={twr.lsealCap}>
                in conversation — hands off. <i>work the thread from your inbox; press only when it ends (resumes outreach).</i>
              </p>
            </>
          ) : status === "contacted" ? (
            <>
              <form action={markReplied}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="return_to" value={`/admin/tower/candidate/${id}`} />
                <CeramicSendButton resting label="START BUTTON" title="They replied" confirmMessage={`Mark ${c.name} as replied? Halts the follow-up ladder and flips them to hands-off.`} />
              </form>
              <p className={twr.lsealCap}>
                sent {timeAgo(c.first_touch_at as string | null)} · ladder step {(c.ladder_step as number | null) ?? 0} · <i>press when they reply — logs it &amp; halts the ladder.</i>
              </p>
            </>
          ) : status === "sourced" ? (
            <>
              <RunBriefButton
                candidateId={id}
                label="Accept & prepare · ~$0.60"
                postPath="/api/admin/accept-and-prepare"
                confirmText={`Accept ${c.name} and prepare them? Research brief + email hunt run in the background (~2 min, ~$0.15–$0.60). Drafting waits for you.`}
                confirmLabel="Accept & prepare"
                busyLabel="Preparing…"
                variant="primary"
              />
              <form action={rejectSourced}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="return_to" value={`/admin/tower/candidate/${id}`} />
                <TowerButton variant="ghost" pendingLabel="Binning…">Bin them</TowerButton>
              </form>
              <p className={twr.lsealCap}>a pre-consolidation row — accept &amp; prepare runs the whole line first.</p>
            </>
          ) : liveDraft && !liveManual ? (
            <>
              <form action={oneClickSend}>
                <input type="hidden" name="id" value={liveDraft.id as string} />
                <CeramicSendButton
                  label="START BUTTON"
                  title={`Send to ${liveDraft.to_addr as string}`}
                  confirmMessage={`Send this letter to ${liveDraft.to_addr as string} now? One press does everything — it goes out immediately and can't be undone.`}
                />
              </form>
              <p className={twr.lsealCap}>
                press to send · sealed from partners@aesdr<br />
                <i>suppression re-checked → sent → logged in the sent record → the clock starts. a second press can&apos;t double-send.</i>
              </p>
              <form action={holdDraft} style={{ marginLeft: "auto" }}>
                <input type="hidden" name="id" value={liveDraft.id as string} />
                <TowerButton variant="ghost" pendingLabel="Holding…">Hold</TowerButton>
              </form>
            </>
          ) : liveDraft && liveManual ? (
            <>
              <form action={attachEmail} style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <input type="hidden" name="id" value={id} />
                <input
                  type="text"
                  name="email"
                  placeholder="found their address? paste it…"
                  style={{ fontFamily: MONO, fontSize: "12px", color: INK, background: "#fff", border: `1.5px solid ${INK}`, padding: "10px 12px", width: "240px" }}
                />
                <CeramicSendButton resting label="START BUTTON" title="Attach the address" confirmMessage="Attach this address? The letter converts to a real email send and the seal arms." />
              </form>
              <p className={twr.lsealCap}>
                no address yet — paste one and press; the seal arms for a real send.<br />
                <i>or deliver by hand:</i>{" "}
                <ContactLinks text={(liveDraft.to_addr as string) + " " + ((c.contact_path as string | null) ?? "")} searchHint={`${c.name as string} ${(c.surface as string | null) ?? ""}`} />
              </p>
              <form action={markManualSent} style={{ marginLeft: "auto" }}>
                <input type="hidden" name="id" value={liveDraft.id as string} />
                <TowerButton variant="ghost" pendingLabel="Marking…">Mark sent</TowerButton>
              </form>
            </>
          ) : status === "enriched" && (brief || hasLegacyBrief) ? (
            <>
              <form action={draftNow}>
                <input type="hidden" name="id" value={id} />
                <CeramicSendButton
                  resting={verdict === "skip"}
                  label="START BUTTON"
                  title="Write the draft"
                  confirmMessage={
                    verdict === "skip"
                      ? `The machine says pass on ${c.name}. Write the letter anyway?`
                      : `Write ${c.name}'s letter? One press drafts it in AESDR voice — nothing sends until you press again.`
                  }
                />
              </form>
              <p className={twr.lsealCap}>
                {verdict === "skip"
                  ? "the machine says pass — press only to override."
                  : verdict === "reach_out"
                    ? "one press writes their letter → then the same seal sends it."
                    : "the machine couldn't call it — read the fold, then press to write it anyway."}
              </p>
              <form action={rejectSourced} style={{ marginLeft: "auto" }}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="return_to" value={`/admin/tower/candidate/${id}`} />
                <TowerButton variant="ghost" pendingLabel="Binning…">Bin them</TowerButton>
              </form>
            </>
          ) : status === "enriched" ? (
            <>
              <RunBriefButton candidateId={id} label="Run brief now" />
              <form action={draftNow}>
                <input type="hidden" name="id" value={id} />
                <CeramicSendButton resting label="START BUTTON" title="Draft from template" confirmMessage={`No brief yet for ${c.name}. Write a template letter anyway?`} />
              </form>
              <p className={twr.lsealCap}>no brief landed — run it, or press to write from template.</p>
            </>
          ) : (
            <p className={twr.lsealCap}>{next}</p>
          )}
        </div>

        {/* Sent proof, right on the sheet. */}
        {lastSent && !liveDraft && (
          <div style={{ fontFamily: MONO, fontSize: "11px", lineHeight: 1.9, color: INK, borderLeft: "3px solid", borderImage: "linear-gradient(180deg,#FF006E,#8B5CF6) 1", padding: "4px 0 4px 12px", marginTop: "12px" }}>
            <strong style={{ color: GREEN }}>sent ✓</strong>{" "}
            {lastSent.sent_at ? `${timeAgo(lastSent.sent_at as string)} → ` : "→ "}{lastSent.to_addr as string}
            {lastSent.resend_id ? <><br />resend id {lastSent.resend_id as string}</> : null}
            <br />
            {(() => {
              const del = deliveryByQueue.get(lastSent.id as string);
              if (del?.status === "delivered") return <strong style={{ color: GREEN }}>delivered ✓{del.at ? ` ${timeAgo(del.at)}` : ""}</strong>;
              if (del?.status === "bounced" || del?.status === "complained") return <strong style={{ color: CRIMSON }}>{del.status} — address suppressed, don&apos;t resend</strong>;
              return <span style={{ color: MUTED }}>delivery pending — stamps when Resend confirms</span>;
            })()}
          </div>
        )}

        {/* ════ THE FOLD ════ */}
        <div className={twr.lfold}>
          <details className={twr.lsec}>
            <summary>the read <span className={twr.lsecHint}>voice · conflict · contact · audience</span></summary>
            <div className={twr.lsecBody}>
              <p style={{ margin: "0 0 4px" }}><b style={{ color: MUTED }}>voice fit</b> — {vf ?? "—"}/5, sounds like AESDR (not overall fit)</p>
              <p style={{ margin: "0 0 4px" }}><b style={{ color: MUTED }}>conflict</b> — {conflict ?? "not assessed"}{brief?.conflict_note ? ` · ${brief.conflict_note}` : ""}</p>
              <p style={{ margin: "0 0 4px", color: CRIMSON }}>
                <b style={{ color: MUTED }}>contact</b> — {(c.contact_path as string | null) ?? "—"}{" "}
                {c.contact_path ? <ContactLinks text={c.contact_path as string} searchHint={`${c.name as string} ${(c.surface as string | null) ?? ""}`} /> : null}
              </p>
              {(c.found_email as string | null) && (
                <p style={{ margin: "0 0 4px" }}>
                  <b style={{ color: MUTED }}>found email</b> — {c.found_email as string} ({((c.found_email_status as string | null) ?? "found").replace(/_/g, " ")}){" "}
                  <a href={inboxSearchUrl(c.found_email as string)} target="_blank" rel="noreferrer" style={{ color: CRIMSON }}>inbox ↗</a>
                </p>
              )}
              {foundEmail && !hasEmail && (
                <form action={useFoundEmail} style={{ margin: "6px 0" }}>
                  <input type="hidden" name="id" value={id} />
                  <TowerButton variant="outline" pendingLabel="Applying…">Use {foundEmail.email} (unverified)</TowerButton>
                </form>
              )}
              {!hasEmail && !liveDraft && emailFinderConfigured() && (status === "sourced" || status === "enriched") && (
                <form action={findEmailNow} style={{ display: "flex", gap: "8px", alignItems: "stretch", margin: "6px 0" }}>
                  <input type="hidden" name="id" value={id} />
                  <input type="text" name="domain" placeholder="their site, if you know it" style={{ fontFamily: MONO, fontSize: "11px", color: INK, background: "#fff", border: `1px solid ${LIGHT}`, padding: "0 10px", width: "210px" }} />
                  <TowerButton variant="outline" pendingLabel="Running waterfall… (~80s)" confirmMessage={`Find an email for ${c.name}? One BetterContact credit, charged only on a found address.`}>Find email</TowerButton>
                </form>
              )}
              <p style={{ margin: 0 }}><b style={{ color: MUTED }}>audience</b> — est. {(c.audience_est as number | null)?.toLocaleString() ?? "unknown"} · {(c.archetype as string | null) ?? "—"}</p>
            </div>
          </details>

          <details className={twr.lsec}>
            <summary>the scout&apos;s notes</summary>
            <div className={twr.lsecBody}>
              <p style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{(c.why_fit as string | null) ?? "—"}</p>
              {c.next_action && <p style={{ margin: "6px 0 0", color: MUTED }}>next noted: {c.next_action as string}</p>}
            </div>
          </details>

          {(sentDrafts.length > 0 || parkedDrafts.length > 0) && (
            <details className={twr.lsec}>
              <summary>sends &amp; parked <span className={twr.lsecHint}>{sentDrafts.length} sent{parkedDrafts.length > 0 ? ` · ${parkedDrafts.length} parked` : ""}</span></summary>
              <div className={twr.lsecBody}>
                {sentDrafts.map((d) => {
                  const del = deliveryByQueue.get(d.id as string);
                  return (
                    <p key={d.id as string} style={{ margin: "0 0 6px" }}>
                      <strong style={{ color: GREEN }}>sent ✓</strong> {d.sent_at ? timeAgo(d.sent_at as string) : ""} → {d.to_addr as string} · &ldquo;{(d.subject as string).slice(0, 44)}&rdquo;
                      {del?.status === "delivered" ? <strong style={{ color: GREEN }}> · delivered ✓</strong> : del?.status ? <strong style={{ color: CRIMSON }}> · {del.status}</strong> : <span style={{ color: MUTED }}> · delivery pending</span>}
                    </p>
                  );
                })}
                {parkedDrafts.map((d) => (
                  <div key={d.id as string} style={{ margin: "0 0 8px" }}>
                    <p style={{ margin: "0 0 4px", color: CRIMSON }}>
                      {d.status as string} — &ldquo;{(d.subject as string).slice(0, 44)}&rdquo; → {d.to_addr as string}
                      {d.error ? ` · ${(d.error as string).slice(0, 80)}` : ""}
                    </p>
                    <form action={releaseDraft} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={d.id as string} />
                      <TowerButton variant="ghost" pendingLabel="Releasing…">Release → ready</TowerButton>
                    </form>
                  </div>
                ))}
              </div>
            </details>
          )}

          <details className={twr.lsec}>
            <summary>replies <span className={twr.lsecHint}>{replies.length} · inbox</span></summary>
            <div className={twr.lsecBody}>
              {replies.length === 0 ? (
                <p style={{ margin: 0, color: MUTED }}>
                  none yet — replies land in your inbox.{" "}
                  {(c.found_email as string | null) && (
                    <a href={inboxSearchUrl(c.found_email as string)} target="_blank" rel="noreferrer" style={{ color: CRIMSON }}>open in inbox ↗</a>
                  )}{" "}
                  when they write back, press the seal above — it logs the reply and halts the ladder.
                </p>
              ) : (
                replies.map((r, i) => (
                  <div key={i} style={{ margin: "0 0 8px" }}>
                    <p style={{ margin: 0 }}>
                      <strong>{r.from_addr as string}</strong> · {timeAgo(r.received_at as string)} · &ldquo;{(r.subject as string | null) ?? "(no subject)"}&rdquo;
                      {r.classification ? <span style={{ color: MUTED }}> · {r.classification as string}</span> : null}
                    </p>
                    <p style={{ margin: "2px 0 0", color: MUTED, whiteSpace: "pre-wrap" }}>{((r.text_body as string | null) ?? "").slice(0, 240)}</p>
                  </div>
                ))
              )}
            </div>
          </details>

          <details className={twr.lsec}>
            <summary>history <span className={twr.lsecHint}>{timeline.length} entries</span></summary>
            <div className={twr.lsecBody}>
              {timeline.map((t, i) => (
                <p key={i} style={{ margin: "0 0 3px" }}>
                  <span style={{ color: MUTED }}>{fmt(t.at)}</span> · <span style={{ color: CRIMSON }}>{t.actor}</span> · {t.label}
                </p>
              ))}
            </div>
          </details>
        </div>
      </div>
    </main>
  );
}
