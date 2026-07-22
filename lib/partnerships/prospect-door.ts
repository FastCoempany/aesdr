import { createAdminClient } from "@/utils/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";
import { generateOpaqueCode } from "@/app/(affiliate-experience)/_lib/slug";

/**
 * The prospect's DOOR — their personal, activity-tracked link into the
 * affiliate experience (/x/welcome → /x/landing → /x/kit).
 *
 * Minted here at draft time and pasted into the letter, so every first-touch
 * leads with a working private door instead of a call ask. One door per
 * pipeline candidate: the affiliate_prospects row is tagged with the pipeline
 * id in `note`, so re-drafting (or a follow-up later) reuses the same slug and
 * the /x/ops dashboard keeps one activity trail per person.
 *
 * The slug is opaque (no vowels, no identity leaked in the URL); the display
 * name lives only in the roster. /x/access?p=<slug> validates against that
 * roster and sets the 30-day signed cookie — see lib/experience-gate.ts.
 */
export async function ensureProspectDoor(
  pipelineId: string,
  displayName: string,
): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const tag = `pipeline:${pipelineId}`;

    const { data: existing } = await supabase
      .from("affiliate_prospects")
      .select("slug")
      .eq("note", tag)
      .limit(1);
    const found = existing?.[0]?.slug as string | undefined;
    if (found) return doorUrl(found);

    const slug = generateOpaqueCode(8);
    const { error } = await supabase
      .from("affiliate_prospects")
      .insert({ slug, display_name: displayName, note: tag });
    if (error) return null;
    return doorUrl(slug);
  } catch {
    return null; // caller degrades to the public kit link and flags the draft
  }
}

function doorUrl(slug: string): string {
  return `${getSiteUrl()}/x/access?p=${slug}`;
}
