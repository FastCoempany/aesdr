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
          // Match the lesson's own progress-label typography on the opposite
          // side of the topbar: mono, 9px, .16em tracking, #636060 (--mid).
          fontFamily: "var(--mono)",
          fontSize: "9px",
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: "#636060",
          background: hovered ? "rgba(99,96,96,0.08)" : "transparent",
          border: "1px solid rgba(99,96,96,0.32)",
          borderColor: hovered ? "rgba(99,96,96,0.65)" : "rgba(99,96,96,0.32)",
          padding: "4px 8px",
          cursor: "pointer",
          lineHeight: "12px",
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          transition: "background 150ms ease, border-color 150ms ease",
        }}
      >
        <span aria-hidden="true">&larr;</span>
        <span>Save &amp; Exit</span>
      </button>
    </>
  );
}
