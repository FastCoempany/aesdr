"use client";

/**
 * Wraps a section and intercepts clicks on its buttons + non-anchor links,
 * showing the "no no no — preview only" popup instead. Lets in-page anchor
 * navigation (#foo) through; blocks everything that would try to checkout,
 * navigate off the host, or otherwise leave the experience.
 */
import { useState, type ReactNode, type MouseEvent } from "react";
import { trackProspect } from "../_lib/track";

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

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(26,26,26,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--cream, #FAF7F2)",
              color: "var(--ink, #1A1A1A)",
              padding: 28,
              maxWidth: 460,
              width: "100%",
              textAlign: "center",
              border: "2px solid var(--crimson, #8B1A1A)",
              borderRadius: 4,
              boxShadow: "0 20px 60px rgba(26,26,26,0.35)",
            }}
          >
            <img
              src="/preview-only.gif"
              alt="no no no — preview only"
              style={{
                maxWidth: 280,
                width: "100%",
                height: "auto",
                margin: "0 auto 16px",
                display: "block",
                borderRadius: 2,
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const ph = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (ph) ph.style.display = "block";
              }}
            />
            <div style={{ display: "none", fontSize: 80, lineHeight: 1, marginBottom: 10 }} aria-hidden>
              ☝️
            </div>
            <p
              style={{
                fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
                fontStyle: "italic",
                fontSize: 22,
                color: "var(--crimson, #8B1A1A)",
                margin: "0 0 6px",
              }}
            >
              No, no, no, no, no.
            </p>
            <p
              style={{
                fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
                textTransform: "uppercase",
                letterSpacing: ".18em",
                fontSize: 13,
                color: "var(--ink, #1A1A1A)",
                margin: "0 0 20px",
              }}
            >
              Preview only.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                fontFamily: "var(--cond, 'Barlow Condensed', sans-serif)",
                textTransform: "uppercase",
                letterSpacing: ".14em",
                fontSize: 12,
                color: "#FAF7F2",
                background: "var(--crimson, #8B1A1A)",
                border: "none",
                borderRadius: 2,
                padding: "10px 22px",
                cursor: "pointer",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
