import { createAdminClient } from "@/utils/supabase/admin";
import { setLessonFeedbackStatus } from "@/app/actions/admin-lesson-feedback";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  email: string | null;
  lesson_id: string;
  role: string | null;
  kind: "stuck" | "disagree" | "didnt_land" | "other";
  note: string | null;
  last_screen: number | null;
  status: "new" | "reviewed" | "dismissed";
  created_at: string;
}

const KIND_LABEL: Record<Row["kind"], string> = {
  stuck: "Stuck",
  disagree: "Disagrees",
  didnt_land: "Didn't land",
  other: "Other",
};

function pill(status: Row["status"]) {
  const map: Record<Row["status"], { bg: string; fg: string; label: string }> = {
    new: { bg: "#FAF7F2", fg: "#8B1A1A", label: "New" },
    reviewed: { bg: "#1A1A1A", fg: "#FAF7F2", label: "Reviewed" },
    dismissed: { bg: "#E8E4DF", fg: "#6B6B6B", label: "Dismissed" },
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

export default async function LessonFeedbackAdminPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("lesson_feedback")
    .select("id, email, lesson_id, role, kind, note, last_screen, status, created_at")
    .order("created_at", { ascending: false })
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
        Admin · Lesson feedback
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
        What&rsquo;s not landing.
      </h1>

      <div style={{ display: "grid", gap: 16 }}>
        {rows.length === 0 && <p style={{ color: "#6B6B6B" }}>No feedback yet.</p>}
        {rows.map((r) => (
          <article
            key={r.id}
            style={{ background: "#fff", border: "1px solid #E8E4DF", padding: "20px 24px" }}
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
                <strong>Lesson {r.lesson_id}</strong>
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
                  {KIND_LABEL[r.kind]}
                </span>
                {r.role && (
                  <span style={{ color: "#6B6B6B", marginLeft: 10, fontSize: 12 }}>
                    {r.role}
                  </span>
                )}
                {r.last_screen != null && (
                  <span style={{ color: "#6B6B6B", marginLeft: 10, fontSize: 12 }}>
                    screen {r.last_screen}
                  </span>
                )}
              </div>
              {pill(r.status)}
            </div>

            {r.note && (
              <p
                style={{
                  fontFamily: "Georgia,'Source Serif 4',serif",
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "#1A1A1A",
                  marginBottom: 12,
                }}
              >
                &ldquo;{r.note}&rdquo;
              </p>
            )}
            <p
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10,
                letterSpacing: ".22em",
                color: "#6B6B6B",
                marginBottom: 16,
              }}
            >
              {r.email ?? "—"} · {new Date(r.created_at).toISOString().slice(0, 10)}
            </p>

            <form action={setLessonFeedbackStatus} style={{ display: "flex", gap: 8 }}>
              <input type="hidden" name="id" value={r.id} />
              {r.status !== "reviewed" && (
                <button
                  type="submit"
                  name="status"
                  value="reviewed"
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
                  Mark reviewed
                </button>
              )}
              {r.status !== "dismissed" && (
                <button
                  type="submit"
                  name="status"
                  value="dismissed"
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
                  Dismiss
                </button>
              )}
              {r.status !== "new" && (
                <button
                  type="submit"
                  name="status"
                  value="new"
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
