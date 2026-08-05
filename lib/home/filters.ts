import { formatGenre, type Shop, type VibePost } from "./types";
import { isNewShop } from "./newShops";

export const GENRE_FILTERS = [
  { id: "すべて", label: "すべて" },
  { id: "居酒屋", label: "🏮 居酒屋" },
  { id: "バー", label: "🍸 バー" },
  { id: "クラフトビール", label: "🍺 クラフトビール" },
  { id: "カラオケ", label: "🎤 カラオケ" },
  { id: "ライブハウス", label: "🎵 ライブハウス" },
  { id: "ダイニング", label: "🍽️ ダイニング" },
  { id: "その他", label: "その他" },
];

export const MOOD_FILTERS = [
  { id: "激熱", label: "🔥 激熱" },
  { id: "音楽あり", label: "🎵 音楽あり" },
  { id: "混ざり歓迎", label: "🤝 混ざり歓迎" },
  { id: "飲み放題", label: "🍻 飲み放題" },
  { id: "踊れる", label: "🕺 踊れる" },
  { id: "歌える", label: "🎤 歌える" },
];

export const AREA_FILTERS = [
  { id: "すべて", label: "📍 すべて" },
  { id: "渋谷", label: "渋谷" },
  { id: "恵比寿", label: "恵比寿" },
  { id: "新宿", label: "新宿" },
  { id: "銀座", label: "銀座" },
  { id: "六本木", label: "六本木" },
  { id: "中目黒", label: "中目黒" },
  { id: "その他", label: "その他" },
];

const KNOWN_GENRES = GENRE_FILTERS.filter(
  (item) => item.id !== "すべて" && item.id !== "その他",
).map((item) => item.id);

const KNOWN_AREAS = AREA_FILTERS.filter(
  (item) => item.id !== "すべて" && item.id !== "その他",
).map((item) => item.id);

export function toggleSetValue(
  current: Set<string>,
  value: string,
  allValue = "すべて",
) {
  const next = new Set(current);
  if (value === allValue) {
    return new Set([allValue]);
  }
  next.delete(allValue);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  if (next.size === 0) next.add(allValue);
  return next;
}

export function toggleMood(current: Set<string>, value: string) {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function shopGenres(shop: Shop): string[] {
  if (Array.isArray(shop.genre)) return shop.genre.map(String);
  if (typeof shop.genre === "string" && shop.genre) return [shop.genre];
  return [];
}

function matchesGenreFilter(shop: Shop, genres: Set<string>) {
  if (genres.has("すべて")) return true;

  const values = shopGenres(shop);
  if (genres.has("その他")) {
    const hasKnown = values.some((genre) => KNOWN_GENRES.includes(genre));
    const matchesSelected = values.some((genre) => genres.has(genre));
    return matchesSelected || !hasKnown;
  }

  return values.some((genre) => genres.has(genre));
}

function matchesAreaFilter(address: string, areas: Set<string>) {
  if (areas.has("すべて")) return true;

  if (areas.has("その他")) {
    const hasKnown = KNOWN_AREAS.some((area) => address.includes(area));
    const matchesSelected = [...areas].some(
      (area) => area !== "その他" && address.includes(area),
    );
    return matchesSelected || !hasKnown;
  }

  return [...areas].some((area) => address.includes(area));
}

export function filterPosts(
  posts: VibePost[],
  genres: Set<string>,
  moods: Set<string>,
  areas: Set<string>,
  search: string,
) {
  const query = search.trim().toLowerCase();

  return posts.filter((post) => {
    const shop = post.shops;
    if (!shop) return false;

    if (query) {
      const haystack = [
        shop.name,
        shop.address,
        post.comment,
        formatGenre(shop.genre),
        ...(post.moods ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (!matchesGenreFilter(shop, genres)) return false;
    if (!matchesAreaFilter(shop.address, areas)) return false;

    if (moods.size > 0) {
      if (!post.moods?.some((mood) => moods.has(mood))) return false;
    }

    return true;
  });
}

export function filterShops(
  shops: Shop[],
  latestPostsByShop: Map<string, Pick<VibePost, "comment" | "moods">>,
  genres: Set<string>,
  moods: Set<string>,
  areas: Set<string>,
  search: string,
  newShopsOnly = false,
) {
  const query = search.trim().toLowerCase();

  return shops.filter((shop) => {
    if (newShopsOnly && !isNewShop(shop)) return false;

    if (query) {
      const latest = latestPostsByShop.get(shop.id);
      const haystack = [
        shop.name,
        shop.address,
        formatGenre(shop.genre),
        latest?.comment ?? "",
        ...(latest?.moods ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (!matchesGenreFilter(shop, genres)) return false;
    if (!matchesAreaFilter(shop.address, areas)) return false;

    if (moods.size > 0) {
      const latest = latestPostsByShop.get(shop.id);
      if (!latest?.moods?.some((mood) => moods.has(mood))) return false;
    }

    return true;
  });
}

export function countByArea(posts: VibePost[]) {
  const counts: Record<string, number> = {};
  for (const area of KNOWN_AREAS) {
    counts[area] = posts.filter((p) => p.shops?.address.includes(area)).length;
  }
  return counts;
}

export function countByMood(posts: VibePost[]) {
  const counts: Record<string, number> = {};
  for (const post of posts) {
    for (const mood of post.moods ?? []) {
      counts[mood] = (counts[mood] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

export function isFilterActive(
  genres: Set<string>,
  moods: Set<string>,
  areas: Set<string>,
  type: "genres" | "moods" | "areas" | "newShops",
  newShopsOnly = false,
) {
  if (type === "newShops") return newShopsOnly;
  if (type === "genres") return !genres.has("すべて") && genres.size > 0;
  if (type === "moods") return moods.size > 0;
  return !areas.has("すべて") && areas.size > 0;
}
