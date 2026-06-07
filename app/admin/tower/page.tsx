export const dynamic = "force-dynamic";

import { createAdminClient } from "@/utils/supabase/admin";
import {
  approveDraft,
  approveAllReady,
  holdDraft,
  handleSignal,
  editDraft,
  markManualSent,
} from "./actions";
import PayoutButton from "./PayoutButton";
import AgentLever from "./AgentLever";
import ScoutSweepButton from "./ScoutSweepButton";
import { promoteSourced, rejectSourced } from "./actions";
import { PARTNER_AGENTS } from "@/lib/partnerships/agent-switch";

/**
 * The decision board. Top half is DECISIONS — the few things waiting on one
 * gesture from the operator. Bottom half is the BOARD — read-only situational
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

export default async function TowerPage() {
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

  const { data: readyDrafts } = await supabase
    .from("partner_outbound_queue")
    .select("*")
    .eq("status", "ready")
    .order("send_after", { ascending: true })
    .limit(50);
  // Defensive shape so the page renders before/after the 20260607 migration
  // (send_channel / personalization_note default sensibly when absent).
  type DraftRow = {
    id: string;
    to_addr: string;
    subject: string;
    body: string;
    tier: string;
    warden_cleared: boolean;
    drafted_by: string | null;
    send_channel?: string | null;
    personalization_note?: string | null;
  };
  const drafts: DraftRow[] = (readyDrafts ?? []) as DraftRow[];
  const emailDraftCount = drafts.filter(
    (d) => (d.send_channel ?? "email") === "email",
  ).length;

  // ── Payouts (the money gate): cleared-but-unpaid commission per affiliate. ──
  const { data: clearedAttr } = await supabase
    .from("affiliate_attributions")
    .select("affiliate_slug, commission_amount_cents")
    .eq("status", "cleared")
    .is("paid_at", null);
  const payoutAgg: Record<string, { cents: number; count: number }> = {};
  for (const a of clearedAttr ?? []) {
    const slug = a.affiliate_slug as string;
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

  const { data: sentinelCursor } = await supabase
    .from("agent_cursors")
    .select("updated_at")
    .eq("agent", "sentinel")
    .eq("stream", "prospect_events")
    .maybeSingle();

  // ── Agent master switches (the levers). Missing table → all OFF. ──
  const { data: switchRows, error: switchErr } = await supabase
    .from("agent_switches")
    .select("agent, enabled");
  const switchesMissing = !!switchErr;
  const switchMap: Record<string, boolean> = {};
  for (const s of switchRows ?? []) switchMap[s.agent as string] = s.enabled === true;
  const anyAgentOn = PARTNER_AGENTS.some((a) => switchMap[a]);

  const AGENT_META: Record<string, { label: string; cadence: string; desc: string; confirm: string }> = {
    sentinel: {
      label: "Sentinel",
      cadence: "every 10 min",
      desc: "Reads inbound replies, classifies them, and pings you for the interested ones. Sends email when it finds a bright signal.",
      confirm: "Start Sentinel? It will read affiliates@ inbound and may email you about bright replies.",
    },
    scribe: {
      label: "Scribe (drafter)",
      cadence: "every 15 min",
      desc: "Turns enriched candidates into ready first-touch drafts in the tower. Drafts only — never sends. You still approve every one.",
      confirm: "Start Scribe? It will begin drafting first-touch outreach to your enriched candidates (drafts only — nothing sends without your approval).",
    },
    courier: {
      label: "Courier",
      cadence: "every 5 min",
      desc: "Sends the drafts you've APPROVED, and logs them. Does nothing to unapproved drafts.",
      confirm: "Start Courier? It will send any outbound rows you have already approved.",
    },
    followup: {
      label: "Follow-up ladder",
      cadence: "hourly",
      desc: "Drafts +4d / +9d follow-ups for contacted-but-silent candidates; halts on reply. Drafts only — you approve.",
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
    "dossier-enrich": {
      label: "Dossier auto-enrich",
      cadence: "hourly (5 rows/tick)",
      desc: "Costs Anthropic tokens per row. Hourly, takes promoted candidates and fills in the dossier brief (audience, voice-fit, conflicts, contact path).",
      confirm: "Start Dossier auto-enrich? It will spend Anthropic tokens (~$0.10-0.30 per candidate) and update enriched rows in the pipeline.",
    },
  };

  const decisionCount =
    brightSignals.length + drafts.length + payoutAffiliates.length;

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
  const btnPrimary: React.CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    color: "#FFFFFF",
    background: CRIMSON,
    border: "none",
    padding: "9px 18px",
    cursor: "pointer",
  };
  const btnGhost: React.CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    color: MUTED,
    background: "transparent",
    border: `1px solid ${LIGHT}`,
    padding: "8px 16px",
    cursor: "pointer",
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
          {decisionCount === 0
            ? "All clear."
            : `${decisionCount} waiting on you.`}
        </h1>
        <span style={{ fontFamily: MONO, fontSize: "11px", color: MUTED }}>
          sentinel last swept {timeAgo(sentinelCursor?.updated_at ?? null)}
        </span>
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

      {/* ════ AGENT CONTROLS (the levers) ════ */}
      <section style={{ marginBottom: "52px" }}>
        <p style={sectionLabel}>
          <span>Agent Controls</span>
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
          <span style={{ flex: 1, height: 1, background: LIGHT }} />
        </p>
        <div style={{ ...card, marginBottom: "16px" }}>
          <p style={{ fontFamily: SERIF, fontSize: "14px", color: INK, margin: "0 0 4px" }}>
            <strong>Run a sweep.</strong> Each press calls Claude server-side and drops ~12–15 candidates into the pipeline at <code>status=&apos;sourced&apos;</code> for you to review. Spends API tokens (~$0.30–$1.50 per sweep).
          </p>
          <p style={{ fontFamily: SERIF, fontSize: "13px", color: MUTED, fontStyle: "italic", margin: "0 0 14px" }}>
            Nothing reaches enriched (the auto-drafter only acts on enriched) until you click <strong>Promote</strong> on each row.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <ScoutSweepButton sweep="communities" label="Sweep 1 · Paid communities" />
            <ScoutSweepButton sweep="newsletters_podcasts" label="Sweep 2 · Newsletters + podcasts" />
            <ScoutSweepButton sweep="practitioners" label="Sweep 3 · Practitioner figures" />
          </div>
        </div>

        {sourced.length > 0 && (
          <div>
            <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: INK, display: "block", marginBottom: "10px" }}>
              {sourced.length} candidate{sourced.length > 1 ? "s" : ""} awaiting review
            </span>
            {sourced.map((s) => (
              <div key={s.id} style={card}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <span style={{ fontFamily: SERIF, fontSize: "16px", fontWeight: 600, color: INK }}>{s.name}</span>
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
                  <p style={{ fontFamily: MONO, fontSize: "11.5px", color: "#8B1A1A", margin: "0 0 10px" }}>{s.contact_path}</p>
                )}
                <div style={{ display: "flex", gap: "8px" }}>
                  <form action={promoteSourced}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" style={btnPrimary}>Promote → enriched</button>
                  </form>
                  <form action={rejectSourced}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" style={btnGhost}>Reject</button>
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
          <span style={{ flex: 1, height: 1, background: LIGHT }} />
        </p>

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
              {emailDraftCount > 1 && (
                <form action={approveAllReady}>
                  <button type="submit" style={btnPrimary}>
                    Send all {emailDraftCount} email
                  </button>
                </form>
              )}
            </div>
            {drafts.map((d) => {
              const channel = d.send_channel ?? "email";
              const isManual = channel === "manual";
              return (
                <div key={d.id} style={card}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <span style={tierChip(d.tier)}>{d.tier}</span>
                    <span style={{ ...tierChip(isManual ? "cold" : "ok"), color: isManual ? "#a14400" : MUTED, borderColor: isManual ? "#e6c9a8" : LIGHT }}>
                      {isManual ? "manual send" : "email"}
                    </span>
                    {d.warden_cleared ? (
                      <span style={{ ...tierChip("ok"), color: "#2E7D32", borderColor: "#CDE7CE" }}>warden ✓</span>
                    ) : (
                      <span style={{ ...tierChip("cold"), color: "#a14400", borderColor: "#e6c9a8" }}>needs eye</span>
                    )}
                    <span style={{ fontFamily: MONO, fontSize: "12px", color: MUTED, marginLeft: "auto" }}>
                      → {d.to_addr}
                    </span>
                  </div>
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
                        <button type="submit" style={btnPrimary}>Mark sent</button>
                      </form>
                    ) : (
                      <form action={approveDraft}>
                        <input type="hidden" name="id" value={d.id} />
                        <button type="submit" style={btnPrimary}>Send</button>
                      </form>
                    )}
                    <form action={holdDraft}>
                      <input type="hidden" name="id" value={d.id} />
                      <button type="submit" style={btnGhost}>Hold</button>
                    </form>
                  </div>

                  {/* Inline editor — the tower as draft house */}
                  <details style={{ marginTop: "10px" }}>
                    <summary style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".14em", textTransform: "uppercase", color: MUTED, cursor: "pointer" }}>
                      Edit draft
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
                      <button type="submit" style={{ ...btnGhost, marginTop: "8px" }}>
                        Save &amp; re-check canon
                      </button>
                    </form>
                  </details>
                </div>
              );
            })}
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
                <form action={handleSignal}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" style={btnGhost}>Mark handled</button>
                </form>
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
                    <span style={{ fontFamily: MONO, fontSize: "12px", color: INK }}>{st.replace(/_/g, " ")}</span>
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
