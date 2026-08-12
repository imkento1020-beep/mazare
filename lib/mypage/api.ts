import { supabase } from "@/lib/supabase";
import { getTonightInterestWindowJST } from "@/lib/home/dates";
import type { InterestRow, TodayInterestRow } from "@/lib/home/types";
import type { GuestProfile } from "./types";
import type { User } from "@supabase/supabase-js";
import { countUserVisitedShops } from "@/lib/checkins/api";

export function getDisplayName(user: User) {
  return (
    (user.user_metadata?.display_name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "ゲスト"
  );
}

export async function ensureGuestProfile(userId: string) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      user_type: "guest",
    },
    { onConflict: "id", ignoreDuplicates: true },
  );

  if (error) return { error: error.message };
  return { error: null };
}

export async function fetchGuestProfile(user: User): Promise<{
  data: GuestProfile;
  error: string | null;
}> {
  await ensureGuestProfile(user.id);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, user_type, profile_image, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return {
      data: {
        id: user.id,
        user_type: "guest",
        profile_image: null,
        created_at: null,
        display_name: getDisplayName(user),
        email: user.email ?? "",
      },
      error: error.message,
    };
  }

  return {
    data: {
      id: user.id,
      user_type: data?.user_type ?? "guest",
      profile_image: data?.profile_image ?? null,
      created_at: data?.created_at ?? null,
      display_name: getDisplayName(user),
      email: user.email ?? "",
    },
    error: null,
  };
}

export async function updateGuestProfile(input: {
  userId: string;
  displayName: string;
  profileImage: string | null;
}) {
  const trimmedName = input.displayName.trim();
  if (!trimmedName) {
    return { error: "表示名を入力してください" };
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: { display_name: trimmedName },
  });

  if (authError) return { error: authError.message };

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: input.userId,
      user_type: "guest",
      profile_image: input.profileImage,
      display_name: trimmedName,
    },
    { onConflict: "id" },
  );

  if (profileError) return { error: profileError.message };
  return { error: null };
}

export async function fetchUserInterests(userId: string): Promise<{
  data: InterestRow[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("interests")
    .select(
      `
      id,
      user_id,
      shop_id,
      vibe_post_id,
      created_at,
      vibe_posts (
        comment,
        posted_at,
        shops ( name )
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  const rows: InterestRow[] = (data ?? []).map((row) => {
    const vibePost = Array.isArray(row.vibe_posts)
      ? row.vibe_posts[0]
      : row.vibe_posts;
    const shop = Array.isArray(vibePost?.shops)
      ? vibePost.shops[0]
      : vibePost?.shops;

    return {
      id: row.id,
      user_id: row.user_id,
      shop_id: row.shop_id,
      vibe_post_id: row.vibe_post_id,
      created_at: row.created_at,
      vibe_posts: vibePost
        ? {
            comment: vibePost.comment,
            posted_at: vibePost.posted_at,
            shops: shop ? { name: shop.name } : null,
          }
        : null,
    };
  });

  return { data: rows, error: null };
}

export async function fetchTonightInterests(userId: string): Promise<{
  data: TodayInterestRow[];
  error: string | null;
}> {
  const { start, end } = getTonightInterestWindowJST();

  const { data, error } = await supabase
    .from("interests")
    .select(
      `
      id,
      user_id,
      shop_id,
      vibe_post_id,
      created_at,
      note,
      vibe_posts (
        comment,
        posted_at,
        shops ( name, address, open_hours )
      )
    `,
    )
    .eq("user_id", userId)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  const rows: TodayInterestRow[] = (data ?? []).map((row) => {
    const vibePost = Array.isArray(row.vibe_posts)
      ? row.vibe_posts[0]
      : row.vibe_posts;
    const shop = Array.isArray(vibePost?.shops)
      ? vibePost.shops[0]
      : vibePost?.shops;

    return {
      id: row.id,
      user_id: row.user_id,
      shop_id: row.shop_id,
      vibe_post_id: row.vibe_post_id,
      created_at: row.created_at,
      note: row.note ?? null,
      vibe_posts: vibePost
        ? {
            comment: vibePost.comment,
            posted_at: vibePost.posted_at,
            shops: shop
              ? {
                  name: shop.name,
                  address: shop.address,
                  open_hours: shop.open_hours,
                }
              : null,
          }
        : null,
    };
  });

  return { data: rows, error: null };
}

/** @deprecated fetchTonightInterests を使用 */
export async function fetchTodayInterests(userId: string): Promise<{
  data: TodayInterestRow[];
  error: string | null;
}> {
  return fetchTonightInterests(userId);
}

export async function cancelInterest(
  interestId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("interests")
    .delete()
    .eq("id", interestId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function updateInterestNote(
  interestId: string,
  userId: string,
  note: string | null,
): Promise<{ error: string | null }> {
  const trimmed = note?.trim() ?? "";

  const { error } = await supabase
    .from("interests")
    .update({ note: trimmed || null })
    .eq("id", interestId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function syncGuestDisplayName(userId: string, displayName: string) {
  const trimmed = displayName.trim();
  if (!trimmed) return { error: null };

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      user_type: "guest",
      display_name: trimmed,
    },
    { onConflict: "id" },
  );

  if (error) return { error: error.message };
  return { error: null };
}

export async function fetchUserInterestStats(userId: string) {
  const [{ data }, visitedShops] = await Promise.all([
    supabase.from("interests").select("shop_id").eq("user_id", userId),
    countUserVisitedShops(userId),
  ]);

  const rows = data ?? [];

  return {
    totalInterests: rows.length,
    visitedShops,
  };
}
