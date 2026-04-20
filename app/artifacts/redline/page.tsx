import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";
import { getCachedArtifact } from "@/lib/artifacts/generate";
import type { RedlineData } from "@/lib/artifacts/types";
import RedlineView from "./RedlineView";
import { MOCK_REDLINE } from "./mock";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Redline | AESDR",
  description: "Your end-of-course manuscript, returned with edits.",
};

export default async function RedlinePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  if (sp.preview === "1") {
    return <RedlineView data={MOCK_REDLINE} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Access gate: user must have picked this artifact OR purchased it OR have bypass
  const cookieStore = await cookies();
  const hasBypass = cookieStore.get("aesdr_bypass")?.value === "1";

  if (!hasBypass) {
    const { data: pick } = await supabase
      .from("reveal_picks")
      .select("chosen_artifact")
      .eq("user_id", user.id)
      .maybeSingle();

    const hasFreePick = pick?.chosen_artifact === "redline";

    if (!hasFreePick) {
      const { data: unlock } = await supabase
        .from("artifact_unlocks")
        .select("id")
        .eq("user_id", user.id)
        .eq("artifact_type", "redline")
        .maybeSingle();

      if (!unlock) {
        redirect("/dashboard");
      }
    }
  }

  const artifact = await getCachedArtifact(user.id, "redline");

  if (!artifact) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#FAF7F2",
          color: "#1A1A1A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 5%",
          fontFamily: "'Source Serif 4', Georgia, serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "520px" }}>
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "10px",
              letterSpacing: ".3em",
              textTransform: "uppercase",
              color: "#C53030",
              marginBottom: "16px",
            }}
          >
            Not yet returned
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 900,
              fontStyle: "italic",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            The editor has not yet read it.
          </h1>
          <p style={{ fontSize: "16px", fontStyle: "italic", color: "#6B6B6B", lineHeight: 1.6, marginBottom: "28px" }}>
            Your Redline will be prepared once all twelve lessons are complete.
            Return here after you submit the final draft.
          </p>
          <Link
            href="/dashboard"
            style={{
              display: "inline-block",
              padding: "14px 32px",
              background: "#1A1A1A",
              color: "#FAF7F2",
              textDecoration: "none",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: ".22em",
              textTransform: "uppercase",
            }}
          >
            Back to the Journey
          </Link>
        </div>
      </main>
    );
  }

  return <RedlineView data={artifact.artifact_data as RedlineData} />;
}
