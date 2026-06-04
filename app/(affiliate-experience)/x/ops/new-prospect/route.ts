/**
 * POST /x/ops/new-prospect — mint an opaque prospect link.
 * Takes a display name, generates a random code, stores the mapping, and
 * bounces back to the dashboard where the copyable link appears. Gated by the
 * ops cookie (same password gate as the dashboard).
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isOpsAuthed } from "../../../_lib/ops-auth";
import { generateOpaqueCode } from "../../../_lib/slug";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const origin = new URL(req.url).origin;

  if (!(await isOpsAuthed())) {
    return NextResponse.redirect(`${origin}/x/ops`, { status: 303 });
  }

  const form = await req.formData();
  const name = String(form.get("name") || "").trim().slice(0, 80);
  if (!name) {
    return NextResponse.redirect(`${origin}/x/ops`, { status: 303 });
  }

  const slug = generateOpaqueCode(8);
  const supabase = createAdminClient();
  await supabase.from("affiliate_prospects").insert({ slug, display_name: name });

  return NextResponse.redirect(`${origin}/x/ops?created=${slug}`, {
    status: 303,
  });
}
