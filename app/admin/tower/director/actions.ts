"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { canonCheck } from "@/lib/partnerships/canon-mechanical";
import {
  attemptEmailFind,
  emailFinderConfigured,
} from "@/lib/partnerships/email-finder";
import { firstTouchIdemKey } from "@/lib/partnerships/outreach-templates";
import { logPartnerEvents } from "@/lib/partnerships/events";
import { assertUnderDailyWall } from "@/lib/partnerships/spend";

/**
 * The hall of doors' two real buttons. Both follow the clickomate canon:
 * a press makes a real thing exist, and the page then reports what actually
 * happened — no homework handed back to the founder.
 */

// ── Door: the ten channel companies ──
// One press turns the researched list into real cards in the pipeline
// (marked channel, not affiliate), drafts each company's opening letter into
// its room, and sends the address hunt after the right person's email — so
// the founder never researches an inbox. Every company then rides the same
// room → edit → ceramic press → sent record → delivered ✓ path as everyone
// else.

const CHANNEL_ORGS: Array<{
  name: string;
  site: string;
  what: string;
  structure: string;
  conflict?: string;
}> = [
  { name: "Vendux", site: "https://vendux.org", what: "a network of part-time sales leaders", structure: "they refer clients' teams to us, or we sell together" },
  { name: "Martal Group", site: "https://martal.ca", what: "a company that rents out sales teams", structure: "our course becomes part of how they train new hires" },
  { name: "Skaled", site: "https://skaled.com", what: "a sales-improvement consultancy", structure: "our course rides inside their client projects" },
  { name: "RevOps Consulting", site: "https://revopsconsulting.io", what: "a sales-systems consultancy", structure: "bundled when they set up a client's sales tools" },
  { name: "The Revenue Operations Group", site: "https://revopsgroup.com", what: "a sales-systems consultancy", structure: "they refer, we pay a fee per client" },
  { name: "Activated Scale", site: "https://activatedscale.com", what: "part-time sales help for startups", structure: "they refer, we pay a fee per client" },
  { name: "Belkins", site: "https://belkins.io", what: "a company that books sales meetings for clients", structure: "our course rides inside their client work" },
  { name: "Sales Assembly", site: "https://salesassembly.com", what: "a training community for tech companies", structure: "they refer individual salespeople to us", conflict: "some overlap with what they teach — go gently" },
  { name: "Factor 8", site: "https://factor8.com", what: "a sales training firm", structure: "bundle only for their smallest startup clients", conflict: "they sell their own training — startup clients only" },
  { name: "Winning by Design", site: "https://winningbydesign.com", what: "a sales training firm", structure: "sell together to companies too small for them", conflict: "they sell their own courses — small clients only" },
];

const CHANNEL_SUBJECT = "a ramp gap your clients keep paying for";

function channelLetter(orgName: string): string {
  return `To the team at ${orgName} — your practice fixes how teams sell; AESDR fixes the first two years of the people doing the selling. It is a one-time course built by operators ($249 SDR / $299 AE), and it slots under what you already deliver instead of competing with it.

If it fits your clients, we will build the referral structure around your practice — reply and I will send the one-pager.

— Antaeus, AESDR · affiliates@aesdr.com`;
}

