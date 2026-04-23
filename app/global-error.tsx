"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          background: "#FAF7F2",
          color: "#1A1A1A",
          fontFamily: "var(--serif, Georgia, serif)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--display, Georgia, serif)", fontSize: "2rem", marginBottom: "1rem" }}>
            Something broke.
          </h1>
          <p style={{ marginBottom: "1.5rem", opacity: 0.8 }}>
            We&rsquo;ve been notified. Try refreshing, or head home.
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "#1A1A1A",
              color: "#FAF7F2",
              textDecoration: "none",
              border: "1px solid #1A1A1A",
            }}
          >
            Go home
          </a>
        </div>
      </body>
    </html>
  );
}
