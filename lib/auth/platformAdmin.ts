import type { User } from "@supabase/supabase-js";

const DEFAULT_PLATFORM_ADMIN_EMAILS = ["admin@mazare.app"];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getPlatformAdminEmails(): string[] {
  const fromEnv = (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);

  if (fromEnv.length > 0) return fromEnv;
  return DEFAULT_PLATFORM_ADMIN_EMAILS;
}

export function isPlatformAdminFeatureEnabled() {
  return getPlatformAdminEmails().length > 0;
}

export function isPlatformAdminEmail(email: string | null | undefined) {
  if (!email) return false;

  const admins = getPlatformAdminEmails();
  if (admins.length === 0) return false;

  return admins.includes(normalizeEmail(email));
}

export function isPlatformAdminUser(user: User | null | undefined) {
  return isPlatformAdminEmail(user?.email);
}