export async function openChannelDoors(): Promise<void> {
  const user = await requireAdmin();
  let failure: string | null = null;

  try {
    const supabase = createAdminClient();

    // Never double-create: skip any org already in the pipeline by name.
    const { data: existing } = await supabase
      .from("partner_pipeline")
      .select("name")
      .in("name", CHANNEL_ORGS.map((o) => o.name));
    const have = new Set((existing ?? []).map((r) => (r.name as string).toLowerCase()));
    const fresh = CHANNEL_ORGS.filter((o) => !have.has(o.name.toLowerCase()));

    if (fresh.length > 0) {
      const inserts = fresh.map((o) => ({
        name: o.name,
        surface: o.what,
        handle: o.site,
        motion: "channel",
        archetype: "community",
        status: "enriched",
        contact_path: o.site,
        why_fit: `${o.structure}${o.conflict ? ` — careful: ${o.conflict}` : ""} [channel]`,
        source_agent: "director-hall:channel",
        next_action:
          "The letter is drafted and waiting in this room. The machine is hunting the right person's address.",
      }));
      const { data: created, error } = await supabase
        .from("partner_pipeline")
        .insert(inserts)
        .select("id, name, contact_path, handle");
      if (error) throw new Error(error.message);

      const rows = created ?? [];

      // Draft each company's opening letter into its room, ready to edit and
      // press. Manual channel until the hunt lands an address; the room's
      // existing use-found-address button flips it to a one-press send.
      const body = (name: string) => channelLetter(name);
      const draftInserts = rows.map((r) => {
        const text = body(r.name as string);
        const { clean } = canonCheck(`${CHANNEL_SUBJECT}\n${text}`);
        return {
          to_addr: (r.contact_path as string | null) || (r.handle as string | null) || "(no address yet)",
          subject: CHANNEL_SUBJECT,
          body: text,
          tier: "cold",
          status: "ready",
          warden_cleared: clean,
          send_after: new Date().toISOString(),
          idempotency_key: firstTouchIdemKey(r.id as string),
          related_pipeline_id: r.id as string,
          drafted_by: `director-hall:${user.email}`,
          draft_source: "director-hall:channel",
          send_channel: "manual",
          personalization_note:
            "The machine is hunting the right person's address — when it lands, press use-found-address in this room, greet them by name, then press send.",
        };
      });
      if (draftInserts.length > 0) {
        const { error: draftErr } = await supabase
          .from("partner_outbound_queue")
          .insert(draftInserts);
        if (draftErr) {
          console.error("[director-hall] channel drafts failed", draftErr.message);
        }
      }

      await logPartnerEvents(
        rows.map((r) => ({
          pipelineId: r.id as string,
          actor: user.email,
          kind: "sourced",
          detail: { via: "director-hall", motion: "channel" },
        })),
      );

      // The address hunts ride in the background so the press returns fast.
      // Each one re-checks the daily money wall and is billed at most once
      // per company (the finder's own once-only guard).
      if (emailFinderConfigured()) {
        after(async () => {
          for (const r of rows) {
            try {
              await assertUnderDailyWall();
              await attemptEmailFind({
                pipelineId: r.id as string,
                name: r.name as string,
                contactPath: r.contact_path as string | null,
                handle: r.handle as string | null,
                via: "promote",
                actor: user.email,
              });
            } catch (e) {
              console.error(
                "[director-hall] address hunt failed for",
                r.name,
                e instanceof Error ? e.message : String(e),
              );
            }
          }
          revalidatePath("/admin/tower/director");
        });
      }
    }
  } catch (e) {
    failure = e instanceof Error ? e.message : String(e);
  }

  revalidatePath("/admin/tower/director");
  revalidatePath("/admin/tower");
  if (failure) {
    redirect(`/admin/tower/director?err=${encodeURIComponent(failure.slice(0, 200))}`);
  }
  redirect("/admin/tower/director?ok=channel");
}

// ── Door: prove a sale pays a partner ──
// One press makes sure a test partner named "The Money Test" exists with a
// working tracked link, and the page then shows the link plus the exact
// steps. The door's lamp lights by itself when the first money row appears.

const LINK_ALPHABET = "bcdfghjkmnpqrstvwxyz23456789";

export async function runMoneyTest(): Promise<void> {
  await requireAdmin();
  let failure: string | null = null;

  try {
    const supabase = createAdminClient();

    const { data: aff } = await supabase
      .from("affiliates")
      .select("slug")
      .eq("slug", "money-test")
      .maybeSingle();
    if (!aff) {
      const { error } = await supabase.from("affiliates").insert({
        slug: "money-test",
        display_name: "The Money Test",
        email: "mrcoe7@gmail.com",
        archetype: "creator",
        sophistication_tier: "developing",
        status: "active",
      });
      if (error) throw new Error(`couldn't create the test partner: ${error.message}`);
    }

    const { data: links } = await supabase
      .from("affiliate_links")
      .select("slug")
      .eq("affiliate_slug", "money-test")
      .limit(1);
    if (!links || links.length === 0) {
      const { randomBytes } = await import("node:crypto");
      const bytes = randomBytes(8);
      let slug = "mt";
      for (let i = 0; i < 6; i++) slug += LINK_ALPHABET[bytes[i] % LINK_ALPHABET.length];
      const { error } = await supabase.from("affiliate_links").insert({
        affiliate_slug: "money-test",
        slug,
        destination_url: "https://www.aesdr.com/",
        label: "the money test",
      });
      if (error) throw new Error(`couldn't mint the tracked link: ${error.message}`);
    }
  } catch (e) {
    failure = e instanceof Error ? e.message : String(e);
  }

  revalidatePath("/admin/tower/director");
  if (failure) {
    redirect(`/admin/tower/director?err=${encodeURIComponent(failure.slice(0, 200))}`);
  }
  redirect("/admin/tower/director?ok=moneytest");
}
