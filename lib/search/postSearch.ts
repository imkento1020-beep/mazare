import { extractAreaFromAddress } from "@/lib/geo/area";
import { addressMatchesAreaFilters } from "@/lib/geo/tokyoDrinkingAreas";
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
    let profileRows: Record<string, unknown>[] | null = null;

    const primary = await supabase
      .from("profiles")
      .select("id, merge_attitude, vibe_scale, tonight_social_mood")
      .in("id", authorIds);

    if (!primary.error) {
      profileRows = (primary.data as Record<string, unknown>[] | null) ?? null;
    } else if (primary.error.message.includes("merge_attitude")) {
      const legacy = await supabase
        .from("profiles")
        .select("id, tonight_social_mood")
        .in("id", authorIds);
      if (!legacy.error) {
        profileRows = (legacy.data as Record<string, unknown>[] | null) ?? null;
      }
    }

    for (const row of profileRows ?? []) {
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

    const derived = extractAreaFromAddress(shop.address);
    if (
      !addressMatchesAreaFilters(
        shop.address ?? "",
        derived,
        filters.areas,
        shop.nearest_station,
      )
    ) {
      return false;
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
