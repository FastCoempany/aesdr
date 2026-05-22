import Link from "next/link";

import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

interface QueueRow {
  id: string;
  affiliate_id: string;
  channel: string;
  format: string;
  status: string;
  draft_url: string | null;
  scheduled_publish_at: string | null;
  submitted_at: string;
  counted_toward_gate: boolean;
  affiliate_slug: string;
  display_name: string;
  sophistication_tier: string;
  approved_pieces_count: number;
  strike_count: number;
}

const STATUS_LABEL: Record<string, string> = {
  submitted: "New",
  reviewing: "In review",
  approved: "Approved",
  edits_requested: "Edits requested",
  declined: "Declined",
};

function dateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toISOString().slice(0, 10);
}

export default async function AdminAffiliateQueuePage() {
  const admin = createAdminClient();

  // Pull submissions in review-pending statuses + join affiliate context.
  const { data: pending } = await admin
    .from("affiliate_copy_submissions")
    .select(
      "id, affiliate_id, channel, format, status, draft_url, scheduled_publish_at, submitted_at, counted_toward_gate, affiliates(slug, display_name, sophistication_tier, approved_pieces_count, strike_count)"
    )
    .in("status", ["submitted", "reviewing"])
    .order("submitted_at", { ascending: true })
    .limit(100);

  const { data: recent } = await admin
    .from("affiliate_copy_submissions")
    .select(
      "id, affiliate_id, channel, format, status, draft_url, scheduled_publish_at, submitted_at, counted_toward_gate, reviewed_at, affiliates(slug, display_name, sophistication_tier, approved_pieces_count, strike_count)"
    )
    .in("status", ["approved", "edits_requested", "declined"])
    .order("reviewed_at", { ascending: false })
    .limit(25);

  type RawRow = {
    id: string;
    affiliate_id: string;
    channel: string;
    format: string;
    status: string;
    draft_url: string | null;
    scheduled_publish_at: string | null;
    submitted_at: string;
    counted_toward_gate: boolean;
    affiliates:
      | {
          slug: string;
          display_name: string;
          sophistication_tier: string;
          approved_pieces_count: number;
          strike_count: number;
        }
      | null;
  };

  const flatten = (rows: RawRow[] | null | undefined): QueueRow[] =>
    (rows ?? []).map((r) => ({
      id: r.id,
      affiliate_id: r.affiliate_id,
      channel: r.channel,
      format: r.format,
      status: r.status,
      draft_url: r.draft_url,
      scheduled_publish_at: r.scheduled_publish_at,
      submitted_at: r.submitted_at,
      counted_toward_gate: r.counted_toward_gate,
      affiliate_slug: r.affiliates?.slug ?? "(unknown)",
      display_name: r.affiliates?.display_name ?? "(unknown)",
      sophistication_tier: r.affiliates?.sophistication_tier ?? "developing",
      approved_pieces_count: r.affiliates?.approved_pieces_count ?? 0,
      strike_count: r.affiliates?.strike_count ?? 0,
    }));

  const queue = flatten(pending as RawRow[] | null);
  const recentRows = flatten(recent as RawRow[] | null);

  return (
    <div>
      <p
        style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: 10,
          letterSpacing: ".32em",
          textTransform: "uppercase",
          color: "#6B6B6B",
          marginBottom: 8,
        }}
      >
        <Link href="/admin/affiliates" style={{ color: "#6B6B6B" }}>
          ← Affiliates
        </Link>
        {" · "}Queue
      </p>
      <h1
        style={{
          fontFamily: "'Playfair Display',Georgia,serif",
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "clamp(28px,4vw,40px)",
          lineHeight: 1.1,
          marginBottom: 8,
        }}
      >
        Brand-conformance queue.
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: "#6B6B6B", marginBottom: 32 }}>
        {queue.length} draft{queue.length === 1 ? "" : "s"} waiting for review.
        Sorted by oldest-submitted first so nothing rots.
      </p>

      {queue.length === 0 ? (
        <p
          style={{
            background: "#fff",
            border: "1px solid #E8E4DF",
            padding: "20px 24px",
            fontSize: 15,
            color: "#6B6B6B",
          }}
        >
          Inbox zero. Pending submissions show up here as affiliates post them.
        </p>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #E8E4DF", marginBottom: 32 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#FAF7F2", textAlign: "left" }}>
                {[
                  "Submitted",
                  "Affiliate",
                  "Tier",
                  "Channel",
                  "Format",
                  "Gate",
                  "Strikes",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 10,
                      letterSpacing: ".22em",
                      textTransform: "uppercase",
                      color: "#6B6B6B",
                      borderBottom: "1px solid #E8E4DF",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #E8E4DF" }}>
                  <td style={{ padding: "12px 14px", color: "#6B6B6B" }}>
                    {dateShort(r.submitted_at)}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 700 }}>{r.display_name}</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#6B6B6B" }}>
                      {r.affiliate_slug}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#6B6B6B" }}>
                    {r.sophistication_tier}
                  </td>
                  <td style={{ padding: "12px 14px" }}>{r.channel}</td>
                  <td style={{ padding: "12px 14px", color: "#6B6B6B" }}>{r.format}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "'Space Mono',monospace", fontSize: 13 }}>
                    {r.approved_pieces_count}/
                    {r.sophistication_tier === "proven" ? 1 : 3}
                  </td>
                  <td style={{ padding: "12px 14px", color: r.strike_count > 0 ? "#8B1A1A" : "#6B6B6B" }}>
                    {r.strike_count}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <Link
                      href={`/admin/affiliates/queue/${r.id}`}
                      style={{
                        fontFamily: "'Barlow Condensed',sans-serif",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: ".15em",
                        textTransform: "uppercase",
                        color: "#fff",
                        background: "#8B1A1A",
                        padding: "8px 14px",
                        textDecoration: "none",
                      }}
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {recentRows.length > 0 && (
        <>
          <h2
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 11,
              letterSpacing: ".25em",
              textTransform: "uppercase",
              color: "#8B1A1A",
              marginBottom: 16,
            }}
          >
            Recently reviewed
          </h2>
          <div style={{ background: "#fff", border: "1px solid #E8E4DF" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#FAF7F2", textAlign: "left" }}>
                  {["Status", "Affiliate", "Channel", "Submitted", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        fontFamily: "'Space Mono',monospace",
                        fontSize: 10,
                        letterSpacing: ".22em",
                        textTransform: "uppercase",
                        color: "#6B6B6B",
                        borderBottom: "1px solid #E8E4DF",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentRows.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #E8E4DF" }}>
                    <td style={{ padding: "10px 14px", fontFamily: "'Space Mono',monospace", fontSize: 11, color: r.status === "declined" ? "#8B1A1A" : "#6B6B6B" }}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </td>
                    <td style={{ padding: "10px 14px" }}>{r.display_name}</td>
                    <td style={{ padding: "10px 14px", color: "#6B6B6B" }}>{r.channel}</td>
                    <td style={{ padding: "10px 14px", color: "#6B6B6B" }}>{dateShort(r.submitted_at)}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <Link
                        href={`/admin/affiliates/queue/${r.id}`}
                        style={{
                          fontFamily: "'Barlow Condensed',sans-serif",
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: ".15em",
                          textTransform: "uppercase",
                          color: "#8B1A1A",
                          textDecoration: "underline",
                        }}
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
