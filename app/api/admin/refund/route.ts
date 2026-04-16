export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const purchaseId = body?.purchaseId;
    if (!purchaseId || typeof purchaseId !== "string") {
      return NextResponse.json({ error: "Missing purchaseId" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("purchases")
      .update({ status: "refunded" })
      .eq("id", purchaseId)
      .eq("status", "active");

    if (error) {
      console.error("[admin-refund] Update failed:", error.message);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin-refund] Unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
