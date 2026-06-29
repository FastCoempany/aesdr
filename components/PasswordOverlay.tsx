"use client";

import { useRouter } from "next/navigation";

/**
 * Shown to a buyer who signed in with the temporary password from their
 * welcome email but hasn't set a permanent one yet. It is intentionally
 * NON-dismissable (R5-OB-1 / R3-AUTH-6): a skippable overlay let people bounce
 * off the only step that lets them get back in later, so they'd lose access the
 * moment the temp password aged out. The single path forward is the one
 * canonical set-password route — same destination the login redirect uses.
 */
export default function PasswordOverlay() {
  const router = useRouter();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-overlay-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div style={{
        position: "relative",
        background: "#FAF7F2",
        color: "#1A1A1A",
        maxWidth: "440px",
        width: "90%",
        padding: "48px 40px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
      }}>
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

        <h2
          id="password-overlay-title"
          style={{
            fontFamily: "var(--display)",
            fontSize: "28px",
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 1.15,
            marginBottom: "16px",
          }}
        >
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
          Set a permanent one now so you can get back in anytime — it only
          takes a moment, and it&rsquo;s the last step before your courses.
        </p>

        <button
          onClick={() => router.push("/account/set-password")}
          style={{
            display: "block",
            width: "100%",
            fontFamily: "var(--cond)",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "#fff",
            background: "var(--iris)",
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
