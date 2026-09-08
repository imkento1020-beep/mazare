import { storePendingReturnPath } from "@/lib/auth/pendingReturnPath";
import { getSafeRedirectPath } from "@/lib/auth/safeRedirectPath";

function resolveReturnPath(returnPath?: string) {
  if (returnPath) return getSafeRedirectPath(returnPath);

  if (typeof window !== "undefined") {
    return getSafeRedirectPath(
      `${window.location.pathname}${window.location.search}`,
    );
  }

  return "/home";
}

export function getSignupPathWithReturn(returnPath?: string) {
  const path = resolveReturnPath(returnPath);
  return `/signup?next=${encodeURIComponent(path)}`;
}

export function getOwnerSignupPathWithReturn(returnPath?: string) {
  const path = resolveReturnPath(returnPath);
  return `/signup?type=owner&next=${encodeURIComponent(path)}`;
}

export function getLoginPathWithReturn(returnPath?: string) {
  const path = resolveReturnPath(returnPath);
  return `/login?next=${encodeURIComponent(path)}`;
}

export function prepareAuthNavigation(returnPath?: string) {
  const path = resolveReturnPath(returnPath);
  storePendingReturnPath(path);
  return path;
}
