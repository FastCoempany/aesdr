"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import styles from "./tower.module.css";

/**
 * The tower's submit button. Every trigger-pull in the tower posts a server
 * action, which takes real time — so the button has to acknowledge the press:
 * hover/active states from tower.module.css, plus disabled + a pending label
 * + a pulse while its own form is in flight (useFormStatus is scoped to the
 * nearest form, so sibling buttons stay live).
 *
 * Pass `confirmMessage` for actions that spend money/tokens or start an agent;
 * cancelling the confirm cancels the submit.
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
  return (
    <button
      type="submit"
      className={`${styles.btn} ${styles[variant]}`}
      style={style}
      disabled={pending}
      aria-busy={pending}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        if (confirmMessage && !confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
