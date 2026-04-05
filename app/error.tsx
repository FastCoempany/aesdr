"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: "var(--bg-main)", color: "var(--text-main)" }}
    >
      <h1
        style={{
          fontFamily: "var(--display)",
          fontSize: "clamp(36px, 5vw, 56px)",
          lineHeight: "1",
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          fontFamily: "var(--serif)",
          fontSize: "18px",
          color: "var(--text-muted)",
          marginTop: "16px",
        }}
      >
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
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
          background: "none",
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    </main>
  );
}
