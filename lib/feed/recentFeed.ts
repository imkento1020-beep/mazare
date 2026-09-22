import { supabase } from "@/lib/supabase";
import { fetchShopsFromDb } from "@/lib/home/shops";
import { getRecentPostsWindowStart, isWithinRecentPostsWindow } from "@/lib/home/recentWindow";
import { getTrendingTagWindowJST } from "@/lib/home/recentWindow";
import type { Shop, VibePost } from "@/lib/home/types";

export type RecentShopFeedItem = {
  shop: Shop;
  postCount: number;
  uniquePosterCount: number;
  latestPost: VibePost;
  latestHashtags: string[];
};

export type TrendingTag = {
  tag: string;
  count: number;
};

const POST_SELECT =
  "id, shop_id, comment, moods, images, video_url, posted_at, hashtags, media_type, is_guest_post, author_id";

function normalizeHashtags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(String).filter(Boolean);
}

export async function fetchRecentVibePosts(): Promise<{
  data: VibePost[];
  error: string | null;
}> {
  const since = getRecentPostsWindowStart().toISOString();
  const nowIso = new Date().toISOString();

  const [postsResult, shopsResult] = await Promise.all([
    supabase
      .from("vibe_posts")
      .select(POST_SELECT)
      .gte("posted_at", since)
      .lte("posted_at", nowIso)
      .eq("is_guest_post", true)
      .order("posted_at", { ascending: false }),
    fetchShopsFromDb(),
  ]);

  if (postsResult.error) {
    return { data: [], error: postsResult.error.message };
  }
  if (shopsResult.error) {
    return { data: [], error: shopsResult.error };
  }

  const shopsMap = new Map(
    (shopsResult.data ?? []).map((shop) => [shop.id, shop as Shop]),
  );

  const rows = (postsResult.data ?? []).map((row) =>
    mapPostRow(row as Record<string, unknown>, shopsMap.get(String(row.shop_id)) ?? null),
  );
  return { data: rows, error: null };
}

function mapPostRow(row: Record<string, unknown>, shop: Shop | null): VibePost {
  return {
    id: String(row.id),
    shop_id: String(row.shop_id),
    comment: String(row.comment ?? ""),
    moods: Array.isArray(row.moods) ? row.moods.map(String) : [],
    images: Array.isArray(row.images) ? row.images.map(String) : [],
    video_url: typeof row.video_url === "string" ? row.video_url : null,
    posted_at: typeof row.posted_at === "string" ? row.posted_at : null,
    hashtags: normalizeHashtags(row.hashtags),
    media_type:
      row.media_type === "image" || row.media_type === "video"
        ? row.media_type
        : null,
    is_guest_post: Boolean(row.is_guest_post),
    author_id: typeof row.author_id === "string" ? row.author_id : null,
    shops: shop,
  };
}

async function fetchPostsInWindow(filters: {
  sinceIso: string;
  beforeIso?: string;
  hashtag?: string;
}): Promise<{ data: VibePost[]; error: string | null }> {
  let query = supabase
    .from("vibe_posts")
    .select(POST_SELECT)
    .gte("posted_at", filters.sinceIso)
    .eq("is_guest_post", true)
    .order("posted_at", { ascending: false });

  if (filters.beforeIso) {
    query = query.lt("posted_at", filters.beforeIso);
  }
  if (filters.hashtag) {
    query = query.contains("hashtags", [filters.hashtag]);
  }

  const [postsResult, shopsResult] = await Promise.all([query, fetchShopsFromDb()]);

  if (postsResult.error) {
    return { data: [], error: postsResult.error.message };
  }
  if (shopsResult.error) {
    return { data: [], error: shopsResult.error };
  }

  const shopsMap = new Map(
    (shopsResult.data ?? []).map((shop) => [shop.id, shop as Shop]),
  );

  return {
    data: (postsResult.data ?? []).map((row) =>
      mapPostRow(
        row as Record<string, unknown>,
        shopsMap.get(String(row.shop_id)) ?? null,
      ),
    ),
    error: null,
  };
}

