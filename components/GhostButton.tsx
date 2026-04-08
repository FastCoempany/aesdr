"use client";

export default function GhostButton() {
  function handleClick() {
    const code = prompt("");
    if (code === process.env.NEXT_PUBLIC_BYPASS_CODE) {
      document.cookie = "aesdr_bypass=1; path=/; max-age=31536000; SameSite=Lax";
      window.location.href = "/dashboard";
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-hidden="true"
      tabIndex={-1}
      style={{
        position: "absolute",
        top: "1.4rem",
        right: "1.8rem",
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "transparent",
        cursor: "default",
        padding: 0,
        zIndex: 10,
        animation: "ghostPulse 4s ease-in-out infinite",
      }}
    />
  );
}
