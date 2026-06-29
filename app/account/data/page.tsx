"use client";

import Link from "next/link";
import { useState } from "react";

import { exportMyData, deleteMyAccount, type DeletionStep } from "@/app/actions/account-data";
import { createClient } from "@/utils/supabase/client";

export default function AccountDataPage() {
  // Export state.
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportHover, setExportHover] = useState(false);

  // Delete state.
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteHover, setDeleteHover] = useState(false);
  const [doneSteps, setDoneSteps] = useState<DeletionStep[] | null>(null);

  const canDelete = confirmText === "DELETE" && !deleting;

  async function handleExport() {
    setExportError(null);
    setExporting(true);
    try {
      const result = await exportMyData();
      if (!result.ok) {
        setExportError(result.error);
        return;
      }
      // Build a Blob from the JSON string and trigger a download. Done on the
      // client so the file never round-trips through a route — the action
      // already gathered everything server-side.
      const blob = new Blob([result.json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Something went wrong building your export. Try again.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    setDeleting(true);
    try {
      const result = await deleteMyAccount(confirmText);
      if (!result.ok) {
        setDeleteError(result.error);
        // A partial erasure still hands back steps — show them so the user
        // sees what was removed before contacting us.
        if (result.steps) setDoneSteps(result.steps);
        setDeleting(false);
        return;
      }
      // Account is gone. Sign out the dead session and send them home.
      setDoneSteps(result.steps);
      const supabase = createClient();
      await supabase.auth.signOut();
      setTimeout(() => {
        window.location.href = "/";
      }, 2500);
    } catch {
      setDeleteError("Something went wrong. Email hello@aesdr.com and we'll help.");
      setDeleting(false);
    }
  }

  return (
    <main
      className="min-h-screen px-6 py-0"
      style={{ background: "var(--cream)" }}
    >
      {/* Top nav — mirrors /account */}
      <nav
        className="sticky top-0 z-50 -mx-6 flex items-center justify-between border-b px-[5%] py-5"
        style={{
          borderColor: "var(--light)",
          background: "rgba(250,247,242,0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Link
          href="/account"
          className="flex items-center gap-3"
          style={{
            fontFamily: "var(--cond)",
            fontSize: "18px",
            fontWeight: 800,
            letterSpacing: ".2em",
            textTransform: "uppercase" as const,
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
        <Link
          href="/account"
          style={{
            fontFamily: "var(--cond)",
            fontWeight: 600,
            fontSize: "13px",
            letterSpacing: ".1em",
            textTransform: "uppercase" as const,
            color: "var(--muted)",
            textDecoration: "none",
          }}
        >
          &larr; Account
        </Link>
      </nav>

      <div className="mx-auto w-full max-w-xl py-16" style={{ color: "var(--ink)" }}>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontSize: "clamp(32px, 5vw, 48px)",
            lineHeight: ".95",
            marginBottom: "12px",
          }}
        >
          Your Data &amp; Privacy
        </h1>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: "16px",
            color: "var(--muted)",
            lineHeight: 1.55,
            marginBottom: "40px",
            maxWidth: "460px",
          }}
        >
          Take a copy of everything we hold about you, or close your account for
          good. Both are yours to do, any time.
        </p>

        {/* ── Export ── */}
        <section className="mb-12">
          <h2 style={sectionLabelStyle}>Export Your Data</h2>
          <div style={cardStyle}>
            <p style={{ fontFamily: "var(--serif)", fontSize: "15px", marginBottom: "16px", lineHeight: 1.55 }}>
              Download a single file with your account details, purchases,
              lesson progress, the work you generated in the course, and any
              affiliate records tied to you. It&apos;s plain JSON — yours to
              keep or hand to anyone you like.
            </p>
            {exportError && (
              <div role="alert" style={alertStyle}>
                {exportError}
              </div>
            )}
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              onMouseEnter={() => setExportHover(true)}
              onMouseLeave={() => setExportHover(false)}
              className="relative overflow-hidden cursor-pointer disabled:cursor-wait disabled:opacity-60"
              style={primaryButtonStyle(exportHover)}
            >
              <span style={{ position: "relative", zIndex: 1 }}>
                {exporting ? "Gathering…" : "Download my data"}
              </span>
            </button>
          </div>
        </section>

        {/* ── Delete ── */}
        <section
          style={{
            borderTop: "1px solid var(--light)",
            paddingTop: "32px",
          }}
        >
          <h2 style={{ ...sectionLabelStyle, color: "var(--crimson)" }}>
            Delete Your Account
          </h2>

          {doneSteps && !deleteError ? (
            <div
              role="status"
              style={{
                ...cardStyle,
                borderLeft: "3px solid var(--crimson)",
                background: "rgba(139,26,26,0.05)",
              }}
            >
              <p style={{ fontFamily: "var(--serif)", fontSize: "16px", color: "var(--crimson)", marginBottom: "4px" }}>
                Your account is closed.
              </p>
              <p style={{ fontFamily: "var(--serif)", fontSize: "14px", color: "var(--muted)" }}>
                Signing you out and taking you home…
              </p>
            </div>
          ) : (
            <div style={cardStyle}>
              <p style={{ fontFamily: "var(--serif)", fontSize: "15px", marginBottom: "12px", lineHeight: 1.55 }}>
                This closes your account and signs you out for good. It
                can&apos;t be undone.
              </p>

              <p style={{ ...fineLabelStyle, marginBottom: "6px" }}>
                What we remove
              </p>
              <ul style={listStyle}>
                <li>Your sign-in account and profile.</li>
                <li>Your lesson progress and the artifacts you generated.</li>
                <li>Your reveal picks, unlocks, testimonials, and lesson feedback.</li>
                <li>Your affiliate profile, if you have one.</li>
              </ul>

              <p style={{ ...fineLabelStyle, marginBottom: "6px", marginTop: "16px" }}>
                What we keep (and why)
              </p>
              <ul style={listStyle}>
                <li>
                  Purchase, checkout, and commission records — stripped of your
                  name and email, but kept with their amounts and dates because
                  tax and accounting law requires us to.
                </li>
                <li>
                  Your email opt-out, so we never email you again after you
                  leave.
                </li>
              </ul>

              <div style={{ marginTop: "20px" }}>
                <label htmlFor="confirm-delete" style={labelStyle}>
                  Type DELETE to confirm
                </label>
                <input
                  id="confirm-delete"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-4 py-3 outline-none transition"
                  style={{ ...inputStyle, marginTop: "8px" }}
                  placeholder="DELETE"
                />
              </div>

              {deleteError && (
                <div role="alert" style={{ ...alertStyle, marginTop: "16px", marginBottom: 0 }}>
                  {deleteError}
                </div>
              )}

              {doneSteps && deleteError && (
                <div style={{ marginTop: "16px" }}>
                  <p style={fineLabelStyle}>What we managed to remove</p>
                  <ul style={listStyle}>
                    {doneSteps.map((s, i) => (
                      <li key={i}>
                        {s.label} — {s.status}
                        {s.detail ? ` (${s.detail})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={handleDelete}
                disabled={!canDelete}
                onMouseEnter={() => setDeleteHover(true)}
                onMouseLeave={() => setDeleteHover(false)}
                className="relative overflow-hidden cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                style={{ ...dangerButtonStyle(deleteHover && canDelete), marginTop: "20px" }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>
                  {deleting ? "Closing your account…" : "Delete my account"}
                </span>
              </button>
            </div>
          )}
        </section>

        {/* Support */}
        <section style={{ marginTop: "32px" }}>
          <p style={{ fontFamily: "var(--serif)", fontSize: "14px", color: "var(--muted)" }}>
            Questions before you decide?{" "}
            <a href="mailto:hello@aesdr.com" style={{ color: "var(--crimson)" }}>
              hello@aesdr.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}

/* ── styles (mirrors app/account/change-password/page.tsx) ── */

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: "10px",
  letterSpacing: ".2em",
  textTransform: "uppercase",
  color: "var(--muted)",
  marginBottom: "12px",
};

const fineLabelStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: "10px",
  letterSpacing: ".2em",
  textTransform: "uppercase",
  color: "var(--muted)",
};

const cardStyle: React.CSSProperties = {
  padding: "20px 24px",
  background: "#fff",
  border: "1px solid var(--light)",
};

const listStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "14px",
  color: "var(--ink)",
  lineHeight: 1.6,
  paddingLeft: "18px",
  listStyleType: "disc",
  margin: 0,
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: "10px",
  letterSpacing: ".22em",
  textTransform: "uppercase",
  color: "var(--muted)",
  display: "block",
};

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "16px",
  background: "#fff",
  border: "1px solid var(--form-border)",
  color: "var(--ink)",
  borderRadius: "2px",
};

const alertStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "14px",
  borderLeft: "3px solid var(--crimson)",
  background: "rgba(139,26,26,0.05)",
  color: "var(--crimson)",
  padding: "12px 16px",
  marginBottom: "16px",
};

function primaryButtonStyle(hover: boolean): React.CSSProperties {
  return {
    fontFamily: "var(--cond)",
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    padding: "16px 28px",
    background: hover ? "var(--iris)" : "var(--ink)",
    backgroundSize: hover ? "200% 100%" : undefined,
    animation: hover ? "iris 3s linear infinite" : undefined,
    color: "var(--cream)",
    border: "1px solid var(--ink)",
    borderRadius: "2px",
    transition: "background 180ms ease, color 180ms ease",
  };
}

function dangerButtonStyle(hover: boolean): React.CSSProperties {
  return {
    fontFamily: "var(--cond)",
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    padding: "16px 28px",
    background: hover ? "#6f1414" : "var(--crimson)",
    color: "var(--cream)",
    border: "1px solid var(--crimson)",
    borderRadius: "2px",
    transition: "background 180ms ease",
  };
}
