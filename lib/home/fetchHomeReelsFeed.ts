import { supabase } from "@/lib/supabase";
import { parseNightOutFromRow } from "@/lib/guest-post/nightOut";
import { parseMazaruFromRow } from "@/lib/guest-post/mazaruSettings";
import {
  POST_CARD_SHOP_RELATION,
  POST_CARD_SHOP_RELATION_LEGACY,
} from "@/lib/home/postCardShopFields";
import type { Shop, VibePost } from "@/lib/home/types";
import type {
  MergeAttitude,
  VibeScale,
} from "@/lib/profile/tonightSocialContext";

export type HomeReelsPost = VibePost & {
  author_profile_image?: string | null;
  author_merge_attitude?: MergeAttitude | null;
  author_vibe_scale?: VibeScale | null;
};

const POST_CORE_FIELDS = `
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
  party_size
`;

function buildPostSelect(extraFields: string, shopRelation: string) {
  const extra = extraFields.trim();
  return `${POST_CORE_FIELDS}${extra ? `, ${extra}` : ""}, ${shopRelation}`;
}

/** 存在しないカラムを順に外してクエリが通るまで試す */
const FEED_SELECT_VARIANTS = [
  buildPostSelect(
    "mazaru_mode, mazaru_details, author_merge_attitude, author_vibe_scale",
    POST_CARD_SHOP_RELATION,
  ),
  buildPostSelect(
    "author_merge_attitude, author_vibe_scale",
    POST_CARD_SHOP_RELATION,
  ),
  buildPostSelect("", POST_CARD_SHOP_RELATION),
  buildPostSelect("", POST_CARD_SHOP_RELATION_LEGACY),
];

function mapRow(row: Record<string, unknown>): HomeReelsPost {
  const shopRaw = row.shops;
  const shopEntry = Array.isArray(shopRaw) ? shopRaw[0] : shopRaw;
  const shop =
    shopEntry && typeof shopEntry === "object" ? (shopEntry as Shop) : null;

  return {
    id: String(row.id),
    shop_id: String(row.shop_id),
    comment: String(row.comment ?? ""),
    moods: Array.isArray(row.moods) ? row.moods.map(String) : [],
    images: Array.isArray(row.images) ? row.images.map(String) : [],
    video_url: typeof row.video_url === "string" ? row.video_url : null,
    posted_at: typeof row.posted_at === "string" ? row.posted_at : null,
    hashtags: Array.isArray(row.hashtags) ? row.hashtags.map(String) : [],
    media_type:
      row.media_type === "image" ||
      row.media_type === "video" ||
      row.media_type === "mixed"
        ? row.media_type
        : null,
    is_guest_post: Boolean(row.is_guest_post),
    author_id: typeof row.author_id === "string" ? row.author_id : null,
    shops: shop,
    author_display_name: null,
    author_profile_image: null,
    ...parseNightOutFromRow(row),
    ...parseMazaruFromRow(row),
    author_merge_attitude:
      row.author_merge_attitude === "open" ||
      row.author_merge_attitude === "closed"
        ? row.author_merge_attitude
        : null,
    author_vibe_scale:
      row.author_vibe_scale === "solo" ||
      row.author_vibe_scale === "small" ||
      row.author_vibe_scale === "lively"
        ? row.author_vibe_scale
        : null,
  };
}

async function attachAuthors(posts: HomeReelsPost[]): Promise<HomeReelsPost[]> {
  const ids = posts
    .map((p) => p.author_id)
    .filter((id): id is string => Boolean(id));
  if (ids.length === 0) return posts;

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, profile_image")
    .in("id", ids);

  const map = new Map<string, { name: string; image: string | null }>();
  for (const row of data ?? []) {
    map.set(String(row.id), {
      name:
        typeof row.display_name === "string" && row.display_name.trim()
          ? row.display_name.trim()
          : "ゲスト",
      image:
        typeof row.profile_image === "string" && row.profile_image.trim()
          ? row.profile_image.trim()
          : null,
    });
  }

  return posts.map((post) => {
    if (!post.author_id) return post;
    const profile = map.get(post.author_id);
    return {
      ...post,
      author_display_name: profile?.name ?? "ゲスト",
      author_profile_image: profile?.image ?? null,
    };
  });
}

async function queryGuestPosts(select: string, nowIso: string) {
  return supabase
    .from("vibe_posts")
    .select(select)
    .eq("is_guest_post", true)
    .lte("posted_at", nowIso)
    .order("posted_at", { ascending: false })
    .limit(50);
}

export async function fetchHomeReelsFeed(): Promise<{
  data: HomeReelsPost[];
  error: string | null;
}> {
  const nowIso = new Date().toISOString();

  let rows: unknown[] | null = null;
  let fetchError: { message: string } | null = null;

  for (const select of FEED_SELECT_VARIANTS) {
    const result = await queryGuestPosts(select, nowIso);
    if (!result.error) {
      rows = result.data as unknown[] | null;
      fetchError = null;
      break;
    }
    fetchError = result.error;
  }

  if (fetchError) return { data: [], error: fetchError.message };

  let posts = (rows ?? []).map((row) =>
    mapRow(row as unknown as Record<string, unknown>),
  );
  posts = await attachAuthors(posts);
  return { data: posts, error: null };
}
