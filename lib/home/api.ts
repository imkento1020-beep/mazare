import { getCached } from "@/lib/cache/clientCache";
import { supabase } from "@/lib/supabase";
import {
  filterPostsPostedTonight,
  filterPublishedPosts,
  isPostedTonightJST,
} from "@/lib/home/dates";
import { parseNightOutFromRow } from "@/lib/guest-post/nightOut";
import { getRecentPostsWindowStart } from "@/lib/home/recentWindow";
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

const BROWSE_POST_SELECT =
  "id, shop_id, comment, moods, images, video_url, posted_at, hashtags, media_type, is_guest_post, author_id, stop_number, visit_order, drink_name, drink_cups, drink_count, party_size";

const BROWSE_CACHE_TTL_MS = 45_000;

export type BrowseVibePostsBundle = {
  posts: VibePost[];
  shops: Shop[];
};

function mapBrowsePostRow(
  row: Record<string, unknown>,
  shop: Shop | null,
): VibePost {
  return {
    id: String(row.id),
    shop_id: String(row.shop_id),
    comment: String(row.comment ?? ""),
    moods: normalizeMoods(row.moods),
    images: Array.isArray(row.images) ? row.images.map(String) : [],
    video_url: typeof row.video_url === "string" ? row.video_url : null,
    posted_at: typeof row.posted_at === "string" ? row.posted_at : null,
    hashtags: Array.isArray(row.hashtags) ? row.hashtags.map(String) : [],
    media_type:
      row.media_type === "image" || row.media_type === "video"
        ? row.media_type
        : null,
    is_guest_post: Boolean(row.is_guest_post),
    author_id: typeof row.author_id === "string" ? row.author_id : null,
    shops: shop,
    ...parseNightOutFromRow(row),
  };
}

/** 24h 以内のゲスト投稿 + 全店舗（探す・サイドバー向け・軽量） */
export async function fetchBrowseVibePostsBundle(): Promise<{
  data: BrowseVibePostsBundle | null;
  error: string | null;
}> {
  const since = getRecentPostsWindowStart().toISOString();
  const nowIso = new Date().toISOString();

  const [postsResult, shopsResult] = await Promise.all([
    supabase
      .from("vibe_posts")
      .select(BROWSE_POST_SELECT)
      .eq("is_guest_post", true)
      .gte("posted_at", since)
      .lte("posted_at", nowIso)
      .order("posted_at", { ascending: false }),
    fetchShopsFromDb(),
  ]);

  if (postsResult.error) {
    return { data: null, error: postsResult.error.message };
  }
  if (shopsResult.error || !shopsResult.data) {
    return { data: null, error: shopsResult.error ?? "shops" };
  }

  const shopsMap = new Map(
    shopsResult.data.map((shop) => [shop.id, shop as Shop]),
  );

  const posts = (postsResult.data ?? []).map((row) =>
    mapBrowsePostRow(row as Record<string, unknown>, shopsMap.get(String(row.shop_id)) ?? null),
  );

  return {
    data: { posts, shops: shopsResult.data },
    error: null,
  };
}

export function fetchBrowseVibePostsBundleCached(): Promise<{
  data: BrowseVibePostsBundle | null;
  error: string | null;
}> {
  return getCached("browse-vibe-posts-bundle", BROWSE_CACHE_TTL_MS, () =>
    fetchBrowseVibePostsBundle(),
  );
}

export function deriveLiveShopIdsFromPosts(posts: VibePost[]): Set<string> {
  return new Set(
    posts
      .filter(
        (post) =>
          isPostedTonightJST(post.posted_at) &&
          !isShopRegistrationPost({ comment: post.comment }),
      )
      .map((post) => post.shop_id),
  );
}

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
