import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";
import { LESSONS } from "@/utils/progress/types";
import RevealView from "./RevealView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Reveal | AESDR",
  description: "Choose your keeper — two readings of the same story.",
};

export default async function RevealPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check if user already picked
  const { data: existingPick } = await supabase
    .from("reveal_picks")
    .select("chosen_artifact")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingPick) {
    const dest =
      existingPick.chosen_artifact === "playbill"
        ? "/artifacts/playbill"
        : "/artifacts/redline";
    redirect(dest);
  }

  // Completion gate — all 12 lessons must be done
  const { data: progress } = await supabase
    .from("course_progress")
    .select("lesson_id, is_completed")
    .eq("user_id", user.id);

  const completedCount = (progress || []).filter(
    (r) => r.is_completed
  ).length;

  // Founder bypass
  const cookieStore = await cookies();
  const hasBypass = cookieStore.get("aesdr_bypass")?.value === "1";

  if (completedCount < LESSONS.length && !hasBypass) {
    redirect("/dashboard");
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Student";
  const role = (user.user_metadata?.role as string) || "SDR";

  return (
    <RevealView
      studentName={fullName}
      role={role.toUpperCase()}
    />
  );
}
