import { supabase } from "@/lib/supabase";
import { notifyShopPostCreated } from "@/lib/notifications/api";
import { isPostScheduled } from "@/lib/home/dates";
import {
  countShopCheckinsTonight,
  fetchShopTonightCheckins,
} from "@/lib/checkins/api";
import type { Shop } from "@/lib/home/types";

const shopSelect =
  "id, name, address, genre, open_hours, cover_image, cover_images, owner_id, staff_ids";

export async function fetchOwnerShop(ownerId: string): Promise<{
  data: Shop | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("shops")
    .select(shopSelect)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: (data as Shop) ?? null, error: null };
}

export async function fetchManagedShop(userId: string): Promise<{
  data: Shop | null;
  error: string | null;
  isOwner: boolean;
}> {
  const owned = await fetchOwnerShop(userId);
  if (owned.data) {
    return { data: owned.data, error: null, isOwner: true };
  }
  if (owned.error) {
    return { data: null, error: owned.error, isOwner: false };
  }

  const { data, error } = await supabase
    .from("shops")
    .select(shopSelect)
    .contains("staff_ids", [userId])
    .maybeSingle();

  if (error) return { data: null, error: error.message, isOwner: false };
  return { data: (data as Shop) ?? null, error: null, isOwner: false };
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
  postedAt?: string;
}) {
  const postedAt = input.postedAt ?? new Date().toISOString();

  const { data, error } = await supabase
    .from("vibe_posts")
    .insert({
      shop_id: input.shopId,
      moods: input.moods,
      comment: input.comment,
      images: input.images,
      posted_at: postedAt,
    })
    .select("id")
    .single();

  if (!error && data?.id && !isPostScheduled(postedAt)) {
    await notifyShopPostCreated(data.id);
  }

  return { data, error };
}

export async function fetchOwnerVibePost(
  postId: string,
  ownerId: string,
): Promise<{
  data: {
    id: string;
    shop_id: string;
    moods: string[];
    comment: string;
    images: string[];
    posted_at: string;
  } | null;
  error: string | null;
}> {
  const { data: shop, error: shopError } = await fetchManagedShop(ownerId);
  if (shopError || !shop) {
    return { data: null, error: shopError ?? "店舗が見つかりません" };
  }

  const { data, error } = await supabase
    .from("vibe_posts")
    .select("id, shop_id, moods, comment, images, posted_at")
    .eq("id", postId)
    .eq("shop_id", shop.id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: "投稿が見つかりません" };

  return {
    data: {
      id: data.id,
      shop_id: data.shop_id,
      moods: Array.isArray(data.moods) ? data.moods.map(String) : [],
      comment: data.comment,
      images: Array.isArray(data.images) ? data.images.map(String) : [],
      posted_at: data.posted_at,
    },
    error: null,
  };
}

export async function updateVibePost(
  postId: string,
  shopId: string,
  input: {
    moods: string[];
    comment: string;
    images: string[];
    postedAt?: string;
  },
) {
  const payload: Record<string, unknown> = {
    moods: input.moods,
    comment: input.comment,
    images: input.images,
  };

  if (input.postedAt) {
    payload.posted_at = input.postedAt;
  }

  const { error } = await supabase
    .from("vibe_posts")
    .update(payload)
    .eq("id", postId)
    .eq("shop_id", shopId);

  return { error };
}

export async function deleteVibePost(postId: string, shopId: string) {
  const { error } = await supabase
    .from("vibe_posts")
    .delete()
    .eq("id", postId)
    .eq("shop_id", shopId);

  return { error };
}

export async function fetchShopDashboardStats(shopId: string) {
  const [interestsResult, postsResult, allPostsViewsResult, checkinsCount] =
    await Promise.all([
    supabase
      .from("interests")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", shopId),
    supabase
      .from("vibe_posts")
      .select("id, comment, images, posted_at, moods, view_count")
      .eq("shop_id", shopId)
      .order("posted_at", { ascending: false })
      .limit(15),
    supabase.from("vibe_posts").select("view_count").eq("shop_id", shopId),
    countShopCheckinsTonight(shopId),
  ]);

  const interestCount = interestsResult.count ?? 0;
  const totalViews = (allPostsViewsResult.data ?? []).reduce(
    (sum, post) => sum + (post.view_count ?? 0),
    0,
  );

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
    views: totalViews,
    interests: interestCount,
    checkins: checkinsCount,
    recentPosts: (postsResult.data ?? []).map((post) => ({
      ...post,
      interestCount: interestByPost[post.id] ?? 0,
      viewCount: post.view_count ?? 0,
    })),
  };
}

export async function fetchShopInterestsForFeed(shopId: string, limit = 5) {
  const { data } = await fetchShopTonightCheckins(shopId, limit);
  return data;
}
