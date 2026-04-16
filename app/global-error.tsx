"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "40px", textAlign: "center" }}>
        <h2>Something went wrong</h2>
        <p style={{ color: "#666" }}>We've been notified and are looking into it.</p>
        <button
          onClick={reset}
          style={{
            marginTop: "20px",
            padding: "10px 24px",
            background: "#1A1A1A",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
