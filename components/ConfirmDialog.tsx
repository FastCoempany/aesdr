"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * AESDR's own confirm dialog — replaces the browser-native window.confirm()
 * ("www.aesdr.com says…", unstyleable) with a branded modal. Two ways to use it:
 *
 *  1. <ConfirmDialog> directly — presentational; you control open/close. For a
 *     form-submit button, render it with confirmType="submit" so its Confirm IS
 *     the form's submit (it's a DOM descendant of the form), no requestSubmit
 *     gymnastics needed. See TowerButton.
 *  2. useConfirm() — a promise-based drop-in for window.confirm in click
 *     handlers: `if (await confirm("…")) { … }`. Render the returned element.
 */

const BACKDROP: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background: "rgba(26,26,26,0.45)",
};
const DIALOG: CSSProperties = {
  maxWidth: 440,
  width: "100%",
  background: "var(--cream, #FAF7F2)",
  color: "var(--ink, #1A1A1A)",
  border: "1px solid var(--light, #E8E4DF)",
  borderTop: "3px solid var(--crimson, #8B1A1A)",
  boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
  padding: "22px 24px 18px",
};
const EYEBROW: CSSProperties = {
  fontFamily: "var(--mono, monospace)",
  fontSize: 10,
  letterSpacing: ".28em",
  textTransform: "uppercase",
  color: "var(--crimson, #8B1A1A)",
  margin: "0 0 12px",
};
const MESSAGE: CSSProperties = {
  fontFamily: "var(--serif, Georgia, serif)",
  fontSize: 15,
  lineHeight: 1.55,
  margin: "0 0 20px",
};
const ROW: CSSProperties = { display: "flex", gap: 10, justifyContent: "flex-end" };
const BTN: CSSProperties = {
  fontFamily: "var(--cond, sans-serif)",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  padding: "10px 18px",
  cursor: "pointer",
};
const GHOST: CSSProperties = {
  ...BTN,
  background: "transparent",
  color: "var(--ink, #1A1A1A)",
  border: "1px solid var(--light, #E8E4DF)",
};
const PRIMARY: CSSProperties = {
  ...BTN,
  background: "var(--crimson, #8B1A1A)",
  color: "#fff",
  border: "1px solid var(--crimson, #8B1A1A)",
};

export function ConfirmDialog({
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Confirm",
  confirmType = "button",
  eyebrow = "Confirm",
}: {
  message: ReactNode;
  onCancel: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmType?: "button" | "submit";
  eyebrow?: string;
}) {
  // Esc cancels (matches the native confirm's affordance).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={eyebrow}
      style={BACKDROP}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div style={DIALOG}>
        <p style={EYEBROW}>{eyebrow}</p>
        <p style={MESSAGE}>{message}</p>
        <div style={ROW}>
          <button type="button" style={GHOST} onClick={onCancel}>
            Cancel
          </button>
          <button type={confirmType} style={PRIMARY} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Promise-based replacement for window.confirm() in click handlers. Returns a
 * `confirm()` you await, plus the modal element to drop into your JSX:
 *
 *   const [confirm, confirmModal] = useConfirm();
 *   ...
 *   onClick={async () => { if (await confirm("…")) doThing(); }}
 *   return <>{button}{confirmModal}</>;
 */
export function useConfirm(): readonly [
  (message: string, opts?: { confirmLabel?: string }) => Promise<boolean>,
  ReactNode,
] {
  const [state, setState] = useState<{
    message: string;
    confirmLabel: string;
    resolve: (v: boolean) => void;
  } | null>(null);

  const confirm = useCallback(
    (message: string, opts?: { confirmLabel?: string }) =>
      new Promise<boolean>((resolve) =>
        setState({ message, confirmLabel: opts?.confirmLabel ?? "Confirm", resolve }),
      ),
    [],
  );

  const settle = useCallback((v: boolean) => {
    setState((s) => {
      s?.resolve(v);
      return null;
    });
  }, []);

  const modal = state ? (
    <ConfirmDialog
      message={state.message}
      confirmLabel={state.confirmLabel}
      onCancel={() => settle(false)}
      onConfirm={() => settle(true)}
    />
  ) : null;

  return [confirm, modal] as const;
}
