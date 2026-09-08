import { getSafeRedirectPath } from "@/lib/auth/safeRedirectPath";

const STORAGE_KEY = "mazare_auth_return_path";

export function storePendingReturnPath(path: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, getSafeRedirectPath(path));
}

export function readPendingReturnPath(): string | null {
  if (typeof window === "undefined") return null;

  const stored = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);

  if (!stored) return null;
  return getSafeRedirectPath(stored);
}
