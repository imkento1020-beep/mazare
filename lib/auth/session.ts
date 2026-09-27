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

  const refreshResult = await Promise.race([
    supabase.auth.refreshSession(),
    new Promise<{ data: { session: null }; error: Error }>((resolve) => {
      setTimeout(
        () => resolve({ data: { session: null }, error: new Error("refresh timeout") }),
        8_000,
      );
    }),
  ]);

  const { data, error } = refreshResult;
  return !error && Boolean(data.session);
}

export async function signOutSilently() {
  await supabase.auth.signOut();
}

export async function signOutAndRedirectToLogin() {
  await signOutSilently();
  window.location.assign("/login");
}
