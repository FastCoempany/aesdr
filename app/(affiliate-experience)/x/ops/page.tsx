/**
 * Affiliate Analytics — the one place to see prospect behavior.
 *
 * Source of truth is our own DB (affiliate_prospect_events), so this needs no
 * PostHog API key. For the things only PostHog renders (session replay, the
 * scroll heatmap) each prospect row deep-links to their PostHog person.
 */
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

type EventRow = {
  prospect_slug: string;
  session_id: string | null;
  name: string;
  props: Record<string, unknown> | null;
  country: string | null;
  device: string | null;
  created_at: string;
};
type ProspectRow = {
  slug: string;
  display_name: string | null;
  note: string | null;
};

// Funnel order — index = how far a prospect got.
const STAGES = [
  "link_opened",
  "animation_started",
  "role_picked",
  "landing_completed",
  "timer_started",
  "directed_to_kit",
  "kit_viewed",
  "request_conversation_clicked",
] as const;
const STAGE_LABEL: Record<string, string> = {
  link_opened: "Opened link",
  animation_started: "Started landing",
  role_picked: "Picked role",
  landing_completed: "Finished landing",
  timer_started: "Hit the timer",
  directed_to_kit: "Sent to kit",
  kit_viewed: "Viewed kit",
  request_conversation_clicked: "Requested conversation",
};

const ink = "var(--ink, #1A1A1A)";
const crimson = "var(--crimson, #8B1A1A)";
const muted = "var(--muted, #6B6B6B)";
const mono = "var(--mono, 'Space Mono', monospace)";
const display = "var(--display, 'Playfair Display', Georgia, serif)";

function posthogAppHost(): string {
  const h = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  return h.replace("us.i.posthog.com", "us.posthog.com").replace(
    "eu.i.posthog.com",
    "eu.posthog.com",
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: display,
        fontStyle: "italic",
        fontSize: 22,
        margin: "44px 0 14px",
      }}
    >
      {children}
    </h2>
  );
}

