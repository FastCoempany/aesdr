import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { getCachedArtifact } from "@/lib/artifacts/generate";
import type { RedlineData } from "@/lib/artifacts/types";
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import ArtifactBackfill from "@/components/artifacts/ArtifactBackfill";
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

  // Access gate: user must have picked this artifact OR purchased it OR be an admin
  const isAdmin = isAdminEmail(user?.email);

  // Admins always land on the fully-baked sample so the founder can demo the
  // artifact to affiliates without a completed course — no more getting stuck
  // on the "Composing…" state. `?real=1` escapes to the real cached artifact;
  // `?preview=1` (above) is the same sample with no auth, for a shareable link.
  if (isAdmin && sp.real !== "1") {
    return <RedlineView data={MOCK_REDLINE} />;
  }

  if (!isAdmin) {
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
    // Self-healing empty state: try the backfill generation, render the real
    // Redline on success, offer a retry on failure (see ArtifactBackfill).
    return (
      <ArtifactBackfill
        type="redline"
        noun="Redline"
        eyebrow="Not yet returned"
        title="The editor has not yet read it."
        accent="#C53030"
        mascot={<Mascot pose="diagnosis" size={MASCOT_SIZE.card} priority />}
      />
    );
  }

  return <RedlineView data={artifact.artifact_data as RedlineData} />;
}
