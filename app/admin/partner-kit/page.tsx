/**
 * /admin/partner-kit — list tokens, mint new ones, view recent access.
 *
 * Sits behind requireAdmin() (via app/admin/layout.tsx). Shows:
 *   - Mint form (slug, label, days, notes) → POSTs to a server action
 *   - Token list (issued, expires, revoked, partner)
 *   - Access log (most recent 200 events)
 */

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import { mintToken, signToken } from "@/lib/partner-kit-tokens";

type TokenRow = {
  id: string;
  partner_slug: string;
  partner_label: string | null;
  notes: string | null;
  issued_at: string;
  expires_at: string;
  revoked_at: string | null;
  revoked_reason: string | null;
};

type AccessRow = {
  id: string;
  token_id: string | null;
  partner_slug: string;
  doc_slug: string | null;
  event: "view" | "auth" | "denied";
  ip_hash: string | null;
  user_agent: string | null;
  referrer: string | null;
  accessed_at: string;
};

async function mintAction(formData: FormData) {
  "use server";
  const slug = String(formData.get("partnerSlug") || "").trim();
  const label = String(formData.get("partnerLabel") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const days = Math.max(1, Math.min(365, Number(formData.get("days") || 90)));

  if (!slug) throw new Error("Partner slug is required");
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Partner slug must be lowercase letters, digits, and hyphens only");
  }

  await mintToken({
    partnerSlug: slug,
    partnerLabel: label || undefined,
    notes: notes || undefined,
    expiresInDays: days,
  });

  revalidatePath("/admin/partner-kit");
}

async function revokeAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const reason = String(formData.get("reason") || "manually revoked");
  if (!id) throw new Error("Token id required");

  const supabase = createAdminClient();
  await supabase
    .from("partner_kit_tokens")
    .update({ revoked_at: new Date().toISOString(), revoked_reason: reason })
    .eq("id", id);

  revalidatePath("/admin/partner-kit");
}

