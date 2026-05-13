"use client";

import { useCallback, useState } from "react";

export default function SaveExitButton() {
  const [exiting, setExiting] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleExit = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (exiting) return;
      setExiting(true);
      // Brief fade-to-black before navigating
      setTimeout(() => { window.location.href = "/dashboard"; }, 300);
    },
    [exiting],
  );

  return (
    <>
      {exiting && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            zIndex: 99999,
            animation: "fadeIn 300ms ease-out forwards",
          }}
        />
      )}
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
      <button
        onClick={handleExit}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          fontFamily: "var(--mono)",
          fontSize: "10px",
          letterSpacing: ".18em",
          textTransform: "uppercase",
          color: "var(--ink)",
          background: hovered ? "rgba(26,26,26,0.06)" : "transparent",
          border: "1px solid rgba(26,26,26,0.22)",
          padding: "5px 10px",
          cursor: "pointer",
          lineHeight: "14px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          transition: "background 150ms ease, border-color 150ms ease",
          borderColor: hovered ? "rgba(26,26,26,0.55)" : "rgba(26,26,26,0.22)",
        }}
      >
        <span aria-hidden="true">&larr;</span>
        <span>Save &amp; Exit</span>
      </button>
    </>
  );
}
