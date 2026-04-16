export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  const checks: Record<string, "ok" | "fail"> = {};

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("purchases")
      .select("id", { count: "exact", head: true });
    checks.database = error ? "fail" : "ok";
  } catch {
    checks.database = "fail";
  }

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    checks.stripe_config = stripeKey ? "ok" : "fail";
  } catch {
    checks.stripe_config = "fail";
  }

  try {
    const resendKey = process.env.RESEND_API_KEY;
    checks.email_config = resendKey ? "ok" : "fail";
  } catch {
    checks.email_config = "fail";
  }

  const allOk = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    { status: allOk ? "healthy" : "degraded", checks },
    { status: allOk ? 200 : 503 }
  );
}
