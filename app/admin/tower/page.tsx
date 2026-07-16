export const dynamic = "force-dynamic";
// Sweeps moved to /api/admin/run-sweep (which carries its own 300s ceiling for
// the search loop + the warren's prepare batch). This page still hosts slower
// actions — runDossierNow runs a research brief inline — so it keeps headroom.
export const maxDuration = 180;

import Link from "next/link";

import { createAdminClient } from "@/utils/supabase/admin";
import { releaseDraft } from "./actions";
import PayoutButton from "./PayoutButton";
import AgentLever from "./AgentLever";
import ScoutSweepButton from "./ScoutSweepButton";
import ModelSelector from "./ModelSelector";
import TowerButton from "./TowerButton";
import Hint from "./Hint";
import twr from "./tower.module.css";
import PostageStrip from "./PostageStrip";
import WarrenBand, { type WarrenCard, type SweepRing } from "./WarrenBand";
import {
  PARTNER_AGENTS,
  AGENT_MODEL_DEFAULTS,
} from "@/lib/partnerships/agent-switch";
import { getTodaySpendUsd, getTodayEmailCredits, DAILY_WALL_USD } from "@/lib/partnerships/spend";
import { extractEmail } from "@/lib/partnerships/outreach-templates";
import { getSuppressedEmails } from "@/lib/email";

