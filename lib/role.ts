/**
 * Anonymous role single-source-of-truth.
 *
 * Persists across browser sessions via localStorage (was sessionStorage
 * which lost role on tab close — see H.12/§N #1 of the behavioral audit).
 * Members are server-rendered with initialRole from Supabase
 * user_metadata.role and bypass this module entirely.
 *
 * setRole dispatches `aesdr-role-change` so listening components (e.g.
 * the pricing tiers) re-render the moment the fork sets a role mid-session
 * without prop-drilling through the page tree.
 *
 * Cross-tab sync: when the storage event fires from another tab, we also
 * emit the change event locally so other listeners in this tab pick it
 * up. Result: pick SDR in one tab, the pricing card in another tab
 * updates within ~100ms.
 */

import { useSyncExternalStore } from "react";

export type Role = "ae" | "sdr";

const STORAGE_KEY = "aesdr_role";
const CHANGE_EVENT = "aesdr-role-change";

function isRole(value: unknown): value is Role {
  return value === "ae" || value === "sdr";
}

/** Backwards-compat: read sessionStorage too in case a returning visitor
 *  still has a value from the pre-localStorage version of this module. */
function readStored(): Role | null {
  if (typeof window === "undefined") return null;
  try {
    const local = window.localStorage.getItem(STORAGE_KEY);
    if (isRole(local)) return local;
    const session = window.sessionStorage.getItem(STORAGE_KEY);
    if (isRole(session)) {
      // Migrate forward — write to localStorage and clear session.
      window.localStorage.setItem(STORAGE_KEY, session);
      window.sessionStorage.removeItem(STORAGE_KEY);
      return session;
    }
  } catch {
    // localStorage can throw in Safari private mode etc. — fall through.
  }
  return null;
}

export function getRole(): Role | null {
  return readStored();
}

export function setRole(role: Role): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, role);
  } catch {
    // Fall back to sessionStorage if localStorage is unavailable
    // (Safari private, quota, etc.).
    try {
      window.sessionStorage.setItem(STORAGE_KEY, role);
    } catch {
      /* truly nowhere to persist — accept the loss */
    }
  }
  window.dispatchEvent(new CustomEvent<Role>(CHANGE_EVENT, { detail: role }));
}

export function clearRole(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent<null>(CHANGE_EVENT, { detail: null }));
}

function subscribeRoleChange(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  // Listen for cross-tab storage events too — when another tab changes the
  // role, this tab should re-render. Filter to our key only.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Subscribe to the role state. Server-rendered with `initial` (from Supabase
 * user_metadata) for members; client falls back to localStorage for
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
