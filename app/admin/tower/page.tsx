export const dynamic = "force-dynamic";
// Scout sweeps post to this page and run a live web_search loop that emits
// 12-15 candidates — it self-caps at SCOUT_BUDGET_MS (150s), so the route
// needs headroom above that. Pro allows up to 300s; 180 sits comfortably above
// the sweep's budget so an overrun is a caught "timed out", not a hard kill.
export const maxDuration = 180;

import Link from "next/link";

import { createAdminClient } from "@/utils/supabase/admin";
import {
  approveDraft,
  sendNow,
  approveAllReady,
  holdDraft,
  releaseDraft,
  handleSignal,
  editDraft,
  markManualSent,
} from "./actions";
import PayoutButton from "./PayoutButton";
import AgentLever from "./AgentLever";
import ScoutSweepButton from "./ScoutSweepButton";
import ModelSelector from "./ModelSelector";
import TowerButton from "./TowerButton";
import Hint from "./Hint";
import ContactLinks from "./ContactLinks";
import twr from "./tower.module.css";
import { inboxSearchUrl, looksLikeEmail } from "@/lib/partnerships/inbox-link";
import { rejectSourced, draftNow } from "./actions";
import {
  PARTNER_AGENTS,
  AGENT_MODEL_DEFAULTS,
} from "@/lib/partnerships/agent-switch";
import { getTodaySpendUsd, getTodayEmailCredits } from "@/lib/partnerships/spend";
import { extractEmail } from "@/lib/partnerships/outreach-templates";
import { getSuppressedEmails } from "@/lib/email";
import SpendMeter from "./SpendMeter";
import AcceptPrepareButton from "./candidate/[id]/RunBriefButton";

/**
 * The decision board. Four sections, top to bottom:
 *   1. Agent Controls (the levers — Start/Pause each cron-style agent)
 *   2. Scout & Enrich (Option-2 buttons + sourced-row review)
 *   3. Decisions — the few things waiting on one gesture from the operator
 *   4. Board — read-only situational
 * awareness so the cockpit shows live state, not just an inbox.
 *
 * Reads degrade gracefully: if the 20260606 migration (partner_signals.
 * handled_at) hasn't been applied yet, the signal queries fail soft and a
 * banner says so rather than crashing the page.
 */

// ── Palette (literal hex, matching app/admin/layout.tsx) ──
const INK = "#1A1A1A";
const CRIMSON = "#8B1A1A";
const MUTED = "#6B6B6B";
const LIGHT = "#E8E4DF";
const MONO = "'Space Mono', monospace";
const DISPLAY = "'Playfair Display', Georgia, serif";
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

