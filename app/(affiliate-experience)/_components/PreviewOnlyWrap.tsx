"use client";

/**
 * Wraps a section and intercepts clicks on its buttons + non-anchor links,
 * showing the "AFFILIATE PREVIEW ONLY" popup instead. Lets in-page anchor
 * navigation (#foo) and in-experience nav (/x/*) through; blocks everything
 * that would try to checkout, navigate off the host, or otherwise leave the
 * experience.
 *
 * The popup itself: iris-shimmer header band + a Leponeus carousel that
 * cycles through four poses (doctrine -> verdict -> owner -> recovery) on a
 * 3s loop, body copy, and a Got-it dismissal. The carousel is the brand
 * presence here; no gifs, no whimsy outside the canonical mascot set.
 */
import { useEffect, useState, type ReactNode, type MouseEvent } from "react";
import Image from "next/image";
import { trackProspect } from "../_lib/track";

const CAROUSEL_POSES = ["doctrine", "verdict", "owner", "recovery"] as const;
const CAROUSEL_INTERVAL_MS = 3000;

export default function PreviewOnlyWrap({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  function onClickCapture(e: MouseEvent<HTMLDivElement>) {
    const t = e.target as HTMLElement;
    const action = t.closest("button, a") as HTMLElement | null;
    if (!action) return;
    // Explicit opt-out — in-experience interactive elements (forms,
    // submission CTAs etc.) set data-preview-allow="1" so PreviewOnlyWrap
    // doesn't hijack their click. Use sparingly — anything that would
    // navigate the prospect off-host must NOT carry this attribute.
    if (action.getAttribute("data-preview-allow") === "1") return;
    if (action.tagName === "A") {
      const href = (action as HTMLAnchorElement).getAttribute("href") || "";
      // Allow in-page anchors and any in-experience nav (/x/*). Block the rest.
      if (href.startsWith("#") || href.startsWith("/x/")) return;
    }
    e.preventDefault();
    e.stopPropagation();
    trackProspect("preview_only_blocked", {
      target: action.tagName === "A"
        ? (action as HTMLAnchorElement).getAttribute("href") || "anchor"
        : action.textContent?.trim().slice(0, 60) || "button",
    });
    setOpen(true);
  }

  return (
    <>
      <div onClickCapture={onClickCapture}>{children}</div>

      {open && <PreviewOnlyModal onClose={() => setOpen(false)} />}
    </>
  );
}

/* ─────────────────────────────────────────────────
   The modal — iris-shimmer header + Leponeus carousel + body.
   Carousel cycles through 4 canonical poses on a 3s loop so the
   brand presence is the mascot set, not a one-off gif.
   ───────────────────────────────────────────────── */
function PreviewOnlyModal({ onClose }: { onClose: () => void }) {
  const [poseIndex, setPoseIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPoseIndex((i) => (i + 1) % CAROUSEL_POSES.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // Esc to close — keyboard a11y for the dialog
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const currentPose = CAROUSEL_POSES[poseIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Affiliate preview only"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(26, 26, 26, 0.62)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <style>{`
        @keyframes preview-iris-shimmer {
          0%   { background-position:   0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes preview-pose-fade {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes preview-modal-in {
          0%   { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--cream, #FAF7F2)",
          color: "var(--ink, #1A1A1A)",
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
          border: "1px solid var(--ink, #1A1A1A)",
          borderRadius: 4,
          boxShadow:
            "0 0 22px rgba(255, 0, 110, 0.14), 0 0 44px rgba(139, 92, 246, 0.10), 0 28px 56px -18px rgba(26, 26, 26, 0.45)",
          overflow: "hidden",
          animation: "preview-modal-in 240ms cubic-bezier(.22,1.1,.35,1)",
        }}
      >
        {/* Iris-shimmer header band — the brand signal */}
        <div
          style={{
            background: "var(--iris)",
            backgroundSize: "300% 100%",
            animation: "preview-iris-shimmer 6s linear infinite",
            color: "#FAF7F2",
            padding: "11px 20px",
            fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
            textTransform: "uppercase",
            letterSpacing: ".22em",
            fontSize: 12,
            fontWeight: 700,
            textShadow: "0 1px 2px rgba(0,0,0,0.25)",
          }}
        >
          Affiliate Preview Only
        </div>

        {/* Leponeus carousel — one pose visible at a time, 3s cycle.
            Pre-rendered all four images so swapping is just opacity. */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 180,
            background: "var(--cream, #FAF7F2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          {CAROUSEL_POSES.map((pose) => (
            <div
              key={pose}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: pose === currentPose ? 1 : 0,
                transition: "opacity 700ms ease",
                pointerEvents: "none",
              }}
              aria-hidden={pose !== currentPose}
            >
              <Image
                src={`/mascot/leponeus-${pose}.png`}
                alt=""
                width={160}
                height={160}
                priority={pose === "doctrine"}
                style={{ display: "block", objectFit: "contain" }}
              />
            </div>
          ))}
        </div>

        {/* Body copy + dismissal */}
        <div style={{ padding: "8px 28px 28px" }}>
          <p
            style={{
              fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 22,
              lineHeight: 1.25,
              color: "var(--ink, #1A1A1A)",
              margin: "0 0 10px",
              letterSpacing: "-0.005em",
            }}
          >
            This one&rsquo;s for affiliates only.
          </p>
          <p
            style={{
              fontFamily: "var(--serif, 'Source Serif 4', Georgia, serif)",
              fontSize: 15,
              lineHeight: 1.55,
              color: "var(--muted, #6B6B6B)",
              margin: "0 0 22px",
            }}
          >
            We&rsquo;re showing you the same landing your audience would see —
            you&rsquo;ll be redirected to the affiliate kit shortly, or when
            you&rsquo;re ready by clicking the button at the bottom right.
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
              textTransform: "uppercase",
              letterSpacing: ".16em",
              fontSize: 12,
              color: "#FAF7F2",
              background: "var(--crimson, #8B1A1A)",
              border: "none",
              borderRadius: 2,
              padding: "11px 24px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
