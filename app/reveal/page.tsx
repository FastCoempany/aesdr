import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/admin";
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

  // Completion gate — all 12 courses must be done
  const { data: progress } = await supabase
    .from("course_progress")
    .select("lesson_id, is_completed")
    .eq("user_id", user.id);

  const completedCount = (progress || []).filter(
    (r) => r.is_completed
  ).length;

  // Admin bypass — founder-level access, server-trusted against the JWT email.
  const isAdmin = isAdminEmail(user.email);

  if (completedCount < LESSONS.length && !isAdmin) {
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
