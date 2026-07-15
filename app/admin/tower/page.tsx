export const dynamic = "force-dynamic";
// Scout sweeps post to this page and run a live web_search loop that emits
// 12-15 candidates (self-capped at SCOUT_BUDGET_MS, 150s) — and since the
// warren consolidation, the same invocation continues in after() to run the
// whole catch's briefs + email hunts in parallel (≈ one brief's duration,
// 60–120s). 300 is Pro's ceiling and covers sweep + the after() batch.
export const maxDuration = 300;

import Link from "next/link";

import { createAdminClient } from "@/utils/supabase/admin";
import {
  approveDraft,
  sendNow,
  approveAllReady,
  releaseDraft,
  markManualSent,
} from "./actions";
import PayoutButton from "./PayoutButton";
import AgentLever from "./AgentLever";
import ScoutSweepButton from "./ScoutSweepButton";
import ModelSelector from "./ModelSelector";
import TowerButton from "./TowerButton";
import Hint from "./Hint";
import twr from "./tower.module.css";
import { rejectSourced, draftNow, markReplied, resumeOutreach } from "./actions";
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
 * The ledger (founder pick 2026-07-07, second-pass triptych): the tower is ONE
 * thin table of every working candidate, sorted so rows whose next move is
 * YOURS float to the top and rows waiting on the world sink. Stage is a
 * column, not a section. Everything that used to be a section is now either a
 * row group, a conditional block (payouts / shelf, only when nonempty), or a
 * line in the machinery drawer at the bottom.
 *
 * Deliberately gone (same founder pass): the signal lanes (nothing writes
 * partner_signals since sentinel was deleted — bright alerts arrive by email),
 * the Board (the side rail carries the counts), the flow diagram, the
 * agent-controls essay, and the in-header roster/bin links.
 */

// ── Palette (literal hex, matching app/admin/layout.tsx) ──
const INK = "#1A1A1A";
const CRIMSON = "#8B1A1A";
const MUTED = "#6B6B6B";
const LIGHT = "#E8E4DF";
const MONO = "'Space Mono', monospace";
const DISPLAY = "'Playfair Display', Georgia, serif";
const SERIF = "'Source Serif 4', Georgia, serif";

// Thin-row button sizing — the ledger's rows are ~30px; the default .btn
// padding would double that.
const THIN: React.CSSProperties = { padding: "3px 10px", fontSize: "11px", letterSpacing: ".1em" };

function daysAgo(iso: string | null): string {
  if (!iso) return "—";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return d < 1 ? "today" : `${d}d`;
}

