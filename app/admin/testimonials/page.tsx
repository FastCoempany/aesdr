import { createAdminClient } from "@/utils/supabase/admin";
import { setTestimonialStatus } from "@/app/actions/admin-testimonial";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  email: string;
  display_name: string | null;
  role: string | null;
  rating: number;
  body: string;
  permit_publish: boolean;
  status: "pending" | "approved" | "rejected";
  status_note: string | null;
  submitted_at: string;
}

function pill(status: Row["status"]) {
  const map: Record<Row["status"], { bg: string; fg: string; label: string }> = {
    pending: { bg: "#FAF7F2", fg: "#8B1A1A", label: "Pending" },
    approved: { bg: "#1A1A1A", fg: "#FAF7F2", label: "Approved" },
    rejected: { bg: "#E8E4DF", fg: "#6B6B6B", label: "Rejected" },
  };
  const s = map[status];
  return (
    <span
      style={{
        display: "inline-block",
        background: s.bg,
        color: s.fg,
        fontFamily: "'Space Mono',monospace",
        fontSize: 9,
        letterSpacing: ".22em",
        textTransform: "uppercase",
        padding: "4px 10px",
      }}
    >
      {s.label}
    </span>
  );
}

export default async function TestimonialsAdminPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("testimonials")
    .select(
      "id, email, display_name, role, rating, body, permit_publish, status, status_note, submitted_at"
    )
    .order("submitted_at", { ascending: false })
    .limit(500);

  const rows: Row[] = (data as Row[]) ?? [];

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
        Admin · Review queue
      </p>
      <h1
        style={{
          fontFamily: "'Playfair Display',Georgia,serif",
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "clamp(28px,4vw,40px)",
          lineHeight: 1.1,
          marginBottom: 24,
        }}
      >
        Testimonials.
      </h1>

      <div style={{ display: "grid", gap: 16 }}>
        {rows.length === 0 && (
          <p style={{ color: "#6B6B6B" }}>No submissions yet.</p>
        )}
        {rows.map((r) => (
          <article
            key={r.id}
            style={{
              background: "#fff",
              border: "1px solid #E8E4DF",
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 8,
                alignItems: "center",
              }}
            >
              <div>
                <strong>{r.display_name || r.email}</strong>
                <span style={{ color: "#6B6B6B", marginLeft: 10, fontSize: 13 }}>
                  {r.email}
                </span>
                {r.role && (
                  <span
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      marginLeft: 10,
                      fontSize: 10,
                      letterSpacing: ".18em",
                      textTransform: "uppercase",
                      color: "#8B1A1A",
                    }}
                  >
                    {r.role}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "'Playfair Display',Georgia,serif",
                    fontStyle: "italic",
                    fontWeight: 900,
                    fontSize: 20,
                  }}
                >
                  {r.rating}/5
                </span>
                {pill(r.status)}
              </div>
            </div>

            <p
              style={{
                fontFamily: "Georgia,'Source Serif 4',serif",
                fontSize: 16,
                lineHeight: 1.6,
                color: "#1A1A1A",
                marginBottom: 12,
              }}
            >
              &ldquo;{r.body}&rdquo;
            </p>
            <p
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10,
                letterSpacing: ".22em",
                color: "#6B6B6B",
                marginBottom: 16,
              }}
            >
              {new Date(r.submitted_at).toISOString().slice(0, 10)}
              {!r.permit_publish && " · publish=NO"}
            </p>

            <form action={setTestimonialStatus} style={{ display: "flex", gap: 8 }}>
              <input type="hidden" name="id" value={r.id} />
              {r.status !== "approved" && r.permit_publish && (
                <button
                  type="submit"
                  name="status"
                  value="approved"
                  style={{
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    background: "#8B1A1A",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  Approve
                </button>
              )}
              {r.status !== "rejected" && (
                <button
                  type="submit"
                  name="status"
                  value="rejected"
                  style={{
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    background: "transparent",
                    color: "#6B6B6B",
                    border: "1px solid #B5B0A8",
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  Reject
                </button>
              )}
              {r.status !== "pending" && (
                <button
                  type="submit"
                  name="status"
                  value="pending"
                  style={{
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    background: "transparent",
                    color: "#6B6B6B",
                    border: "1px solid #B5B0A8",
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  Re-open
                </button>
              )}
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
