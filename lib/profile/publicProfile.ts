import { supabase } from "@/lib/supabase";
import { parseNightOutFromRow } from "@/lib/guest-post/nightOut";
import type { Shop, VibePost } from "@/lib/home/types";

export type PublicGuestProfile = {
  id: string;
  display_name: string;
  profile_image: string | null;
  user_type: string;
  created_at: string | null;
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
  drink_name,
  drink_cups,
  shops ( id, name, address, genre, open_hours )
`;

export async function fetchPublicGuestProfile(userId: string): Promise<{
  data: PublicGuestProfile | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, profile_image, user_type, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };

  const displayName =
    typeof data.display_name === "string" && data.display_name.trim()
      ? data.display_name.trim()
      : "ゲスト";

  return {
    data: {
      id: data.id,
      display_name: displayName,
      profile_image: data.profile_image ?? null,
      user_type: data.user_type ?? "guest",
      created_at: data.created_at ?? null,
    },
    error: null,
  };
}

function mapPublicPostRow(row: Record<string, unknown>): VibePost {
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
      row.media_type === "image" || row.media_type === "video"
        ? row.media_type
        : null,
    is_guest_post: Boolean(row.is_guest_post),
    author_id: typeof row.author_id === "string" ? row.author_id : null,
    shops: shop,
    ...parseNightOutFromRow(row),
  };
}

export async function fetchPublicGuestPosts(userId: string, limit = 30): Promise<{
  data: VibePost[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("vibe_posts")
    .select(GUEST_POST_SELECT)
    .eq("author_id", userId)
    .eq("is_guest_post", true)
    .order("posted_at", { ascending: false })
    .limit(limit);

  if (error) return { data: [], error: error.message };

  return {
    data: (data ?? []).map((row) =>
      mapPublicPostRow(row as Record<string, unknown>),
    ),
    error: null,
  };
}

export async function fetchAuthorDisplayNames(
  userIds: string[],
): Promise<Map<string, string>> {
  const ids = [...new Set(userIds.filter(Boolean))];
  const map = new Map<string, string>();
  if (ids.length === 0) return map;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", ids);

  if (error) return map;

  for (const row of data ?? []) {
    const name =
      typeof row.display_name === "string" && row.display_name.trim()
        ? row.display_name.trim()
        : "ゲスト";
    map.set(row.id, name);
  }

  return map;
}

export async function attachAuthorDisplayNames<T extends VibePost>(
  posts: T[],
): Promise<T[]> {
  const ids = posts
    .map((post) => post.author_id)
    .filter((id): id is string => Boolean(id));
  const names = await fetchAuthorDisplayNames(ids);

  return posts.map((post) => ({
    ...post,
    author_display_name: post.author_id
      ? (names.get(post.author_id) ?? "ゲスト")
      : null,
  }));
}
