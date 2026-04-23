"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordOverlay() {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  if (dismissed) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0, 0, 0, 0.65)",
      backdropFilter: "blur(6px)",
    }}>
      <div style={{
        position: "relative",
        background: "#FAF7F2",
        color: "#1A1A1A",
        maxWidth: "440px",
        width: "90%",
        padding: "48px 40px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
      }}>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#6B6B6B",
            padding: "4px 8px",
            lineHeight: 1,
          }}
        >
          &times;
        </button>

        <p style={{
          fontFamily: "var(--mono)",
          fontSize: "9px",
          letterSpacing: "0.3em",
          textTransform: "uppercase" as const,
          color: "#6B6B6B",
          marginBottom: "12px",
        }}>
          One last thing
        </p>

        <h2 style={{
          fontFamily: "var(--display)",
          fontSize: "28px",
          fontWeight: 900,
          fontStyle: "italic",
          lineHeight: 1.15,
          marginBottom: "16px",
        }}>
          Create your password.
        </h2>

        <p style={{
          fontFamily: "var(--serif)",
          fontSize: "15px",
          lineHeight: 1.7,
          color: "#6B6B6B",
          marginBottom: "28px",
        }}>
          You signed in with a temporary password from your welcome email.
          Set a permanent one now so you can get back in anytime.
        </p>

        <button
          onClick={() => router.push("/account/change-password")}
          style={{
            display: "block",
            width: "100%",
            fontFamily: "var(--cond)",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "#fff",
            background: "linear-gradient(90deg, #FF006E 0%, #FF6B00 17%, #F59E0B 34%, #10B981 51%, #38BDF8 68%, #8B5CF6 85%, #FF006E 100%)",
            backgroundSize: "300% 100%",
            animation: "iris 4s linear infinite",
            padding: "16px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Create Password
        </button>
      </div>
    </div>
  );
}
