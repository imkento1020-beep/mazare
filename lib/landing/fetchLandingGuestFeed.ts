import { buildTonightCumulativeCupTotals } from "@/lib/guest-post/tonightCups";
import { parseMediaTypeField } from "@/lib/guest-post/parseMediaTypeField";
import { parseNightOutFromRow } from "@/lib/guest-post/nightOut";
import { getPostCardLocationLabel } from "@/lib/geo/postCardLocation";
import { ensureNearestStationsForShops } from "@/lib/shops/ensureNearestStation";
import {
  POST_CARD_SHOP_RELATION,
  POST_CARD_SHOP_RELATION_LEGACY,
} from "@/lib/home/postCardShopFields";
import type { Shop, VibePost } from "@/lib/home/types";
import { createSupabaseAnonServerClient } from "@/lib/supabase/serverAnon";

export type LandingGuestFeedItem = {
  post: VibePost;
  interestCount: number;
  commentCount: number;
  tonightTotalCups: number | null;
};

const GUEST_POST_SELECT = `
  id,
  shop_id,
  comment,
  moods,
  images,
  video_url,
  posted_at,
  hashtags,
  media_type,
  is_guest_post,
  author_id,
  stop_number,
  visit_order,
  drink_name,
  drink_cups,
  drink_count,
  party_size,
  ${POST_CARD_SHOP_RELATION}
`;

const GUEST_POST_SELECT_LEGACY = GUEST_POST_SELECT.replace(
  POST_CARD_SHOP_RELATION,
  POST_CARD_SHOP_RELATION_LEGACY,
);

function mapGuestPostRow(row: Record<string, unknown>): VibePost {
  const shopRaw = row.shops;
  const shopEntry = Array.isArray(shopRaw) ? shopRaw[0] : shopRaw;
  const shop =
    shopEntry && typeof shopEntry === "object" ? (shopEntry as Shop) : null;

  const images = Array.isArray(row.images) ? row.images.map(String) : [];
  const video_url = typeof row.video_url === "string" ? row.video_url : null;

  return {
    id: String(row.id),
    shop_id: String(row.shop_id),
    comment: String(row.comment ?? ""),
    moods: Array.isArray(row.moods) ? row.moods.map(String) : [],
    images,
    video_url,
    posted_at: typeof row.posted_at === "string" ? row.posted_at : null,
    hashtags: Array.isArray(row.hashtags) ? row.hashtags.map(String) : [],
    media_type: parseMediaTypeField(row.media_type, images, video_url),
    is_guest_post: Boolean(row.is_guest_post),
    author_id: typeof row.author_id === "string" ? row.author_id : null,
    shops: shop,
    author_display_name: null,
    ...parseNightOutFromRow(row),
  };
}

async function attachAuthorDisplayNames(
  posts: VibePost[],
): Promise<VibePost[]> {
  const supabase = createSupabaseAnonServerClient();
  const ids = posts
    .map((post) => post.author_id)
    .filter((id): id is string => Boolean(id));

  if (ids.length === 0) return posts;

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", ids);

  const names = new Map<string, string>();
  for (const row of data ?? []) {
    const name =
      typeof row.display_name === "string" && row.display_name.trim()
        ? row.display_name.trim()
        : "ゲスト";
    names.set(row.id, name);
  }

  return posts.map((post) => ({
    ...post,
    author_display_name: post.author_id
      ? (names.get(post.author_id) ?? "ゲスト")
      : null,
  }));
}

export async function fetchLandingGuestFeed(): Promise<LandingGuestFeedItem[]> {
  try {
    const supabase = createSupabaseAnonServerClient();
    const nowIso = new Date().toISOString();

    const primary = await supabase
      .from("vibe_posts")
      .select(GUEST_POST_SELECT)
      .eq("is_guest_post", true)
      .lte("posted_at", nowIso)
      .order("posted_at", { ascending: false })
      .limit(10);

    let rows: unknown[] | null = primary.data as unknown[] | null;
    let fetchError = primary.error;

    if (fetchError?.message?.includes("nearest_station")) {
      const retry = await supabase
        .from("vibe_posts")
        .select(GUEST_POST_SELECT_LEGACY)
        .eq("is_guest_post", true)
        .lte("posted_at", nowIso)
        .order("posted_at", { ascending: false })
        .limit(10);
      rows = retry.data as unknown[] | null;
      fetchError = retry.error;
    }

    if (fetchError || !rows?.length) {
      return [];
    }

    let posts = rows.map((row) =>
      mapGuestPostRow(row as unknown as Record<string, unknown>),
    );
    posts = await attachAuthorDisplayNames(posts);

    const uniqueShops = [
      ...new Map(
        posts
          .map((post) => post.shops)
          .filter((shop): shop is Shop => Boolean(shop))
          .map((shop) => [shop.id, shop]),
      ).values(),
    ];
    const stations = await ensureNearestStationsForShops(uniqueShops);
    posts = posts.map((post) =>
      post.shops
        ? {
            ...post,
            shops: {
              ...post.shops,
              nearest_station:
                stations[post.shops.id] ?? post.shops.nearest_station,
            },
          }
        : post,
    );

    const postIds = posts.map((post) => post.id);
    const interestByPost = new Map<string, number>();
    const commentByPost = new Map<string, number>();

    const [interestsResult, commentsResult] = await Promise.all([
      supabase.from("interests").select("vibe_post_id").in("vibe_post_id", postIds),
      supabase.from("comments").select("vibe_post_id").in("vibe_post_id", postIds),
    ]);

    for (const row of interestsResult.data ?? []) {
      const id = String(row.vibe_post_id);
      interestByPost.set(id, (interestByPost.get(id) ?? 0) + 1);
    }

    if (!commentsResult.error) {
      for (const row of commentsResult.data ?? []) {
        const id = String(row.vibe_post_id);
        commentByPost.set(id, (commentByPost.get(id) ?? 0) + 1);
      }
    }

    const cupTotals = buildTonightCumulativeCupTotals(posts);

    return posts.map((post) => ({
      post,
      interestCount: interestByPost.get(post.id) ?? 0,
      commentCount: commentByPost.get(post.id) ?? 0,
      tonightTotalCups: cupTotals.get(post.id) ?? null,
    }));
  } catch {
    return [];
  }
}

/** @deprecated LandingGuestFeedItem を利用してください */
export type LandingFeedPost = {
  id: string;
  shopName: string;
  area: string;
  interestCount: number;
  imageUrl: string | null;
  videoUrl: string | null;
};

export async function fetchLandingFeedPosts(): Promise<LandingFeedPost[]> {
  const items = await fetchLandingGuestFeed();
  return items.map(({ post, interestCount }) => {
    const images = (post.images ?? []).filter(Boolean);
    const videoUrl =
      post.media_type === "video" || (post.video_url && images.length === 0)
        ? (post.video_url ?? null)
        : null;
    return {
      id: post.id,
      shopName: post.shops?.name?.trim() || "お店",
      area: getPostCardLocationLabel(null, post.shops),
      interestCount,
      imageUrl: images[0] ?? null,
      videoUrl,
    };
  });
}
