"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useConfirm } from "@/components/ConfirmDialog";

/**
 * Per-prospect kill-switch in the ops roster. Confirms (branded dialog), POSTs
 * to /x/ops/revoke, then refreshes the board. With the live roster re-check in
 * resolveExperienceAccess, revoking here kills every copy of that invite link on
 * the next page load.
 */
export default function RevokeButton({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const router = useRouter();
  const [confirm, confirmModal] = useConfirm();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    const ok = await confirm(
      `Revoke ${name}? Their invite link dies immediately and their tracked history is deleted. This can't be undone — you'd generate a fresh link to let them back in.`,
      { confirmLabel: "Revoke link" },
    );
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch("/x/ops/revoke", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        style={{
          fontFamily: "var(--mono, 'Space Mono', monospace)",
          fontSize: 10,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--crimson, #8B1A1A)",
          background: "transparent",
          border: "1px solid var(--crimson, #8B1A1A)",
          padding: "5px 10px",
          cursor: busy ? "default" : "pointer",
          opacity: busy ? 0.5 : 1,
          whiteSpace: "nowrap",
        }}
      >
        {busy ? "…" : "Revoke"}
      </button>
      {confirmModal}
    </>
  );
}
