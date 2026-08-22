const DEFAULT_SITE_URL = "https://mazare.app";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return DEFAULT_SITE_URL;
}

export function getAuthCallbackUrl() {
  return `${getSiteUrl()}/auth/callback`;
}

export function getPasswordResetUrl() {
  return `${getSiteUrl()}/login/reset-password`;
}

export function getStaffJoinUrl(inviteId: string) {
  return `${getSiteUrl()}/staff/join/${inviteId}`;
}

export function getSignupUrl(params?: { invite?: string; email?: string }) {
  const url = new URL("/signup", getSiteUrl());

  if (params?.invite) {
    url.searchParams.set("invite", params.invite);
  }

  if (params?.email) {
    url.searchParams.set("email", params.email);
  }

  return url.toString();
}

export function getLoginUrl(params?: { invite?: string }) {
  const url = new URL("/login", getSiteUrl());

  if (params?.invite) {
    url.searchParams.set("invite", params.invite);
  }

  return url.toString();
}
