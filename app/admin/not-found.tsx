import Link from "next/link";

/**
 * Admin not-found (R5-EE-3 sibling). `notFound()` is called from several admin
 * routes (e.g. an unknown affiliate slug). Without this it falls through to the
 * app-wide 404, which is off-palette for the admin chrome. Editorial palette.
 */
export default function AdminNotFound() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E8E4DF",
        borderLeft: "3px solid #8B1A1A",
        padding: "32px 36px",
        maxWidth: 620,
      }}
    >
      <p
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: ".3em",
          textTransform: "uppercase",
          color: "#8B1A1A",
          marginBottom: 8,
        }}
      >
        404
      </p>
      <h1
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 32,
          fontWeight: 900,
          fontStyle: "italic",
          lineHeight: 1.1,
          color: "#1A1A1A",
          marginBottom: 16,
        }}
      >
        Nothing here.
      </h1>
      <p
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 16,
          lineHeight: 1.6,
          color: "#6B6B6B",
          marginBottom: 24,
        }}
      >
        That record or page doesn&rsquo;t exist — it may have been a stale link
        or a slug that was never created.
      </p>
      <Link
        href="/admin"
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: ".15em",
          textTransform: "uppercase",
          color: "#fff",
          background: "#8B1A1A",
          border: "none",
          padding: "12px 24px",
          textDecoration: "none",
        }}
      >
        Back to dashboard
      </Link>
    </div>
  );
}
