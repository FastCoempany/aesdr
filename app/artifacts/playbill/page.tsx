import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { getCachedArtifact } from "@/lib/artifacts/generate";
import type { PlaybillData } from "@/lib/artifacts/types";
import PlaybillView from "./PlaybillView";
import { MOCK_PLAYBILL } from "./mock";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Playbill | AESDR",
  description: "Your end-of-course self-portrait, staged in three acts.",
};

export default async function PlaybillPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  if (sp.preview === "1") {
    return <PlaybillView data={MOCK_PLAYBILL} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const artifact = await getCachedArtifact(user.id, "playbill");

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
              color: "#8B1A1A",
              marginBottom: "16px",
            }}
          >
            Not yet staged
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
            The curtain has not risen.
          </h1>
          <p style={{ fontSize: "16px", fontStyle: "italic", color: "#6B6B6B", lineHeight: 1.6, marginBottom: "28px" }}>
            Your Playbill will be composed once all twelve lessons are complete.
            Return here after the final performance.
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

  return <PlaybillView data={artifact.artifact_data as PlaybillData} />;
}
