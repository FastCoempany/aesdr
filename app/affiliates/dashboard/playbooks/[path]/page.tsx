/**
 * Page: /affiliates/dashboard/playbooks/[path]
 *
 * Renders one path-specific playbook. Source markdown lives in
 * content/affiliate-playbooks/[slug].md and is rendered via the
 * shared lib/markdown.ts renderer.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import AesdrBrand from "@/components/AesdrBrand";
import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";
import { getPlaybook, getPlaybookHtml } from "@/lib/affiliate-playbooks";
import { isAdminEmail } from "@/lib/admin";
import "../playbooks.css";

type Params = { path: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { path } = await params;
  const entry = getPlaybook(path);
  if (!entry) return { title: "Playbook not found | AESDR Affiliates" };
  return {
    title: `${entry.title} playbook | AESDR Affiliates`,
    robots: { index: false, follow: false },
  };
}

export default async function PlaybookDetailPage(
  { params }: { params: Promise<Params> },
) {
  const { path } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/affiliates/dashboard/playbooks/${path}`);

  // Admin bypass (matches lib/affiliate-kit-session.ts pattern).
  const isAdmin = isAdminEmail(user.email);
  const isAffiliate = user.user_metadata?.is_affiliate === true;
  if (!isAffiliate && !isAdmin) redirect("/affiliates/dashboard");

  const entry = getPlaybook(path);
  if (!entry) notFound();

  const html = getPlaybookHtml(entry);

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

      <section className="playbooks-breadcrumb">
        <Link href="/affiliates/dashboard/playbooks">← All playbooks</Link>
        <p className="playbooks-eyebrow">
          Dashboard · Playbooks · {entry.title}
          {entry.status === "draft" && " · Draft"}
        </p>
      </section>

      <article
        className="playbook-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <section className="playbooks-footnote">
        <p>
          Stuck on something this playbook didn't cover? Email{" "}
          <a href={`mailto:affiliates@aesdr.com?subject=Playbook question — ${entry.title}`}>
            affiliates@aesdr.com
          </a>
          . 24 business hours.
        </p>
      </section>
    </main>
  );
}