export default async function TowerPage({
  searchParams,
}: {
  searchParams: Promise<{
    sweep_ok?: string;
    sweep_seen?: string;
    sweep_error?: string;
  }>;
}) {
  // Sweep outcome, set by the action's redirect. Render-once feedback: it
  // lives in the URL, so a reload or navigation clears it.
  const sp = await searchParams;
  const sweepError = sp.sweep_error ?? null;
  const sweepOk = sp.sweep_ok != null ? Number(sp.sweep_ok) : null;
  const sweepSeen = sp.sweep_seen != null ? Number(sp.sweep_seen) : 0;

  const supabase = createAdminClient();

  // R5-EE-6: if a decision-feeding query fails, the "All clear." headline
  // would be a lie — surface a banner and suppress the all-clear copy instead.
  let decisionLoadFailed = false;

  // ── Every working candidate (the ledger's rows) ──
  const { data: pipeRows, error: pipeErr } = await supabase
    .from("partner_pipeline")
    .select("id, name, surface, voice_fit, status, why_fit, contact_path, first_touch_at, ladder_step, updated_at, dossier_brief")
    .in("status", ["sourced", "enriched", "contacted", "replied"])
    .eq("motion", "affiliate")
    .order("updated_at", { ascending: true })
    .limit(200);
  if (pipeErr) decisionLoadFailed = true;
  type PipeRow = {
    id: string;
    name: string;
    surface: string | null;
    voice_fit: number | null;
    status: string;
    why_fit: string | null;
    contact_path: string | null;
    first_touch_at: string | null;
    ladder_step: number | null;
    updated_at: string;
    dossier_brief: { verdict?: string | null; conflict?: string | null } | null;
  };
  const people = (pipeRows ?? []) as PipeRow[];
  const byId = new Map(people.map((p) => [p.id, p]));

  // ── Live drafts (ready/approved) — they turn their candidate's row into a
  //    draft-stage row with Ready / Send now / Mark sent inline. ──
  const { data: draftRows, error: draftErr } = await supabase
    .from("partner_outbound_queue")
    .select("*")
    .in("status", ["ready", "approved"])
    .order("send_after", { ascending: true })
    .limit(50);
  if (draftErr) decisionLoadFailed = true;
  type DraftRow = {
    id: string;
    to_addr: string;
    subject: string;
    status: string;
    warden_cleared: boolean;
    send_channel?: string | null;
    personalization_note?: string | null;
    related_pipeline_id?: string | null;
  };
  const drafts = (draftRows ?? []) as DraftRow[];
  const draftByPipeline = new Map<string, DraftRow>();
  for (const d of drafts) {
    if (d.related_pipeline_id && !draftByPipeline.has(d.related_pipeline_id)) {
      draftByPipeline.set(d.related_pipeline_id, d);
    }
  }
  const emailReadyCount = drafts.filter(
    (d) => (d.send_channel ?? "email") === "email" && d.status === "ready",
  ).length;
  const suppressedSet = await getSuppressedEmails(
    drafts.filter((d) => (d.send_channel ?? "email") === "email").map((d) => d.to_addr),
  );

  // ── The shelf: held + failed sends (visible only when nonempty). ──
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

  // ── Payouts (the money gate) — visible only when money is owed. ──
  const { data: clearedAttr, error: clearedAttrError } = await supabase
    .from("affiliate_attributions")
    .select("affiliate_slug, commission_amount_cents")
    .eq("status", "cleared")
    .is("paid_at", null);
  if (clearedAttrError) decisionLoadFailed = true;
  const payoutAgg: Record<string, { cents: number; count: number }> = {};
  for (const a of clearedAttr ?? []) {
    const slug = a.affiliate_slug as string | null;
    if (!slug) continue; // EE-12: never bucket null slugs
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
  const usd = (cents: number) =>
    `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ── Sent log (drawer) + roster/bin counts (side rail) ──
  const { data: recentSent } = await supabase
    .from("partner_sent_log")
    .select("to_addr, subject, tier, sent_at")
    .order("sent_at", { ascending: false })
    .limit(8);
  const { count: sentCount } = await supabase
    .from("partner_sent_log")
    .select("*", { count: "exact", head: true });
  const { data: allStatusRows } = await supabase.from("partner_pipeline").select("status");
  const pipeCounts: Record<string, number> = {};
  for (const r of allStatusRows ?? []) pipeCounts[r.status] = (pipeCounts[r.status] ?? 0) + 1;

  // ── Agent switches (drawer levers) + models (sweep row pickers) ──
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
  const modelFor = (agent: string): string =>
    modelMap[agent] ?? AGENT_MODEL_DEFAULTS[agent] ?? "claude-sonnet-4-6";

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
      desc: "Runs enriched candidates through BetterContact's waterfall to find their email, chips the roster, and adds verified addresses to the contact path. Accepts stay instant — the email fills in within ~5 min. BetterContact bills per email found.",
      confirm: "Start Contact finder? It spends ~1 BetterContact credit per email found (not per attempt) across your enriched candidates. Turn it off anytime to stop spending.",
    },
  };

  // ── The spend meter ──
  let spentUsd = 0;
  let ledgerBroken = false;
  try {
    spentUsd = await getTodaySpendUsd();
  } catch {
    ledgerBroken = true; // paid runs fail closed; say so instead of showing $0
  }
  const emailCredits = await getTodayEmailCredits();

  // ── Assemble the ledger's row groups (needs-you first, then the world) ──
  const hasBrief = (p: PipeRow) => (p.why_fit ?? "").includes("[dossier]");
  const hasAddr = (p: PipeRow) => Boolean(extractEmail(p.contact_path));

  const fitCalls = people.filter(
    (p) => p.status === "enriched" && hasBrief(p) && !draftByPipeline.has(p.id),
  );
  const draftPeople = people.filter((p) => draftByPipeline.has(p.id));
  const orphanDrafts = drafts.filter(
    (d) => !d.related_pipeline_id || !byId.has(d.related_pipeline_id),
  );
  const briefPending = people.filter(
    (p) => p.status === "enriched" && !hasBrief(p) && !draftByPipeline.has(p.id),
  );
  const sourced = people.filter((p) => p.status === "sourced");
  const contacted = people.filter((p) => p.status === "contacted");
  const inConvo = people.filter((p) => p.status === "replied");

  const needsYouCount =
    fitCalls.length + draftPeople.length + orphanDrafts.length + briefPending.length + sourced.length;
  const worldCount = contacted.length + inConvo.length;
  const decisionCount =
    fitCalls.length +
    drafts.length +
    payoutAffiliates.length +
    shelf.filter((s) => s.status === "failed").length;

  // Shared cell fragments
  const roomLink = (p: { id: string; name: string; why_fit?: string | null }) => (
    <Link
      href={`/admin/tower/candidate/${p.id}`}
      className={twr.lnk}
      title={(p.why_fit ?? "").slice(0, 300)}
    >
      {p.name}
    </Link>
  );
  const mailCell = (p: PipeRow) =>
    p.status === "sourced" && !hasAddr(p) ? (
      <span className={twr.tinychip}>?</span>
    ) : hasAddr(p) ? (
      <span className={`${twr.tinychip} ${twr.ok}`}>✉</span>
    ) : (
      <span className={`${twr.tinychip} ${twr.inkc}`}>DM</span>
    );

  const sectionLabel: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: "11px",
    letterSpacing: ".26em",
    textTransform: "uppercase",
    color: MUTED,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "34px 0 12px",
  };
  const card: React.CSSProperties = {
    border: `1px solid ${LIGHT}`,
    background: "#FFFFFF",
    padding: "14px 16px",
    marginBottom: "12px",
  };

  return (
    <div>
      {/* ── Identity strip ── */}
      <p style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".3em", textTransform: "uppercase", color: CRIMSON, margin: "0 0 6px" }}>
        Control Tower · Partnerships · Live
      </p>

      <SpendMeter spentUsd={spentUsd} emailCredits={emailCredits} ledgerBroken={ledgerBroken} />

      {/* ── Side rail: the doors, reachable at any scroll depth ── */}
      <nav className={twr.sideRail} aria-label="Tower shortcuts">
        <Link href="/admin/tower/pipeline" className={twr.sideRailLink}>
          The roster
          <span className={twr.sideRailCount}>
            {Object.entries(pipeCounts)
              .filter(([k]) => k !== "passed" && k !== "cold")
              .reduce((s, [, n]) => s + n, 0)}{" "}
            active
          </span>
        </Link>
        <Link href="/admin/tower/pipeline#passed" className={twr.sideRailLink}>
          The bin
          <span className={twr.sideRailCount}>
            {(pipeCounts["passed"] ?? 0) + (pipeCounts["cold"] ?? 0)} parked
          </span>
        </Link>
        <Link href="/admin/tower/sent" className={twr.sideRailLink}>
          The sent record
          <span className={twr.sideRailCount}>{sentCount ?? 0} sent</span>
        </Link>
      </nav>

      <div style={{ display: "flex", alignItems: "baseline", gap: "14px", flexWrap: "wrap", marginBottom: "22px", paddingBottom: "14px", borderBottom: `1px solid ${LIGHT}` }}>
        <h1 style={{ fontFamily: DISPLAY, fontSize: "30px", fontStyle: "italic", fontWeight: 700, margin: 0, color: INK }}>
          {decisionLoadFailed
            ? "Some rows didn't load."
            : decisionCount === 0
              ? "All clear."
              : `${decisionCount} waiting on you.`}
        </h1>
        <Hint tip="One table, every working candidate. Rows where the next move is yours are on top; rows waiting on the world sink. Names are doors to their rooms (hover a name for the why-fit). Accept & prepare runs research + email hunt (~$0.15–0.60); drafting waits for your fit call; Send now is the only sender." />
        {decisionLoadFailed && (
          <span style={{ fontFamily: SERIF, fontSize: "13px", color: CRIMSON }}>
            A query errored — treat the table as partial and reload.
          </span>
        )}
      </div>

      {sweepError && (
        <div style={{ ...card, borderColor: CRIMSON, background: "#FBF3F3", fontFamily: SERIF, fontSize: "13.5px" }}>
          <strong style={{ color: CRIMSON }}>Sweep failed.</strong> {sweepError}
        </div>
      )}
      {sweepOk != null && !sweepError && (
        <p style={{ fontFamily: SERIF, fontSize: "13.5px", color: INK, margin: "0 0 14px" }}>
          {sweepOk > 0
            ? `${sweepOk} new candidate${sweepOk > 1 ? "s" : ""} landed at the bottom of the ledger.${sweepSeen > sweepOk ? ` ${sweepSeen - sweepOk} already known, skipped.` : ""}`
            : "Sweep finished — nothing new that isn't already in the pipeline."}
        </p>
      )}

      {/* ════ THE LEDGER ════ */}
      {needsYouCount + worldCount === 0 ? (
        <p style={{ ...card, fontFamily: SERIF, fontSize: "14px", color: MUTED, fontStyle: "italic" }}>
          The ledger is empty — run a sweep below to fill it.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          {emailReadyCount > 1 && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
              <form action={approveAllReady}>
                <TowerButton pendingLabel="Arming all…" style={THIN}>
                  Ready all {emailReadyCount} email drafts
                </TowerButton>
              </form>
            </div>
          )}
          <table className={twr.ledger}>
            <thead>
              <tr>
                <th>candidate</th>
                <th>stage</th>
                <th>vf</th>
                <th>✉</th>
                <th>last touch</th>
                <th>waiting on</th>
                <th style={{ textAlign: "right" }}>act</th>
              </tr>
            </thead>
            <tbody>
              {needsYouCount > 0 && (
                <tr className={twr.sect}><td colSpan={7}>needs you · {needsYouCount}</td></tr>
              )}

              {/* 1 — fit calls. The "waiting on" cell leads with THE CALL
                  (the machine's verdict), not the voice-fit number — a 5/5
                  voice with a hard conflict is still a skip. */}
              {fitCalls.map((p) => {
                const v = p.dossier_brief?.verdict ?? null;
                const cf = p.dossier_brief?.conflict ?? null;
                const callWord = v === "reach_out" ? "reach out" : v === "skip" ? "SKIP" : v === "needs_research" ? "needs research" : "—";
                const callColor = v === "reach_out" ? "#2E7D32" : v === "skip" ? CRIMSON : MUTED;
                return (
                <tr key={p.id}>
                  <td className={twr.nm}>{roomLink(p)}</td>
                  <td className={twr.mo}>fit call</td>
                  <td className={twr.num}>{p.voice_fit ?? "—"}/5</td>
                  <td>{mailCell(p)}</td>
                  <td className={twr.num}>—</td>
                  <td className={twr.mo}>
                    <span style={{ color: callColor, fontWeight: 700 }}>{callWord}</span>
                    {(cf === "hard" || cf === "soft") && (
                      <span className={`${twr.tinychip} ${twr.warn}`} style={{ marginLeft: "6px" }}>conflict: {cf}</span>
                    )}
                  </td>
                  <td className={twr.act}>
                    <span style={{ display: "inline-flex", gap: "6px" }}>
                      <form action={draftNow} style={{ display: "inline" }}>
                        <input type="hidden" name="id" value={p.id} />
                        <TowerButton pendingLabel="Drafting…" style={THIN}>Fits</TowerButton>
                      </form>
                      <form action={rejectSourced} style={{ display: "inline" }}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="return_to" value="/admin/tower" />
                        <TowerButton variant="ghost" pendingLabel="Binning…" style={THIN}>Bin</TowerButton>
                      </form>
                    </span>
                  </td>
                </tr>
                );
              })}

              {/* 2 — drafts in the house */}
              {draftPeople.map((p) => {
                const d = draftByPipeline.get(p.id)!;
                const isManual = (d.send_channel ?? "email") === "manual";
                const isSuppressed = !isManual && suppressedSet.has(d.to_addr.toLowerCase());
                return (
                  <tr key={p.id}>
                    <td className={twr.nm}>{roomLink(p)}</td>
                    <td className={twr.mo}>draft</td>
                    <td className={twr.num}>{p.voice_fit ?? "—"}/5</td>
                    <td>{isManual ? <span className={`${twr.tinychip} ${twr.inkc}`}>DM</span> : <span className={`${twr.tinychip} ${twr.ok}`}>✉</span>}</td>
                    <td className={twr.num}>—</td>
                    <td className={twr.mo} title={d.personalization_note ?? undefined}>
                      {isSuppressed ? (
                        <span className={`${twr.tinychip} ${twr.warn}`}>suppressed — will never send</span>
                      ) : d.warden_cleared ? (
                        <span className={`${twr.tinychip} ${twr.ok}`}>clean — skim &amp; send</span>
                      ) : (
                        <span className={`${twr.tinychip} ${twr.warn}`}>needs your edit</span>
                      )}
                      {" "}
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "12px", color: MUTED }}>
                        “{d.subject.length > 44 ? d.subject.slice(0, 44) + "…" : d.subject}”
                      </span>
                    </td>
                    <td className={twr.act}>
                      <span style={{ display: "inline-flex", gap: "6px" }}>
                        {!d.warden_cleared && (
                          <Link href={`/admin/tower/candidate/${p.id}`} className={twr.lnk} style={{ fontFamily: MONO, fontSize: "10px", color: CRIMSON, alignSelf: "center" }}>
                            edit →
                          </Link>
                        )}
                        {isManual ? (
                          <form action={markManualSent} style={{ display: "inline" }}>
                            <input type="hidden" name="id" value={d.id} />
                            <TowerButton pendingLabel="Marking…" style={THIN}>Mark sent</TowerButton>
                          </form>
                        ) : d.status === "approved" ? (
                          <form action={sendNow} style={{ display: "inline" }}>
                            <input type="hidden" name="id" value={d.id} />
                            <TowerButton
                              pendingLabel="Sending…"
                              style={THIN}
                              confirmMessage={`Send this email to ${d.to_addr} now? It goes out immediately and can't be undone.`}
                            >
                              Send now
                            </TowerButton>
                          </form>
                        ) : (
                          <form action={approveDraft} style={{ display: "inline" }}>
                            <input type="hidden" name="id" value={d.id} />
                            <TowerButton pendingLabel="Arming…" style={THIN}>Ready</TowerButton>
                          </form>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {orphanDrafts.map((d) => (
                <tr key={d.id}>
                  <td className={twr.nm}>{d.to_addr}</td>
                  <td className={twr.mo}>draft</td>
                  <td className={twr.num}>—</td>
                  <td><span className={`${twr.tinychip} ${twr.ok}`}>✉</span></td>
                  <td className={twr.num}>—</td>
                  <td className={twr.mo}>{d.warden_cleared ? "clean" : "needs your edit"}</td>
                  <td className={twr.act}>
                    {d.status === "approved" ? (
                      <form action={sendNow} style={{ display: "inline" }}>
                        <input type="hidden" name="id" value={d.id} />
                        <TowerButton pendingLabel="Sending…" style={THIN} confirmMessage={`Send to ${d.to_addr} now?`}>Send now</TowerButton>
                      </form>
                    ) : (
                      <form action={approveDraft} style={{ display: "inline" }}>
                        <input type="hidden" name="id" value={d.id} />
                        <TowerButton pendingLabel="Arming…" style={THIN}>Ready</TowerButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}

              {/* 3 — accepted but the brief never landed */}
              {briefPending.map((p) => (
                <tr key={p.id}>
                  <td className={twr.nm}>{roomLink(p)}</td>
                  <td className={twr.mo}>research</td>
                  <td className={twr.num}>{p.voice_fit ?? "—"}/5</td>
                  <td>{mailCell(p)}</td>
                  <td className={twr.num}>—</td>
                  <td className={twr.mo}>a brief — run it from their room</td>
                  <td className={twr.act}>
                    <Link href={`/admin/tower/candidate/${p.id}`} className={twr.lnk} style={{ fontFamily: MONO, fontSize: "10px", color: CRIMSON }}>
                      run brief →
                    </Link>
                  </td>
                </tr>
              ))}

              {/* 4 — sourced, your review */}
              {sourced.map((p) => (
                <tr key={p.id}>
                  <td className={twr.nm}>{roomLink(p)}</td>
                  <td className={twr.mo}>sourced</td>
                  <td className={twr.num}>{p.voice_fit ?? "—"}/5</td>
                  <td>{mailCell(p)}</td>
                  <td className={twr.num}>—</td>
                  <td className={twr.mo}>{(p.surface ?? "").slice(0, 34) || "your review"}</td>
                  <td className={twr.act}>
                    <span style={{ display: "inline-flex", gap: "6px", alignItems: "flex-start" }}>
                      <AcceptPrepareButton
                        candidateId={p.id}
                        label="Accept & prep · ~$0.60"
                        postPath="/api/admin/accept-and-prepare"
                        confirmText={`Accept ${p.name} and prepare them? Research brief + email hunt run in the background (~2 min, ~$0.15–$0.60 + 1 email credit if an address is found). Drafting waits for your fit call.`}
                        confirmLabel="Accept & prepare"
                        busyLabel="Preparing…"
                        variant="primary"
                        roomHref={`/admin/tower/candidate/${p.id}`}
                        thin
                      />
                      <form action={rejectSourced} style={{ display: "inline" }}>
                        <input type="hidden" name="id" value={p.id} />
                        <TowerButton variant="ghost" pendingLabel="Rejecting…" style={THIN}>Reject</TowerButton>
                      </form>
                    </span>
                  </td>
                </tr>
              ))}

              {/* — waiting on the world — */}
              {worldCount > 0 && (
                <tr className={twr.sect}><td colSpan={7}>waiting on the world · {worldCount}</td></tr>
              )}
              {contacted.map((p) => (
                <tr key={p.id}>
                  <td className={twr.nm}>{roomLink(p)}</td>
                  <td className={twr.mo}>contacted</td>
                  <td className={twr.num}>{p.voice_fit ?? "—"}/5</td>
                  <td>{mailCell(p)}</td>
                  <td className={twr.num}>{daysAgo(p.first_touch_at)}</td>
                  <td className={twr.mo}>their reply · ladder {p.ladder_step ?? 0}</td>
                  <td className={twr.act}>
                    <form action={markReplied} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="return_to" value="/admin/tower" />
                      <TowerButton variant="ghost" pendingLabel="Marking…" style={THIN}>Replied</TowerButton>
                    </form>
                  </td>
                </tr>
              ))}
              {inConvo.map((p) => (
                <tr key={p.id}>
                  <td className={twr.nm}>{roomLink(p)}</td>
                  <td><span className={`${twr.tinychip} ${twr.inkc}`}>in convo</span></td>
                  <td className={twr.num}>{p.voice_fit ?? "—"}/5</td>
                  <td>{mailCell(p)}</td>
                  <td className={twr.num}>{daysAgo(p.updated_at)}</td>
                  <td className={twr.mo}>them — hands off</td>
                  <td className={twr.act}>
                    <form action={resumeOutreach} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="return_to" value="/admin/tower" />
                      <TowerButton variant="ghost" pendingLabel="Resuming…" style={THIN}>Resume</TowerButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ════ PAYOUTS — only when money is owed ════ */}
      {payoutAffiliates.length > 0 && (
        <section>
          <p style={sectionLabel}>
            <span>Payouts waiting · {usd(payoutAffiliates.reduce((s, a) => s + a.cents, 0))}</span>
            <Hint tip="Cleared, unpaid commission. Mark paid runs a real Stripe Connect transfer — it confirms first." />
            <span style={{ flex: 1, height: 1, background: LIGHT }} />
          </p>
          <table className={twr.ledger}>
            <tbody>
              {payoutAffiliates.map((a) => (
                <tr key={a.id}>
                  <td className={twr.nm}>{a.display_name}</td>
                  <td className={twr.mo}>{a.slug}</td>
                  <td className={twr.num}>{usd(a.cents)}</td>
                  <td className={twr.mo}>{a.count} sale{a.count === 1 ? "" : "s"}</td>
                  <td className={twr.act}>
                    <PayoutButton
                      affiliateId={a.id}
                      amountLabel={usd(a.cents)}
                      enabled={a.stripe_account_status === "active"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ════ THE SHELF — only when something is held or failed ════ */}
      {shelf.length > 0 && (
        <section>
          <p style={sectionLabel}>
            <span>On the shelf · {shelf.length}</span>
            <Hint tip="Drafts parked off the send path. Held = you pulled it back (or the suppression gate did); Release returns it to the ledger. Failed = the send errored; Release re-readies it." />
            <span style={{ flex: 1, height: 1, background: LIGHT }} />
          </p>
          <table className={twr.ledger}>
            <tbody>
              {shelf.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className={`${twr.tinychip} ${s.status === "failed" ? twr.warn : ""}`}>{s.status}</span>
                  </td>
                  <td className={twr.nm} style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis" }}>{s.subject}</td>
                  <td className={twr.mo}>→ {s.to_addr}</td>
                  <td className={twr.mo} style={{ color: CRIMSON }}>{s.error ? s.error.slice(0, 60) : ""}</td>
                  <td className={twr.act}>
                    <span style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                      {s.related_pipeline_id && (
                        <Link href={`/admin/tower/candidate/${s.related_pipeline_id}`} className={twr.lnk} style={{ fontFamily: MONO, fontSize: "10px", color: CRIMSON }}>
                          room →
                        </Link>
                      )}
                      <form action={releaseDraft} style={{ display: "inline" }}>
                        <input type="hidden" name="id" value={s.id} />
                        <TowerButton variant="ghost" pendingLabel="Releasing…" style={THIN}>Release</TowerButton>
                      </form>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ════ SWEEPS — one compact row ════ */}
      <section>
        <p style={sectionLabel}>
          <span>Sweeps</span>
          <Hint tip="Each press has Claude search the live web and drop ~12–15 verified candidates into the ledger at 'sourced' (~$0.50–$2.50 per sweep, counted by the $10 wall). Nothing moves past sourced until you Accept a row." />
          <span style={{ flex: 1, height: 1, background: LIGHT }} />
        </p>
        <div style={{ ...card, display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <ScoutSweepButton sweep="communities" label="Communities" />
          <ScoutSweepButton sweep="newsletters_podcasts" label="Newsletters + podcasts" />
          <ScoutSweepButton sweep="practitioners" label="Practitioners" />
          <span style={{ flex: 1 }} />
          <ModelSelector agent="scout" current={modelFor("scout")} label="Sweep model:" />
          <ModelSelector agent="dossier-enrich" current={modelFor("dossier-enrich")} label="Brief model:" />
        </div>
      </section>

      {/* ════ MACHINERY — collapsed drawer ════ */}
      <details style={{ marginTop: "30px", borderTop: `1px solid ${LIGHT}`, paddingTop: "10px" }}>
        <summary style={{ cursor: "pointer", fontFamily: MONO, fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: MUTED }}>
          ▸ machinery — {PARTNER_AGENTS.length} levers · sent log
        </summary>
        <div style={{ marginTop: "14px" }}>
          {switchesMissing ? (
            <div style={{ ...card, borderColor: CRIMSON, background: "#FBF3F3", fontFamily: SERIF, fontSize: "13.5px" }}>
              <strong style={{ color: CRIMSON }}>Controls not active yet.</strong> Apply{" "}
              <code style={{ fontFamily: MONO, fontSize: "12px" }}>supabase/migrations/20260609_agent_switches.sql</code>{" "}
              to turn on the levers. Until then every agent is paused (the crons fail safe to OFF).
            </div>
          ) : (
            <div style={card}>
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
          <div style={card}>
            <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".18em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "8px" }}>
              Sent log — last {recentSent?.length ?? 0}
            </span>
            {(recentSent ?? []).length === 0 ? (
              <p style={{ fontFamily: SERIF, fontSize: "13px", fontStyle: "italic", color: MUTED, margin: 0 }}>
                Nothing sent yet.
              </p>
            ) : (
              (recentSent ?? []).map((s, i) => (
                <p key={i} style={{ fontFamily: MONO, fontSize: "11px", color: INK, margin: "0 0 4px" }}>
                  <span style={{ color: MUTED }}>{new Date(s.sent_at as string).toISOString().slice(0, 10)}</span>
                  {" · "}{s.to_addr}{" · "}
                  <span style={{ color: MUTED }}>{(s.subject as string).slice(0, 56)}</span>
                </p>
              ))
            )}
          </div>
        </div>
      </details>
    </div>
  );
}
