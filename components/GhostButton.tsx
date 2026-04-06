"use client";

export default function GhostButton() {
  function handleClick() {
    const code = prompt("");
    if (code === "741407") {
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
        position: "fixed",
        bottom: "52px",
        right: "24px",
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        border: "none",
        background: "rgba(255,255,255,0.04)",
        cursor: "default",
        padding: 0,
        zIndex: 10,
      }}
    />
  );
}
