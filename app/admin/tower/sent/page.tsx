export const dynamic = "force-dynamic";

import Link from "next/link";

import { createAdminClient } from "@/utils/supabase/admin";

/**
 * The sent record — the surefire list of every email that ever left this
 * machine (founder request, 2026-07-15). Reads partner_sent_log, the
 * claim-before-send table: a send physically cannot happen without landing a
 * line here first, and a failed send releases its line — so this page shows
 * exactly what went out, no more, no less. The BCC copy in the founder inbox
 * is the paper duplicate of every line.
 */

const INK = "#1A1A1A";
const CRIMSON = "#8B1A1A";
const MUTED = "#6B6B6B";
const LIGHT = "#E8E4DF";
const GREEN = "#2E7D32";
const MONO = "'Space Mono', monospace";
const DISPLAY = "'Playfair Display', Georgia, serif";
const SERIF = "'Source Serif 4', Georgia, serif";

function fmt(ts: string): string {
  const d = new Date(ts);
  return `${d.toISOString().slice(0, 10)} · ${d.toISOString().slice(11, 16)} UTC`;
}

export default async function SentRecordPage() {
  const supabase = createAdminClient();

  const { data: lines, error } = await supabase
    .from("partner_sent_log")
    .select("queue_id, to_addr, subject, tier, resend_id, sent_at")
    .order("sent_at", { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);
  const rows = lines ?? [];

  // Join room links + reply state through the queue rows.
  const queueIds = rows.map((r) => r.queue_id).filter(Boolean);
  const roomByQueue = new Map<string, { pipelineId: string; name: string; status: string }>();
  if (queueIds.length > 0) {
    const { data: queueRows } = await supabase
      .from("partner_outbound_queue")
      .select("id, related_pipeline_id")
      .in("id", queueIds);
    const pipelineIds = [...new Set((queueRows ?? []).map((q) => q.related_pipeline_id).filter(Boolean))] as string[];
    if (pipelineIds.length > 0) {
      const { data: pipes } = await supabase
        .from("partner_pipeline")
        .select("id, name, status")
        .in("id", pipelineIds);
      const pipeById = new Map((pipes ?? []).map((p) => [p.id as string, p]));
      for (const q of queueRows ?? []) {
        const pipe = q.related_pipeline_id ? pipeById.get(q.related_pipeline_id as string) : undefined;
        if (pipe) {
          roomByQueue.set(q.id as string, {
            pipelineId: pipe.id as string,
            name: pipe.name as string,
            status: pipe.status as string,
          });
        }
      }
    }
  }

  return (
    <main style={{ maxWidth: "1060px", margin: "0 auto", padding: "28px 20px 80px", color: INK }}>
      <p style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: ".3em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>
        <Link href="/admin/tower" style={{ color: MUTED }}>← the tower</Link>
        &nbsp;·&nbsp; the sent record
      </p>
      <h1 style={{ fontFamily: DISPLAY, fontSize: "34px", fontStyle: "italic", fontWeight: 900, margin: "0 0 6px" }}>
        The sent record.
      </h1>
      <p style={{ fontFamily: SERIF, fontSize: "14px", color: MUTED, maxWidth: "72ch", margin: "0 0 22px", lineHeight: 1.6 }}>
        Every email that ever left this machine. Written at the moment of claim — a send cannot happen
        without landing a line here, and failures never appear (a failed send releases its line). Your
        BCC copy is the paper duplicate of each row.
      </p>

      {rows.length === 0 ? (
        <p style={{ fontFamily: SERIF, fontStyle: "italic", color: MUTED }}>
          Nothing has been sent yet. The first press of the button writes the first line.
        </p>
      ) : (
        <div style={{ overflowX: "auto", border: `1px solid ${LIGHT}`, background: "#FAF7F2" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: "11.5px" }}>
            <thead>
              <tr>
                {["sent", "to", "who", "subject", "tier", "resend id"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      fontSize: "9.5px",
                      letterSpacing: ".2em",
                      textTransform: "uppercase",
                      color: MUTED,
                      fontWeight: 400,
                      padding: "10px 12px",
                      borderBottom: `1px solid ${LIGHT}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const room = r.queue_id ? roomByQueue.get(r.queue_id as string) : undefined;
                return (
                  <tr key={`${r.queue_id ?? i}-${r.sent_at}`}>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${LIGHT}`, color: MUTED, whiteSpace: "nowrap" }}>
                      {fmt(r.sent_at as string)}
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${LIGHT}`, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {r.to_addr as string}
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${LIGHT}`, whiteSpace: "nowrap" }}>
                      {room ? (
                        <Link href={`/admin/tower/candidate/${room.pipelineId}`} style={{ color: CRIMSON }}>
                          {room.name}
                          {room.status === "replied" ? <span style={{ color: GREEN }}> · replied</span> : null}
                        </Link>
                      ) : (
                        <span style={{ color: MUTED }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${LIGHT}`, maxWidth: "340px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      &ldquo;{r.subject as string}&rdquo;
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${LIGHT}`, color: MUTED, whiteSpace: "nowrap" }}>
                      {(r.tier as string | null) ?? "—"}
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${LIGHT}`, color: MUTED, whiteSpace: "nowrap" }}>
                      {(r.resend_id as string | null) ?? "accepted (id pending)"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ fontFamily: MONO, fontSize: "10px", color: MUTED, letterSpacing: ".06em", margin: "14px 0 0", lineHeight: 1.8 }}>
        when the delivery webhook ships, a &ldquo;delivered ✓ / bounced&rdquo; column joins this table.
      </p>
    </main>
  );
}
