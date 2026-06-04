"use client";

/**
 * Step 1 gate. "Begin" sends the prospect into the full landing experience at
 * /x/landing, carrying their ?p= tag forward so tracking stays attributed.
 */
import { useRouter } from "next/navigation";
import LeponeusGate from "./LeponeusGate";

export default function ExperienceGate() {
  const router = useRouter();
  return (
    <LeponeusGate
      onBegin={() => {
        const p =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("p")
            : null;
        router.push(p ? `/x/landing?p=${encodeURIComponent(p)}` : "/x/landing");
      }}
    />
  );
}
