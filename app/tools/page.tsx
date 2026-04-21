import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import SignOutButton from "@/components/SignOutButton";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Tools | AESDR",
  description:
    "The AESDR toolkit. Five standalone instruments you can open in-browser or download for the record.",
};

export const dynamic = "force-dynamic";

/**
 * The five standalone tools, in course order. Slugs match filenames in
 * /tools/standalone-html/ (minus the .html extension).
 *
 * Copy is intentionally dry and slightly menacing — consistent with the
 * Rowan-Pope-energy voice on the dashboard.
 */
const TOOLS: ReadonlyArray<{
  slug: string;
  number: string;
  name: string;
  title: string;
  description: string;
}> = [
  {
    slug: "3.3-aesdr-alignment-contract",
    number: "3.3",
    name: "The Alignment Contract",
    title: "3.3 — The Alignment Contract",
    description:
      "The AE/SDR partnership manuscript. Signed, binding, tonally superior to any Slack agreement.",
  },
  {
    slug: "6.3-idk-framework",
    number: "6.3",
    name: "The IDK Framework",
    title: "6.3 — The IDK Framework",
    description:
      "A pocket reference for the four questions you never should’ve had to guess at.",
  },
  {
    slug: "9.2-time-reclaimed-calculator",
    number: "9.2",
    name: "Time Reclaimed Calculator",
    title: "9.2 — Time Reclaimed Calculator",
    description:
      "How much of your life the “revenue operations stack” is eating. A reckoning in minutes.",
  },
  {
    slug: "10.1-ROI-commission-defense-tracker",
    number: "10.1",
    name: "ROI Commission Defense Tracker",
    title: "10.1 — Commission Defense Tracker",
    description:
      "Your commission check, itemized and indefensible. Export to CSV when HR asks.",
  },
  {
    slug: "12.3-72-hr-strike-plan",
    number: "12.3",
    name: "72-Hour Strike Plan",
    title: "12.3 — 72-Hour Strike Plan",
    description:
      "A red-lined checklist for the three days you most need discipline. Timestamped, crossed off.",
  },
];

/**
 * Returns true if the user has access to coursework:
 *   - an active purchase on their email
 *   - an active purchase on their user_id
 *   - an accepted team_members row on a team with an active purchase
 */
async function userHasAccess(userId: string, email: string | null | undefined) {
  const supabase = await createClient();

  if (email) {
    const { data: byEmail } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_email", email.toLowerCase())
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    if (byEmail) return true;
  }

  const { data: byId } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (byId) return true;

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, teams!inner(id, purchase_id)")
    .eq("user_id", userId)
    .not("accepted_at", "is", null)
    .limit(1)
    .maybeSingle();

  if (membership) {
    const team = membership.teams as unknown as {
      id: string;
      purchase_id: string | null;
    };
    if (team?.purchase_id) {
      const { data: teamPurchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("id", team.purchase_id)
        .eq("status", "active")
        .maybeSingle();
      if (teamPurchase) return true;
    }
  }

  return false;
}

export default async function ToolsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?reason=no_purchase");

  // Founder bypass — same cookie the rest of the gated pages honor.
  const cookieStore = await cookies();
  const hasBypass = cookieStore.get("aesdr_bypass")?.value === "1";

  if (!hasBypass) {
    const ok = await userHasAccess(user.id, user.email);
    if (!ok) redirect("/login?reason=no_purchase");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-main)",
        color: "var(--text-main)",
        animation: "toolsFadeIn 500ms ease-out forwards",
      }}
    >
      <style>{`
        @keyframes toolsFadeIn{from{opacity:0}to{opacity:1}}
        .tool-card{transition:border-color .25s ease, transform .25s ease, box-shadow .25s ease, background .25s ease;}
        .tool-card:hover{border-color: var(--line2); transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,.35);}
        .tool-btn{transition:border-color .2s ease, background .2s ease, color .2s ease;}
        .tool-btn.primary:hover{background: var(--theme); color:#020617; border-color: var(--theme);}
        .tool-btn.secondary:hover{border-color: var(--line2); background: rgba(255,255,255,0.04);}
      `}</style>

      {/* Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 5%",
          borderBottom: "1px solid var(--line)",
          background: "rgba(2,6,23,0.85)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--display)",
            fontSize: "18px",
            fontWeight: 900,
            fontStyle: "italic",
            letterSpacing: ".05em",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              background: "var(--iris)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "iris 3s linear infinite",
            }}
          >
            AESDR
          </span>
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: ".15em",
            textTransform: "uppercase",
          }}
        >
          <Link
            href="/dashboard"
            style={{ color: "var(--text-muted)", textDecoration: "none" }}
          >
            Course
          </Link>
          <Link
            href="/account"
            style={{ color: "var(--text-muted)", textDecoration: "none" }}
          >
            Account
          </Link>
          <SignOutButton />
        </div>
      </nav>

      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "64px 5% 96px",
        }}
      >
        {/* Header */}
        <header style={{ marginBottom: "56px" }}>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "10px",
              letterSpacing: ".3em",
              textTransform: "uppercase",
              marginBottom: "16px",
              background: "var(--iris)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "iris 3s linear infinite",
            }}
          >
            The Toolkit
          </p>
          <h1
            style={{
              fontFamily: "var(--display)",
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: ".01em",
              lineHeight: 1.05,
              marginBottom: "16px",
              color: "var(--text-main)",
            }}
          >
            Five instruments. Use them as intended.
          </h1>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: "17px",
              lineHeight: 1.6,
              color: "var(--text-muted)",
              maxWidth: "640px",
              fontStyle: "italic",
            }}
          >
            Open each tool in-browser for a working session, or download the
            HTML to keep a copy offline. Everything runs locally — nothing
            phones home.
          </p>
        </header>

        {/* Tool grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {TOOLS.map((tool) => {
            const openHref = `/tools/${encodeURIComponent(tool.slug)}`;
            const downloadHref = `/api/tools/${encodeURIComponent(tool.slug)}`;
            return (
              <article
                key={tool.slug}
                className="tool-card"
                style={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--line)",
                  borderRadius: "4px",
                  padding: "28px 26px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "10px",
                    letterSpacing: ".28em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: "10px",
                  }}
                >
                  Course {tool.number}
                </p>
                <h2
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: "22px",
                    fontWeight: 700,
                    fontStyle: "italic",
                    lineHeight: 1.2,
                    color: "var(--text-main)",
                    marginBottom: "12px",
                  }}
                >
                  {tool.name}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "15px",
                    lineHeight: 1.55,
                    color: "var(--text-muted)",
                    marginBottom: "24px",
                    flexGrow: 1,
                  }}
                >
                  {tool.description}
                </p>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <a
                    href={openHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tool-btn primary"
                    style={{
                      flex: "1 1 120px",
                      textAlign: "center",
                      padding: "12px 16px",
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      letterSpacing: ".2em",
                      textTransform: "uppercase",
                      color: "var(--text-main)",
                      background: "transparent",
                      border: "1px solid var(--theme)",
                      borderRadius: "2px",
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    Open ↗
                  </a>
                  <a
                    href={downloadHref}
                    className="tool-btn secondary"
                    style={{
                      flex: "1 1 120px",
                      textAlign: "center",
                      padding: "12px 16px",
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      letterSpacing: ".2em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      background: "transparent",
                      border: "1px solid var(--line)",
                      borderRadius: "2px",
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    Download ↓
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* Footer note */}
        <p
          style={{
            marginTop: "56px",
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          Tools are yours to keep. Don’t post them on LinkedIn.
        </p>
      </div>
    </main>
  );
}
