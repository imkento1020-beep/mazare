import { supabase } from "@/lib/supabase";
import {
  filterPostsPostedTonight,
  filterPublishedPosts,
  isPostedTonightJST,
} from "@/lib/home/dates";
import {
  normalizeMoods,
  type Shop,
  type VibePost,
} from "@/lib/home/types";
import { fetchShopsFromDb } from "@/lib/home/shops";
import {
  excludeShopRegistrationPosts,
  isShopRegistrationPost,
  SHOP_REGISTRATION_COMMENT,
} from "@/lib/home/shopRegistration";

export async function fetchVibePosts(): Promise<{
  data: VibePost[] | null;
  error: string | null;
}> {
  const nowIso = new Date().toISOString();

  const [postsResult, shopsResult] = await Promise.all([
    supabase
      .from("vibe_posts")
      .select("id, shop_id, comment, moods, images, posted_at")
      .lte("posted_at", nowIso)
      .not("comment", "ilike", `${SHOP_REGISTRATION_COMMENT}%`)
      .order("posted_at", { ascending: false }),
    fetchShopsFromDb(),
  ]);

  if (postsResult.error) {
    return { data: null, error: `vibe_posts: ${postsResult.error.message}` };
  }

  if (shopsResult.error) {
    return { data: null, error: `shops: ${shopsResult.error}` };
  }

  const shopsMap = new Map(
    (shopsResult.data ?? []).map((shop) => [shop.id, shop as Shop]),
  );

  const merged = excludeShopRegistrationPosts(
    (postsResult.data ?? []).map((post) => ({
      id: post.id,
      shop_id: post.shop_id,
      comment: post.comment,
      moods: normalizeMoods(post.moods),
      images: Array.isArray(post.images) ? post.images.map(String) : [],
      posted_at: post.posted_at ?? null,
      shops: shopsMap.get(post.shop_id) ?? null,
    })),
  );

  return { data: merged, error: null };
}

export function countByShopId(rows: { shop_id: string }[]) {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.shop_id] = (counts[row.shop_id] ?? 0) + 1;
  }
  return counts;
}

export function countByPostId(rows: { vibe_post_id: string }[]) {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.vibe_post_id] = (counts[row.vibe_post_id] ?? 0) + 1;
  }
  return counts;
}

export async function fetchAllShops(): Promise<{
  data: Shop[] | null;
  error: string | null;
}> {
  return fetchShopsFromDb();
}

export async function fetchLiveShopIds(): Promise<Set<string>> {
  const { data } = await supabase
    .from("vibe_posts")
    .select("shop_id, comment, posted_at")
    .lte("posted_at", new Date().toISOString());

  return new Set(
    (data ?? [])
      .filter(
        (row) =>
          isPostedTonightJST(row.posted_at) &&
          !isShopRegistrationPost({ comment: row.comment }),
      )
      .map((row) => row.shop_id),
  );
}

export type LatestVibePost = Pick<
  VibePost,
  "id" | "shop_id" | "comment" | "moods" | "images" | "posted_at"
>;

export async function fetchLatestVibePostsByShop(): Promise<
  Map<string, LatestVibePost>
> {
  const { data, error } = await supabase
    .from("vibe_posts")
    .select("id, shop_id, comment, moods, images, posted_at")
    .lte("posted_at", new Date().toISOString())
    .order("posted_at", { ascending: false });

  if (error || !data) return new Map();

  const publishedTonight = filterPostsPostedTonight(
    excludeShopRegistrationPosts(data),
  );

  const byShop = new Map<string, LatestVibePost>();
  for (const post of publishedTonight) {
    if (!byShop.has(post.shop_id)) {
      byShop.set(post.shop_id, {
        id: post.id,
        shop_id: post.shop_id,
        comment: post.comment,
        moods: normalizeMoods(post.moods),
        images: Array.isArray(post.images) ? post.images.map(String) : [],
        posted_at: post.posted_at ?? null,
      });
    }
  }
  return byShop;
}

export { filterPublishedPosts, filterPostsPostedTonight };
