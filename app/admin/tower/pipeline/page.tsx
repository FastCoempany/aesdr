export const dynamic = "force-dynamic";

import Link from "next/link";

import { createAdminClient } from "@/utils/supabase/admin";
import { extractAllDomains } from "@/lib/partnerships/email-finder";
import twr from "../tower.module.css";

/**
 * The map — every candidate in the pipeline as a card in its stage column.
 * This is where a candidate *is*; their room (/admin/tower/candidate/[id]) is
 * where their whole story lives. The tower stays the what-needs-me cockpit.
 *
 * Each column header says what moves a card out of it. Empty columns say what
 * fills them — the map is also the explanation of the machine.
 */

const INK = "#1A1A1A";
const CRIMSON = "#8B1A1A";
const MUTED = "#6B6B6B";
const LIGHT = "#E8E4DF";
const MONO = "'Space Mono', monospace";
const DISPLAY = "'Playfair Display', Georgia, serif";
const SERIF = "'Source Serif 4', Georgia, serif";

type Row = {
  id: string;
  name: string;
  surface: string | null;
  handle: string | null;
  voice_fit: number | null;
  status: string;
  motion: string;
  why_fit: string | null;
  next_action: string | null;
  updated_at: string;
  contact_path?: string | null;
  found_email?: string | null;
  email_checked_at?: string | null;
};

const GREEN = "#2E7D32";

/** The email-find chip for a card: what we know about reaching them. */
function emailChip(r: Row): { label: string; color: string } | null {
  if (r.found_email) return { label: "✉ email found", color: GREEN };
  if (r.email_checked_at) return { label: "no email found", color: MUTED };
  const hasDomain = extractAllDomains(r.contact_path, r.handle, r.why_fit).length > 0;
  if (!hasDomain) return { label: "no site to search", color: MUTED };
  if (r.status === "sourced") return null; // finding happens at promote
  return { label: "finding email…", color: MUTED };
}

const STAGES: Array<{ id: string; label: string; caption: string; empty: string }> = [
  {
    id: "sourced",
    label: "Sourced",
    caption: "scout found them — your Promote or Reject moves each card",
    empty: "Fills when a scout sweep runs (tower → Scout & Enrich).",
  },
  {
    id: "enriched",
    label: "Enriched · the research room",
    caption: "dossier-enrich writes the brief (hourly lever); scribe drafts at voice-fit ≥ 4 (15-min lever) — or use the room's buttons",
    empty: "Fills when you press Promote on a sourced candidate.",
  },
  {
    id: "contacted",
    label: "Contacted",
    caption: "first touch sent — the follow-up ladder climbs on its own (+4d, +9d)",
    empty: "Fills when courier sends an approved draft (or you mark a manual send).",
  },
  {
    id: "replied",
    label: "Replied",
    caption: "they wrote back — sentinel filed it; your move, in their room",
    empty: "Fills when sentinel matches an inbound reply to a candidate.",
  },
  {
    id: "call_booked",
    label: "Call booked",
    caption: "on the calendar — notes live in the room",
    empty: "Set a candidate here once a call lands on the calendar.",
  },
  {
    id: "negotiating",
    label: "Negotiating",
    caption: "terms in motion",
    empty: "Fills when a call turns into a real conversation about terms.",
  },
  {
    id: "activated",
    label: "Activated",
    caption: "live affiliate — link issued, commissions tracking in /admin/affiliates",
    empty: "The goal column. Fills when a partner signs up and gets their link.",
  },
];

const PARKED = ["passed", "cold"] as const;

function daysAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return d < 1 ? "· today" : `· ${d}d`;
}

function waitingOn(r: Row): string {
  if (r.status === "sourced") return "waiting on your review";
  if (r.status === "enriched") {
    const hasBrief = (r.why_fit ?? "").includes("[dossier]");
    if (!hasBrief) return "waiting on a research brief";
    if ((r.voice_fit ?? 0) >= 4) return "brief ✓ — waiting on a draft (scribe)";
    return `brief ✓ — below scribe's bar (vf ${r.voice_fit ?? "—"}); draft from the room`;
  }
  if (r.status === "contacted") return "waiting on a reply — ladder climbing";
  if (r.status === "replied") return "waiting on you";
  return r.next_action ?? "";
}

