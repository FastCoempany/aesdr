import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit(`reveal:${user.id}`, { max: 10, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const chosen = body?.artifact;

  if (chosen !== "playbill" && chosen !== "redline") {
    return NextResponse.json(
      { error: "Invalid artifact. Must be 'playbill' or 'redline'." },
      { status: 400 }
    );
  }

  // Insert-only-if-missing via ignoreDuplicates. Prevents race where two
  // concurrent requests both pass a separate "already picked?" check.
  const { error: insertError } = await supabase
    .from("reveal_picks")
    .upsert(
      { user_id: user.id, chosen_artifact: chosen },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

  if (insertError) {
    return NextResponse.json({ error: "Failed to record pick" }, { status: 500 });
  }

  // Return the canonical pick (the existing one if there was a conflict)
  const { data: finalPick } = await supabase
    .from("reveal_picks")
    .select("chosen_artifact")
    .eq("user_id", user.id)
    .maybeSingle();

  const canonical = finalPick?.chosen_artifact ?? chosen;
  const redirectPath =
    canonical === "playbill" ? "/artifacts/playbill" : "/artifacts/redline";

  if (canonical !== chosen) {
    return NextResponse.json(
      { ok: true, alreadyPicked: true, chosen: canonical, redirect: redirectPath },
      { status: 200 }
    );
  }

  return NextResponse.json({ ok: true, redirect: redirectPath });
}
