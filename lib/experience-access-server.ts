import "server-only";

import { cookies } from "next/headers";

import { createAdminClient } from "@/utils/supabase/admin";
import { EXPERIENCE_COOKIE, verifyExperienceToken } from "@/lib/experience-gate";

/**
 * Node-side access check for the experience PAGES (welcome / landing / kit).
 *
 * Verifies the HMAC token AND — for prospect subjects — that the slug is STILL
 * in the roster. So deleting a prospect in /x/ops (the kill-switch) instantly
 * revokes every copy of their link: the signed cookie stays cryptographically
 * valid, but this live check fails on the next page load and walls them.
 *
 * Founder grants ("ops" / "preview") have no roster row and pass on a valid
 * signature alone. The edge middleware still does the coarse HMAC gate; this is
 * the fine-grained, revocation-aware check the content pages run (the admin
 * Supabase client is node-only, which is why this doesn't live in middleware).
 *
 * Returns the subject on success, else null (⇒ render the wall).
 */
export async function resolveExperienceAccess(): Promise<string | null> {
  const jar = await cookies();
  const subject = await verifyExperienceToken(
    jar.get(EXPERIENCE_COOKIE)?.value,
  );
  if (!subject) return null;
  if (subject === "ops" || subject === "preview") return subject;

  // Prospect slug — must still exist in the roster (instant revocation on delete).
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("affiliate_prospects")
    .select("slug")
    .eq("slug", subject)
    .maybeSingle();
  return data ? subject : null;
}
