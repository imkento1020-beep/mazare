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

export async function ensureAnonymousSession(): Promise<User | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    await ensureGuestProfile(session.user.id);
    return session.user;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    console.warn("signInAnonymously failed:", error?.message);
    return null;
  }

  await ensureGuestProfile(data.user.id);
  return data.user;
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
