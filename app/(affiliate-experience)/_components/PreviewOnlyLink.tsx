"use client";

/**
 * Click handler for any link that would navigate OFF the locked experience
 * host. Shows an inline popup with the Mutombo "no no no — preview only" GIF
 * (drop the file at /public/preview-only.gif to enable; falls back to a
 * styled text card while missing). Never lets the prospect leave the
 * environment by accident.
 */
import { useState, type ReactNode, type CSSProperties } from "react";
import { trackProspect } from "../_lib/track";

type Props = {
  children: ReactNode;
  /** What the prospect tried to reach — recorded for analytics. */
  target: string;
  className?: string;
  style?: CSSProperties;
};

export default function PreviewOnlyLink({
  children,
  target,
  className,
  style,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <a
        href="#"
        className={className}
        style={style}
        onClick={(e) => {
          e.preventDefault();
          trackProspect("preview_only_blocked", { target });
          setOpen(true);
        }}
      >
        {children}
      </a>

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
                // gif not yet uploaded — show a finger-wave placeholder
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const ph = (e.currentTarget.nextElementSibling as HTMLElement | null);
                if (ph) ph.style.display = "block";
              }}
            />
            <div
              style={{
                display: "none",
                fontSize: 80,
                lineHeight: 1,
                marginBottom: 10,
              }}
              aria-hidden
            >
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
