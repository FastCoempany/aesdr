import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import SignOutButton from "@/components/SignOutButton";
import UnlockArtifactTile from "@/components/UnlockArtifactTile";
import { createClient } from "@/utils/supabase/server";
import { LESSONS } from "@/utils/progress/types";
import type { LessonProgressSummary } from "@/utils/progress/types";

export const metadata: Metadata = {
  title: "Your Lessons | AESDR",
  description: "Access your 12-course AESDR curriculum. Track progress, complete lessons, and download tools.",
};

/* ─── Rowan Pope energy. Each line is cryptic, sharp, slightly menacing. ─── */
/* `lead` stays muted italic. `kicker` gets the iris shimmer. */
const TEASERS: Record<string, { lead: string; kicker: string }> = {
  "1":  { lead: "You think you\u2019re ready. You\u2019re not.", kicker: "But we start here anyway." },
  "2":  { lead: "Your own team is working against you.", kicker: "And they don\u2019t even know it." },
  "3":  { lead: "Nobody is coming to save you.", kicker: "Learn to save yourself." },
  "4":  { lead: "Fear is a choice. A poor one.", kicker: "This is where you stop choosing it." },
  "5":  { lead: "Your outreach is a confession letter.", kicker: "Let\u2019s make it a weapon." },
  "6":  { lead: "They will say no.", kicker: "The question is what you do in the next four seconds." },
  "7":  { lead: "Hope is not a pipeline strategy.", kicker: "Math is. Learn the math." },
  "8":  { lead: "You\u2019re talking too much.", kicker: "That\u2019s not an opinion \u2014 it\u2019s a diagnosis." },
  "9":  { lead: "Eleven hours yesterday. Four of them were selling.", kicker: "Do the arithmetic." },
  "10": { lead: "They will change your comp plan.", kicker: "The only question is whether you\u2019re ready." },
  "11": { lead: "One thread. One champion. One prayer.", kicker: "That\u2019s not strategy \u2014 that\u2019s religion." },
  "12": { lead: "This is where you stop reading.", kicker: "72 hours. No mercy." },
};

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Force password change for users with temp passwords
  if (user?.user_metadata?.needs_password_change) {
    redirect("/account/set-password");
  }

  // Force role selection if not yet chosen
  if (user && !user.user_metadata?.role) {
    redirect("/account/select-role");
  }

  // Purchase gate — bypass for founder (GhostButton cookie)
  const cookieStore = await cookies();
  const hasBypass = cookieStore.get("aesdr_bypass")?.value === "1";

  if (user && !hasBypass) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_email", user.email?.toLowerCase())
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!purchase) {
      const { data: purchaseById } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (!purchaseById) {
        // Check if user is an accepted team member on an active team
        const { data: teamMembership } = await supabase
          .from("team_members")
          .select("team_id, teams!inner(id, purchase_id)")
          .eq("user_id", user.id)
          .not("accepted_at", "is", null)
          .limit(1)
          .maybeSingle();

        let teamHasActivePurchase = false;
        if (teamMembership) {
          const teamData = teamMembership.teams as unknown as { id: string; purchase_id: string | null };
          if (teamData?.purchase_id) {
            const { data: teamPurchase } = await supabase
              .from("purchases")
              .select("id")
              .eq("id", teamData.purchase_id)
              .eq("status", "active")
              .maybeSingle();
            teamHasActivePurchase = !!teamPurchase;
          }
        }

        if (!teamHasActivePurchase) {
          redirect("/login?reason=no_purchase");
        }
      }
    }
  }

  const userRole = user?.user_metadata?.role as string | undefined;

  let progressMap: Record<string, LessonProgressSummary> = {};
  if (user) {
    const { data } = await supabase
      .from("course_progress")
      .select("lesson_id, is_completed, last_screen")
      .eq("user_id", user.id);
    if (data) {
      for (const row of data) progressMap[row.lesson_id] = row;
    }
  }

  const completedCount = LESSONS.filter((l) => progressMap[l.id]?.is_completed).length;
  const currentLesson = LESSONS.find((l) => !progressMap[l.id]?.is_completed) || LESSONS[0];
  const currentIdx = LESSONS.findIndex((l) => l.id === currentLesson.id);
  const allComplete = completedCount === LESSONS.length;

  // Fetch reveal pick (if any) and check if sealed artifact is unlocked
  let revealPick: string | null = null;
  let sealedUnlocked = false;
  if (user && allComplete) {
    const { data: pick } = await supabase
      .from("reveal_picks")
      .select("chosen_artifact")
      .eq("user_id", user.id)
      .maybeSingle();
    revealPick = pick?.chosen_artifact ?? null;

    if (revealPick) {
      const sealedType = revealPick === "playbill" ? "redline" : "playbill";
      const { data: unlock } = await supabase
        .from("artifact_unlocks")
        .select("id")
        .eq("user_id", user.id)
        .eq("artifact_type", sealedType)
        .maybeSingle();
      sealedUnlocked = !!unlock;
    }
  }

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#FAF7F2",
        color: "#1A1A1A",
        animation: "dashFadeIn 500ms ease-out forwards",
      }}
    >
      <style>{`@keyframes dashFadeIn{from{opacity:0}to{opacity:1}}`}</style>
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-[5%] py-5"
        style={{ borderBottom: "1px solid #E8E4DF", background: "rgba(250,247,242,0.95)", backdropFilter: "blur(10px)" }}
      >
        <Link href="/dashboard" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", fontWeight: 900, fontStyle: "italic", letterSpacing: ".05em", textDecoration: "none" }}>
          <span style={{ background: "var(--iris)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "iris 3s linear infinite" }}>AESDR</span>
        </Link>
        <div className="flex items-center gap-4" style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: "11px", letterSpacing: ".15em", textTransform: "uppercase" }}>
          {user ? (
            <>
              <Link href="/account" style={{ color: "#6B6B6B", textDecoration: "none", padding: "12px 4px" }}>Account</Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" style={{ color: "#8B1A1A", textDecoration: "none" }}>Sign In</Link>
          )}
        </div>
      </nav>

      <div className="mx-auto w-full max-w-3xl px-6 py-16" style={{ color: "#1A1A1A" }}>

        {/* Header */}
        <header className="mb-16">
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "10px",
              letterSpacing: ".3em",
              textTransform: "uppercase",
              color: "#8B1A1A",
              marginBottom: "16px",
            }}
          >
            The Journey
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: ".01em",
              lineHeight: "1.05",
              marginBottom: "12px",
              color: "#1A1A1A",
            }}
          >
            {completedCount === 0
              ? "It starts now."
              : completedCount === LESSONS.length
                ? "You made it."
                : `${completedCount} down. ${LESSONS.length - completedCount} to go.`}
          </h1>
        </header>

        {/* The Journey — sequential timeline */}
        <div className="flex flex-col" style={{ gap: "0" }}>
          {LESSONS.map((lesson, idx) => {
            const isCompleted = progressMap[lesson.id]?.is_completed ?? false;
            const isCurrent = lesson.id === currentLesson.id;
            const isFuture = idx > currentIdx;
            const isNextVisible = idx === currentIdx + 1;

            const isVisible = isCompleted || isCurrent || isNextVisible;
            const isLocked = isFuture && !isNextVisible;
            const displayTitle = userRole === "ae" && lesson.titleAe ? lesson.titleAe : lesson.title;

            return (
              <div
                key={lesson.id}
                style={{
                  position: "relative",
                  paddingLeft: "48px",
                }}
              >
                {/* Vertical timeline line */}
                {idx < LESSONS.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "32px",
                      bottom: "0",
                      width: "1px",
                      background: isCompleted ? "#8B1A1A" : "#E8E4DF",
                      transition: "background 0.5s",
                    }}
                  />
                )}

                {/* Node */}
                <div
                  style={{
                    position: "absolute",
                    left: "8px",
                    top: "8px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    border: isCompleted
                      ? "2px solid #8B1A1A"
                      : isCurrent
                        ? "2px solid #1A1A1A"
                        : "1px solid #E8E4DF",
                    background: isCompleted ? "#8B1A1A" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    color: isCompleted ? "#FAF7F2" : "transparent",
                    transition: "all 0.3s",
                    boxShadow: isCurrent ? "0 0 12px rgba(139,26,26,0.2)" : "none",
                  }}
                >
                  {isCompleted && "\u2713"}
                </div>

                {/* Content */}
                <div
                  style={{
                    padding: "0 0 40px 0",
                    opacity: isLocked ? 0.2 : isNextVisible && !isCompleted ? 0.5 : 1,
                    filter: isLocked ? "blur(2px)" : "none",
                    transition: "opacity 0.5s, filter 0.5s",
                  }}
                >
                  {/* Lesson number */}
                  <p
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "9px",
                      letterSpacing: ".2em",
                      textTransform: "uppercase",
                      color: isCompleted ? "#8B1A1A" : "#6B6B6B",
                      marginBottom: "6px",
                    }}
                  >
                    {isCompleted ? "Completed" : `Lesson ${lesson.id}`}
                  </p>

                  {/* Title — linked if accessible (completed, current, or next) */}
                  {isCompleted || isCurrent || isNextVisible ? (
                    <Link
                      href={`/course/${lesson.id}`}
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: "22px",
                        fontWeight: 700,
                        fontStyle: "italic",
                        letterSpacing: ".01em",
                        color: isCurrent ? "#1A1A1A" : "#6B6B6B",
                        textDecoration: "none",
                        display: "block",
                        marginBottom: "8px",
                        lineHeight: "1.2",
                      }}
                    >
                      {displayTitle}
                      {isCurrent && (
                        <span style={{ marginLeft: "12px", fontSize: "14px", color: "#8B1A1A" }}>&rarr;</span>
                      )}
                      {isNextVisible && !isCompleted && (
                        <span style={{ marginLeft: "12px", fontSize: "11px", color: "#6B6B6B", fontWeight: 400, fontFamily: "'Space Mono', monospace", letterSpacing: ".06em" }}>up next</span>
                      )}
                    </Link>
                  ) : (
                    <p
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: "22px",
                        fontWeight: 700,
                        fontStyle: "italic",
                        letterSpacing: ".01em",
                        color: "#6B6B6B",
                        marginBottom: "8px",
                        lineHeight: "1.2",
                      }}
                    >
                      {isVisible ? displayTitle : "???"}
                    </p>
                  )}

                  {/* Cryptic teaser — the Rowan Pope line */}
                  <p
                    style={{
                      fontFamily: "'Source Serif 4', Georgia, serif",
                      fontSize: "16px",
                      fontStyle: "italic",
                      lineHeight: "1.6",
                      color: "#6B6B6B",
                      maxWidth: "480px",
                    }}
                  >
                    {isVisible && TEASERS[lesson.id] ? (
                      <>
                        {TEASERS[lesson.id].lead}{" "}
                        <span
                          style={{
                            fontStyle: "normal",
                            fontWeight: 600,
                            background: "var(--iris)",
                            backgroundSize: "200% 100%",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            animation: "iris 3s linear infinite",
                          }}
                        >
                          {TEASERS[lesson.id].kicker}
                        </span>
                      </>
                    ) : isLocked ? (
                      "You haven\u2019t earned this yet."
                    ) : (
                      ""
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ REVEAL / ARTIFACTS SECTION ═══ */}
        {allComplete && (
          <div style={{ marginTop: 8, paddingLeft: 48, position: "relative" }}>
            {/* Timeline connector from last lesson */}
            <div style={{ position: "absolute", left: 15, top: 0, height: 32, width: 1, background: "#8B1A1A" }} />
            <div style={{
              position: "absolute", left: 6, top: 32, width: 20, height: 20, borderRadius: "50%",
              background: "linear-gradient(135deg, #B8943E, #D4B96A)", border: "2px solid #B8943E",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: "#FAF7F2", boxShadow: "0 0 16px rgba(184,148,62,0.35)",
            }}>
              ★
            </div>

            <div style={{ paddingTop: 28, paddingBottom: 48 }}>
              <p style={{
                fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: ".2em",
                textTransform: "uppercase", color: "#B8943E", marginBottom: 6,
              }}>
                {revealPick ? "Your Keeper" : "The Reveal"}
              </p>

              {!revealPick ? (
                <>
                  <Link
                    href="/reveal"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22,
                      fontWeight: 700, fontStyle: "italic", color: "#1A1A1A",
                      textDecoration: "none", display: "block", marginBottom: 8, lineHeight: 1.2,
                    }}
                  >
                    Choose your keeper.
                    <span style={{ marginLeft: 12, fontSize: 14, color: "#B8943E" }}>&rarr;</span>
                  </Link>
                  <p style={{
                    fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16,
                    fontStyle: "italic", lineHeight: 1.6, color: "#6B6B6B", maxWidth: 480,
                  }}>
                    Two readings of the same story.{" "}
                    <span style={{
                      fontStyle: "normal", fontWeight: 600,
                      background: "var(--iris)", backgroundSize: "200% 100%",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      animation: "iris 3s linear infinite",
                    }}>
                      Pick the one you want to take home.
                    </span>
                  </p>
                </>
              ) : (
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 4 }}>
                  {/* Chosen artifact */}
                  <Link
                    href={revealPick === "playbill" ? "/artifacts/playbill" : "/artifacts/redline"}
                    style={{
                      display: "block", width: 200, height: 260, borderRadius: 6, overflow: "hidden",
                      backgroundImage: revealPick === "playbill" ? "url('/reveal/stage.png')" : "url('/reveal/desk.png')",
                      backgroundSize: "cover", backgroundPosition: "center", position: "relative",
                      boxShadow: "0 8px 28px rgba(0,0,0,.18)", textDecoration: "none",
                      transition: "transform .3s ease, box-shadow .3s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,.25)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,.18)"; }}
                  >
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img
                        src={revealPick === "playbill" ? "/reveal/playbill.png" : "/reveal/manuscript.png"}
                        alt={revealPick === "playbill" ? "The Programme" : "The Manuscript"}
                        style={{ width: "65%", height: "auto", filter: "drop-shadow(0 8px 16px rgba(0,0,0,.4))" }}
                      />
                    </div>
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 12px 12px",
                      background: "linear-gradient(transparent, rgba(0,0,0,.6))",
                      fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: ".25em",
                      textTransform: "uppercase", color: "rgba(250,247,242,.8)", textAlign: "center",
                    }}>
                      {revealPick === "playbill" ? "The Programme" : "The Manuscript"}
                    </div>
                  </Link>

                  {/* Sealed artifact — unlocked or purchasable */}
                  {sealedUnlocked ? (
                    <Link
                      href={revealPick === "playbill" ? "/artifacts/redline" : "/artifacts/playbill"}
                      style={{
                        display: "block", width: 200, height: 260, borderRadius: 6, overflow: "hidden",
                        backgroundImage: revealPick === "playbill" ? "url('/reveal/desk.png')" : "url('/reveal/stage.png')",
                        backgroundSize: "cover", backgroundPosition: "center", position: "relative",
                        boxShadow: "0 8px 28px rgba(0,0,0,.18)", textDecoration: "none",
                        transition: "transform .3s ease, box-shadow .3s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,.25)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,.18)"; }}
                    >
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img
                          src={revealPick === "playbill" ? "/reveal/manuscript.png" : "/reveal/playbill.png"}
                          alt={revealPick === "playbill" ? "The Manuscript" : "The Programme"}
                          style={{ width: "65%", height: "auto", filter: "drop-shadow(0 8px 16px rgba(0,0,0,.4))" }}
                        />
                      </div>
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 12px 12px",
                        background: "linear-gradient(transparent, rgba(0,0,0,.6))",
                        fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: ".25em",
                        textTransform: "uppercase", color: "rgba(250,247,242,.8)", textAlign: "center",
                      }}>
                        {revealPick === "playbill" ? "The Manuscript" : "The Programme"}
                      </div>
                    </Link>
                  ) : (
                    <UnlockArtifactTile
                      artifactType={revealPick === "playbill" ? "redline" : "playbill"}
                      email={user?.email || ""}
                      bgImage={revealPick === "playbill" ? "/reveal/desk.png" : "/reveal/stage.png"}
                      artifactImage={revealPick === "playbill" ? "/reveal/manuscript.png" : "/reveal/playbill.png"}
                      label={revealPick === "playbill" ? "The Manuscript" : "The Programme"}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