export function buildRecentShopFeed(posts: VibePost[]): RecentShopFeedItem[] {
  const byShop = new Map<
    string,
    {
      shop: Shop;
      posts: VibePost[];
      authors: Set<string>;
    }
  >();

  for (const post of posts) {
    if (!isWithinRecentPostsWindow(post.posted_at)) continue;
    const shop = post.shops;
    if (!shop) continue;

    const bucket = byShop.get(post.shop_id) ?? {
      shop,
      posts: [],
      authors: new Set<string>(),
    };
    bucket.posts.push(post);
    if (post.author_id) bucket.authors.add(post.author_id);
    byShop.set(post.shop_id, bucket);
  }

  const items: RecentShopFeedItem[] = [];

  for (const entry of byShop.values()) {
    const latestPost = entry.posts[0];
    if (!latestPost) continue;

    items.push({
      shop: entry.shop,
      postCount: entry.posts.length,
      uniquePosterCount: entry.authors.size,
      latestPost,
      latestHashtags: latestPost.hashtags ?? [],
    });
  }

  return items.sort((a, b) => {
    if (b.postCount !== a.postCount) return b.postCount - a.postCount;
    return (
      new Date(b.latestPost.posted_at ?? 0).getTime() -
      new Date(a.latestPost.posted_at ?? 0).getTime()
    );
  });
}

export function countTrendingTags(
  posts: VibePost[],
  limit = 5,
): TrendingTag[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    if (!isWithinRecentPostsWindow(post.posted_at)) continue;
    for (const tag of post.hashtags ?? []) {
      const normalized = tag.startsWith("#") ? tag : `#${tag}`;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function fetchTonightTrendingTags(limit = 50): Promise<{
  data: TrendingTag[];
  error: string | null;
}> {
  const { start, end } = getTrendingTagWindowJST();

  const { data, error } = await supabase
    .from("vibe_posts")
    .select("hashtags, posted_at")
    .gte("posted_at", start.toISOString())
    .lt("posted_at", end.toISOString())
    .eq("is_guest_post", true);

  if (error) {
    return { data: [], error: error.message };
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    for (const tag of normalizeHashtags(row.hashtags)) {
      const normalized = tag.startsWith("#") ? tag : `#${tag}`;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }

  const ranked = [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return { data: ranked, error: null };
}

export async function fetchPostsByHashtag(tag: string): Promise<{
  data: VibePost[];
  error: string | null;
}> {
  const normalized = tag.startsWith("#") ? tag : `#${tag}`;
  const { start, end } = getTrendingTagWindowJST();

  return fetchPostsInWindow({
    sinceIso: start.toISOString(),
    beforeIso: end.toISOString(),
    hashtag: normalized,
  });
}

export type MapShopActivity = {
  shopId: string;
  shop: Shop;
  uniquePosterCount: number;
  postCount: number;
  latestHashtags: string[];
  latestPostId: string;
};

export function buildMapShopActivity(posts: VibePost[]): MapShopActivity[] {
  const byShop = new Map<
    string,
    {
      shop: Shop;
      posts: VibePost[];
      authors: Set<string>;
    }
  >();

  for (const post of posts) {
    if (!isWithinRecentPostsWindow(post.posted_at)) continue;
    const shop = post.shops;
    if (!shop) continue;

    const bucket = byShop.get(post.shop_id) ?? {
      shop,
      posts: [],
      authors: new Set<string>(),
    };
    bucket.posts.push(post);
    if (post.author_id) bucket.authors.add(post.author_id);
    byShop.set(post.shop_id, bucket);
  }

  const activities: MapShopActivity[] = [];

  for (const [shopId, entry] of byShop) {
    const latest = entry.posts[0];
    if (!latest) continue;
    activities.push({
      shopId,
      shop: entry.shop,
      uniquePosterCount: entry.authors.size,
      postCount: entry.posts.length,
      latestHashtags: latest.hashtags ?? [],
      latestPostId: latest.id,
    });
  }

  return activities;
}

export function mapPinTier(uniquePosterCount: number): 0 | 1 | 2 | 3 {
  if (uniquePosterCount <= 0) return 0;
  if (uniquePosterCount <= 3) return 1;
  if (uniquePosterCount <= 9) return 2;
  return 3;
}
