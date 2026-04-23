"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BYPASS_COOKIE = "aesdr_cs_bypass";
const BYPASS_CODE = "741407";

function hasBypass() {
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${BYPASS_COOKIE}=`));
}

function setBypass() {
  document.cookie = `${BYPASS_COOKIE}=1; path=/; max-age=31536000; SameSite=Lax`;
}

export default function ComingSoonPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      if (hasBypass()) {
        setVisible(false);
        router.replace("/");
      }
    });
  }, [router]);

  if (!visible) return null;

  function handleGhost() {
    const code = prompt("");
    if (code === BYPASS_CODE) {
      setBypass();
      setVisible(false);
      router.replace("/");
    }
  }

  return (
    <main
      style={{
        background: "var(--cream, #FAF7F2)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Turtle + logo container */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Turtle image */}
        <div
          style={{
            position: "relative",
            width: "clamp(300px, 55vw, 560px)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/turtle.png"
            alt=""
            draggable={false}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              userSelect: "none",
            }}
          />

          {/* Ghost bypass button — positioned over the turtle's left eye */}
          <button
            onClick={handleGhost}
            aria-hidden="true"
            tabIndex={-1}
            style={{
              position: "absolute",
              top: "22%",
              left: "16%",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "transparent",
              border: "none",
              cursor: "default",
              zIndex: 10,
              outline: "none",
              padding: 0,
            }}
          />
        </div>

        {/* Iris shimmer AESDR logo — much larger, centered at turtle's foot */}
        <h1
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(72px, 16vw, 180px)",
            fontWeight: 900,
            fontStyle: "italic",
            background: "var(--iris)",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "iris 4s linear infinite",
            letterSpacing: "-0.02em",
            marginTop: "-30px",
            marginBottom: 0,
            lineHeight: 1,
            position: "relative",
            zIndex: 2,
            userSelect: "none",
            textAlign: "center",
          }}
        >
          AESDR
        </h1>

        {/* Tagline beneath the logo */}
        <p
          style={{
            fontFamily: "var(--display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(14px, 2.2vw, 22px)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--ink, #1A1A1A)",
            letterSpacing: "0.02em",
            marginTop: 16,
            textAlign: "center",
            userSelect: "none",
            opacity: 0.85,
          }}
        >
          aes and sdrs rule this world
        </p>
      </div>
    </main>
  );
}
