import { extractAreaFromAddress } from "@/lib/geo/area";
import type { VibePost } from "@/lib/home/types";
import { isWithinRecentPostsWindow } from "@/lib/home/recentWindow";
import {
  isTonightSocialMoodId,
  type TonightSocialMoodId,
} from "@/lib/profile/tonightSocialMood";
import { supabase } from "@/lib/supabase";

export type PostSearchRow = VibePost & {
  author_tonight_social_mood: TonightSocialMoodId | null;
};

export async function attachAuthorTonightMoods(
  posts: VibePost[],
): Promise<PostSearchRow[]> {
  const authorIds = [...new Set(posts.map((p) => p.author_id).filter(Boolean))] as string[];
  const moodByUser = new Map<string, TonightSocialMoodId>();

  if (authorIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, tonight_social_mood")
      .in("id", authorIds);

    for (const row of data ?? []) {
      const mood = row.tonight_social_mood;
      if (typeof mood === "string" && isTonightSocialMoodId(mood)) {
        moodByUser.set(String(row.id), mood);
      }
    }
  }

  return posts.map((post) => ({
    ...post,
    author_tonight_social_mood: post.author_id
      ? (moodByUser.get(post.author_id) ?? null)
      : null,
  }));
}

export type PartySizeFilter = "any" | "solo" | "small" | "large";

export function filterPostSearchRows(
  rows: PostSearchRow[],
  filters: {
    search: string;
    areas: Set<string>;
    moods: Set<TonightSocialMoodId>;
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

    if (filters.moods.size > 0) {
      const authorMood = post.author_tonight_social_mood;
      if (!authorMood || !filters.moods.has(authorMood)) return false;
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
