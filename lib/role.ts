/**
 * Anonymous role single-source-of-truth.
 *
 * Lenient sessionStorage: survives F5 + back-button + same-tab navigation,
 * resets on tab close. Members are server-rendered with initialRole from
 * Supabase user_metadata.role and bypass this entirely.
 *
 * Listeners attach to window for `aesdr-role-change` and re-render when the
 * fork sets a role mid-session — so the pricing block can pre-highlight the
 * matching tier without prop-drilling through the page tree.
 */

import { useEffect, useState } from "react";

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

export function useRole(initial?: Role | null): Role | null {
  const [role, setRoleState] = useState<Role | null>(initial ?? null);

  useEffect(() => {
    setRoleState(getRole() ?? initial ?? null);

    function onChange(event: Event) {
      const detail = (event as CustomEvent<Role | null>).detail;
      setRoleState(detail ?? null);
    }

    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, [initial]);

  return role;
}
