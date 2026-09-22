import { supabase } from "@/lib/supabase";
import { storePendingReturnPath } from "@/lib/auth/pendingReturnPath";
import { getAuthCallbackUrl } from "@/lib/site/url";
import { isAnonymousUser } from "@/lib/auth/anonymous";

export async function startGoogleAuth(returnPath: string) {
  storePendingReturnPath(returnPath);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = getAuthCallbackUrl();

  if (isAnonymousUser(user)) {
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo },
    });
    if (error) throw error;
    return;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw error;
}
