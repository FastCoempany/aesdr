"use client";

import { useCallback, useState } from "react";

export default function SaveExitButton() {
  const [exiting, setExiting] = useState(false);

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
        style={{
          fontFamily: "var(--mono)",
          fontSize: "9px",
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "#fff",
          background: "rgba(0,0,0,0.82)",
          backdropFilter: "blur(8px)",
          padding: "6px 10px",
          border: "none",
          cursor: "pointer",
          minHeight: "26px",
          lineHeight: "12px",
        }}
      >
        <span aria-hidden="true">&larr;</span> Save &amp; Exit
      </button>
    </>
  );
}
