import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { getCachedArtifact } from "@/lib/artifacts/generate";
import type { PlaybillData } from "@/lib/artifacts/types";
import { Mascot, MASCOT_SIZE } from "@/components/brand/Mascot";
import ArtifactBackfill from "@/components/artifacts/ArtifactBackfill";
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

  // Access gate: user must have picked this artifact OR purchased it OR be an admin
  const isAdmin = isAdminEmail(user?.email);

  // Admins always land on the fully-baked sample so the founder can demo the
  // artifact to affiliates without a completed course — no more getting stuck
  // on the "Composing…" state. `?real=1` escapes to the real cached artifact;
  // `?preview=1` (above) is the same sample with no auth, for a shareable link.
  if (isAdmin && sp.real !== "1") {
    return <PlaybillView data={MOCK_PLAYBILL} />;
  }

  if (!isAdmin) {
    const { data: pick } = await supabase
      .from("reveal_picks")
      .select("chosen_artifact")
      .eq("user_id", user.id)
      .maybeSingle();

    const hasFreePick = pick?.chosen_artifact === "playbill";

    if (!hasFreePick) {
      const { data: unlock } = await supabase
        .from("artifact_unlocks")
        .select("id")
        .eq("user_id", user.id)
        .eq("artifact_type", "playbill")
        .maybeSingle();

      if (!unlock) {
        redirect("/dashboard");
      }
    }
  }

  const artifact = await getCachedArtifact(user.id, "playbill");

  if (!artifact) {
    // Self-healing empty state: try the backfill generation, render the real
    // Playbill on success, offer a retry on failure (see ArtifactBackfill).
    return (
      <ArtifactBackfill
        type="playbill"
        noun="Playbill"
        eyebrow="Not yet staged"
        title="The curtain has not risen."
        accent="#8B1A1A"
        mascot={<Mascot pose="owner" size={MASCOT_SIZE.card} priority />}
      />
    );
  }

  return <PlaybillView data={artifact.artifact_data as PlaybillData} />;
}
