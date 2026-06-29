"use server";

/**
 * GDPR / CCPA self-service data rights.
 *
 * Closes audit finding R3-AUTH-5. Two server actions a signed-in user can
 * call from /account/data:
 *
 *   - exportMyData()           — the access right. Read-only. Gathers every
 *                                row keyed to the caller across the
 *                                user-linked tables and returns one JSON
 *                                string the browser downloads as a file.
 *   - deleteMyAccount(confirm) — the erasure right. Destructive. ANONYMIZES
 *                                financial/tax records (kept for a legal
 *                                obligation), HARD-DELETES non-financial
 *                                personal data, then deletes the auth user.
 *
 * Design notes:
 *   - Identity is always resolved server-side via the SSR client's
 *     auth.getUser() (cookie session) — never a parameter. The id/email we
 *     act on are the signed-in user's own, so a caller can only export or
 *     erase themselves.
 *   - All row access uses the service-role admin client because most of
 *     these tables are service-role-only under RLS (see the migrations).
 *   - DELETION IS CONSERVATIVE. Financial records (purchases,
 *     checkout_sessions, affiliate_attributions, affiliate_payouts) are
 *     RETAINED for tax/accounting obligations and only stripped of direct
 *     identifiers. We never hard-delete them.
 *   - Every delete/anonymize step is wrapped so one failure is reported but
 *     does not abort the rest — a partial erasure is recorded, not silently
 *     swallowed.
 */

import crypto from "node:crypto";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Tables we read for the export, each by the column that keys it to the
 * user. Some tables key on user_id (a uuid FK to auth.users), some on an
 * email column, and a couple carry both — we gather whatever matches.
 *
 * The financial tables (purchases, checkout_sessions, affiliate_attributions,
 * affiliate_payouts) are exported too: the user has a right to see them. They
 * are simply NOT deleted on erasure.
 */

export type ExportResult =
  | { ok: true; json: string; filename: string }
  | { ok: false; error: string };

export type StepStatus = "anonymized" | "deleted" | "skipped" | "failed";

export interface DeletionStep {
  label: string;
  status: StepStatus;
  detail?: string;
}

export type DeleteResult =
  | { ok: true; steps: DeletionStep[] }
  | { ok: false; error: string; steps?: DeletionStep[] };

/**
 * Deterministic pseudonym for an anonymized financial row. Same user always
 * maps to the same token, so retained rows for one person stay
 * grouped/joinable for accounting without exposing the real address. Uses a
 * truncated SHA-256 of the user id; not reversible to the email.
 */
function anonEmailFor(userId: string): string {
  const hash = crypto.createHash("sha256").update(userId).digest("hex").slice(0, 16);
  return `deleted-${hash}@removed.invalid`;
}

/* ───────────────────────── EXPORT ───────────────────────── */

/**
 * Gather every row keyed to the signed-in user and return it as one JSON
 * string for the browser to download. Read-only — no writes, no deletion.
 *
 * This is the user exercising their right of access. We pull from both the
 * id-keyed and email-keyed tables so nothing personal is missed.
 */
