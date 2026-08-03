import type { User } from "@supabase/supabase-js";
import { getUserRoles, type AppRole } from "./roles";

export type AppMode = AppRole;

const MODE_STORAGE_KEY = "mazare_app_mode";

export function getStoredAppMode(): AppMode | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(MODE_STORAGE_KEY);
  return value === "guest" || value === "owner" ? value : null;
}

export function setStoredAppMode(mode: AppMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MODE_STORAGE_KEY, mode);
}

export function clearStoredAppMode() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MODE_STORAGE_KEY);
}

/** 利用可能なロールの中から、現在の操作モードを決定 */
export function resolveAppMode(
  user: User | null | undefined,
  preferred?: AppMode | null,
): AppMode {
  const roles = getUserRoles(user);
  if (roles.length === 0) return "guest";
  if (roles.length === 1) return roles[0];

  const candidate = preferred ?? getStoredAppMode();
  if (candidate && roles.includes(candidate)) return candidate;

  return "guest";
}
