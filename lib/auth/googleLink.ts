import { supabase } from "@/lib/supabase";
import { storePendingReturnPath } from "@/lib/auth/pendingReturnPath";
import { getAuthCallbackUrl } from "@/lib/site/url";
import { isAnonymousUser } from "@/lib/auth/anonymous";

function isManualLinkingDisabledError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("manual linking") && normalized.includes("disabled")
  );
}

async function signInWithGoogleOAuth(redirectTo: string) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw error;
}

/**
 * ゲスト（匿名）→ Google 正式登録は linkIdentity が理想だが、
 * Supabase で Manual Linking が無効だと失敗する。その場合は一度サインアウトして OAuth ログインへフォールバックする。
 */
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
    if (!error) return;

    if (isManualLinkingDisabledError(error.message)) {
      await supabase.auth.signOut();
      await signInWithGoogleOAuth(redirectTo);
      return;
    }

    throw error;
  }

  await signInWithGoogleOAuth(redirectTo);
}