/**
 * The warren (founder pick 2026-07-15, direction I revised): the tower is his
 * floor. Three thin sweep buttons send Leponeus out — the running button IS
 * the status, filling with the iris tide while fit → brief → address hunt run
 * for the whole catch. What lands is finished cards in THE BAND, which flips
 * in place between the strip (working depth) and the territory (pulled back).
 * A card is a door; drafting and the ceramic one-press send live in the room.
 * Postage (the $10 wall) sits in the masthead as stamps.
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
    .select("id, name, surface, voice_fit, status, why_fit, contact_path, first_touch_at, ladder_step, updated_at, dossier_brief, source_agent, next_action")
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
    source_agent: string | null;
    next_action: string | null;
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

  // ── The spend meter (postage) ──
  let spentUsd = 0;
  let ledgerBroken = false;
  try {
    spentUsd = await getTodaySpendUsd();
  } catch {
    ledgerBroken = true; // paid runs fail closed; say so instead of showing $0
  }
  const emailCredits = await getTodayEmailCredits();

  // ── Sweep sub-lines + territory ring labels: last swept · brought N ──
  const SWEEP_LABELS: Record<string, string> = {
    communities: "communities",
    newsletters_podcasts: "newsletters & podcasts",
    practitioners: "practitioners",
  };
  const { data: sourcedEvents } = await supabase
    .from("partner_events")
    .select("detail, created_at")
    .eq("kind", "sourced")
    .order("created_at", { ascending: false })
    .limit(400);
  const sweepMeta: Record<string, { last: string; brought: number }> = {};
  for (const ev of sourcedEvents ?? []) {
    const sweepId = (ev.detail as { sweep?: string } | null)?.sweep;
    if (!sweepId || !SWEEP_LABELS[sweepId]) continue;
    const day = (ev.created_at as string).slice(0, 10);
    if (!sweepMeta[sweepId]) sweepMeta[sweepId] = { last: day, brought: 1 };
    else if (sweepMeta[sweepId].last === day) sweepMeta[sweepId].brought += 1;
  }
  const sweepSub = (id: string): string => {
    const m = sweepMeta[id];
    if (!m) return "never swept";
    const d = new Date(m.last + "T00:00:00Z");
    const nice = d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).toLowerCase();
    return `last swept ${nice} · brought ${m.brought}`;
  };

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
  // Enriched-with-no-brief splits two ways. A brief is a one-shot background
  // job (the sweep's after() batch); it never runs for long. So a candidate
  // whose row was touched recently is plausibly still researching, but one
  // sitting untouched for a while means the brief never landed — it is NOT
  // doing anything active, and mustn't wear the "researching…" label. That
  // stalled pile becomes a real state: your call, needs a brief run.
  const RESEARCH_STALE_MS = 15 * 60 * 1000;
  const enrichedNoBrief = people.filter(
    (p) => p.status === "enriched" && !hasBrief(p) && !draftByPipeline.has(p.id),
  );
  const briefPending = enrichedNoBrief.filter(
    (p) => Date.now() - new Date(p.updated_at).getTime() < RESEARCH_STALE_MS,
  );
  const briefStalled = enrichedNoBrief.filter(
    (p) => Date.now() - new Date(p.updated_at).getTime() >= RESEARCH_STALE_MS,
  );
  const sourced = people.filter((p) => p.status === "sourced");
  const contacted = people.filter((p) => p.status === "contacted");
  const inConvo = people.filter((p) => p.status === "replied");

  const decisionCount =
    fitCalls.length +
    drafts.length +
    payoutAffiliates.length +
    shelf.filter((s) => s.status === "failed").length;

  // ── The band's cards — finished work first, skips sleep at the back ──
  const originOf = (p: PipeRow & { source_agent?: string | null }): string | null => {
    const src = (p as { source_agent?: string | null }).source_agent ?? null;
    if (!src?.startsWith("scout-tower:")) return null;
    return SWEEP_LABELS[src.slice("scout-tower:".length)] ?? null;
  };
  const cards: WarrenCard[] = [];
  const verdictOf = (p: PipeRow) => p.dossier_brief?.verdict ?? null;
  const kindOf = (p: PipeRow): WarrenCard["kind"] =>
    verdictOf(p) === "reach_out" ? "reach_out" : verdictOf(p) === "skip" ? "skip" : "your_call";
  // Drafted candidates lead with the verdict too — draft state lives in the sub.
  for (const p of draftPeople) {
    const d = draftByPipeline.get(p.id)!;
    const isManual = (d.send_channel ?? "email") === "manual";
    const isSuppressed = !isManual && suppressedSet.has(d.to_addr.toLowerCase());
    cards.push({
      id: p.id,
      name: p.name,
      kind: kindOf(p),
      origin: originOf(p),
      hasEmail: !isManual,
      sub: isSuppressed
        ? "suppressed — will never send"
        : isManual
          ? "draft written — attach an address in their room, or deliver by hand"
          : d.warden_cleared
            ? "draft ready — one press in their room sends it"
            : "draft needs your edit first",
    });
  }
  for (const p of fitCalls.filter((p) => verdictOf(p) === "reach_out")) {
    const cf = p.dossier_brief?.conflict ?? null;
    cards.push({
      id: p.id, name: p.name, kind: "reach_out", origin: originOf(p), hasEmail: hasAddr(p),
      sub: `brief ✓ voice ${p.voice_fit ?? "—"}/5${cf && cf !== "none" ? ` · conflict: ${cf}` : " · no conflict"} — write the draft in their room`,
    });
  }
  for (const p of fitCalls.filter((p) => verdictOf(p) === "needs_research" || verdictOf(p) === null)) {
    cards.push({
      id: p.id, name: p.name, kind: "your_call", origin: originOf(p), hasEmail: hasAddr(p),
      sub: "the machine couldn't call it — read the brief, you decide",
    });
  }
  for (const p of briefPending) {
    cards.push({
      id: p.id, name: p.name, kind: "preparing", origin: originOf(p), hasEmail: hasAddr(p),
      sub: "brief & address hunt still running — lands as a verdict when done",
    });
  }
  // Stalled (brief never landed, nothing active): honest label, real action.
  for (const p of briefStalled) {
    cards.push({
      id: p.id, name: p.name, kind: "your_call", origin: originOf(p), hasEmail: hasAddr(p),
      sub: "brief didn't land — open their room to run it (nothing is running now)",
    });
  }
  for (const p of sourced) {
    cards.push({
      id: p.id, name: p.name, kind: "your_call", origin: originOf(p), hasEmail: hasAddr(p),
      sub: "pre-consolidation row — accept & prepare in their room",
    });
  }
  for (const p of contacted) {
    cards.push({
      id: p.id, name: p.name, kind: "waiting", origin: originOf(p), hasEmail: hasAddr(p),
      sub: `last touch ${daysAgo(p.first_touch_at)} · ladder ${p.ladder_step ?? 0} · mark them replied in their room`,
    });
  }
  for (const p of inConvo) {
    cards.push({
      id: p.id, name: p.name, kind: "talking", origin: originOf(p), hasEmail: hasAddr(p),
      sub: "in conversation — hands off, work the thread",
    });
  }
  for (const p of fitCalls.filter((p) => verdictOf(p) === "skip")) {
    const cf = p.dossier_brief?.conflict ?? null;
    cards.push({
      id: p.id, name: p.name, kind: "skip", origin: originOf(p), hasEmail: hasAddr(p),
      sub: `${cf === "hard" ? "hard conflict" : cf === "soft" ? "soft conflict" : "the machine says pass"} — override in their room`,
    });
  }
  for (const d of orphanDrafts) {
    cards.push({
      id: d.related_pipeline_id ?? "",
      name: d.to_addr,
      kind: "your_call",
      origin: null,
      hasEmail: (d.send_channel ?? "email") === "email",
      sub: "orphan draft — no candidate row behind it",
    });
  }
  const rings: SweepRing[] = Object.entries(SWEEP_LABELS).map(([id, label]) => ({
    label,
    note: sweepMeta[id] ? sweepSub(id).replace("last swept ", "") : "never",
  }));
  const coverage = `${cards.length} on the floor · ${(pipeCounts["passed"] ?? 0) + (pipeCounts["cold"] ?? 0)} in the bin · ${sentCount ?? 0} sent all-time`;

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
      {/* ── Masthead: the warren + postage ── */}
      <PostageStrip
        spentUsd={spentUsd}
        wallUsd={DAILY_WALL_USD}
        emailCredits={emailCredits}
        ledgerBroken={ledgerBroken}
      />

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
        <Hint tip="The warren: a sweep button runs the whole line — find, fit call, brief, address hunt — and finished cards land in the band below. The band flips between the strip (work the cards) and the territory (everyone as dots). A card is a door to its room, where the draft and the one-press ceramic send live." />
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
            ? `${sweepOk} new card${sweepOk > 1 ? "s" : ""} landed in the band.${sweepSeen > sweepOk ? ` ${sweepSeen - sweepOk} already known, skipped.` : ""}`
            : "Sweep finished — nothing new that isn't already in the pipeline."}
        </p>
      )}

      {/* ════ SWEEPS — send him out; the hunt lives in the button ════ */}
      <div className={twr.sweepRow}>
        <ScoutSweepButton sweep="communities" label="Communities" sub={sweepSub("communities")} />
        <ScoutSweepButton sweep="newsletters_podcasts" label="Newsletters & podcasts" sub={sweepSub("newsletters_podcasts")} />
        <ScoutSweepButton sweep="practitioners" label="Practitioners" sub={sweepSub("practitioners")} />
        <Hint tip="One press runs the whole line: Claude sweeps the live web (~2–4 min), then every new find is auto-promoted, briefed, verdict-called, and address-hunted before the run reports done (sweep ~$0.50–$2.50 + ~$0.15–0.60 per card, all counted by the postage wall). Nothing drafts or sends without your press in a room." />
      </div>

      {/* ════ THE BAND — the strip / the territory, flipped in place ════ */}
      <WarrenBand cards={cards} rings={rings} coverage={coverage} />

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
            <Hint tip="Drafts parked off the send path. Held = you pulled it back (or the suppression gate did); Release re-readies it in the room. Failed = the send errored; Release re-readies it." />
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

      {/* ════ MACHINERY — collapsed drawer ════ */}
      <details style={{ marginTop: "30px", borderTop: `1px solid ${LIGHT}`, paddingTop: "10px" }}>
        <summary style={{ cursor: "pointer", fontFamily: MONO, fontSize: "10px", letterSpacing: ".2em", textTransform: "uppercase", color: MUTED }}>
          ▸ machinery — {PARTNER_AGENTS.length} levers · sent log
        </summary>
        <div style={{ marginTop: "14px" }}>
          <div style={{ ...card, display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <ModelSelector agent="scout" current={modelFor("scout")} label="Sweep model:" />
            <ModelSelector agent="dossier-enrich" current={modelFor("dossier-enrich")} label="Brief model:" />
          </div>
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
