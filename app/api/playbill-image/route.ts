import { NextRequest, NextResponse } from "next/server";
import { generatePlaybillImage } from "@/lib/playbill-image";
import { createClient } from "@/utils/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit(`playbill-image:${user.id}`, { max: 10, windowMs: 60 * 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const name = request.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "name parameter required" }, { status: 400 });
  }

  // Cap input length to prevent abuse of the image renderer
  const safeName = name.slice(0, 80);

  const buffer = await generatePlaybillImage(safeName);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
