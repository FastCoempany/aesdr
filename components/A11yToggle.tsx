"use client";

import { useEffect, useState } from "react";

/**
 * In-product accessibility toggle.
 *
 * Floating button (bottom-left) → opens a panel with two switches:
 *   • Reduce motion — pauses the iris-shimmer + all CSS animations
 *   • Larger text — 12.5% root font-size bump
 *
 * State persists in localStorage so the preference survives across
 * sessions on the same device.
 *
 * Independently of this toggle, the @media (prefers-reduced-motion: reduce)
 * rule in app/globals.css still honors the OS-level preference. Both
 * signals stack — either one alone halts the shimmer. A user whose OS
 * already signals reduced-motion sees the in-product toggle as already-on
 * (initial state defaults to false but the OS-level CSS rule has already
 * applied, so animations are already paused). This component is the
 * escape hatch for users without OS-level setting.
 */

type Prefs = {
  reduceMotion: boolean;
  largerText: boolean;
};

const STORAGE_KEY = "aesdr-a11y-prefs";
const DEFAULTS: Prefs = { reduceMotion: false, largerText: false };

function readPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      reduceMotion: !!parsed.reduceMotion,
      largerText: !!parsed.largerText,
    };
  } catch {
    return DEFAULTS;
  }
}

function writePrefs(prefs: Prefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage can throw in Safari private mode — silently fall through;
    // the in-memory state still drives the current session.
  }
}

function applyPrefs(prefs: Prefs) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (prefs.reduceMotion) root.setAttribute("data-reduce-motion", "true");
  else root.removeAttribute("data-reduce-motion");
  if (prefs.largerText) root.setAttribute("data-larger-text", "true");
  else root.removeAttribute("data-larger-text");
}

export default function A11yToggle() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const p = readPrefs();
    applyPrefs(p);
    /* eslint-disable react-hooks/set-state-in-effect --
       mount-once localStorage hydration. useSyncExternalStore would be
       the alternative, but this component is the only writer to the
       a11y-prefs storage key + applies prefs as a DOM side effect, so a
       single hydration-time read + setState pair is the simpler pattern. */
    setPrefs(p);
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!open) return;
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open]);

  function update(partial: Partial<Prefs>) {
    const next = { ...prefs, ...partial };
    setPrefs(next);
    writePrefs(next);
    applyPrefs(next);
  }

  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close accessibility settings" : "Open accessibility settings"}
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: open ? "var(--ink)" : "var(--cream)",
          border: "1px solid var(--ink)",
          color: open ? "var(--cream)" : "var(--ink)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          zIndex: 9990,
          padding: 0,
          transition: "background 0.15s, color 0.15s",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          {/* Head — separated from body */}
          <circle cx="12" cy="4.25" r="1.65" />
          {/* Horizontal arm bar */}
          <rect x="3.5" y="7.6" width="17" height="1.8" rx="0.9" />
          {/* Torso (vertical) — arms-line down to hip */}
          <rect x="11.1" y="8" width="1.8" height="6.4" rx="0.5" />
          {/* Two legs angled outward */}
          <rect
            x="11.1"
            y="13.4"
            width="1.8"
            height="7.6"
            rx="0.5"
            transform="rotate(-14 12 17.2)"
          />
          <rect
            x="11.1"
            y="13.4"
            width="1.8"
            height="7.6"
            rx="0.5"
            transform="rotate(14 12 17.2)"
          />
        </svg>
      </button>

      {open && (
        <div
          id="a11y-panel"
          role="dialog"
          aria-label="Accessibility settings"
          style={{
            position: "fixed",
            bottom: 76,
            left: 20,
            width: 300,
            background: "#fff",
            border: "1px solid var(--ink)",
            padding: "20px 22px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 9991,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <span
              style={{
                fontFamily: "var(--cond)",
                fontSize: 11,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              Accessibility
            </span>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                padding: 4,
                fontFamily: "var(--mono)",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 16,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={prefs.reduceMotion}
              onChange={(e) => update({ reduceMotion: e.target.checked })}
              style={{ marginTop: 4, width: 16, height: 16, accentColor: "var(--crimson)" }}
            />
            <span style={{ flex: 1 }}>
              <span
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--ink)",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                Reduce motion
              </span>
              <span
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 13,
                  color: "var(--muted)",
                  fontStyle: "italic",
                  lineHeight: 1.5,
                }}
              >
                Pauses the iris-shimmer and other animations across the site.
              </span>
            </span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={prefs.largerText}
              onChange={(e) => update({ largerText: e.target.checked })}
              style={{ marginTop: 4, width: 16, height: 16, accentColor: "var(--crimson)" }}
            />
            <span style={{ flex: 1 }}>
              <span
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--ink)",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                Larger text
              </span>
              <span
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 13,
                  color: "var(--muted)",
                  fontStyle: "italic",
                  lineHeight: 1.5,
                }}
              >
                Increases text size by ~12% across the site.
              </span>
            </span>
          </label>

          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: 12,
              color: "var(--muted)",
              marginTop: 18,
              marginBottom: 0,
              lineHeight: 1.55,
              fontStyle: "italic",
              borderTop: "1px solid var(--light)",
              paddingTop: 14,
            }}
          >
            Settings persist on this device. Your operating system&apos;s
            reduced-motion preference is still honored independently.
          </p>
        </div>
      )}
    </>
  );
}
