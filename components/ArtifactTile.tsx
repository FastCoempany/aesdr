/**
 * ArtifactTile — clickable card for an unlocked end-of-course artifact
 * (Programme or Manuscript). Lives as a client component because it needs
 * the hover handlers; the parent dashboard page is a server component and
 * can't pass functions to client components like next/link directly.
 *
 * Used for BOTH the chosen artifact and the sealed-but-unlocked artifact
 * tiles in the reveal section of /dashboard.
 */

"use client";

import Link from "next/link";

type Props = {
  href: string;
  bgImage: string;
  artifactImage: string;
  artifactAlt: string;
  label: string;
};

export default function ArtifactTile({
  href,
  bgImage,
  artifactImage,
  artifactAlt,
  label,
}: Props) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        width: 200,
        height: 260,
        borderRadius: 6,
        overflow: "hidden",
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        boxShadow: "0 8px 28px rgba(0,0,0,.18)",
        textDecoration: "none",
        transition: "transform .3s ease, box-shadow .3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,.18)";
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artifactImage}
          alt={artifactAlt}
          style={{
            width: "65%",
            height: "auto",
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,.4))",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "24px 12px 12px",
          background: "linear-gradient(transparent, rgba(0,0,0,.6))",
          fontFamily: "'Space Mono', monospace",
          fontSize: 8,
          letterSpacing: ".25em",
          textTransform: "uppercase",
          color: "rgba(250,247,242,.8)",
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </Link>
  );
}
