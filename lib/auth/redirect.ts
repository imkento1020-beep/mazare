export function getAuthRedirectOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

export function getAuthCallbackUrl() {
  return `${getAuthRedirectOrigin()}/auth/callback`;
}

export function getPasswordResetUrl() {
  return `${getAuthRedirectOrigin()}/login/reset-password`;
}
