import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const chosen = body.artifact;

  if (chosen !== "playbill" && chosen !== "redline") {
    return NextResponse.json(
      { error: "Invalid artifact. Must be 'playbill' or 'redline'." },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("reveal_picks")
    .select("chosen_artifact")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Already picked", chosen: existing.chosen_artifact },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("reveal_picks").insert({
    user_id: user.id,
    chosen_artifact: chosen,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const redirectPath =
    chosen === "playbill" ? "/artifacts/playbill" : "/artifacts/redline";

  return NextResponse.json({ ok: true, redirect: redirectPath });
}
