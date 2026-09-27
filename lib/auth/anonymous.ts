import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function isAnonymousUser(user: User | null | undefined) {
  return Boolean(user?.is_anonymous);
}

export function isRegisteredUser(user: User | null | undefined) {
  return Boolean(user && !user.is_anonymous);
}

export async function ensureGuestProfile(userId: string) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      user_type: "guest",
    },
    { onConflict: "id", ignoreDuplicates: false },
  );

  if (error && !error.message.includes("duplicate")) {
    console.warn("ensureGuestProfile:", error.message);
  }
}

export type AnonymousSessionResult = {
  user: User | null;
  error: string | null;
};

export function describeAnonymousAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("anonymous") &&
    (normalized.includes("disabled") || normalized.includes("not enabled"))
  ) {
    return "ゲスト投稿を使うには Supabase で Anonymous Sign-Ins を有効にする必要があります。";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return "リクエストが多すぎます。しばらく待ってから再度お試しください。";
  }

  if (
    normalized.includes("fetch") ||
    normalized.includes("network") ||
    normalized.includes("failed to fetch")
  ) {
    return "ネットワークエラーが発生しました。接続を確認して再度お試しください。";
  }

  return "ログインの準備に失敗しました。ページを再読み込みしてお試しください。";
}

export async function ensureAnonymousSession(): Promise<AnonymousSessionResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    await ensureGuestProfile(session.user.id);
    return { user: session.user, error: null };
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    const detail = error?.message ?? "unknown";
    console.warn("signInAnonymously failed:", detail);
    return {
      user: null,
      error: describeAnonymousAuthError(detail),
    };
  }

  await ensureGuestProfile(data.user.id);
  return { user: data.user, error: null };
}

export async function countGuestPostsByUser(userId: string) {
  const { count, error } = await supabase
    .from("vibe_posts")
    .select("*", { count: "exact", head: true })
    .eq("author_id", userId)
    .eq("is_guest_post", true);

  if (error) return 0;
  return count ?? 0;
}
