/**
 * Page: /affiliates/dashboard/playbooks
 *
 * Path-specific "now that you're an affiliate" hub. Each tile leads to
 * a per-path playbook with the same 7-section skeleton. Four paths are
 * ready (workshop, newsletter, coach, community); three are stubs that
 * point at affiliates@aesdr.com to co-write — which doubles as
 * signal-gathering on what affiliates actually want.
 *
 * Per 2026-05-28 architecture decision: playbooks live inside the
 * authenticated dashboard, not the public kit. They're paths through
 * the program, not promotional material.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import AesdrBrand from "@/components/AesdrBrand";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";
import { PLAYBOOK_ENTRIES, recommendForArchetype } from "@/lib/affiliate-playbooks";
import { getAffiliateForUser } from "@/lib/affiliate-entity";
import type { AffiliateArchetype } from "@/lib/affiliate-entity";
import { isAdminEmail } from "@/lib/admin";
import "./playbooks.css";

const ARCHETYPES: AffiliateArchetype[] = [
  "creator",
  "coach",
  "community",
  "alumni",
  "hybrid",
];

function isArchetype(value: string | null): value is AffiliateArchetype {
  return value !== null && (ARCHETYPES as string[]).includes(value);
}

export const metadata: Metadata = {
  title: "Playbooks | AESDR Affiliates",
  description:
    "Path-specific playbooks for affiliates: workshop host, newsletter feature, coach endorsement, community drop, and more.",
  robots: { index: false, follow: false },
};

export default async function PlaybooksIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/affiliates/dashboard/playbooks");

  // Admin bypass: lib/admin.ts permanent + env allowlist. Admins can
  // preview the playbooks surface without an affiliate row, and can
  // cycle through every archetype's "Start here" callout via the
  // ?preview= query param (?preview=creator|coach|community|alumni|hybrid).
  const isAdmin = isAdminEmail(user.email);
  const isAffiliate = user.user_metadata?.is_affiliate === true;
  if (!isAffiliate && !isAdmin) redirect("/affiliates/dashboard");

  const { preview } = await searchParams;
  const previewArchetype = isAdmin && isArchetype(preview ?? null) ? preview as AffiliateArchetype : null;

  // Load the affiliate record so we can surface an archetype-matched
  // "Start here" callout above the grid. Skipped for admin preview
  // mode (we use the previewArchetype directly instead).
  const affiliate = !previewArchetype && isAffiliate
    ? await getAffiliateForUser({
        userId: user.id,
        jwtAffiliateSlug: user.user_metadata?.affiliate_slug,
        jwtPartnerSlug: user.user_metadata?.partner_slug,
      })
    : null;

  const archetypeForCallout = previewArchetype ?? affiliate?.archetype ?? null;
  const recommendation = archetypeForCallout
    ? recommendForArchetype(archetypeForCallout)
    : null;

  const sorted = [...PLAYBOOK_ENTRIES].sort((a, b) => a.order - b.order);

  return (
    <main className="playbooks-page">
      <header className="playbooks-header">
        <AesdrBrand />
        <SignOutButton />
      </header>

      <nav className="playbooks-nav">
        <Link href="/affiliates/dashboard">Overview</Link>
        <Link href="/affiliates/dashboard/links">Links</Link>
        <Link href="/affiliates/dashboard/submissions">Submit copy</Link>
        <Link href="/affiliates/dashboard/payments">Payments</Link>
        <Link href="/affiliates/dashboard/playbooks" className="playbooks-nav-active">
          Playbooks
        </Link>
      </nav>

      <section className="playbooks-intro">
        <p className="playbooks-eyebrow">Dashboard · Playbooks</p>
        <h1>Pick the path that matches how you&rsquo;ll show up.</h1>
        <p className="playbooks-lead">
          You&rsquo;re approved. Now you choose how to run it. Different affiliates have wildly different leverage — a newsletter writer has a very different first move than a 1:1 coach or a community host. Each playbook below is a path through the program for a specific format, with the same six sections so the structure stays predictable.
        </p>
        <p className="playbooks-lead">
          Pick one to start. Layering a second path later is fine; running two in parallel from week one is not. Start where your highest-leverage channel already is.
        </p>
      </section>

      {isAdmin && (
        <section className="playbooks-admin-preview">
          <p className="playbooks-admin-preview-label">Admin preview</p>
          <p className="playbooks-admin-preview-help">
            Cycle through each archetype&rsquo;s &ldquo;Start here&rdquo; callout:
          </p>
          <div className="playbooks-admin-preview-tabs">
            <Link
              href="/affiliates/dashboard/playbooks"
              className={!previewArchetype ? "playbooks-admin-preview-tab-active" : ""}
            >
              None
            </Link>
            {ARCHETYPES.map((a) => (
              <Link
                key={a}
                href={`/affiliates/dashboard/playbooks?preview=${a}`}
                className={previewArchetype === a ? "playbooks-admin-preview-tab-active" : ""}
              >
                {a}
              </Link>
            ))}
          </div>
        </section>
      )}

      {recommendation && (
        <section className="playbook-recommended-section">
          <Link
            href={`/affiliates/dashboard/playbooks/${recommendation.primary.slug}`}
            className="playbook-recommended-tile"
          >
            <div className="playbook-recommended-header">
              <span className="playbook-recommended-label">Start here</span>
              <span className="playbook-recommended-archetype">
                {previewArchetype
                  ? `Preview: ${previewArchetype}`
                  : affiliate?.archetype
                    ? `Your archetype: ${affiliate.archetype}`
                    : "Recommended for you"}
              </span>
            </div>
            <h2>{recommendation.primary.title}</h2>
            <p className="playbook-recommended-reason">{recommendation.reason}</p>
            {recommendation.primary.status === "draft" && recommendation.fallback && (
              <p className="playbook-recommended-fallback">
                This playbook is in draft. Email{" "}
                <span className="playbook-recommended-fallback-email">
                  affiliates@aesdr.com
                </span>{" "}
                to co-write yours inside 5 business days. In the meantime, the{" "}
                <span className="playbook-recommended-fallback-link">
                  {recommendation.fallback.title}
                </span>{" "}
                playbook is the next-closest fit.
              </p>
            )}
            <span className="playbook-recommended-arrow">→</span>
          </Link>
        </section>
      )}

      <section className="playbooks-grid-section">
        <div className="playbooks-grid">
          {sorted.map((p) => (
            <Link
              key={p.slug}
              href={`/affiliates/dashboard/playbooks/${p.slug}`}
              className={`playbook-tile playbook-tile-${p.status}`}
            >
              <div className="playbook-tile-status">
                {p.status === "ready" ? "Ready" : "Draft"}
              </div>
              <h2>{p.title}</h2>
              <p>{p.audience}</p>
              <span className="playbook-tile-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="playbooks-footnote">
        <h3>None of these fit?</h3>
        <p>
          The seven paths cover most affiliate formats but not all of them. If your audience or channel doesn&rsquo;t match any of the above — or you run multiple formats and aren&rsquo;t sure which to start with — email{" "}
          <a href="mailto:affiliates@aesdr.com?subject=Playbook fit — &lt;your slug&gt;">
            affiliates@aesdr.com
          </a>
          {" "}with a one-paragraph description of your channel and your audience size. We&rsquo;ll write you a playbook directly inside 5 business days, and the patterns that show up across multiple affiliates become new ready playbooks here.
        </p>
      </section>
    </main>
  );
}