export async function exportMyData(): Promise<ExportResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You're not signed in. Sign in and try again." };
  }

  const admin = createAdminClient();
  const id = user.id;
  const email = user.email ?? null;

  // Helper: run a select, swallow errors into an empty list so one missing
  // table (e.g. a schema drift on staging) never sinks the whole export.
  // The export is best-effort-complete; a failed table is simply absent.
  async function rowsByUserId(table: string): Promise<unknown[]> {
    const { data, error } = await admin.from(table).select("*").eq("user_id", id);
    if (error) return [];
    return data ?? [];
  }
  async function rowsByEmailColumn(table: string, column: string): Promise<unknown[]> {
    if (!email) return [];
    const { data, error } = await admin.from(table).select("*").eq(column, email);
    if (error) return [];
    return data ?? [];
  }

  // Pull everything in parallel. Each entry is independent.
  const [
    purchases,
    checkoutSessions,
    courseProgress,
    generatedArtifacts,
    revealPicks,
    artifactUnlocks,
    testimonials,
    lessonFeedback,
    teamMemberships,
    events,
    affiliateAttributions,
    affiliateRows,
    emailSuppressions,
  ] = await Promise.all([
    rowsByEmailColumn("purchases", "user_email"),
    rowsByEmailColumn("checkout_sessions", "user_email"),
    rowsByUserId("course_progress"),
    rowsByUserId("generated_artifacts"),
    rowsByUserId("reveal_picks"),
    rowsByUserId("artifact_unlocks"),
    rowsByUserId("testimonials"),
    rowsByUserId("lesson_feedback"),
    rowsByUserId("team_members"),
    rowsByUserId("events"),
    rowsByEmailColumn("affiliate_attributions", "user_email"),
    rowsByUserId("affiliates"),
    rowsByEmailColumn("email_suppressions", "email"),
  ]);

  // Affiliate payouts aren't keyed by the user directly — they hang off the
  // affiliate row by slug. If this user is an affiliate, pull their payouts
  // by that slug so the export is complete.
  let affiliatePayouts: unknown[] = [];
  const firstAffiliate = affiliateRows[0] as { slug?: string } | undefined;
  if (firstAffiliate?.slug) {
    const { data } = await admin
      .from("affiliate_payouts")
      .select("*")
      .eq("affiliate_slug", firstAffiliate.slug);
    affiliatePayouts = data ?? [];
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    note:
      "Your AESDR data, exported on request. Financial and tax records are " +
      "included here for your reference; we retain our own copies where the " +
      "law requires it, even if you delete your account.",
    user: {
      id: user.id,
      email: user.email ?? null,
      created_at: user.created_at ?? null,
      // user_metadata holds non-sensitive profile prefs (role, full_name,
      // pause window). app_metadata can carry server-set claims; include it
      // so the export is honest about what we hold.
      user_metadata: user.user_metadata ?? {},
      app_metadata: user.app_metadata ?? {},
    },
    purchases,
    checkoutSessions,
    courseProgress,
    generatedArtifacts,
    revealPicks,
    artifactUnlocks,
    testimonials,
    lessonFeedback,
    teamMemberships,
    events,
    affiliate: {
      profile: affiliateRows,
      attributions: affiliateAttributions,
      payouts: affiliatePayouts,
    },
    emailSuppressions,
  };

  const json = JSON.stringify(payload, null, 2);
  const stamp = new Date().toISOString().slice(0, 10);
  return { ok: true, json, filename: `aesdr-data-export-${stamp}.json` };
}

/* ───────────────────────── DELETE ───────────────────────── */

/**
 * Erase the signed-in user's account.
 *
 * The caller must type DELETE in the UI; we re-check confirmText here so a
 * stray call can't erase anyone. Each step is isolated: a failure is recorded
 * in the returned step list and surfaced, but the remaining steps still run,
 * so we don't leave the account half-erased with no record of why.
 *
 * RETAIN + ANONYMIZE (legal/tax obligation):
 *   - purchases               (null user_id, replace user_email + customer_name)
 *   - checkout_sessions       (replace user_email)
 *   - affiliate_attributions  (replace user_email)
 *   - affiliate_payouts       (no direct identifiers; left intact, keyed by slug)
 *
 * HARD-DELETE (non-financial personal data):
 *   - course_progress, generated_artifacts, reveal_picks, artifact_unlocks,
 *     testimonials, lesson_feedback
 *   - the affiliates row, if this user is an affiliate
 *
 * NOT TOUCHED:
 *   - email_suppressions — this is the unsubscribe/bounce record. Deleting it
 *     would resume sends, defeating the user's own opt-out. It survives by
 *     design (and holds only the email, no other personal data).
 *
 * Then the auth user is deleted LAST.
 */
