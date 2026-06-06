export const dynamic = "force-dynamic";

import { createAdminClient } from "@/utils/supabase/admin";
import {
  approveDraft,
  approveAllReady,
  holdDraft,
  handleSignal,
} from "./actions";

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
    .select("id, to_addr, subject, body, tier, warden_cleared, send_after, drafted_by")
    .eq("status", "ready")
    .order("send_after", { ascending: true })
    .limit(50);
  const drafts = readyDrafts ?? [];

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

  const decisionCount = brightSignals.length + drafts.length;

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

      {/* ════ DECISIONS ════ */}
      <section style={{ marginBottom: "52px" }}>
        <p style={sectionLabel}>
          <span>Decisions</span>
          <span style={{ flex: 1, height: 1, background: LIGHT }} />
        </p>

        {/* Drafts ready to send */}
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
                {drafts.length} draft{drafts.length > 1 ? "s" : ""} ready to send
              </span>
              {drafts.length > 1 && (
                <form action={approveAllReady}>
                  <button type="submit" style={btnPrimary}>
                    Send all {drafts.length}
                  </button>
                </form>
              )}
            </div>
            {drafts.map((d) => (
              <div key={d.id} style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={tierChip(d.tier)}>{d.tier}</span>
                  {d.warden_cleared && (
                    <span style={{ ...tierChip("ok"), color: "#2E7D32", borderColor: "#CDE7CE" }}>
                      warden ✓
                    </span>
                  )}
                  <span style={{ fontFamily: MONO, fontSize: "12px", color: MUTED, marginLeft: "auto" }}>
                    → {d.to_addr}
                  </span>
                </div>
                <p style={{ fontFamily: SERIF, fontSize: "16px", fontWeight: 600, margin: "0 0 6px", color: INK }}>
                  {d.subject}
                </p>
                <p style={{ fontFamily: SERIF, fontSize: "14px", lineHeight: 1.6, color: MUTED, margin: "0 0 14px", whiteSpace: "pre-wrap" }}>
                  {d.body.length > 280 ? d.body.slice(0, 280) + "…" : d.body}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <form action={approveDraft}>
                    <input type="hidden" name="id" value={d.id} />
                    <button type="submit" style={btnPrimary}>Send</button>
                  </form>
                  <form action={holdDraft}>
                    <input type="hidden" name="id" value={d.id} />
                    <button type="submit" style={btnGhost}>Hold</button>
                  </form>
                </div>
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
                <form action={handleSignal}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" style={btnGhost}>Mark handled</button>
                </form>
              </div>
            ))}
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
