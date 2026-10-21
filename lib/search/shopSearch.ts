import { extractAreaFromAddress } from "@/lib/geo/area";
import { haversineDistanceKm, type GeoPoint } from "@/lib/geo/haversine";
import { formatGenre, type Shop, type VibePost } from "@/lib/home/types";
import { isWithinRecentPostsWindow } from "@/lib/home/recentWindow";
import { fetchShopsFromDb } from "@/lib/home/shops";

export const SEARCH_SHOP_DEFAULT_LIMIT = 10;

export type ShopSearchItem = {
  shop: Shop;
  tonightPostCount: number;
  latestPost: VibePost | null;
  area: string;
  genreLabel: string;
};

function shopGenreText(shop: Shop): string {
  if (Array.isArray(shop.genre)) return shop.genre.map(String).join(" ");
  return String(shop.genre ?? "");
}

/** DB のジャンル表示から居酒屋・バー系を優先（Places の nightlifePriorityScore に近い） */
export function shopNightlifePriorityScore(shop: Shop): number {
  const text = shopGenreText(shop);
  if (!text.trim()) return 25;

  const rules: Array<[RegExp, number]> = [
    [/居酒屋/, 100],
    [/バー|パブ|クラフト|カクテル|ワインバー|スポーツバー/i, 95],
    [/クラブ|ナイト/i, 82],
    [/カラオケ|ライブ/i, 78],
    [/焼肉|寿司|ラーメン|和食|ダイニング|レストラン/i, 45],
    [/カフェ|コーヒー/i, 10],
  ];

  let best = 25;
  for (const [pattern, score] of rules) {
    if (pattern.test(text)) best = Math.max(best, score);
  }
  return best;
}

export function isDefaultShopBrowseFilters(filters: {
  search: string;
  genres: Set<string>;
  areas: Set<string>;
  minTonightPosts: number;
}): boolean {
  return (
    filters.search.trim().length === 0 &&
    filters.genres.has("すべて") &&
    filters.areas.has("すべて") &&
    filters.minTonightPosts === 0
  );
}

/** デフォルトのお店一覧: 近い順をベースに、居酒屋・バー系を優先して上限件数まで */
export function rankShopSearchItemsForDefaultBrowse(
  items: ShopSearchItem[],
  userLocation: GeoPoint | null,
  limit = SEARCH_SHOP_DEFAULT_LIMIT,
): ShopSearchItem[] {
  const ranked = items
    .map((item) => {
      const lat = item.shop.latitude;
      const lng = item.shop.longitude;
      const distanceKm =
        userLocation != null && lat != null && lng != null
          ? haversineDistanceKm(userLocation, { latitude: lat, longitude: lng })
          : null;

      return {
        item,
        nightlifeScore: shopNightlifePriorityScore(item.shop),
        distanceKm,
      };
    })
    .sort((a, b) => {
      if (b.nightlifeScore !== a.nightlifeScore) {
        return b.nightlifeScore - a.nightlifeScore;
      }
      if (userLocation && a.distanceKm != null && b.distanceKm != null) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm != null && b.distanceKm == null) return -1;
      if (a.distanceKm == null && b.distanceKm != null) return 1;
      if (b.item.tonightPostCount !== a.item.tonightPostCount) {
        return b.item.tonightPostCount - a.item.tonightPostCount;
      }
      return a.item.shop.name.localeCompare(b.item.shop.name, "ja");
    });

  return ranked.slice(0, limit).map((row) => row.item);
}

export function sortShopSearchItemsByActivity(items: ShopSearchItem[]): ShopSearchItem[] {
  return [...items].sort(
    (a, b) =>
      b.tonightPostCount - a.tonightPostCount ||
      a.shop.name.localeCompare(b.shop.name, "ja"),
  );
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

  return shops.map((shop) => {
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
    };
  });
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