export default async function PipelineMapPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("partner_pipeline")
    // select('*') so the new found_email / email_checked_at columns read
    // safely whether or not the 20260613 migration has been applied.
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(500);
  const rows = (data ?? []) as Row[];

  const byStage: Record<string, Row[]> = {};
  for (const r of rows) {
    (byStage[r.status] ??= []).push(r);
  }
  const parked = PARKED.flatMap((st) => byStage[st] ?? []);

  return (
    <main style={{ padding: "8px 0 48px" }}>
      <p style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".22em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>
        <Link href="/admin/tower" className={twr.lnk}>← Control Tower</Link>
      </p>
      <h1 style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 700, fontSize: "34px", color: INK, margin: "0 0 6px" }}>
        The map
      </h1>
      <p style={{ fontFamily: SERIF, fontSize: "15px", fontStyle: "italic", color: MUTED, margin: "0 0 28px", maxWidth: "640px" }}>
        Every candidate, in the column they actually sit in. Click a name to open their room — brief, drafts, replies, and the full timeline live there.
      </p>

      <div className={twr.mapWrap}>
        {STAGES.map((st) => {
          const cards = byStage[st.id] ?? [];
          return (
            <div key={st.id} id={st.id} className={twr.mapCol}>
              <div style={{ borderBottom: `2px solid ${INK}`, paddingBottom: "6px", marginBottom: "10px" }}>
                <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: INK, fontWeight: 700 }}>
                  {st.label}
                </span>
                <span style={{ fontFamily: MONO, fontSize: "11px", color: CRIMSON, fontWeight: 700, float: "right" }}>
                  {cards.length}
                </span>
                <p style={{ fontFamily: MONO, fontSize: "9.5px", lineHeight: 1.5, color: MUTED, margin: "6px 0 0" }}>
                  {st.caption}
                </p>
              </div>
              {cards.length === 0 ? (
                <p style={{ fontFamily: SERIF, fontSize: "12.5px", fontStyle: "italic", color: MUTED, margin: 0 }}>
                  {st.empty}
                </p>
              ) : (
                cards.map((r) => {
                  const chip = emailChip(r);
                  return (
                    <Link key={r.id} href={`/admin/tower/candidate/${r.id}`} className={twr.mapCard}>
                      <span style={{ fontFamily: SERIF, fontSize: "14px", fontWeight: 600, color: INK, display: "block" }}>
                        {r.name}
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, display: "block", margin: "2px 0 4px" }}>
                        {r.surface ?? "—"} · vf {r.voice_fit ?? "—"} · {r.motion}
                      </span>
                      {chip && (
                        <span style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: ".04em", color: chip.color, border: `1px solid ${chip.color}`, padding: "1px 5px", display: "inline-block", marginBottom: "4px" }}>
                          {chip.label}
                        </span>
                      )}
                      <span style={{ fontFamily: MONO, fontSize: "9.5px", lineHeight: 1.45, color: CRIMSON, display: "block" }}>
                        {waitingOn(r)}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          );
        })}
      </div>

      {/* The bin — passed and gone-cold candidates. A recycle bin that never
          empties itself: everything stays, restorable from the room. */}
      <div id="passed" style={{ marginTop: "36px", border: `1px solid ${INK}`, padding: "16px 18px" }}>
        <span id="cold" style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", color: INK, fontWeight: 700 }}>
          The bin — passed &amp; cold · {parked.length}
        </span>
        <p style={{ fontFamily: SERIF, fontSize: "12.5px", fontStyle: "italic", color: MUTED, margin: "6px 0 0" }}>
          Nothing in here expires or gets deleted. Open anyone&apos;s room to Reconsider — research is kept,
          so restoring costs nothing.
        </p>
        {parked.length === 0 ? (
          <p style={{ fontFamily: SERIF, fontSize: "12.5px", fontStyle: "italic", color: MUTED, margin: "10px 0 0" }}>
            Empty. Pass or Reject moves a candidate here.
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {parked.map((r) => (
              <Link
                key={r.id}
                href={`/admin/tower/candidate/${r.id}`}
                className={twr.lnk}
                style={{ fontFamily: MONO, fontSize: "11px", color: INK, border: `1px solid ${LIGHT}`, padding: "4px 10px", background: "rgba(107,107,107,.06)" }}
              >
                {r.name} · {r.status} {daysAgo(r.updated_at)}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
