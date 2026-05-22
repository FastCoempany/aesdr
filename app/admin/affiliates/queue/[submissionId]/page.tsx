import Link from "next/link";
import { notFound } from "next/navigation";

import { createAdminClient } from "@/utils/supabase/admin";
import ReviewActions from "./ReviewActions";

export const dynamic = "force-dynamic";

function dateLong(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

export default async function AdminSubmissionReviewPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const admin = createAdminClient();

  const { data } = await admin
    .from("affiliate_copy_submissions")
    .select(
      "id, affiliate_id, channel, format, status, draft_body, draft_url, scheduled_publish_at, reviewer_notes, edit_requests, decline_reason, decline_category, submitted_at, reviewed_at, reviewer_email, counted_toward_gate, affiliates(slug, display_name, email, sophistication_tier, approved_pieces_count, strike_count, strike_log, status)"
    )
    .eq("id", submissionId)
    .maybeSingle();

  if (!data) notFound();

  type AffiliateJoin = {
    slug: string;
    display_name: string;
    email: string;
    sophistication_tier: string;
    approved_pieces_count: number;
    strike_count: number;
    strike_log: Array<{ category: string; recorded_at: string }>;
    status: string;
  };

  const submission = data as typeof data & { affiliates: AffiliateJoin | null };
  const affiliate = submission.affiliates;

  const reviewable = submission.status === "submitted" || submission.status === "reviewing";

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
        <Link href="/admin/affiliates/queue" style={{ color: "#6B6B6B" }}>
          ← Queue
        </Link>
        {" · "}Submission {submission.id.slice(0, 8)}
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
        {affiliate?.display_name ?? "(unknown affiliate)"}
      </h1>
      <p style={{ fontSize: 15, color: "#6B6B6B", marginBottom: 24 }}>
        {submission.channel} · {submission.format} · submitted {dateLong(submission.submitted_at)}
        {submission.scheduled_publish_at && ` · planned publish ${dateLong(submission.scheduled_publish_at)}`}
      </p>

      {/* Affiliate context */}
      {affiliate && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            { label: "Slug", value: affiliate.slug },
            { label: "Tier", value: affiliate.sophistication_tier },
            {
              label: "Gate progress",
              value: `${affiliate.approved_pieces_count}/${affiliate.sophistication_tier === "proven" ? 1 : 3}`,
            },
            {
              label: "Strikes",
              value: String(affiliate.strike_count),
              emphasis: affiliate.strike_count > 0,
            },
            { label: "Status", value: affiliate.status },
          ].map((c) => (
            <div
              key={c.label}
              style={{
                background: "#fff",
                border: c.emphasis ? "2px solid #8B1A1A" : "1px solid #E8E4DF",
                padding: "12px 14px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 9,
                  letterSpacing: ".22em",
                  textTransform: "uppercase",
                  color: "#6B6B6B",
                }}
              >
                {c.label}
              </p>
              <p style={{ margin: 0, fontFamily: "Georgia,serif", fontSize: 16, color: c.emphasis ? "#8B1A1A" : "#1A1A1A" }}>
                {c.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Draft body */}
      <div
        data-surface="dark"
        style={{
          background: "#1A1A1A",
          color: "#FAF7F2",
          padding: "24px 28px",
          marginBottom: 24,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "'Space Mono',monospace",
            fontSize: 10,
            letterSpacing: ".32em",
            textTransform: "uppercase",
            color: "rgba(250,247,242,0.6)",
            marginBottom: 12,
          }}
        >
          Draft
        </p>
        <pre
          style={{
            margin: 0,
            fontFamily: "'Space Mono',monospace",
            fontSize: 13,
            lineHeight: 1.65,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {submission.draft_body}
        </pre>
        {submission.draft_url && (
          <p style={{ margin: "16px 0 0", fontSize: 13 }}>
            <a
              href={submission.draft_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#FAF7F2", textDecoration: "underline" }}
            >
              {submission.draft_url}
            </a>
          </p>
        )}
      </div>

      {reviewable ? (
        <ReviewActions submissionId={submission.id} />
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1px solid #E8E4DF",
            padding: "20px 24px",
          }}
        >
          <p style={{ margin: 0, fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: 8 }}>
            Already reviewed · {submission.status}
          </p>
          {submission.reviewer_notes && (
            <p style={{ margin: "0 0 8px", whiteSpace: "pre-wrap" }}>
              <strong>Notes:</strong> {submission.reviewer_notes}
            </p>
          )}
          {submission.edit_requests && (
            <p style={{ margin: "0 0 8px", whiteSpace: "pre-wrap" }}>
              <strong>Edits requested:</strong> {submission.edit_requests}
            </p>
          )}
          {submission.decline_reason && (
            <p style={{ margin: "0 0 8px", whiteSpace: "pre-wrap" }}>
              <strong>Decline reason ({submission.decline_category}):</strong> {submission.decline_reason}
            </p>
          )}
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#6B6B6B" }}>
            Reviewed by {submission.reviewer_email} on {dateLong(submission.reviewed_at)}
          </p>
        </div>
      )}
    </div>
  );
}
