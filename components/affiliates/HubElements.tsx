/**
 * Component: HubElements (MonoEyebrow, EditorialSplitHero, ThreePillarBlock,
 *            DisqualificationPanel, CaveatLayer, HubCTA, EmptyStatePanel)
 * Spec: AESDR-PARTNER-HUB-SPEC.md §"Component library"
 * Canon: §6.3 (canonical layout patterns), §6.4 (iris reservation),
 *        §3.2 (Caveat = Michael only)
 * Five-question check: PASS
 *
 * All server components, no client-state. Inline styles consume CSS tokens
 * from app/globals.css (do not introduce raw hex).
 */

import Link from "next/link";
import type { ReactNode } from "react";

export function MonoEyebrow({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--mono)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: "var(--muted)",
        textAlign: "center",
        marginBottom: 24,
      }}
    >
      {children}
    </div>
  );
}

export function HubCTA({
  href,
  children,
  trail,
}: {
  href: string;
  children: ReactNode;
  trail?: ReactNode;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <Link
        href={href}
        style={{
          display: "inline-block",
          fontFamily: "var(--cond)",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#fff",
          background: "var(--iris)",
          backgroundSize: "300% 100%",
          animation: "iris 4s linear infinite",
          padding: "18px 44px",
          textDecoration: "none",
        }}
      >
        {children}
      </Link>
      {trail ? (
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 9,
            color: "var(--muted)",
            marginTop: 12,
            letterSpacing: "0.05em",
          }}
        >
          {trail}
        </div>
      ) : null}
    </div>
  );
}

export function EditorialSplitHero({
  leftEyebrow,
  leftHeadline,
  leftBody,
  rightLabel,
  rightHeadline,
  rightBody,
  ctaHref,
  ctaText,
  ctaTrail,
}: {
  leftEyebrow: string;
  leftHeadline: ReactNode;
  leftBody?: ReactNode;
  rightLabel?: string;
  rightHeadline: ReactNode;
  rightBody?: ReactNode;
  ctaHref: string;
  ctaText: string;
  ctaTrail?: string;
}) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "40% 60%",
        minHeight: 480,
      }}
      className="aesdr-hero"
    >
      <div
        style={{
          background: "var(--crimson)",
          color: "#fff",
          padding: "64px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: "var(--cond)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.8)",
            marginBottom: 20,
          }}
        >
          {leftEyebrow}
        </div>
        <h1
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(32px, 4.5vw, 48px)",
            color: "#fff",
            lineHeight: 1.15,
            marginBottom: leftBody ? 24 : 0,
          }}
        >
          {leftHeadline}
        </h1>
        {leftBody ? (
          <p
            style={{
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: 17,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.6,
              maxWidth: 380,
            }}
          >
            {leftBody}
          </p>
        ) : null}
      </div>
      <div
        style={{
          background: "var(--cream)",
          padding: "64px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {rightLabel ? (
          <div
            style={{
              fontFamily: "var(--cond)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 20,
            }}
          >
            {rightLabel}
          </div>
        ) : null}
        <h2
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(28px, 3.6vw, 36px)",
            color: "var(--ink)",
            lineHeight: 1.2,
            marginBottom: rightBody ? 20 : 32,
          }}
        >
          {rightHeadline}
        </h2>
        {rightBody ? (
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: 17,
              color: "var(--ink)",
              lineHeight: 1.6,
              marginBottom: 32,
              maxWidth: 540,
            }}
          >
            {rightBody}
          </div>
        ) : null}
        <div style={{ alignSelf: "flex-start" }}>
          <HubCTA href={ctaHref} trail={ctaTrail}>
            {ctaText}
          </HubCTA>
        </div>
      </div>
    </section>
  );
}

export function ThreePillarBlock({
  pillars,
}: {
  pillars: { title: string; body: ReactNode; trail?: string }[];
}) {
  return (
    <section
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "96px 24px 0",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 24,
      }}
      className="aesdr-pillars"
    >
      {pillars.map((p, i) => (
        <article
          key={i}
          style={{
            background: "#fff",
            border: "1px solid var(--light)",
            padding: 32,
            position: "relative",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 22,
              color: "var(--ink)",
              marginBottom: 16,
            }}
          >
            {p.title}
          </h3>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: 15,
              color: "var(--ink)",
              lineHeight: 1.6,
            }}
          >
            {p.body}
          </div>
          {p.trail ? (
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 9,
                color: "var(--muted)",
                marginTop: 16,
                letterSpacing: "0.05em",
              }}
            >
              {p.trail}
            </div>
          ) : null}
        </article>
      ))}
    </section>
  );
}

export function DisqualificationPanel({
  header,
  bullets,
  closingLine,
}: {
  header: string;
  bullets: string[];
  closingLine: string;
}) {
  return (
    <section
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "96px 24px 0",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--light)",
          padding: "40px 32px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--cond)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 24,
          }}
        >
          {header}
        </div>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 16,
            lineHeight: 1.7,
            color: "var(--ink)",
          }}
        >
          {bullets.map((b, i) => (
            <p key={i} style={{ marginBottom: 14 }}>
              — {b}
            </p>
          ))}
          <p
            style={{
              marginTop: 20,
              fontStyle: "normal",
              color: "var(--muted)",
            }}
          >
            {closingLine}
          </p>
        </div>
      </div>
    </section>
  );
}

export function CaveatLayer({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--hand)",
        fontSize: 22,
        color: "var(--crimson)",
        transform: "rotate(-1deg)",
        maxWidth: 560,
        margin: "48px auto 32px",
        textAlign: "center",
        lineHeight: 1.4,
        padding: "0 24px",
      }}
    >
      {children}
    </p>
  );
}

export function EmptyStatePanel({
  header,
  body,
  trail,
}: {
  header: string;
  body: ReactNode;
  trail?: string;
}) {
  return (
    <section
      style={{
        maxWidth: 720,
        margin: "96px auto 0",
        padding: "0 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px dashed var(--light)",
          padding: "64px 40px",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 28,
            color: "var(--ink)",
            marginBottom: 20,
          }}
        >
          {header}
        </h3>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontSize: 16,
            color: "var(--muted)",
            lineHeight: 1.7,
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          {body}
        </div>
        {trail ? (
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              color: "var(--muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginTop: 24,
            }}
          >
            {trail}
          </div>
        ) : null}
      </div>
    </section>
  );
}
