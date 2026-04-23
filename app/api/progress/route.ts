import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

// Cap state_data payload size to prevent a malicious or buggy client from
// filling the database with oversized rows.
const MAX_STATE_DATA_BYTES = 32 * 1024; // 32 KB

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 120 writes/min/user — comfortably above the 1.5s debounced client saves.
  const rl = await rateLimit(`progress:${user.id}`, { max: 120, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { lessonId, lastScreen, stateData } = body;

  if (
    !lessonId ||
    typeof lessonId !== "string" ||
    typeof lastScreen !== "number" ||
    !stateData ||
    typeof stateData !== "object"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (JSON.stringify(stateData).length > MAX_STATE_DATA_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const { error } = await supabase.rpc("merge_lesson_progress", {
    p_user_id: user.id,
    p_lesson_id: lessonId,
    p_last_screen: lastScreen,
    p_state_data: stateData,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
