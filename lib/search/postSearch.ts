import { extractAreaFromAddress } from "@/lib/geo/area";
import type { VibePost } from "@/lib/home/types";
import { isWithinRecentPostsWindow } from "@/lib/home/recentWindow";
import {
  type MergeAttitude,
  type VibeScale,
  parseTonightSocialContextFromProfile,
  resolvePostAuthorSocialContext,
} from "@/lib/profile/tonightSocialContext";
import { supabase } from "@/lib/supabase";

export type PostSearchRow = VibePost & {
  author_merge_attitude: MergeAttitude | null;
  author_vibe_scale: VibeScale | null;
};

export async function attachAuthorSocialContext(
  posts: VibePost[],
): Promise<PostSearchRow[]> {
  const authorIds = [...new Set(posts.map((p) => p.author_id).filter(Boolean))] as string[];
  const profileByUser = new Map<
    string,
    { mergeAttitude: MergeAttitude | null; vibeScale: VibeScale | null }
  >();

  if (authorIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, merge_attitude, vibe_scale, tonight_social_mood")
      .in("id", authorIds);

    for (const row of data ?? []) {
      const ctx = parseTonightSocialContextFromProfile(row);
      profileByUser.set(String(row.id), ctx);
    }
  }

  return posts.map((post) => {
    const profile = post.author_id
      ? (profileByUser.get(post.author_id) ?? null)
      : null;
    const resolved = resolvePostAuthorSocialContext({
      author_merge_attitude: post.author_merge_attitude,
      author_vibe_scale: post.author_vibe_scale,
      author_tonight_social_mood: post.author_tonight_social_mood,
      profile,
    });

    return {
      ...post,
      author_merge_attitude: resolved.mergeAttitude,
      author_vibe_scale: resolved.vibeScale,
    };
  });
}

/** @deprecated use attachAuthorSocialContext */
export async function attachAuthorTonightMoods(
  posts: VibePost[],
): Promise<PostSearchRow[]> {
  return attachAuthorSocialContext(posts);
}

export type PartySizeFilter = "any" | "solo" | "small" | "large";

export function filterPostSearchRows(
  rows: PostSearchRow[],
  filters: {
    search: string;
    areas: Set<string>;
    mergeAttitudes: Set<MergeAttitude>;
    vibeScales: Set<VibeScale>;
    partySize: PartySizeFilter;
  },
): PostSearchRow[] {
  const q = filters.search.trim().toLowerCase();

  return rows.filter((post) => {
    if (!post.is_guest_post || !isWithinRecentPostsWindow(post.posted_at)) {
      return false;
    }

    const shop = post.shops;
    if (!shop) return false;

    if (!filters.areas.has("すべて")) {
      const address = shop.address ?? "";
      const inArea =
        filters.areas.has("その他")
          ? !["渋谷", "恵比寿", "新宿", "銀座", "六本木", "中目黒"].some((a) =>
              address.includes(a),
            ) || [...filters.areas].some((a) => a !== "その他" && address.includes(a))
          : [...filters.areas].some((a) => address.includes(a));
      if (!inArea) return false;
    }

    if (filters.mergeAttitudes.size > 0) {
      const merge = post.author_merge_attitude;
      if (!merge || !filters.mergeAttitudes.has(merge)) return false;
    }

    if (filters.vibeScales.size > 0) {
      const vibe = post.author_vibe_scale;
      if (!vibe || !filters.vibeScales.has(vibe)) return false;
    }

    const party = post.party_size ?? 1;
    if (filters.partySize === "solo" && party !== 1) return false;
    if (filters.partySize === "small" && (party < 2 || party > 3)) return false;
    if (filters.partySize === "large" && party < 4) return false;

    if (q) {
      const area = extractAreaFromAddress(shop.address);
      const hay = `${shop.name} ${shop.address} ${area} ${post.comment}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}