export default async function AffiliateAnalyticsPage() {
  const supabase = createAdminClient();
  const [{ data: rawEvents }, { data: rawProspects }] = await Promise.all([
    supabase
      .from("affiliate_prospect_events")
      .select("prospect_slug,session_id,name,props,country,device,created_at")
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase.from("affiliate_prospects").select("slug,display_name,note"),
  ]);

  const events = (rawEvents || []) as EventRow[];
  const prospects = (rawProspects || []) as ProspectRow[];
  const nameFor = new Map(prospects.map((p) => [p.slug, p.display_name]));

  // ── Aggregate per prospect ──
  type Agg = {
    slug: string;
    visits: number; // distinct sessions
    opens: number; // link_opened count
    lastSeen: string;
    role: string | null;
    furthest: number; // STAGES index
    stoppedTimer: boolean;
    requestedConvo: boolean;
    country: string | null;
    device: string | null;
  };
  const byProspect = new Map<string, Agg>();
  const sessions = new Map<string, Set<string>>();
  const hourBuckets = new Array(24).fill(0);
  let aeCount = 0;
  let sdrCount = 0;
  const stoppedTimer: string[] = [];

  for (const e of events) {
    const a =
      byProspect.get(e.prospect_slug) ||
      ({
        slug: e.prospect_slug,
        visits: 0,
        opens: 0,
        lastSeen: e.created_at,
        role: null,
        furthest: -1,
        stoppedTimer: false,
        requestedConvo: false,
        country: e.country,
        device: e.device,
      } as Agg);

    if (e.created_at > a.lastSeen) a.lastSeen = e.created_at;
    if (e.country && !a.country) a.country = e.country;
    if (e.device && !a.device) a.device = e.device;

    const idx = STAGES.indexOf(e.name as (typeof STAGES)[number]);
    if (idx > a.furthest) a.furthest = idx;

    if (e.name === "link_opened") a.opens += 1;
    if (e.name === "timer_stopped") {
      a.stoppedTimer = true;
      if (!stoppedTimer.includes(e.prospect_slug))
        stoppedTimer.push(e.prospect_slug);
    }
    if (e.name === "request_conversation_clicked") a.requestedConvo = true;
    if (e.name === "role_picked") {
      const r = (e.props?.role as string) || null;
      if (r) {
        a.role = r;
        if (r === "ae") aeCount += 1;
        if (r === "sdr") sdrCount += 1;
      }
    }

    if (e.session_id) {
      const set = sessions.get(e.prospect_slug) || new Set<string>();
      set.add(e.session_id);
      sessions.set(e.prospect_slug, set);
    }
    hourBuckets[new Date(e.created_at).getHours()] += 1;

    byProspect.set(e.prospect_slug, a);
  }
  for (const [slug, set] of sessions) {
    const a = byProspect.get(slug);
    if (a) a.visits = set.size;
  }

  const roster = Array.from(byProspect.values()).sort((x, y) =>
    y.lastSeen.localeCompare(x.lastSeen),
  );

  // ── Funnel counts (# prospects who reached at least each stage) ──
  const funnel = STAGES.map((stage, i) => ({
    stage,
    label: STAGE_LABEL[stage],
    count: roster.filter((a) => a.furthest >= i).length,
  }));
  const totalProspects = roster.length;
  const maxHour = Math.max(1, ...hourBuckets);
  const appHost = posthogAppHost();

  const cell: React.CSSProperties = {
    fontFamily: mono,
    fontSize: 12,
    padding: "10px 12px",
    borderBottom: "1px solid var(--light, #E8E4DF)",
    textAlign: "left",
    verticalAlign: "top",
  };
  const th: React.CSSProperties = {
    ...cell,
    color: muted,
    textTransform: "uppercase",
    letterSpacing: ".1em",
    fontSize: 10,
    borderBottom: `1px solid ${ink}`,
  };

  return (
    <div style={{ color: ink }}>
      <h1 style={{ fontFamily: display, fontStyle: "italic", fontSize: 32, margin: 0 }}>
        Affiliate Analytics
      </h1>
      <p style={{ fontFamily: mono, fontSize: 12, color: muted, marginTop: 8 }}>
        {totalProspects} prospect{totalProspects === 1 ? "" : "s"} ·{" "}
        {events.length} events tracked · live from the experience
      </p>

      {totalProspects === 0 && (
        <p
          style={{
            fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
            fontStyle: "italic",
            color: muted,
            marginTop: 24,
          }}
        >
          No prospects yet. Send someone a link like{" "}
          <code>/x/welcome?p=their-name</code> and they&rsquo;ll appear here the
          moment they open it.
        </p>
      )}

      {/* ── Funnel ── */}
      <H2>The funnel</H2>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {funnel.map((f) => {
          const pct = totalProspects ? (f.count / totalProspects) * 100 : 0;
          return (
            <div key={f.stage} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: mono, fontSize: 11, width: 180, color: muted }}>
                {f.label}
              </span>
              <div style={{ flex: 1, background: "var(--light, #E8E4DF)", height: 22 }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: crimson,
                    minWidth: f.count ? 2 : 0,
                  }}
                />
              </div>
              <span style={{ fontFamily: mono, fontSize: 12, width: 36, textAlign: "right" }}>
                {f.count}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── AE vs SDR ── */}
      <H2>AE vs SDR — who your prospects say they are</H2>
      <p style={{ fontFamily: mono, fontSize: 13 }}>
        AE: <strong>{aeCount}</strong> &nbsp;·&nbsp; SDR: <strong>{sdrCount}</strong>
        {aeCount + sdrCount === 0 && (
          <span style={{ color: muted }}> — nobody&rsquo;s picked yet</span>
        )}
      </p>

      {/* ── Roster ── */}
      <H2>Prospect roster</H2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead>
            <tr>
              <th style={th}>Prospect</th>
              <th style={th}>Last seen</th>
              <th style={th}>Visits</th>
              <th style={th}>Role</th>
              <th style={th}>Furthest stage</th>
              <th style={th}>Signals</th>
              <th style={th}>Where</th>
              <th style={th}>PostHog</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((a) => (
              <tr key={a.slug}>
                <td style={cell}>
                  <strong>{nameFor.get(a.slug) || a.slug}</strong>
                  <span style={{ display: "block", color: muted }}>{a.slug}</span>
                </td>
                <td style={cell}>{new Date(a.lastSeen).toLocaleString()}</td>
                <td style={cell}>{a.visits || 1}</td>
                <td style={cell}>{a.role ? a.role.toUpperCase() : "—"}</td>
                <td style={cell}>
                  {a.furthest >= 0 ? STAGE_LABEL[STAGES[a.furthest]] : "—"}
                </td>
                <td style={cell}>
                  {a.requestedConvo && (
                    <span style={{ color: crimson }}>★ requested convo<br /></span>
                  )}
                  {a.stoppedTimer && <span>⏸ stopped timer (engaged)</span>}
                  {!a.requestedConvo && !a.stoppedTimer && "—"}
                </td>
                <td style={cell}>
                  {a.country || "?"} · {a.device || "?"}
                </td>
                <td style={cell}>
                  <a
                    href={`${appHost}/person/${encodeURIComponent(`prospect:${a.slug}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: crimson }}
                  >
                    replay →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Most engaged ── */}
      <H2>Most engaged</H2>
      <p style={{ fontFamily: mono, fontSize: 13, lineHeight: 1.8 }}>
        Requested a conversation:{" "}
        <strong>
          {roster.filter((a) => a.requestedConvo).map((a) => nameFor.get(a.slug) || a.slug).join(", ") || "—"}
        </strong>
        <br />
        Stopped the timer to keep reading:{" "}
        <strong>
          {stoppedTimer.map((s) => nameFor.get(s) || s).join(", ") || "—"}
        </strong>
        <br />
        Came back more than once:{" "}
        <strong>
          {roster.filter((a) => a.visits > 1).map((a) => `${nameFor.get(a.slug) || a.slug} (${a.visits})`).join(", ") || "—"}
        </strong>
      </p>

      {/* ── Time of day ── */}
      <H2>When they read (by hour, server time)</H2>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 80 }}>
        {hourBuckets.map((n, h) => (
          <div
            key={h}
            title={`${h}:00 — ${n} events`}
            style={{
              flex: 1,
              height: `${(n / maxHour) * 100}%`,
              minHeight: n ? 2 : 0,
              background: crimson,
              opacity: n ? 0.85 : 0.15,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: 9, color: muted, marginTop: 4 }}>
        <span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>11p</span>
      </div>
    </div>
  );
}
