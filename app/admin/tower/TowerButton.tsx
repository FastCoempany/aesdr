"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import styles from "./tower.module.css";
import { ConfirmDialog } from "@/components/ConfirmDialog";

/**
 * The tower's submit button. Every trigger-pull posts a server action, which
 * takes real time — so the button acknowledges the press: hover/active states,
 * disabled + a pending label while its own form is in flight (useFormStatus is
 * scoped to the nearest form, so sibling buttons stay live).
 *
 * Pass `confirmMessage` for actions that spend money/tokens, start an agent, or
 * send mail. It opens AESDR's own ConfirmDialog (not the native window.confirm);
 * the dialog's Confirm is rendered inside the form, so it IS the submit.
 */
export default function TowerButton({
  children,
  pendingLabel,
  variant = "primary",
  confirmMessage,
  style,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "ghost" | "start" | "outline";
  confirmMessage?: string;
  style?: CSSProperties;
}) {
  const { pending } = useFormStatus();
  const [asking, setAsking] = useState(false);

  const button = (type: "submit" | "button", onClick?: () => void) => (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]}`}
      style={style}
      disabled={pending}
      aria-busy={pending}
      onClick={onClick}
    >
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );

  // No confirm → a plain submit button (unchanged).
  if (!confirmMessage) return button("submit");

  // With a confirm → the button opens our dialog; the dialog's Confirm is a
  // type="submit" rendered inside this form, so it submits without a native
  // confirm or any requestSubmit dance.
  return (
    <>
      {button("button", () => setAsking(true))}
      {asking && (
        <ConfirmDialog
          message={confirmMessage}
          confirmType="submit"
          onConfirm={() => setAsking(false)}
          onCancel={() => setAsking(false)}
        />
      )}
    </>
  );
}
