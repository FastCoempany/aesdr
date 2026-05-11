/**
 * Anonymous role single-source-of-truth.
 *
 * Lenient sessionStorage: survives F5 + back-button + same-tab navigation,
 * resets on tab close. Members are server-rendered with initialRole from
 * Supabase user_metadata.role and bypass this module entirely.
 *
 * setRole dispatches `aesdr-role-change` so listening components (e.g. the
 * pricing tiers) re-render the moment the fork sets a role mid-session
 * without prop-drilling through the page tree.
 */

import { useSyncExternalStore } from "react";

export type Role = "ae" | "sdr";

const STORAGE_KEY = "aesdr_role";
const CHANGE_EVENT = "aesdr-role-change";

function isRole(value: unknown): value is Role {
  return value === "ae" || value === "sdr";
}

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(STORAGE_KEY);
  return isRole(value) ? value : null;
}

export function setRole(role: Role): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, role);
  window.dispatchEvent(new CustomEvent<Role>(CHANGE_EVENT, { detail: role }));
}

export function clearRole(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent<null>(CHANGE_EVENT, { detail: null }));
}

function subscribeRoleChange(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

/**
 * Subscribe to the role state. Server-rendered with `initial` (from Supabase
 * user_metadata) for members; client falls back to sessionStorage for
 * anonymous visitors. Uses `useSyncExternalStore` to satisfy
 * react-hooks/set-state-in-effect — React handles the snapshot/subscribe
 * lifecycle without us calling setState in an effect body.
 */
export function useRole(initial?: Role | null): Role | null {
  return useSyncExternalStore(
    subscribeRoleChange,
    () => getRole() ?? initial ?? null,
    () => initial ?? null,
  );
}
