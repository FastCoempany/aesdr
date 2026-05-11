"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { createClient } from "@/utils/supabase/client";

interface RoleSwitcherProps {
  currentRole: string | null;
}

const LABELS: Record<string, string> = {
  ae: "Account Executive (AE)",
  sdr: "Sales Development Rep (SDR)",
};

export default function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSwitch() {
    const newRole = currentRole === "ae" ? "sdr" : "ae";
    setLoading(true);
    setFeedback(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { role: newRole },
    });

    if (error) {
      setFeedback(error.message);
      setLoading(false);
      return;
    }

    track("account_role_switched", {
      from: currentRole as "ae" | "sdr",
      to: newRole as "ae" | "sdr",
    });
    setFeedback(`Switched to ${LABELS[newRole]}.`);
    setLoading(false);
    router.refresh();
  }

  if (!currentRole) {
    return (
      <p style={{ fontFamily: "var(--serif)", fontSize: "15px", color: "var(--text-muted)" }}>
        No role selected.{" "}
        <a href="/account/select-role" style={{ color: "var(--theme)" }}>
          Choose one
        </a>
      </p>
    );
  }

  return (
    <div>
      <p style={{ fontFamily: "var(--serif)", fontSize: "16px", marginBottom: "8px" }}>
        {LABELS[currentRole] ?? currentRole}
      </p>
      <button
        onClick={handleSwitch}
        disabled={loading}
        className="cursor-pointer disabled:cursor-wait disabled:opacity-50"
        style={{
          fontFamily: "var(--mono)",
          fontSize: "10px",
          letterSpacing: ".12em",
          textTransform: "uppercase",
          padding: "14px 16px",
          background: "var(--bg-panel)",
          border: "1px solid var(--line)",
          color: "var(--text-muted)",
        }}
      >
        {loading ? "Switching..." : `Switch to ${currentRole === "ae" ? "SDR" : "AE"}`}
      </button>
      {feedback && (
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: ".08em",
            color: "var(--theme)",
            marginTop: "8px",
          }}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}
