import { supabase } from "@/lib/supabase";

const REFRESH_BUFFER_SECONDS = 120;

export async function ensureFreshSession(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return false;

  const expiresAt = session.expires_at ?? 0;
  const now = Math.floor(Date.now() / 1000);
  const shouldRefresh = expiresAt <= now || expiresAt - now < REFRESH_BUFFER_SECONDS;

  if (!shouldRefresh) return true;

  const { data, error } = await supabase.auth.refreshSession();
  return !error && Boolean(data.session);
}

export async function signOutAndRedirectToLogin() {
  await supabase.auth.signOut();
  window.location.assign("/login");
}
