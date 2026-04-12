"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { signOut } from "@/app/actions/progress";

export default function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await signOut();
          window.location.href = "/";
        });
      }}
      disabled={isPending}
      style={{
        color: "var(--text-muted)",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: "inherit",
        fontWeight: "inherit",
        letterSpacing: "inherit",
        textTransform: "inherit" as const,
      }}
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
