/**
 * AdminChip — top-center status pill that doubles as the founder's quick-nav
 * menu. Renders only for admin sessions (decided server-side in app/layout.tsx).
 *
 * Click the chip to drop a small panel of one-tap links to every operating
 * surface (journey, affiliate hub, public + private kit, admin dashboard,
 * sign out). Press Escape or click outside to close. Doesn't disrupt the
 * non-admin layout because non-admins never receive the component at all.
 */

"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { signOut } from "@/app/actions/progress";

type QuickLink = { label: string; href: string; note?: string };
type QuickDivider = { divider: true; label?: string };
type QuickEntry = QuickLink | QuickDivider;

const isDivider = (entry: QuickEntry): entry is QuickDivider =>
  "divider" in entry && entry.divider === true;

const QUICK_LINKS: QuickEntry[] = [
  { label: "Journey", href: "/dashboard", note: "Course dashboard — all lessons unlocked" },
  { label: "Affiliate Hub", href: "/partners", note: "Partner-prospect surface" },
  { label: "Public Kit", href: "/partners/kit", note: "8 partner-facing docs" },
  { label: "Gated Kit", href: "/partners/kit-private", note: "6 ops docs (admin auto-access)" },
  { label: "Admin · Dashboard", href: "/admin", note: "Cohort + revenue stats" },
  { label: "Admin · Users", href: "/admin/users", note: "All buyers, roles, refunds" },
  { label: "Admin · Teams", href: "/admin/teams", note: "Team purchases + seat allocations" },
  { label: "Admin · Partner Kit", href: "/admin/partner-kit", note: "Tokens + audit log" },
  { label: "Apply Form (visitor view)", href: "/partners/apply" },
  { label: "Home", href: "/" },
  { divider: true, label: "AESDR / Enterprise" },
  { label: "/enterprise · Landing", href: "/enterprise", note: "Subsidiary B2B surface" },
  { label: "/enterprise · Curriculum", href: "/enterprise/curriculum", note: "12 modules / 36 lessons mapped" },
  { label: "/enterprise · Implementation", href: "/enterprise/implementation", note: "Manager 8-week rollout guide" },
  { label: "/enterprise · Diagnostic", href: "/enterprise/diagnostic", note: "8 dimensions, before/after spec" },
  { label: "/enterprise · Integrations", href: "/enterprise/integrations", note: "Live + roadmap" },
  { label: "/enterprise · Partners", href: "/enterprise/channel", note: "5 channel categories" },
  { label: "/enterprise · Pricing", href: "/enterprise/pricing", note: "Team / Custom / White-label" },
  { label: "/enterprise · Contact", href: "/enterprise/contact", note: "Inquiry form" },
  { label: "/enterprise · Downloads", href: "/enterprise/downloads", note: "4 printable artifacts" },
];

export default function AdminChip() {
  const [open, setOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  function handleSignOut() {
    startSignOut(async () => {
      await signOut();
      window.location.href = "/";
    });
  }

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        bottom: 14,
        right: 14,
        zIndex: 500,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close admin menu" : "Open admin menu"}
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 12px",
          background: "var(--cream)",
          border: "1px solid var(--crimson)",
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--crimson)",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--crimson)",
          }}
          aria-hidden="true"
        />
        <span>Admin Mode</span>
        <span
          style={{
            opacity: 0.6,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.18s ease",
            display: "inline-block",
            marginLeft: 4,
          }}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            bottom: "100%",
            right: 0,
            marginBottom: 8,
            minWidth: 320,
            maxHeight: "min(72vh, 640px)",
            overflowY: "auto",
            background: "var(--cream)",
            border: "1px solid var(--crimson)",
            boxShadow: "0 -12px 36px rgba(139, 26, 26, 0.18)",
            padding: 8,
          }}
        >
          {QUICK_LINKS.map((entry, idx) => {
            if (isDivider(entry)) {
              return (
                <div
                  key={`divider-${idx}`}
                  role="separator"
                  style={{
                    padding: "16px 12px 8px",
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{
                      height: 2,
                      width: "100%",
                      background: "var(--iris)",
                      backgroundSize: "300% 100%",
                      animation: "iris 4s linear infinite",
                      opacity: 0.7,
                    }}
                    aria-hidden="true"
                  />
                  {entry.label && (
                    <div
                      style={{
                        marginTop: 8,
                        fontFamily: "var(--mono)",
                        fontSize: 9,
                        letterSpacing: ".22em",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                      }}
                    >
                      {entry.label}
                    </div>
                  )}
                </div>
              );
            }
            const link = entry;
            return (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "10px 12px",
                textDecoration: "none",
                color: "var(--ink)",
                borderBottom: "1px solid var(--light)",
                transition: "background 0.12s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(139, 26, 26, 0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--ink)",
                  lineHeight: 1.2,
                }}
              >
                {link.label}
              </div>
              {link.note && (
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 12,
                    color: "var(--muted)",
                    fontStyle: "italic",
                    marginTop: 2,
                    lineHeight: 1.4,
                  }}
                >
                  {link.note}
                </div>
              )}
            </Link>
            );
          })}

          {/* Sign out at the bottom — visually separated */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              display: "block",
              width: "100%",
              padding: "12px",
              marginTop: 4,
              background: "transparent",
              border: 0,
              borderTop: "2px solid var(--crimson)",
              fontFamily: "var(--mono)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--crimson)",
              cursor: signingOut ? "wait" : "pointer",
              textAlign: "center",
            }}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
