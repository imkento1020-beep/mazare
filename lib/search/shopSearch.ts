import { extractAreaFromAddress } from "@/lib/geo/area";
import { formatGenre, type Shop, type VibePost } from "@/lib/home/types";
import { getShopCoverImages } from "@/lib/home/types";
import { isWithinRecentPostsWindow } from "@/lib/home/recentWindow";
import { fetchShopsFromDb } from "@/lib/home/shops";

export type ShopSearchItem = {
  shop: Shop;
  tonightPostCount: number;
  latestPost: VibePost | null;
  area: string;
  genreLabel: string;
  thumbnailUrl: string | null;
};

export function shopThumbnailUrl(shop: Shop): string | null {
  const fromCover = getShopCoverImages(shop)[0];
  if (fromCover?.startsWith("http") || fromCover?.startsWith("data:")) {
    return fromCover;
  }
  return null;
}

export function buildShopSearchIndexFromShops(
  posts: VibePost[],
  shops: Shop[],
): ShopSearchItem[] {
  const recentByShop = new Map<string, VibePost[]>();
  for (const post of posts) {
    if (!post.is_guest_post || !isWithinRecentPostsWindow(post.posted_at)) continue;
    const list = recentByShop.get(post.shop_id) ?? [];
    list.push(post);
    recentByShop.set(post.shop_id, list);
  }

  const items: ShopSearchItem[] = shops.map((shop) => {
    const shopPosts = recentByShop.get(shop.id) ?? [];
    shopPosts.sort((a, b) => {
      const ta = a.posted_at ? new Date(a.posted_at).getTime() : 0;
      const tb = b.posted_at ? new Date(b.posted_at).getTime() : 0;
      return tb - ta;
    });

    return {
      shop,
      tonightPostCount: shopPosts.length,
      latestPost: shopPosts[0] ?? null,
      area: extractAreaFromAddress(shop.address),
      genreLabel: formatGenre(shop.genre),
      thumbnailUrl: shopThumbnailUrl(shop),
    };
  });

  items.sort((a, b) => b.tonightPostCount - a.tonightPostCount || a.shop.name.localeCompare(b.shop.name, "ja"));

  return items;
}

export async function buildShopSearchIndex(
  posts: VibePost[],
): Promise<{ items: ShopSearchItem[]; error: string | null }> {
  const shopsResult = await fetchShopsFromDb();
  if (shopsResult.error || !shopsResult.data) {
    return { items: [], error: shopsResult.error ?? "お店の取得に失敗しました" };
  }

  return {
    items: buildShopSearchIndexFromShops(posts, shopsResult.data),
    error: null,
  };
}

export function filterShopSearchItems(
  items: ShopSearchItem[],
  filters: {
    search: string;
    genres: Set<string>;
    areas: Set<string>;
    minTonightPosts: number;
  },
): ShopSearchItem[] {
  const q = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.minTonightPosts > 0 && item.tonightPostCount < filters.minTonightPosts) {
      return false;
    }

    if (!filters.areas.has("すべて")) {
      const inArea =
        filters.areas.has("その他")
          ? !["渋谷", "恵比寿", "新宿", "銀座", "六本木", "中目黒"].some((a) =>
              item.shop.address.includes(a),
            ) || [...filters.areas].some((a) => a !== "その他" && item.shop.address.includes(a))
          : [...filters.areas].some((a) => item.shop.address.includes(a));
      if (!inArea) return false;
    }

    if (!filters.genres.has("すべて")) {
      const genreStr = formatGenre(item.shop.genre);
      const genres = Array.isArray(item.shop.genre)
        ? item.shop.genre.map(String)
        : [genreStr];
      const match = genres.some((g) => filters.genres.has(g)) ||
        (filters.genres.has("その他") &&
          !genres.some((g) =>
            ["居酒屋", "バー", "クラフトビール", "カラオケ", "ライブハウス", "ダイニング"].includes(g),
          ));
      if (!match) return false;
    }

    if (q) {
      const hay = `${item.shop.name} ${item.shop.address} ${item.genreLabel} ${item.area}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}
