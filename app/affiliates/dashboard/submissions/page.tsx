import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import AesdrBrand from "@/components/AesdrBrand";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  gateRequirementFor,
  hasExitedGate,
  type AffiliateRecord,
} from "@/lib/affiliate-entity";
import { getAffiliateForUser } from "@/lib/affiliate-entity";
import SubmitCopyForm from "./SubmitCopyForm";

export const metadata: Metadata = {
  title: "Submissions | AESDR Affiliates",
  description:
    "Submit your drafts for brand-conformance review and track approval status.",
};

interface SubmissionRow {
  id: string;
  channel: string;
  format: string;
  status: string;
  draft_url: string | null;
  edit_requests: string | null;
  decline_reason: string | null;
  reviewer_notes: string | null;
  counted_toward_gate: boolean;
  submitted_at: string;
  reviewed_at: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  reviewing: "Reviewing",
  approved: "Approved",
  edits_requested: "Edits requested",
  declined: "Declined",
};

const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  submitted: { bg: "#E8E4DF", fg: "#1A1A1A" },
  reviewing: { bg: "#1A1A1A", fg: "#FAF7F2" },
  approved: { bg: "#1A1A1A", fg: "#FAF7F2" },
  edits_requested: { bg: "#FAF7F2", fg: "#8B1A1A" },
  declined: { bg: "#8B1A1A", fg: "#FAF7F2" },
};

function dateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toISOString().slice(0, 10);
}

export default async function AffiliateSubmissionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/affiliates/dashboard/submissions");

  const affiliate = await getAffiliateForUser({
    userId: user.id,
    jwtAffiliateSlug: user.user_metadata?.affiliate_slug as string | undefined,
    jwtPartnerSlug: user.user_metadata?.partner_slug as string | undefined,
  });

  if (!affiliate) {
    redirect("/affiliates/dashboard");
  }

  const admin = createAdminClient();
  const { data: submissionsData, error: submissionsError } = await admin
    .from("affiliate_copy_submissions")
    .select(
      "id, channel, format, status, draft_url, edit_requests, decline_reason, reviewer_notes, counted_toward_gate, submitted_at, reviewed_at"
    )
    .eq("affiliate_id", affiliate.id)
    .order("submitted_at", { ascending: false })
    .limit(50);

  // R5-EE-5: distinguish "no submissions yet" from "the query failed." Falling
  // back to [] on an error rendered the new-user "paste your first draft" empty
  // state over a real history — telling an affiliate their work vanished.
  const submissions = (submissionsData ?? []) as SubmissionRow[];
  const loadFailed = !!submissionsError;
  const gateRequirement = gateRequirementFor(affiliate.sophistication_tier);
  const gateCleared = hasExitedGate(affiliate);
  const piecesRemaining = Math.max(
    gateRequirement - affiliate.approved_pieces_count,
    0
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        color: "var(--ink)",
        fontFamily: "var(--serif)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 5%",
          borderBottom: "1px solid var(--light)",
        }}
      >
        <AesdrBrand
          style={{
            textDecoration: "none",
            color: "inherit",
            fontFamily: "var(--display)",
            fontSize: 18,
            fontWeight: 900,
            fontStyle: "italic",
            letterSpacing: ".05em",
            background: "var(--iris)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "iris 3s linear infinite",
          }}
        />
        <SignOutButton />
      </header>

      <section style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px 24px" }}>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".32em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 12,
          }}
        >
          <Link href="/affiliates/dashboard" style={{ color: "var(--muted)" }}>
            ← Dashboard
          </Link>
          {" · "}Submissions
        </p>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "clamp(32px,4.5vw,44px)",
            lineHeight: 1.05,
            marginBottom: 12,
          }}
        >
          {gateCleared
            ? "Post freely — gate cleared."
            : "Submit drafts for brand-fit review."}
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted)", marginBottom: 8 }}>
          {gateCleared
            ? "You're off the review queue. Submissions are still welcome for a sanity check, but not required."
            : `${piecesRemaining} of ${gateRequirement} approved ${gateRequirement === 1 ? "piece" : "pieces"} remaining before the gate exits and you post freely.`}
        </p>
        <GateProgress affiliate={affiliate} requirement={gateRequirement} />
      </section>

      <section style={{ maxWidth: 880, margin: "0 auto", padding: "16px 24px 48px" }}>
        <SubmitCopyForm />
      </section>

      <section style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 96px" }}>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".25em",
            textTransform: "uppercase",
            color: "var(--crimson)",
            marginBottom: 16,
          }}
        >
          Your submissions
        </p>
        {loadFailed ? (
          <p
            role="alert"
            style={{
              fontSize: 15,
              color: "var(--crimson)",
              borderLeft: "3px solid var(--crimson)",
              paddingLeft: 14,
              lineHeight: 1.6,
            }}
          >
            We couldn&rsquo;t load your submissions right now. Your history is
            safe &mdash; this is a loading error, not a reset. Reload the page to
            try again.
          </p>
        ) : submissions.length === 0 ? (
          <p style={{ fontSize: 15, color: "var(--muted)" }}>
            No submissions yet. Paste your first draft above.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {submissions.map((s) => (
              <SubmissionCard key={s.id} submission={s} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function GateProgress({
  affiliate,
  requirement,
}: {
  affiliate: AffiliateRecord;
  requirement: number;
}) {
  const filled = Math.min(affiliate.approved_pieces_count, requirement);
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginTop: 16,
        marginBottom: 8,
        alignItems: "center",
      }}
    >
      {Array.from({ length: requirement }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 56,
            height: 6,
            background: i < filled ? "var(--crimson)" : "var(--light)",
          }}
        />
      ))}
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: ".22em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginLeft: 4,
        }}
      >
        {filled} / {requirement} · {affiliate.sophistication_tier}
      </span>
    </div>
  );
}

function SubmissionCard({ submission }: { submission: SubmissionRow }) {
  const color = STATUS_COLOR[submission.status] ?? { bg: "#E8E4DF", fg: "#1A1A1A" };
  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid var(--light)",
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          {submission.channel} · {submission.format}
          {submission.counted_toward_gate && " · counted"}
        </p>
        <span
          style={{
            background: color.bg,
            color: color.fg,
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            padding: "3px 10px",
          }}
        >
          {STATUS_LABEL[submission.status] ?? submission.status}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "var(--muted)",
          fontFamily: "var(--mono)",
          letterSpacing: ".05em",
        }}
      >
        Submitted {dateShort(submission.submitted_at)}
        {submission.reviewed_at && ` · reviewed ${dateShort(submission.reviewed_at)}`}
      </p>
      {submission.draft_url && (
        <p style={{ margin: "8px 0 0", fontSize: 14 }}>
          <a
            href={submission.draft_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--crimson)", textDecoration: "underline" }}
          >
            {submission.draft_url}
          </a>
        </p>
      )}
      {submission.status === "edits_requested" && submission.edit_requests && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            background: "var(--cream)",
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: "var(--crimson)",
              marginBottom: 6,
            }}
          >
            Edits to make
          </p>
          {submission.edit_requests}
        </div>
      )}
      {submission.status === "declined" && submission.decline_reason && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            background: "var(--cream)",
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: "var(--crimson)",
              marginBottom: 6,
            }}
          >
            Why
          </p>
          {submission.decline_reason}
        </div>
      )}
      {submission.status === "approved" && submission.reviewer_notes && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            background: "var(--cream)",
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            fontStyle: "italic",
            color: "var(--muted)",
          }}
        >
          {submission.reviewer_notes}
        </div>
      )}
    </article>
  );
}
