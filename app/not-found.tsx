import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: "var(--bg-main)", color: "var(--text-main)" }}
    >
      <h1
        style={{
          fontFamily: "var(--display)",
          fontSize: "clamp(48px, 8vw, 96px)",
          lineHeight: "1",
        }}
      >
        404
      </h1>
      <p
        style={{
          fontFamily: "var(--serif)",
          fontSize: "18px",
          color: "var(--text-muted)",
          marginTop: "16px",
        }}
      >
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        style={{
          marginTop: "32px",
          fontFamily: "var(--cond)",
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "var(--theme)",
          border: "1px solid var(--theme)",
          padding: "10px 24px",
          textDecoration: "none",
        }}
      >
        Back to Home
      </Link>
    </main>
  );
}
