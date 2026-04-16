export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
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
      Sentry.captureMessage("Refund update failed", { level: "error", extra: { purchaseId, error: error.message } });
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    Sentry.captureException(err, { extra: { handler: "POST /api/admin/refund" } });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
