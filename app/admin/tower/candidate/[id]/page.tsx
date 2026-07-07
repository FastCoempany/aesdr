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
import {
  rejectSourced,
  reconsiderPassed,
  draftNow,
  findEmailNow,
  useFoundEmail,
  approveDraft,
  sendNow,
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
const DISPLAY = "'Playfair Display', Georgia, serif";
const SERIF = "'Source Serif 4', Georgia, serif";

const card: React.CSSProperties = {
  border: `1px solid ${LIGHT}`,
  background: "#FFFFFF",
  padding: "18px 20px",
  marginBottom: "14px",
};
const sectionLabel: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: "11px",
  letterSpacing: ".26em",
  textTransform: "uppercase",
  color: MUTED,
  margin: "28px 0 12px",
};
const chip = (color: string): React.CSSProperties => ({
  fontFamily: MONO,
  fontSize: "10px",
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color,
  border: `1px solid ${color}`,
  padding: "2px 8px",
  whiteSpace: "nowrap",
});

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
    if (hasReadyDraft) next = "A draft is in the house — press Ready, then Send it below.";
    else if (hasApprovedDraft) next = "Draft is armed — press Send now to email it.";
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

  const verdictColor = (v: string) =>
    v === "reach_out" ? GREEN : v === "skip" ? AMBERISH : MUTED;

  return (
    <main style={{ padding: "8px 0 48px", maxWidth: "860px" }}>
      <p style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>
        <Link href="/admin/tower" className={twr.lnk}>← Control Tower</Link>
        {"  ·  "}
        <Link href="/admin/tower/pipeline" className={twr.lnk}>The map</Link>
      </p>

      {sp.err && (
        <div style={{ ...card, borderLeft: `3px solid ${CRIMSON}` }}>
          <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: CRIMSON, display: "block", marginBottom: "6px" }}>
            That didn&apos;t work
          </span>
          <p style={{ fontFamily: MONO, fontSize: "12.5px", lineHeight: 1.6, color: INK, margin: 0, wordBreak: "break-word" }}>{sp.err}</p>
        </div>
      )}
      {sp.ok === "brief" && (
        <div style={{ ...card, borderLeft: `3px solid ${INK}` }}>
          <p style={{ fontFamily: SERIF, fontSize: "13.5px", color: INK, margin: 0 }}>Research brief written — it&apos;s below.</p>
        </div>
      )}
      {sp.ok === "draft" && (
        <div style={{ ...card, borderLeft: `3px solid ${INK}` }}>
          <p style={{ fontFamily: SERIF, fontSize: "13.5px", color: INK, margin: 0 }}>First-touch drafted — it&apos;s in Drafts below, waiting on your approve.</p>
        </div>
      )}
      {sp.ok === "email" && (
        <div style={{ ...card, borderLeft: `3px solid ${INK}` }}>
          <p style={{ fontFamily: SERIF, fontSize: "13.5px", color: INK, margin: 0 }}>
            Email added to the contact path — their drafts now go out as real email sends instead of manual delivery.
          </p>
        </div>
      )}
      {sp.ok === "email_risky" && (
        <div style={{ ...card, borderLeft: `3px solid ${AMBERISH}` }}>
          <p style={{ fontFamily: SERIF, fontSize: "13.5px", color: INK, margin: 0 }}>
            BetterContact found an address but flagged it catch-all / not-verified — see the finder result below the brief. Use it only if you trust it.
          </p>
        </div>
      )}
      {sp.ok === "email_none" && (
        <div style={{ ...card, borderLeft: `3px solid ${MUTED}` }}>
          <p style={{ fontFamily: SERIF, fontSize: "13.5px", color: INK, margin: 0 }}>
            BetterContact ran its full waterfall (20+ sources) and found nothing deliverable — no credit spent. That&apos;s a
            strong signal this person has no discoverable business email. Paste a different site if you know one, or take the manual path.
          </p>
        </div>
      )}

      {/* ── Header: who they are + where they stand ── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "14px", flexWrap: "wrap", marginBottom: "4px" }}>
        <h1 style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 700, fontSize: "34px", color: INK, margin: 0 }}>
          {c.name as string}
        </h1>
        {status === "passed" || status === "cold" ? (
          <span style={{ ...chip("#FAF7F2"), background: INK, borderColor: INK }}>
            {status} — in the bin
          </span>
        ) : (
          <span style={chip(status === "activated" ? GREEN : CRIMSON)}>
            {status.replace(/_/g, " ")}
          </span>
        )}
      </div>
      <p style={{ fontFamily: MONO, fontSize: "11.5px", color: MUTED, margin: "0 0 4px" }}>
        {(c.surface as string | null) ?? "—"} · {(c.handle as string | null) ?? "no handle"} · {(c.archetype as string | null) ?? "—"} · audience est. {(c.audience_est as number | null)?.toLocaleString() ?? "unknown"} · vf {vf ?? "—"}
      </p>
      {/* Email, prominent — the first thing you want when reaching out. */}
      {(c.found_email as string | null) ? (
        <p style={{ fontFamily: MONO, fontSize: "14px", fontWeight: 700, color: INK, margin: "8px 0 12px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span>✉ {c.found_email as string}</span>
          <span style={chip((c.found_email_status as string | null) === "deliverable" ? GREEN : AMBERISH)}>
            {((c.found_email_status as string | null) ?? "found").replace(/_/g, " ")}
          </span>
          <a href={inboxSearchUrl(c.found_email as string)} target="_blank" rel="noreferrer" className={twr.lnk} style={{ fontFamily: MONO, fontSize: "11px", color: CRIMSON, fontWeight: 400 }}>
            open in inbox ↗
          </a>
        </p>
      ) : (c.email_checked_at as string | null) ? (
        <p style={{ fontFamily: MONO, fontSize: "11.5px", color: MUTED, margin: "8px 0 12px" }}>
          ✉ no email found — BetterContact came up empty; use the contact path below.
        </p>
      ) : null}
      {c.contact_path && (
        <p style={{ fontFamily: MONO, fontSize: "11.5px", color: CRIMSON, margin: "0 0 14px" }}>
          {c.contact_path as string}{" "}
          <ContactLinks
            text={c.contact_path as string}
            searchHint={`${c.name as string} ${(c.surface as string | null) ?? ""}`}
          />
        </p>
      )}
      {status === "passed" || status === "cold" ? (
        <div style={{ ...card, borderLeft: `3px solid ${INK}`, background: "rgba(107,107,107,.05)" }}>
          <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: INK, display: "block", marginBottom: "6px" }}>
            In the bin
          </span>
          <p style={{ fontFamily: SERIF, fontSize: "14.5px", lineHeight: 1.6, color: INK, margin: "0 0 12px" }}>
            You passed on {c.name as string} {timeAgo(c.updated_at as string | null)}. The bin never expires —
            everything here is kept exactly as researched. Reconsider puts them back{" "}
            {brief || hasLegacyBrief ? "into Enriched (the brief is kept)" : "into the review queue"}.
          </p>
          <form action={reconsiderPassed}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="return_to" value={`/admin/tower/candidate/${id}`} />
            <TowerButton variant="outline" pendingLabel="Restoring…">Reconsider — put them back</TowerButton>
          </form>
        </div>
      ) : (
        <div style={{ ...card, borderLeft: `3px solid ${INK}` }}>
          <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "6px" }}>
            What happens next
          </span>
          <p style={{ fontFamily: SERIF, fontSize: "14.5px", lineHeight: 1.6, color: INK, margin: 0 }}>{next}</p>
        </div>
      )}

      {/* ── The fit call (founder 2026-07-07): the machine scored, you decide.
            Standout by design — nothing drafts until one of these is pressed. ── */}
      {status === "enriched" &&
        (brief || hasLegacyBrief) &&
        !drafts.some((d) => ["ready", "approved", "sent"].includes(d.status as string)) && (
          <div style={{ ...card, border: `2px solid ${CRIMSON}` }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
              <span style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 900, fontSize: "34px", lineHeight: 1, color: INK }}>
                {vf ?? "—"}
              </span>
              <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".14em", textTransform: "uppercase", color: MUTED }}>
                / 5 · machine score — advisory only. Your call decides.
              </span>
              {!hasEmail && (
                <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", color: "#FFFFFF", background: CRIMSON, padding: "4px 8px" }}>
                  no email — drafts to manual channel (DM / form)
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <form action={draftNow}>
                <input type="hidden" name="id" value={id} />
                <TowerButton pendingLabel="Drafting…">Fits — draft them</TowerButton>
              </form>
              <form action={rejectSourced}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="return_to" value={`/admin/tower/candidate/${id}`} />
                <TowerButton variant="ghost" pendingLabel="Binning…">Doesn&rsquo;t fit — bin</TowerButton>
              </form>
            </div>
          </div>
        )}

      {/* ── Hands-off state (founder 2026-07-07): they replied — the machine
            stays out until you move them. ── */}
      {status === "replied" && (
        <div data-surface="dark" style={{ background: INK, color: "#FAF7F2", padding: "16px 18px", marginBottom: "16px" }}>
          <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".22em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
            In conversation · hands off
          </span>
          <p style={{ fontFamily: SERIF, fontSize: "13.5px", lineHeight: 1.6, margin: "0 0 12px", opacity: 0.85 }}>
            No drafts, no nudges, no ladder while they&rsquo;re talking to you. Work the thread from your
            inbox; if the conversation ends without a deal, resume outreach below.
          </p>
          <form action={resumeOutreach}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="return_to" value={`/admin/tower/candidate/${id}`} />
            <TowerButton variant="outline" pendingLabel="Resuming…">Conversation over — resume outreach</TowerButton>
          </form>
        </div>
      )}

      {/* ── Stage actions ── */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        {status === "sourced" && (
          <>
            <RunBriefButton
              candidateId={id}
              label="Accept & prepare · ~$0.60"
              postPath="/api/admin/accept-and-prepare"
              confirmText={`Accept ${c.name} and prepare them? Research brief + email hunt run in the background (~2 min, ~$0.15–$0.60 + 1 email credit if an address is found). Drafting waits for your fit call.`}
              confirmLabel="Accept & prepare"
              busyLabel="Preparing…"
              variant="primary"
            />
            <form action={rejectSourced}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="return_to" value={`/admin/tower/candidate/${id}`} />
              <TowerButton variant="ghost" pendingLabel="Rejecting…">Reject</TowerButton>
            </form>
          </>
        )}
        {(status === "sourced" || status === "enriched") && (
          <RunBriefButton
            candidateId={id}
            label={brief || hasLegacyBrief ? "Re-run brief" : "Run brief now"}
          />
        )}
        {status === "enriched" &&
          !brief &&
          !hasLegacyBrief &&
          !drafts.some((d) => ["ready", "approved", "sent"].includes(d.status as string)) && (
          <form action={draftNow}>
            <input type="hidden" name="id" value={id} />
            <TowerButton variant="outline" pendingLabel="Drafting…">Scribe draft (skip research)</TowerButton>
          </form>
        )}
        {status === "contacted" && (
          <form action={markReplied}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="return_to" value={`/admin/tower/candidate/${id}`} />
            <TowerButton pendingLabel="Marking…">They replied — hands off</TowerButton>
          </form>
        )}
        {(status === "sourced" || status === "enriched") && !hasEmail && emailFinderConfigured() && (
          <form action={findEmailNow} style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
            <input type="hidden" name="id" value={id} />
            <input
              type="text"
              name="domain"
              placeholder="their site, if you know it — e.g. janedoe.com"
              style={{
                fontFamily: MONO,
                fontSize: "11px",
                color: INK,
                background: "#FFFFFF",
                border: `1px solid ${LIGHT}`,
                padding: "0 10px",
                width: "240px",
              }}
            />
            <TowerButton
              variant="outline"
              pendingLabel="Running waterfall… (up to ~80s)"
              confirmMessage={`Find an email for ${c.name}? Runs BetterContact's waterfall across 20+ sources (one credit, charged only on a found email).`}
            >
              Find email
            </TowerButton>
          </form>
        )}
        {status === "enriched" && (
          <form action={rejectSourced}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="return_to" value={`/admin/tower/candidate/${id}`} />
            <TowerButton variant="ghost" pendingLabel="Parking…">Pass on them</TowerButton>
          </form>
        )}
      </div>
      {(status === "sourced" || status === "enriched") && (
        <p style={{ fontFamily: MONO, fontSize: "10px", lineHeight: 1.6, color: MUTED, margin: "0 0 8px" }}>
          Run brief = a live web-search research call (confirmed first, ~$0.10–$0.50). Scribe draft = free template fill.
          Neither sends anything — every email still waits for your approve in Decisions.
        </p>
      )}

      {/* ── The research brief ── */}
      <p style={sectionLabel}>Research brief</p>
      {brief ? (
        <div style={card}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            <span style={chip(verdictColor(brief.verdict))}>the call: {brief.verdict.replace(/_/g, " ")}</span>
            <span style={chip(brief.conflict === "none" ? GREEN : brief.conflict === "hard" ? CRIMSON : AMBERISH)}>
              conflict: {brief.conflict}
            </span>
            <span style={chip(INK)}>voice-fit {brief.voice_fit}/5</span>
          </div>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              {[
                ["Voice fit", brief.voice_fit_rationale],
                ["Conflict", brief.conflict_note || "—"],
                ["Cadence", brief.cadence_note],
                ["Audience", brief.audience_est ? `est. ${brief.audience_est.toLocaleString()}` : "couldn't verify"],
                ["Contact path", brief.contact_path],
                ["First-touch angle", brief.first_touch_angle],
              ].map(([k, v]) => (
                <tr key={k as string}>
                  <td style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", color: MUTED, padding: "6px 14px 6px 0", verticalAlign: "top", whiteSpace: "nowrap" }}>{k}</td>
                  <td style={{ fontFamily: SERIF, fontSize: "14px", lineHeight: 1.55, color: INK, padding: "6px 0", borderBottom: `1px solid ${LIGHT}` }}>
                    {v}
                    {k === "Contact path" && (
                      <>
                        {" "}
                        <ContactLinks
                          text={v as string}
                          searchHint={`${c.name as string} ${(c.surface as string | null) ?? ""}`}
                        />
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={card}>
          <p style={{ fontFamily: SERIF, fontSize: "13.5px", fontStyle: "italic", color: MUTED, margin: 0 }}>
            {hasLegacyBrief
              ? "A brief was written before structured storage existed — the raw trail below has it. Re-run brief to render it properly here."
              : "No brief yet. Press Run brief now above, or start the dossier-enrich lever and it happens on the hour."}
          </p>
        </div>
      )}
      {/* Finder result — what BetterContact turned up, and whether it was trusted. */}
      {foundEmail && (
        <div style={{ ...card, borderLeft: `3px solid ${foundEmail.verified ? GREEN : AMBERISH}` }}>
          <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "6px" }}>
            Email finder result
          </span>
          <p style={{ fontFamily: SERIF, fontSize: "14px", lineHeight: 1.6, color: INK, margin: "0 0 10px" }}>
            <strong style={{ fontFamily: MONO, fontSize: "13px" }}>{foundEmail.email}</strong>{" "}
            <span style={chip(foundEmail.verified ? GREEN : AMBERISH)}>{foundEmail.status.toLowerCase()}</span>
            {foundEmail.domain ? (
              <span style={{ fontFamily: MONO, fontSize: "10.5px", color: MUTED }}>{"  "}via {foundEmail.domain}</span>
            ) : null}
            {"  "}
            {foundEmail.verified
              ? "— verified, already on the contact path."
              : hasEmail
                ? "— superseded by the email now on the contact path."
                : "— a catch-all/unverified address: it may deliver or silently bounce. Your call."}
          </p>
          {!foundEmail.verified && !hasEmail && (
            <form action={useFoundEmail}>
              <input type="hidden" name="id" value={id} />
              <TowerButton variant="ghost" pendingLabel="Adding…">Use it anyway</TowerButton>
            </form>
          )}
        </div>
      )}

      {/* The raw trail — scout's note + every dossier verdict line, verbatim. */}
      {c.why_fit && (
        <div style={{ ...card, background: "rgba(139, 26, 26, 0.03)" }}>
          <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "6px" }}>
            Raw trail (why_fit)
          </span>
          <p style={{ fontFamily: MONO, fontSize: "12px", lineHeight: 1.6, color: INK, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {c.why_fit as string}
          </p>
        </div>
      )}

      {/* ── Drafts — every status, with the action that fits ── */}
      <p style={sectionLabel}>Drafts &amp; sends</p>
      {drafts.length === 0 ? (
        <div style={card}>
          <p style={{ fontFamily: SERIF, fontSize: "13.5px", fontStyle: "italic", color: MUTED, margin: 0 }}>
            Nothing drafted yet{status === "enriched" ? " — Scribe draft above writes the first-touch." : "."}
          </p>
        </div>
      ) : (
        drafts.map((d) => {
          const st = d.status as string;
          const isManual = (d.send_channel ?? "email") === "manual";
          const isArmed = !isManual && st === "approved";
          return (
            <div
              key={d.id as string}
              style={isArmed ? { ...card, borderLeft: `3px solid ${GREEN}` } : card}
            >
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "8px" }}>
                <span style={chip(st === "sent" ? GREEN : st === "failed" ? CRIMSON : st === "held" ? AMBERISH : INK)}>{st}</span>
                <span style={chip(MUTED)}>{isManual ? "manual send" : "email"}</span>
                {d.warden_cleared ? <span style={chip(GREEN)}>warden ✓</span> : <span style={chip(AMBERISH)}>needs eye</span>}
                {isArmed && <span style={{ ...chip(GREEN), fontWeight: 700 }}>● armed</span>}
                <span style={{ fontFamily: MONO, fontSize: "11px", color: MUTED, marginLeft: "auto" }}>→ {d.to_addr as string}</span>
              </div>
              {isManual && st !== "sent" && (
                <p style={{ fontFamily: MONO, fontSize: "11px", color: MUTED, margin: "0 0 8px" }}>
                  deliver it yourself, then Mark sent:{" "}
                  <ContactLinks
                    text={(d.to_addr as string) + " " + ((c.contact_path as string | null) ?? "")}
                    searchHint={`${c.name as string} ${(c.surface as string | null) ?? ""}`}
                  />
                </p>
              )}
              {st === "ready" || st === "approved" ? (
                // Inline editor — edit subject + body right on screen, then Save
                // re-runs the canon gate. (editDraft accepts ready + approved.)
                <form action={editDraft} style={{ margin: "0 0 10px" }}>
                  <input type="hidden" name="id" value={d.id as string} />
                  <input
                    name="subject"
                    defaultValue={d.subject as string}
                    style={{ width: "100%", boxSizing: "border-box", fontFamily: SERIF, fontSize: "15px", fontWeight: 600, padding: "8px 10px", border: `1px solid ${LIGHT}`, color: INK, background: "#fff", marginBottom: "8px" }}
                  />
                  <textarea
                    name="body"
                    defaultValue={d.body as string}
                    rows={12}
                    style={{ width: "100%", boxSizing: "border-box", fontFamily: SERIF, fontSize: "13.5px", lineHeight: 1.6, padding: "10px", border: `1px solid ${LIGHT}`, color: INK, background: "#fff", resize: "vertical" }}
                  />
                  <div style={{ marginTop: "8px" }}>
                    <TowerButton variant="ghost" pendingLabel="Saving…">Save &amp; re-check canon</TowerButton>
                  </div>
                </form>
              ) : (
                <>
                  <p style={{ fontFamily: SERIF, fontSize: "15px", fontWeight: 600, color: INK, margin: "0 0 6px" }}>{d.subject as string}</p>
                  <p style={{ fontFamily: SERIF, fontSize: "13.5px", lineHeight: 1.6, color: INK, margin: "0 0 10px", whiteSpace: "pre-wrap" }}>
                    {d.body as string}
                  </p>
                </>
              )}
              {d.personalization_note && (
                <p style={{ fontFamily: MONO, fontSize: "11px", lineHeight: 1.5, color: AMBERISH, background: "rgba(161,68,0,.06)", borderLeft: `2px solid ${AMBERISH}`, padding: "8px 10px", margin: "0 0 10px" }}>
                  {d.personalization_note as string}
                </p>
              )}
              {st === "failed" && (
                <div style={{ fontFamily: MONO, fontSize: "12px", lineHeight: 1.5, color: CRIMSON, background: "rgba(139,26,26,.06)", border: `1px solid ${CRIMSON}`, padding: "8px 10px", margin: "0 0 10px" }}>
                  <strong>✗ Didn&apos;t send.</strong> {(d.error as string) || "Unknown error."} — fix it and hit Send again, or check Resend → Emails.
                </div>
              )}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {st === "ready" && (
                  <>
                    {isManual ? (
                      <form action={markManualSent}>
                        <input type="hidden" name="id" value={d.id as string} />
                        <TowerButton pendingLabel="Marking…">Mark sent</TowerButton>
                      </form>
                    ) : (
                      <form action={approveDraft}>
                        <input type="hidden" name="id" value={d.id as string} />
                        <TowerButton pendingLabel="Marking ready…">Ready</TowerButton>
                      </form>
                    )}
                    <form action={holdDraft}>
                      <input type="hidden" name="id" value={d.id as string} />
                      <TowerButton variant="ghost" pendingLabel="Holding…">Hold</TowerButton>
                    </form>
                  </>
                )}
                {(st === "held" || st === "failed") && (
                  <form action={releaseDraft}>
                    <input type="hidden" name="id" value={d.id as string} />
                    <TowerButton variant="ghost" pendingLabel="Releasing…">Release → ready</TowerButton>
                  </form>
                )}
                {st === "approved" && (
                  <>
                    <form action={sendNow}>
                      <input type="hidden" name="id" value={d.id as string} />
                      <TowerButton
                        pendingLabel="Sending…"
                        confirmMessage={`Send this email to ${d.to_addr as string} now? It goes out immediately and can't be undone.`}
                      >
                        Send now
                      </TowerButton>
                    </form>
                    <form action={holdDraft}>
                      <input type="hidden" name="id" value={d.id as string} />
                      <TowerButton variant="ghost" pendingLabel="Holding…">Hold</TowerButton>
                    </form>
                  </>
                )}
                {st === "sent" && (
                  <span style={{ fontFamily: MONO, fontSize: "12px", fontWeight: 700, color: GREEN, background: "rgba(46,125,50,.08)", border: `1px solid ${GREEN}`, padding: "6px 10px" }}>
                    ✓ Sent to {d.to_addr as string}{d.sent_at ? ` · ${timeAgo(d.sent_at as string)}` : ""}
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* ── Replies ── */}
      <p style={sectionLabel}>Replies</p>
      {replies.length === 0 ? (
        <div style={card}>
          <p style={{ fontFamily: SERIF, fontSize: "13.5px", fontStyle: "italic", color: MUTED, margin: 0 }}>
            Nothing yet. Replies land in your inbox (the outbound&apos;s reply-to address) — the search link
            in Contact paths above jumps straight to their thread. When they write back, work it from
            there and move this card&apos;s status yourself (it also halts the follow-up ladder).
          </p>
        </div>
      ) : (
        replies.map((r, i) => (
          <div key={i} style={{ ...card, borderLeft: `3px solid ${CRIMSON}` }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "baseline", flexWrap: "wrap", marginBottom: "6px" }}>
              <span style={{ fontFamily: SERIF, fontSize: "14.5px", fontWeight: 600, color: INK }}>{r.subject ?? "(no subject)"}</span>
              {r.classification && <span style={chip(MUTED)}>{r.classification as string}</span>}
              <span style={{ fontFamily: MONO, fontSize: "10.5px", color: MUTED, marginLeft: "auto" }}>
                {r.from_addr as string} · {timeAgo(r.received_at as string)}
              </span>
            </div>
            <p style={{ fontFamily: SERIF, fontSize: "13.5px", lineHeight: 1.6, color: INK, margin: "0 0 10px", whiteSpace: "pre-wrap" }}>
              {((r.text_body as string | null) ?? "").slice(0, 600) || "(empty body)"}
            </p>
            <a
              href={inboxSearchUrl(r.from_addr as string)}
              target="_blank"
              rel="noreferrer"
              className={twr.lnk}
              style={{ fontFamily: MONO, fontSize: "11px", color: CRIMSON }}
            >
              open the thread in your inbox ↗
            </a>
          </div>
        ))
      )}

      {/* ── Timeline ── */}
      <p style={sectionLabel}>Timeline</p>
      <div style={card}>
        {timeline.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", padding: "7px 0", borderBottom: i < timeline.length - 1 ? `1px solid ${LIGHT}` : "none" }}>
            <span style={{ fontFamily: MONO, fontSize: "10.5px", color: MUTED, whiteSpace: "nowrap", minWidth: "110px" }}>{fmt(t.at)}</span>
            <span style={{ fontFamily: MONO, fontSize: "10.5px", color: CRIMSON, whiteSpace: "nowrap", minWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }}>{t.actor}</span>
            <span style={{ fontFamily: SERIF, fontSize: "13px", color: INK, lineHeight: 1.5 }}>{t.label}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