export async function deleteMyAccount(confirmText: string): Promise<DeleteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You're not signed in. Sign in and try again." };
  }

  if (confirmText !== "DELETE") {
    return {
      ok: false,
      error: 'Type DELETE exactly (all caps) to confirm.',
    };
  }

  const admin = createAdminClient();
  const id = user.id;
  const email = user.email ?? null;
  const anonEmail = anonEmailFor(id);
  const steps: DeletionStep[] = [];

  // Small helpers so each step is uniform: catch everything, record a result,
  // never throw out of the function before the auth-user delete.
  // fn returns a Supabase query builder, which is a PromiseLike (thenable),
  // not a true Promise — awaiting it resolves to { error }. Type the param as
  // PromiseLike so the builder is accepted directly without a wrapping cast.
  async function anonymizeStep(
    label: string,
    fn: () => PromiseLike<{ error: { message: string } | null }>
  ): Promise<void> {
    try {
      const { error } = await fn();
      if (error) {
        steps.push({ label, status: "failed", detail: error.message });
      } else {
        steps.push({ label, status: "anonymized" });
      }
    } catch (e) {
      steps.push({
        label,
        status: "failed",
        detail: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  async function deleteStep(
    label: string,
    fn: () => PromiseLike<{ error: { message: string } | null }>
  ): Promise<void> {
    try {
      const { error } = await fn();
      if (error) {
        steps.push({ label, status: "failed", detail: error.message });
      } else {
        steps.push({ label, status: "deleted" });
      }
    } catch (e) {
      steps.push({
        label,
        status: "failed",
        detail: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  /* ── 1. Anonymize retained financial / tax records ── */
  // purchases: keyed by user_email (NOT NULL) and a nullable user_id. Null the
  // id, pseudonymize the email, and drop the customer_name. Amounts/dates/plan
  // stay for accounting. user_email is NOT NULL so we replace rather than null.
  if (email) {
    await anonymizeStep("Anonymize purchase records (retained for tax law)", () =>
      admin
        .from("purchases")
        .update({ user_id: null, user_email: anonEmail, customer_name: null })
        .eq("user_email", email)
    );
  } else {
    steps.push({
      label: "Anonymize purchase records (retained for tax law)",
      status: "skipped",
      detail: "No email on the account to match purchases by.",
    });
  }

  // checkout_sessions: keyed by user_email only (no user_id column). Replace it.
  if (email) {
    await anonymizeStep("Anonymize checkout sessions (retained for tax law)", () =>
      admin
        .from("checkout_sessions")
        .update({ user_email: anonEmail })
        .eq("user_email", email)
    );
  } else {
    steps.push({
      label: "Anonymize checkout sessions (retained for tax law)",
      status: "skipped",
      detail: "No email on the account to match sessions by.",
    });
  }

  // affiliate_attributions: keyed by user_email (the BUYER's email). Replace it.
  // Commission amounts + dates stay for 1099/payout reconciliation.
  if (email) {
    await anonymizeStep("Anonymize commission attributions (retained for tax law)", () =>
      admin
        .from("affiliate_attributions")
        .update({ user_email: anonEmail })
        .eq("user_email", email)
    );
  } else {
    steps.push({
      label: "Anonymize commission attributions (retained for tax law)",
      status: "skipped",
      detail: "No email on the account to match attributions by.",
    });
  }

  // affiliate_payouts carries no direct buyer/affiliate identifier columns
  // (it's keyed by affiliate_slug + amounts). Nothing to anonymize; the row is
  // a financial record we keep. Recorded explicitly so the audit trail is clear.
  steps.push({
    label: "Affiliate payout records (retained for tax law)",
    status: "skipped",
    detail: "No direct identifiers to remove; amounts/dates retained as required.",
  });

  /* ── 2. Hard-delete non-financial personal data ── */
  await deleteStep("Delete course progress", () =>
    admin.from("course_progress").delete().eq("user_id", id)
  );
  await deleteStep("Delete generated artifacts", () =>
    admin.from("generated_artifacts").delete().eq("user_id", id)
  );
  await deleteStep("Delete artifact reveal choices", () =>
    admin.from("reveal_picks").delete().eq("user_id", id)
  );
  await deleteStep("Delete artifact unlocks", () =>
    admin.from("artifact_unlocks").delete().eq("user_id", id)
  );
  await deleteStep("Delete testimonials", () =>
    admin.from("testimonials").delete().eq("user_id", id)
  );
  await deleteStep("Delete lesson feedback", () =>
    admin.from("lesson_feedback").delete().eq("user_id", id)
  );

  // The affiliates row, if this user is one (an affiliate erasing their
  // account). Their financial attributions/payouts stay (anonymized/keyed by
  // slug); this removes the profile (name, email, Stripe id, notes).
  await deleteStep("Delete affiliate profile (if any)", () =>
    admin.from("affiliates").delete().eq("user_id", id)
  );

  /* ── 3. Delete the auth user LAST ── */
  // After this the session is dead. The client signs out + redirects home.
  try {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      steps.push({
        label: "Delete sign-in account",
        status: "failed",
        detail: error.message,
      });
      // The auth user is the anchor for re-login; if it survived, the erasure
      // is incomplete. Report ok:false so the UI tells them to contact us,
      // but still hand back the per-step list (personal data above is gone).
      return {
        ok: false,
        error:
          "We removed your data but couldn't fully close your sign-in account. " +
          "Email hello@aesdr.com and we'll finish it by hand.",
        steps,
      };
    }
    steps.push({ label: "Delete sign-in account", status: "deleted" });
  } catch (e) {
    steps.push({
      label: "Delete sign-in account",
      status: "failed",
      detail: e instanceof Error ? e.message : "Unknown error",
    });
    return {
      ok: false,
      error:
        "We removed your data but couldn't fully close your sign-in account. " +
        "Email hello@aesdr.com and we'll finish it by hand.",
      steps,
    };
  }

  return { ok: true, steps };
}