export default async function TowerPage({
  searchParams,
}: {
  searchParams: Promise<{
    sweep_ok?: string;
    sweep_seen?: string;
    sweep_error?: string;
    promoted?: string;
    promoted_name?: string;
  }>;
}) {
  // Sweep + promote outcomes, set by the actions' redirects. Render-once
  // feedback: it lives in the URL, so a reload or navigation clears it.
  const sp = await searchParams;
  const sweepError = sp.sweep_error ?? null;
  const sweepOk = sp.sweep_ok != null ? Number(sp.sweep_ok) : null;
  const sweepSeen = sp.sweep_seen != null ? Number(sp.sweep_seen) : 0;
  const promotedId = sp.promoted ?? null;
  const promotedName = sp.promoted_name ?? null;

  const supabase = createAdminClient();

  // ── Decisions ──
  let migrationMissing = false;
  let brightSignals: Array<{
    id: string;
    signal_type: string;
    source: string;
    summary: string | null;
    prospect_slug: string | null;
    created_at: string;
  }> = [];
  let softSignals: Array<{
    id: string;
    summary: string | null;
    signal_type: string;
    created_at: string;
  }> = [];

  {
    const { data, error } = await supabase
      .from("partner_signals")
      .select("id, signal_type, source, summary, prospect_slug, created_at")
      .eq("severity", "bright")
      .is("handled_at", null)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) migrationMissing = true;
    else brightSignals = data ?? [];
  }
  if (!migrationMissing) {
    const { data } = await supabase
      .from("partner_signals")
      .select("id, summary, signal_type, created_at")
      .eq("severity", "soft")
      .is("handled_at", null)
      .order("created_at", { ascending: false })
      .limit(12);
    softSignals = data ?? [];
  }

  // R5-EE-6: track whether any decision-feeding query failed. If one did, the
  // "All clear." headline would be a lie (the counts it's built from are
  // partial). We surface a banner and suppress the all-clear copy instead.
  let decisionLoadFailed = false;

  // Both 'ready' (awaiting your review) and 'approved' (armed — you pressed
  // Ready) stay in the house so the whole gesture lives on one card: Ready
  // arms it, then Send fires it.
  const { data: readyDrafts, error: readyDraftsError } = await supabase
    .from("partner_outbound_queue")
    .select("*")
    .in("status", ["ready", "approved"])
    .order("send_after", { ascending: true })
    .limit(50);
  if (readyDraftsError) decisionLoadFailed = true;
  // Defensive shape so the page renders before/after the 20260607 migration
  // (send_channel / personalization_note default sensibly when absent).
  type DraftRow = {
    id: string;
    to_addr: string;
    subject: string;
    body: string;
    tier: string;
    status: string;
    warden_cleared: boolean;
    drafted_by: string | null;
    send_channel?: string | null;
    personalization_note?: string | null;
    related_pipeline_id?: string | null;
  };
  const drafts: DraftRow[] = (readyDrafts ?? []) as DraftRow[];
  // The "Ready all" batch only arms rows still awaiting review; already-armed
  // ('approved') rows are sent individually with their own confirm.
  const emailReadyCount = drafts.filter(
    (d) => (d.send_channel ?? "email") === "email" && d.status === "ready",
  ).length;

  // The shelf — drafts parked OFF the send path: held rows you pulled back and
  // failed sends. Armed ('approved') rows now stay in the house with a Send
  // button, so nothing waits on a cron here.
  const { data: shelfRows } = await supabase
    .from("partner_outbound_queue")
    .select("id, to_addr, subject, status, error, related_pipeline_id")
    .in("status", ["held", "failed"])
    .order("created_at", { ascending: true })
    .limit(30);
  const shelf = (shelfRows ?? []) as Array<{
    id: string;
    to_addr: string;
    subject: string;
    status: string;
    error: string | null;
    related_pipeline_id: string | null;
  }>;

  // ── Payouts (the money gate): cleared-but-unpaid commission per affiliate. ──
  const { data: clearedAttr, error: clearedAttrError } = await supabase
    .from("affiliate_attributions")
    .select("affiliate_slug, commission_amount_cents")
    .eq("status", "cleared")
    .is("paid_at", null);
  if (clearedAttrError) decisionLoadFailed = true;
  const payoutAgg: Record<string, { cents: number; count: number }> = {};
  for (const a of clearedAttr ?? []) {
    const slug = a.affiliate_slug as string | null;
    // EE-12: skip rows with a null slug rather than bucketing them under "null"
    // and then minting a payout row keyed on a non-existent affiliate.
    if (!slug) continue;
    if (!payoutAgg[slug]) payoutAgg[slug] = { cents: 0, count: 0 };
    payoutAgg[slug].cents += a.commission_amount_cents ?? 0;
    payoutAgg[slug].count += 1;
  }
  const payoutSlugs = Object.keys(payoutAgg);
  let payoutAffiliates: Array<{
    id: string;
    slug: string;
    display_name: string;
    stripe_account_status: string | null;
    cents: number;
    count: number;
  }> = [];
  if (payoutSlugs.length > 0) {
    const { data: affRows } = await supabase
      .from("affiliates")
      .select("id, slug, display_name, stripe_account_status")
      .in("slug", payoutSlugs);
    payoutAffiliates = (affRows ?? []).map((a) => ({
      id: a.id as string,
      slug: a.slug as string,
      display_name: (a.display_name as string) ?? (a.slug as string),
      stripe_account_status: (a.stripe_account_status as string) ?? null,
      cents: payoutAgg[a.slug as string]?.cents ?? 0,
      count: payoutAgg[a.slug as string]?.count ?? 0,
    })).sort((x, y) => y.cents - x.cents);
  }
  const payoutTotalCents = payoutAffiliates.reduce((s, a) => s + a.cents, 0);
  const usd = (cents: number) =>
    `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ── Sourced rows awaiting promotion (scout output sitting for review). ──
  const { data: sourcedRows } = await supabase
    .from("partner_pipeline")
    .select("id, name, surface, handle, voice_fit, why_fit, contact_path, source_agent")
    .eq("status", "sourced")
    .eq("motion", "affiliate")
    .order("created_at", { ascending: false })
    .limit(50);
  const sourced = sourcedRows ?? [];

  // ── The spend meter (founder 2026-07-07): today's ledger vs the $10 wall. ──
  let spentUsd = 0;
  let ledgerBroken = false;
  try {
    spentUsd = await getTodaySpendUsd();
  } catch {
    ledgerBroken = true; // paid runs fail closed; say so instead of showing $0
  }
  const emailCredits = await getTodayEmailCredits();

  // ── Fit calls: brief done, no draft yet — the machine scored, you decide. ──
  const { data: fitRowsRaw } = await supabase
    .from("partner_pipeline")
    .select("id, name, surface, voice_fit, contact_path, dossier_brief, updated_at")
    .eq("status", "enriched")
    .eq("motion", "affiliate")
    .ilike("why_fit", "%[dossier]%")
    .order("updated_at", { ascending: false })
    .limit(30);
  type FitRow = {
    id: string;
    name: string;
    surface: string | null;
    voice_fit: number | null;
    contact_path: string | null;
    dossier_brief: { verdict?: string | null; first_touch_angle?: string | null } | null;
    updated_at: string;
  };
  let fitCalls: FitRow[] = (fitRowsRaw ?? []) as FitRow[];
  if (fitCalls.length > 0) {
    const { data: drafted } = await supabase
      .from("partner_outbound_queue")
      .select("related_pipeline_id")
      .in("related_pipeline_id", fitCalls.map((r) => r.id));
    const hasDraft = new Set((drafted ?? []).map((d) => d.related_pipeline_id as string));
    fitCalls = fitCalls.filter((r) => !hasDraft.has(r.id));
  }

  // ── Suppression chips for the draft house (send-side gate is in the code
  //    path; this is the visible warning before you press anything). ──
  const suppressedSet = await getSuppressedEmails(
    drafts.filter((d) => (d.send_channel ?? "email") === "email").map((d) => d.to_addr),
  );

  // ── Board (situational) ──
  const { data: pipelineRows } = await supabase
    .from("partner_pipeline")
    .select("status");
  const pipeCounts: Record<string, number> = {};
  for (const r of pipelineRows ?? [])
    pipeCounts[r.status] = (pipeCounts[r.status] ?? 0) + 1;

  const { data: recentSent } = await supabase
    .from("partner_sent_log")
    .select("to_addr, subject, tier, sent_at")
    .order("sent_at", { ascending: false })
    .limit(8);

  // ── Agent master switches (the levers). Missing table → all OFF. ──
  const { data: switchRows, error: switchErr } = await supabase
    .from("agent_switches")
    .select("agent, enabled, model");
  const switchesMissing = !!switchErr;
  const switchMap: Record<string, boolean> = {};
  const modelMap: Record<string, string | null> = {};
  for (const s of switchRows ?? []) {
    switchMap[s.agent as string] = s.enabled === true;
    modelMap[s.agent as string] = (s.model as string | null) ?? null;
  }
  const anyAgentOn = PARTNER_AGENTS.some((a) => switchMap[a]);
  // Resolve effective model (stored value, or per-agent default).
  const modelFor = (agent: string): string =>
    modelMap[agent] ?? AGENT_MODEL_DEFAULTS[agent] ?? "claude-sonnet-4-6";
  const scoutModel = modelFor("scout");
  const dossierModel = modelFor("dossier-enrich");

  const AGENT_META: Record<string, { label: string; cadence: string; desc: string; confirm: string }> = {
    followup: {
      label: "Follow-up ladder",
      cadence: "hourly",
      desc: "Drafts +4d / +9d follow-ups for contacted-but-silent candidates. Halts when you move a candidate off 'contacted' — do that when they reply. Drafts only — you approve.",
      confirm: "Start the follow-up ladder? It will draft follow-ups for contacted candidates (drafts only — you approve each).",
    },
    usher: {
      label: "Usher",
      cadence: "every 30 min",
      desc: "Runs workshop logistics — reminders and the replay window — for workshops you've scheduled.",
      confirm: "Start Usher? It will run logistics for any scheduled workshops.",
    },
    almanac: {
      label: "Almanac",
      cadence: "daily 7am ET",
      desc: "Emails you the morning standup digest of what's waiting in the tower.",
      confirm: "Start Almanac? It will email you a daily standup digest.",
    },
    "contact-finder": {
      label: "Contact finder",
      cadence: "every 5 min (8 rows/tick)",
      desc: "Runs enriched candidates through BetterContact's waterfall to find their email, chips the map, and adds verified addresses to the contact path. Accepts stay instant — the email fills in within ~5 min. BetterContact bills per email found.",
      confirm: "Start Contact finder? It spends ~1 BetterContact credit per email found (not per attempt) across your enriched candidates. Turn it off anytime to stop spending.",
    },
  };

  // Failed sends count as waiting-on-you (Release → re-approve fixes them);
  // held and queued rows don't — held is deliberate, queued is in flight.
  const decisionCount =
    brightSignals.length +
    drafts.length +
    fitCalls.length +
    payoutAffiliates.length +
    shelf.filter((s) => s.status === "failed").length;

  // ── Styles ──
  const sectionLabel: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: "11px",
    letterSpacing: ".26em",
    textTransform: "uppercase",
    color: MUTED,
    margin: "0 0 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };
  const card: React.CSSProperties = {
    border: `1px solid ${LIGHT}`,
    background: "#FFFFFF",
    padding: "18px 20px",
    marginBottom: "12px",
  };
  const tierChip = (tier: string): React.CSSProperties => ({
    fontFamily: MONO,
    fontSize: "9px",
    letterSpacing: ".18em",
    textTransform: "uppercase",
    padding: "2px 7px",
    color: tier === "cold" ? CRIMSON : MUTED,
    border: `1px solid ${tier === "cold" ? CRIMSON : LIGHT}`,
  });

  return (
    <div>
      {/* ── Identity + status strip ── */}
      <p
        style={{
          fontFamily: MONO,
          fontSize: "10px",
          letterSpacing: ".3em",
          textTransform: "uppercase",
          color: CRIMSON,
          margin: "0 0 6px",
        }}
      >
        Control Tower · Partnerships · Live
      </p>

      {/* ── The blaring signal: today's spend vs the $10 wall ── */}
      <SpendMeter spentUsd={spentUsd} emailCredits={emailCredits} ledgerBroken={ledgerBroken} />
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "32px",
          paddingBottom: "20px",
          borderBottom: `1px solid ${LIGHT}`,
        }}
      >
        <h1
          style={{
            fontFamily: DISPLAY,
            fontSize: "32px",
            fontStyle: "italic",
            fontWeight: 700,
            margin: 0,
            color: INK,
          }}
        >
          {decisionLoadFailed
            ? "Some panels didn't load."
            : decisionCount === 0
              ? "All clear."
              : `${decisionCount} waiting on you.`}
        </h1>
      </div>

      {migrationMissing && (
        <div
          style={{
            ...card,
            borderColor: CRIMSON,
            background: "#FBF3F3",
            fontFamily: SERIF,
            fontSize: "14px",
            color: INK,
          }}
        >
          <strong style={{ color: CRIMSON }}>Migration pending.</strong> Apply{" "}
          <code style={{ fontFamily: MONO, fontSize: "12px" }}>
            supabase/migrations/20260606_tower_signal_handling.sql
          </code>{" "}
          to enable the signal board (partner_signals.handled_at).
        </div>
      )}

      {decisionLoadFailed && (
        <div
          style={{
            ...card,
            borderColor: CRIMSON,
            background: "#FBF3F3",
            fontFamily: SERIF,
            fontSize: "14px",
            color: INK,
          }}
        >
          <strong style={{ color: CRIMSON }}>Some panels didn&rsquo;t load.</strong>{" "}
          A draft- or payout-queue query errored, so the &ldquo;waiting on
          you&rdquo; count below is incomplete &mdash; treat it as partial, not
          empty, and reload to retry.
        </div>
      )}

      {/* ════ AGENT CONTROLS (the levers) ════ */}
      <section style={{ marginBottom: "52px" }}>
        <p style={sectionLabel}>
          <span>Agent Controls</span>
          <Hint tip="Each lever starts or pauses one agent's scheduled run. Research, drafting, and sending are manual-only — the buttons in each candidate's room. These levers cover the support agents: almanac (a digest email to you), follow-up ladder (drafts nudges), contact finder (emails), usher (workshop logistics). Pausing is instant and always safe." />
          <span style={{ flex: 1, height: 1, background: LIGHT }} />
        </p>
        {switchesMissing ? (
          <div style={{ ...card, borderColor: CRIMSON, background: "#FBF3F3", fontFamily: SERIF, fontSize: "14px" }}>
            <strong style={{ color: CRIMSON }}>Controls not active yet.</strong> Apply{" "}
            <code style={{ fontFamily: MONO, fontSize: "12px" }}>supabase/migrations/20260609_agent_switches.sql</code>{" "}
            to turn on the levers. Until then every agent is <strong>paused</strong> (the crons fail safe to OFF), so nothing is running.
          </div>
        ) : (
          <div style={{ ...card }}>
            <p style={{ fontFamily: SERIF, fontSize: "14px", color: anyAgentOn ? INK : MUTED, margin: "0 0 12px", fontStyle: anyAgentOn ? "normal" : "italic" }}>
              {anyAgentOn
                ? "Some agents are running. Each does only what its line says; pause any one instantly."
                : "Everything is paused. Nothing runs until you Start a lever — and the drafting agents only ever produce drafts you approve."}
            </p>
            {PARTNER_AGENTS.map((a) => {
              const m = AGENT_META[a];
              return (
                <AgentLever
                  key={a}
                  agent={a}
                  label={m.label}
                  cadence={m.cadence}
                  desc={m.desc}
                  enabled={!!switchMap[a]}
                  startConfirm={m.confirm}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* ════ SCOUT & ENRICH (Option-2 buttons + sourced-row review) ════ */}
      <section style={{ marginBottom: "52px" }}>
        <p style={sectionLabel}>
          <span>Scout &amp; Enrich</span>
          <Hint tip="Start here when the pipeline is thin. Run a sweep, review each card below, Accept the good ones. An accepted candidate moves to the map's Enriched column and gets a room — Run brief and Scribe draft live there. Then your next stop is Decisions, once drafts appear." />
          <span style={{ flex: 1, height: 1, background: LIGHT }} />
          <Link href="/admin/tower/pipeline" className={twr.lnk} style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".16em", color: CRIMSON }}>
            open the map →
          </Link>
          <Link href="/admin/tower/pipeline#passed" className={twr.lnk} style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".16em", color: MUTED, marginLeft: "12px" }}>
            the bin · {(pipeCounts["passed"] ?? 0) + (pipeCounts["cold"] ?? 0)} →
          </Link>
        </p>
        {promotedId && (
          <div style={{ ...card, borderLeft: `3px solid ${INK}`, marginBottom: "16px" }}>
            <p style={{ fontFamily: SERIF, fontSize: "13.5px", color: INK, margin: 0 }}>
              <strong>{promotedName || "Candidate"}</strong> moved to Research —{" "}
              <Link href={`/admin/tower/candidate/${promotedId}`} className={twr.lnk} style={{ color: CRIMSON }}>
                open their room →
              </Link>
            </p>
          </div>
        )}
        {sweepError && (
          <div style={{ ...card, borderLeft: `3px solid ${CRIMSON}`, marginBottom: "16px" }}>
            <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: CRIMSON, display: "block", marginBottom: "6px" }}>
              Sweep failed
            </span>
            <p style={{ fontFamily: MONO, fontSize: "12.5px", lineHeight: 1.6, color: INK, margin: "0 0 6px", wordBreak: "break-word" }}>
              {sweepError}
            </p>
            <p style={{ fontFamily: SERIF, fontSize: "13px", fontStyle: "italic", color: MUTED, margin: 0 }}>
              Nothing was inserted. Fix the cause above, then run the sweep again.
            </p>
          </div>
        )}
        {sweepOk !== null && (
          <div style={{ ...card, borderLeft: `3px solid ${INK}`, marginBottom: "16px" }}>
            <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: INK, display: "block", marginBottom: "6px" }}>
              Sweep complete
            </span>
            <p style={{ fontFamily: SERIF, fontSize: "13.5px", lineHeight: 1.55, color: INK, margin: 0 }}>
              {sweepOk > 0
                ? `${sweepOk} new candidate${sweepOk > 1 ? "s" : ""} at 'sourced' — review below.${sweepSeen > sweepOk ? ` ${sweepSeen - sweepOk} already in the pipeline, skipped.` : ""}`
                : sweepSeen > 0
                  ? `All ${sweepSeen} candidates were already in the pipeline — nothing new to review.`
                  : "The reply didn't parse into candidates. Run the sweep again — this is usually a one-off."}
            </p>
          </div>
        )}
        {/* The candidate path — what each button in this section actually moves. */}
        <div style={{ ...card, marginBottom: "16px" }}>
          <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "10px" }}>
            The path a candidate takes
          </span>
          <div className={twr.flow}>
            <span className={twr.flowStatus}>sourced</span>
            <span className={twr.flowMove}>→ <b className={twr.flowYou}>you: Accept &amp; prepare</b> (brief + email hunt run for you) →</span>
            <span className={twr.flowStatus}>enriched</span>
            <span className={twr.flowMove}>→ <b className={twr.flowYou}>you: fit call</b> (the score is advisory — Fits drafts them, Doesn&rsquo;t fit bins them) →</span>
            <span className={twr.flowStatus}>ready</span>
            <span className={twr.flowMove}>→ <b className={twr.flowYou}>you: edit + Ready</b> →</span>
            <span className={twr.flowStatus}>approved</span>
            <span className={twr.flowMove}>→ <b className={twr.flowYou}>you: Send now</b> →</span>
            <span className={twr.flowStatus}>contacted</span>
            <span className={twr.flowMove}>→ they answer → <b className={twr.flowYou}>you: hands off</b> →</span>
            <span className={twr.flowStatus}>replied</span>
          </div>
          <p style={{ fontFamily: SERIF, fontSize: "12.5px", fontStyle: "italic", color: MUTED, margin: "10px 0 0" }}>
            Each chip is a value in the row&apos;s <code>status</code> column. One big button does the machine work (capped by the $10 wall above); every judgment — fit, edit, send — is yours. The follow-up ladder (a lever above) queues +4d/+9d nudge drafts for contacted-but-silent candidates and halts the moment you mark them replied; even its drafts wait for your approve.
          </p>
        </div>
        <div style={{ ...card, marginBottom: "16px" }}>
          <p style={{ fontFamily: SERIF, fontSize: "14px", color: INK, margin: "0 0 4px" }}>
            <strong>Run a sweep.</strong> Each press has Claude search the live web and drop ~12–15 verified candidates into the pipeline at <code>status=&apos;sourced&apos;</code> for you to review. Spends API tokens + web searches (~$0.50–$2.50 per sweep on Sonnet 4.6).
          </p>
          <p style={{ fontFamily: SERIF, fontSize: "13px", color: MUTED, fontStyle: "italic", margin: "0 0 14px" }}>
            Nothing moves past sourced until you click <strong>Accept</strong> on each row.
          </p>
          <div style={{ marginBottom: "12px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <ModelSelector agent="scout" current={scoutModel} label="Sweep model:" />
            <ModelSelector agent="dossier-enrich" current={dossierModel} label="Brief model:" />
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <ScoutSweepButton sweep="communities" label="Sweep 1 · Paid communities" />
            <ScoutSweepButton sweep="newsletters_podcasts" label="Sweep 2 · Newsletters + podcasts" />
            <ScoutSweepButton sweep="practitioners" label="Sweep 3 · Practitioner figures" />
          </div>
        </div>

        {sourced.length > 0 && (
          <div>
            <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: INK, display: "block", marginBottom: "6px" }}>
              {sourced.length} candidate{sourced.length > 1 ? "s" : ""} awaiting review
            </span>
            <p style={{ fontFamily: SERIF, fontSize: "12.5px", fontStyle: "italic", color: MUTED, margin: "0 0 10px" }}>
              Accept changes one database cell — the row&apos;s status, <code>sourced → enriched</code> — which is the research queue that Run brief and Scribe draft work from. Reject parks the row at <code>passed</code>; nothing is deleted.
            </p>
            {sourced.map((s) => (
              <div key={s.id} style={card}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <Link href={`/admin/tower/candidate/${s.id}`} className={twr.lnk} style={{ fontFamily: SERIF, fontSize: "16px", fontWeight: 600, color: INK }}>
                    {s.name}
                  </Link>
                  <span style={{ fontFamily: MONO, fontSize: "11px", color: MUTED }}>{s.surface ?? ""}</span>
                  <span style={{ fontFamily: MONO, fontSize: "11px", color: MUTED }}>vf {s.voice_fit ?? "—"}</span>
                  <span style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, marginLeft: "auto" }}>{s.source_agent}</span>
                </div>
                {s.handle && (
                  <p style={{ fontFamily: MONO, fontSize: "12px", color: MUTED, margin: "0 0 4px" }}>{s.handle}</p>
                )}
                {s.why_fit && (
                  <p style={{ fontFamily: SERIF, fontSize: "13.5px", lineHeight: 1.55, color: INK, margin: "0 0 6px" }}>{s.why_fit}</p>
                )}
                {s.contact_path && (
                  <p style={{ fontFamily: MONO, fontSize: "11.5px", color: "#8B1A1A", margin: "0 0 10px" }}>
                    {s.contact_path}{" "}
                    <ContactLinks text={s.contact_path} searchHint={`${s.name} ${s.surface ?? ""}`} />
                  </p>
                )}
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <AcceptPrepareButton
                    candidateId={s.id as string}
                    label="Accept & prepare · ~$0.60"
                    postPath="/api/admin/accept-and-prepare"
                    confirmText={`Accept ${s.name} and prepare them? Research brief + email hunt run in the background (~2 min, ~$0.15–$0.60 + 1 email credit if an address is found). Drafting waits for your fit call.`}
                    confirmLabel="Accept & prepare"
                    busyLabel="Preparing…"
                    variant="primary"
                  />
                  <form action={rejectSourced}>
                    <input type="hidden" name="id" value={s.id} />
                    <TowerButton variant="ghost" pendingLabel="Rejecting…">Reject</TowerButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ════ DECISIONS ════ */}
      <section style={{ marginBottom: "52px" }}>
        <p style={sectionLabel}>
          <span>Decisions</span>
          <Hint tip="The only place anything leaves the building. Fit calls come first — the machine scored, you decide who gets drafted. Then the draft house: Ready arms a reviewed draft (it lights green); Send then emails it immediately. Hold pulls it back; manual rows you deliver yourself and then Mark sent. Empty lane means nothing needs you." />
          <span style={{ flex: 1, height: 1, background: LIGHT }} />
        </p>

        {/* Fit calls — research done, drafting waits on you (founder 2026-07-07:
            the machine scores voice-fit; the human decides who fits). */}
        {fitCalls.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: INK, display: "block", marginBottom: "10px" }}>
              {fitCalls.length} fit call{fitCalls.length > 1 ? "s" : ""} — you decide who gets drafted
            </span>
            {fitCalls.map((f) => (
              <div key={f.id} style={{ ...card, border: `2px solid ${CRIMSON}` }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <span style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 900, fontSize: "30px", lineHeight: 1, color: INK }}>
                    {f.voice_fit ?? "—"}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".14em", textTransform: "uppercase", color: MUTED }}>
                    / 5 · machine score — advisory only
                  </span>
                  <Link href={`/admin/tower/candidate/${f.id}`} className={twr.lnk} style={{ fontFamily: SERIF, fontSize: "16px", fontWeight: 600, color: INK, marginLeft: "auto" }}>
                    {f.name}
                  </Link>
                  <span style={{ fontFamily: MONO, fontSize: "11px", color: MUTED }}>{f.surface ?? ""}</span>
                  {!extractEmail(f.contact_path) && (
                    <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", color: "#FFFFFF", background: CRIMSON, padding: "4px 8px" }}>
                      no email — drafts to manual channel
                    </span>
                  )}
                </div>
                {f.dossier_brief?.first_touch_angle && (
                  <p style={{ fontFamily: SERIF, fontSize: "13.5px", lineHeight: 1.5, color: MUTED, margin: "0 0 10px" }}>
                    {f.dossier_brief.first_touch_angle}
                    {f.dossier_brief.verdict && (
                      <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".1em", color: CRIMSON }}>
                        {" "}· the call: {String(f.dossier_brief.verdict).replace(/_/g, " ")}
                      </span>
                    )}
                  </p>
                )}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <form action={draftNow}>
                    <input type="hidden" name="id" value={f.id} />
                    <TowerButton pendingLabel="Drafting…">Fits — draft them</TowerButton>
                  </form>
                  <form action={rejectSourced}>
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="return_to" value="/admin/tower" />
                    <TowerButton variant="ghost" pendingLabel="Binning…">Doesn&rsquo;t fit — bin</TowerButton>
                  </form>
                  <Link href={`/admin/tower/candidate/${f.id}`} className={twr.lnk} style={{ fontFamily: MONO, fontSize: "11px", color: CRIMSON, alignSelf: "center" }}>
                    read the brief →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Drafts ready to send — the draft house */}
        {drafts.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: INK }}>
                {drafts.length} draft{drafts.length > 1 ? "s" : ""} in the house
              </span>
              {emailReadyCount > 1 && (
                <form action={approveAllReady}>
                  <TowerButton pendingLabel="Arming all…">
                    Ready all {emailReadyCount} email
                  </TowerButton>
                </form>
              )}
            </div>
            {drafts.map((d) => {
              const channel = d.send_channel ?? "email";
              const isManual = channel === "manual";
              const isArmed = !isManual && d.status === "approved";
              return (
                <div
                  key={d.id}
                  style={isArmed ? { ...card, borderLeft: "3px solid #2E7D32" } : card}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <span style={tierChip(d.tier)}>{d.tier}</span>
                    <span style={{ ...tierChip(isManual ? "cold" : "ok"), color: isManual ? "#a14400" : MUTED, borderColor: isManual ? "#e6c9a8" : LIGHT }}>
                      {isManual ? "manual send" : "email"}
                    </span>
                    {d.warden_cleared ? (
                      <span style={{ ...tierChip("ok"), color: "#2E7D32", borderColor: "#CDE7CE" }}>clean — skim &amp; send</span>
                    ) : (
                      <span style={{ ...tierChip("cold"), color: "#a14400", borderColor: "#a14400", fontWeight: 700 }}>needs your edit</span>
                    )}
                    {!isManual && suppressedSet.has(d.to_addr.toLowerCase()) && (
                      <span style={{ ...tierChip("cold"), color: "#FFFFFF", background: CRIMSON, borderColor: CRIMSON, fontWeight: 700 }}>
                        suppressed — will never send
                      </span>
                    )}
                    {isArmed && (
                      <span style={{ ...tierChip("ok"), color: "#2E7D32", borderColor: "#2E7D32", fontWeight: 700 }}>
                        ● armed
                      </span>
                    )}
                    <span style={{ fontFamily: MONO, fontSize: "12px", color: MUTED, marginLeft: "auto" }}>
                      → {d.to_addr}
                    </span>
                    {d.related_pipeline_id && (
                      <Link href={`/admin/tower/candidate/${d.related_pipeline_id}`} className={twr.lnk} style={{ fontFamily: MONO, fontSize: "11px", color: CRIMSON }}>
                        their room →
                      </Link>
                    )}
                  </div>
                  {(d.send_channel ?? "email") === "manual" && (
                    <p style={{ fontFamily: MONO, fontSize: "11px", color: MUTED, margin: "0 0 8px" }}>
                      deliver it yourself, then Mark sent:{" "}
                      <ContactLinks text={d.to_addr} />
                    </p>
                  )}
                  <p style={{ fontFamily: SERIF, fontSize: "16px", fontWeight: 600, margin: "0 0 6px", color: INK }}>
                    {d.subject}
                  </p>
                  <p style={{ fontFamily: SERIF, fontSize: "14px", lineHeight: 1.6, color: MUTED, margin: "0 0 10px", whiteSpace: "pre-wrap" }}>
                    {d.body.length > 360 ? d.body.slice(0, 360) + "…" : d.body}
                  </p>

                  {d.personalization_note && (
                    <p style={{ fontFamily: MONO, fontSize: "11px", lineHeight: 1.5, color: "#a14400", background: "rgba(161,68,0,.06)", borderLeft: "2px solid #a14400", padding: "8px 10px", margin: "0 0 12px" }}>
                      {d.personalization_note}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {isManual ? (
                      <form action={markManualSent}>
                        <input type="hidden" name="id" value={d.id} />
                        <TowerButton pendingLabel="Marking…">Mark sent</TowerButton>
                      </form>
                    ) : isArmed ? (
                      <form action={sendNow}>
                        <input type="hidden" name="id" value={d.id} />
                        <TowerButton
                          pendingLabel="Sending…"
                          confirmMessage={`Send this email to ${d.to_addr} now? It goes out immediately and can't be undone.`}
                        >
                          Send now
                        </TowerButton>
                      </form>
                    ) : (
                      <form action={approveDraft}>
                        <input type="hidden" name="id" value={d.id} />
                        <TowerButton pendingLabel="Marking ready…">Ready</TowerButton>
                      </form>
                    )}
                    <form action={holdDraft}>
                      <input type="hidden" name="id" value={d.id} />
                      <TowerButton variant="ghost" pendingLabel="Holding…">Hold</TowerButton>
                    </form>
                  </div>

                  {/* Inline editor — the tower as draft house */}
                  <details style={{ marginTop: "10px" }}>
                    <summary style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".14em", textTransform: "uppercase", color: CRIMSON, cursor: "pointer" }}>
                      ✎ Edit subject &amp; body
                    </summary>
                    <form action={editDraft} style={{ marginTop: "10px" }}>
                      <input type="hidden" name="id" value={d.id} />
                      <input
                        name="subject"
                        defaultValue={d.subject}
                        style={{ width: "100%", fontFamily: SERIF, fontSize: "14px", padding: "8px 10px", border: `1px solid ${LIGHT}`, marginBottom: "8px", color: INK, background: "#fff" }}
                      />
                      <textarea
                        name="body"
                        defaultValue={d.body}
                        rows={10}
                        style={{ width: "100%", fontFamily: SERIF, fontSize: "14px", lineHeight: 1.6, padding: "10px", border: `1px solid ${LIGHT}`, color: INK, background: "#fff", resize: "vertical" }}
                      />
                      <TowerButton variant="ghost" pendingLabel="Checking…" style={{ marginTop: "8px" }}>
                        Save &amp; re-check canon
                      </TowerButton>
                    </form>
                  </details>
                </div>
              );
            })}
          </div>
        )}

        {/* The shelf — approved (queued), held, and failed drafts. Nothing on
            it needs composing; it's where drafts wait, by state. */}
        {shelf.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: INK, display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              On the shelf · {shelf.length}
              <Hint tip="Drafts parked off the send path. Held = you pulled it back; Release returns it to the house. Failed = the send errored; Release re-readies it for another Ready + Send." />
            </span>
            {shelf.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", padding: "8px 0", borderBottom: `1px solid ${LIGHT}` }}>
                <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", color: s.status === "failed" ? CRIMSON : s.status === "held" ? "#a14400" : MUTED, border: `1px solid currentcolor`, padding: "1px 7px", whiteSpace: "nowrap" }}>
                  {s.status}
                </span>
                <span style={{ fontFamily: SERIF, fontSize: "13.5px", color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "320px" }}>
                  {s.subject}
                </span>
                <span style={{ fontFamily: MONO, fontSize: "11px", color: MUTED }}>→ {s.to_addr}</span>
                {s.status === "failed" && s.error && (
                  <span style={{ fontFamily: MONO, fontSize: "10.5px", color: CRIMSON }}>{s.error.slice(0, 80)}</span>
                )}
                <span style={{ marginLeft: "auto", display: "flex", gap: "10px", alignItems: "center" }}>
                  {s.related_pipeline_id && (
                    <Link href={`/admin/tower/candidate/${s.related_pipeline_id}`} className={twr.lnk} style={{ fontFamily: MONO, fontSize: "11px", color: CRIMSON }}>
                      their room →
                    </Link>
                  )}
                  {(s.status === "held" || s.status === "failed") && (
                    <form action={releaseDraft}>
                      <input type="hidden" name="id" value={s.id} />
                      <TowerButton variant="ghost" pendingLabel="Releasing…">Release</TowerButton>
                    </form>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Bright signals */}
        {brightSignals.length > 0 && (
          <div style={{ marginBottom: "8px" }}>
            <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: INK, display: "block", marginBottom: "10px" }}>
              {brightSignals.length} bright signal{brightSignals.length > 1 ? "s" : ""}
            </span>
            {brightSignals.map((s) => (
              <div key={s.id} style={{ ...card, borderLeft: `3px solid ${CRIMSON}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ ...tierChip("cold") }}>{s.signal_type.replace(/_/g, " ")}</span>
                  <span style={{ fontFamily: MONO, fontSize: "11px", color: MUTED }}>{s.source}</span>
                  <span style={{ fontFamily: MONO, fontSize: "11px", color: MUTED, marginLeft: "auto" }}>
                    {timeAgo(s.created_at)}
                  </span>
                </div>
                <p style={{ fontFamily: SERIF, fontSize: "15px", lineHeight: 1.5, color: INK, margin: "0 0 14px" }}>
                  {s.summary || "(signal)"}
                </p>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <form action={handleSignal}>
                    <input type="hidden" name="id" value={s.id} />
                    <TowerButton variant="ghost" pendingLabel="Clearing…">Mark handled</TowerButton>
                  </form>
                  {looksLikeEmail(s.source) && (
                    <a href={inboxSearchUrl(s.source)} target="_blank" rel="noreferrer" className={twr.lnk} style={{ fontFamily: MONO, fontSize: "11px", color: CRIMSON }}>
                      open in your inbox ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payouts — the money gate */}
        {payoutAffiliates.length > 0 && (
          <div style={{ marginBottom: "8px" }}>
            <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: INK, display: "block", marginBottom: "4px" }}>
              Payouts ready · {usd(payoutTotalCents)} cleared &amp; unpaid
            </span>
            <p style={{ fontFamily: SERIF, fontSize: "13px", color: MUTED, fontStyle: "italic", margin: "0 0 10px" }}>
              This is the dry-run. Review the numbers — money review has no clock.
              Each <strong>Pay</strong> runs a real Stripe Connect transfer and
              emails the affiliate.
            </p>
            {payoutAffiliates.map((a) => {
              const enabled = a.stripe_account_status === "enabled";
              return (
                <div key={a.id} style={{ ...card, borderLeft: `3px solid #2E7D32` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: SERIF, fontSize: "16px", fontWeight: 600, color: INK }}>
                      {a.display_name}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: "12px", color: MUTED }}>
                      {a.count} cleared item{a.count > 1 ? "s" : ""}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: "16px", fontWeight: 700, color: "#2E7D32", marginLeft: "auto" }}>
                      {usd(a.cents)}
                    </span>
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    <PayoutButton affiliateId={a.id} amountLabel={usd(a.cents)} enabled={enabled} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {decisionCount === 0 && !migrationMissing && (
          <p style={{ fontFamily: SERIF, fontSize: "15px", color: MUTED, fontStyle: "italic", margin: 0 }}>
            Nothing waiting on you. The tower handled everything that was safe to
            handle.
          </p>
        )}
      </section>

      {/* ════ BOARD ════ */}
      <section>
        <p style={sectionLabel}>
          <span>Board</span>
          <Hint tip="Read-only situational awareness — nothing here needs a click. Each pipeline stage is a door: click it to open the map at that column." />
          <span style={{ flex: 1, height: 1, background: LIGHT }} />
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {/* Pipeline by stage */}
          <div style={card}>
            <p style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: MUTED, margin: "0 0 14px" }}>
              Pipeline
            </p>
            {Object.keys(pipeCounts).length === 0 ? (
              <p style={{ fontFamily: SERIF, fontSize: "14px", color: MUTED, fontStyle: "italic", margin: 0 }}>
                No candidates yet — run scout.
              </p>
            ) : (
              ["sourced", "enriched", "contacted", "replied", "call_booked", "negotiating", "activated", "passed", "cold"]
                .filter((st) => pipeCounts[st])
                .map((st) => (
                  <div key={st} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${LIGHT}` }}>
                    <Link href={`/admin/tower/pipeline#${st}`} className={twr.lnk} style={{ fontFamily: MONO, fontSize: "12px", color: INK }}>
                      {st.replace(/_/g, " ")}
                    </Link>
                    <span style={{ fontFamily: MONO, fontSize: "12px", fontWeight: 700, color: CRIMSON }}>{pipeCounts[st]}</span>
                  </div>
                ))
            )}
          </div>

          {/* Recent sends */}
          <div style={card}>
            <p style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: MUTED, margin: "0 0 14px" }}>
              Courier — recent sends
            </p>
            {(recentSent ?? []).length === 0 ? (
              <p style={{ fontFamily: SERIF, fontSize: "14px", color: MUTED, fontStyle: "italic", margin: 0 }}>
                Nothing sent yet.
              </p>
            ) : (
              (recentSent ?? []).map((s, i) => (
                <div key={i} style={{ padding: "5px 0", borderBottom: `1px solid ${LIGHT}` }}>
                  <div style={{ fontFamily: SERIF, fontSize: "13px", color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.subject}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: "10px", color: MUTED }}>
                    {s.to_addr} · {timeAgo(s.sent_at)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Soft signals (noise-adjacent, no action required) */}
          <div style={card}>
            <p style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: MUTED, margin: "0 0 14px" }}>
              Soft signals
            </p>
            {softSignals.length === 0 ? (
              <p style={{ fontFamily: SERIF, fontSize: "14px", color: MUTED, fontStyle: "italic", margin: 0 }}>
                Quiet.
              </p>
            ) : (
              softSignals.map((s) => (
                <div key={s.id} style={{ padding: "6px 0", borderBottom: `1px solid ${LIGHT}` }}>
                  <span style={{ fontFamily: SERIF, fontSize: "13px", color: INK }}>{s.summary}</span>
                  <span style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, display: "block" }}>{timeAgo(s.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