export default async function AdminPartnerKit() {
  const supabase = createAdminClient();

  const [tokensRes, accessRes] = await Promise.all([
    supabase
      .from("partner_kit_tokens")
      .select("*")
      .order("issued_at", { ascending: false })
      .limit(50),
    supabase
      .from("partner_kit_access")
      .select("*")
      .order("accessed_at", { ascending: false })
      .limit(200),
  ]);

  const tokens = (tokensRes.data ?? []) as TokenRow[];
  const access = (accessRes.data ?? []) as AccessRow[];

  // Aggregate views per token for a quick at-a-glance number
  const viewsByToken = new Map<string, number>();
  for (const row of access) {
    if (row.event === "view" && row.token_id) {
      viewsByToken.set(row.token_id, (viewsByToken.get(row.token_id) ?? 0) + 1);
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aesdr.com";
  // eslint-disable-next-line react-hooks/purity -- async server component, runs per-request
  const nowMs = Date.now();

  return (
    <>
      <header style={{ marginBottom: "32px" }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: ".3em", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "8px" }}>
          Partner Kit · Private Access
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "36px", fontWeight: 900, fontStyle: "italic", lineHeight: "1.1" }}>
          Tokens & Access Log
        </h1>
      </header>

      <section style={cardStyle}>
        <h2 style={h2Style}>Mint a new partner token</h2>
        <form action={mintAction} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={labelStyle}>
            <span>Partner slug *</span>
            <input
              name="partnerSlug"
              required
              placeholder="acme-newsletter"
              pattern="^[a-z0-9-]+$"
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            <span>Partner label</span>
            <input
              name="partnerLabel"
              placeholder="Acme Newsletter (Jordan Doe)"
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            <span>Expires in (days)</span>
            <input
              name="days"
              type="number"
              defaultValue={90}
              min={1}
              max={365}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            <span>Notes (private)</span>
            <input
              name="notes"
              placeholder="Pilot kickoff 2026-05-12"
              style={inputStyle}
            />
          </label>
          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" style={btnStyle}>Mint Token →</button>
          </div>
        </form>
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>Active &amp; recent tokens</h2>
        {tokens.length === 0 ? (
          <p style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#6B6B6B" }}>No tokens yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Partner</th>
                  <th style={thStyle}>Issued</th>
                  <th style={thStyle}>Expires</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Views</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => {
                  const isRevoked = !!t.revoked_at;
                  const isExpired = new Date(t.expires_at).getTime() < nowMs;
                  const status = isRevoked ? "revoked" : isExpired ? "expired" : "active";
                  const views = viewsByToken.get(t.id) ?? 0;
                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid #E8E4DF" }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700 }}>{t.partner_label || t.partner_slug}</div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#6B6B6B" }}>{t.partner_slug}</div>
                        {t.notes && <div style={{ fontSize: 12, color: "#6B6B6B", fontStyle: "italic", marginTop: 4 }}>{t.notes}</div>}
                      </td>
                      <td style={tdStyle}>{fmt(t.issued_at)}</td>
                      <td style={tdStyle}>{fmt(t.expires_at)}</td>
                      <td style={tdStyle}>
                        <span style={statusStyle(status)}>{status}</span>
                        {t.revoked_reason && <div style={{ fontSize: 11, color: "#6B6B6B", fontStyle: "italic" }}>{t.revoked_reason}</div>}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: "'Space Mono', monospace" }}>{views}</td>
                      <td style={tdStyle}>
                        {!isRevoked && !isExpired && (
                          <details>
                            <summary style={{ cursor: "pointer", fontSize: 12 }}>actions</summary>
                            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                              <CopyLinkBlock baseUrl={baseUrl} tid={t.id} expiresAt={t.expires_at} />
                              <form action={revokeAction}>
                                <input type="hidden" name="id" value={t.id} />
                                <input
                                  name="reason"
                                  placeholder="reason (optional)"
                                  style={{ ...inputStyle, width: 180, marginRight: 8, fontSize: 12, padding: "4px 6px" }}
                                />
                                <button type="submit" style={{ ...btnStyle, background: "#8B1A1A", padding: "6px 12px", fontSize: 11 }}>
                                  Revoke
                                </button>
                              </form>
                            </div>
                          </details>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>Recent access (last 200 events)</h2>
        {access.length === 0 ? (
          <p style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#6B6B6B" }}>No access events yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>When</th>
                  <th style={thStyle}>Partner</th>
                  <th style={thStyle}>Event</th>
                  <th style={thStyle}>Doc</th>
                  <th style={thStyle}>IP hash</th>
                  <th style={thStyle}>User agent</th>
                </tr>
              </thead>
              <tbody>
                {access.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #E8E4DF" }}>
                    <td style={tdStyle}>{fmt(a.accessed_at)}</td>
                    <td style={tdStyle}>{a.partner_slug}</td>
                    <td style={tdStyle}>
                      <span style={statusStyle(a.event === "denied" ? "revoked" : a.event === "auth" ? "active" : "active")}>{a.event}</span>
                    </td>
                    <td style={tdStyle}>{a.doc_slug || "(index)"}</td>
                    <td style={{ ...tdStyle, fontFamily: "'Space Mono', monospace", fontSize: 11 }}>{a.ip_hash || "—"}</td>
                    <td style={{ ...tdStyle, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{a.user_agent || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function CopyLinkBlock({
  baseUrl,
  tid,
  expiresAt,
}: {
  baseUrl: string;
  tid: string;
  expiresAt: string;
}) {
  const signed = signToken(tid, new Date(expiresAt));
  const url = `${baseUrl}/partners/kit-private?t=${signed}`;
  return (
    <div>
      <div style={{ fontSize: 11, color: "#6B6B6B", marginBottom: 4 }}>Access URL — share with partner:</div>
      <code
        style={{
          display: "block",
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          padding: "8px 10px",
          background: "#FAF7F2",
          border: "1px solid #E8E4DF",
          wordBreak: "break-all",
          userSelect: "all",
        }}
      >
        {url}
      </code>
    </div>
  );
}

function fmt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E8E4DF",
  padding: "24px 28px",
  marginBottom: 24,
};
const h2Style: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: "italic",
  fontWeight: 900,
  fontSize: 22,
  marginBottom: 16,
  color: "#1A1A1A",
};
const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontFamily: "'Space Mono', monospace",
  fontSize: 11,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "#6B6B6B",
};
const inputStyle: React.CSSProperties = {
  fontFamily: "'Source Serif 4', Georgia, serif",
  fontSize: 14,
  padding: "8px 10px",
  border: "1px solid #E8E4DF",
  background: "#FAF7F2",
  color: "#1A1A1A",
};
const btnStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 12,
  letterSpacing: ".15em",
  textTransform: "uppercase",
  padding: "10px 20px",
  background: "#1A1A1A",
  color: "#fff",
  border: 0,
  cursor: "pointer",
};
const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: "'Source Serif 4', Georgia, serif",
  fontSize: 14,
};
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontFamily: "'Space Mono', monospace",
  fontSize: 10,
  letterSpacing: ".15em",
  textTransform: "uppercase",
  color: "#6B6B6B",
  borderBottom: "2px solid #1A1A1A",
};
const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  verticalAlign: "top",
};

function statusStyle(status: string): React.CSSProperties {
  const colors: Record<string, { bg: string; fg: string }> = {
    active: { bg: "#E8F5E9", fg: "#1B5E20" },
    expired: { bg: "#FFF3E0", fg: "#6B6B6B" },
    revoked: { bg: "#FFEBEE", fg: "#8B1A1A" },
  };
  const c = colors[status] || { bg: "#FAF7F2", fg: "#6B6B6B" };
  return {
    display: "inline-block",
    padding: "2px 8px",
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: ".1em",
    textTransform: "uppercase",
    background: c.bg,
    color: c.fg,
  };
}
