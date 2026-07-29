import { supabase } from "@/lib/supabase";
import type { Shop } from "@/lib/home/types";

export async function fetchOwnerShop(ownerId: string): Promise<{
  data: Shop | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("shops")
    .select(
      "id, name, address, genre, open_hours, cover_image, cover_images, owner_id, staff_ids",
    )
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: (data as Shop) ?? null, error: null };
}

export async function createOwnerShop(input: {
  ownerId: string;
  name: string;
  address: string;
  openHours: string;
  genres: string[];
  coverImages: string[];
}) {
  const { data, error } = await supabase
    .from("shops")
    .insert({
      name: input.name,
      address: input.address,
      open_hours: input.openHours || "—",
      genre: input.genres,
      cover_images: input.coverImages,
      owner_id: input.ownerId,
    })
    .select("id")
    .single();

  return { data, error };
}

export async function updateOwnerShop(
  shopId: string,
  input: {
    name: string;
    address: string;
    openHours: string;
    genres: string[];
    coverImages: string[];
    staffIds: string[];
  },
) {
  const { error } = await supabase
    .from("shops")
    .update({
      name: input.name,
      address: input.address,
      open_hours: input.openHours,
      genre: input.genres,
      cover_images: input.coverImages,
      staff_ids: input.staffIds.filter((id) =>
        /^[0-9a-f-]{36}$/i.test(id),
      ),
    })
    .eq("id", shopId);

  return { error };
}

export async function createVibePost(input: {
  shopId: string;
  moods: string[];
  comment: string;
  images: string[];
}) {
  const { data, error } = await supabase
    .from("vibe_posts")
    .insert({
      shop_id: input.shopId,
      moods: input.moods,
      comment: input.comment,
      images: input.images,
    })
    .select("id")
    .single();

  return { data, error };
}

export async function fetchShopDashboardStats(shopId: string) {
  const [interestsResult, postsResult] = await Promise.all([
    supabase
      .from("interests")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", shopId),
    supabase
      .from("vibe_posts")
      .select("id, comment, images, posted_at, moods")
      .eq("shop_id", shopId)
      .order("posted_at", { ascending: false })
      .limit(3),
  ]);

  const interestCount = interestsResult.count ?? 0;

  const postIds = postsResult.data?.map((post) => post.id) ?? [];

  let interestByPost: Record<string, number> = {};
  if (postIds.length > 0) {
    const { data: postInterests } = await supabase
      .from("interests")
      .select("vibe_post_id")
      .in("vibe_post_id", postIds);

    for (const row of postInterests ?? []) {
      interestByPost[row.vibe_post_id] =
        (interestByPost[row.vibe_post_id] ?? 0) + 1;
    }
  }

  return {
    views: Math.max(interestCount * 4, 12),
    interests: interestCount,
    checkins: Math.max(Math.floor(interestCount * 0.4), 0),
    recentPosts: (postsResult.data ?? []).map((post) => ({
      ...post,
      interestCount: interestByPost[post.id] ?? 0,
    })),
  };
}

export async function fetchShopInterestsForFeed(shopId: string, limit = 5) {
  const { data } = await supabase
    .from("interests")
    .select("id, created_at, user_id")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row, index) => ({
    id: row.id,
    name: `ゲスト${String.fromCharCode(65 + (index % 26))}`,
    time: new Date(row.created_at).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    viaMazare: true,
  }));
}
