import { formatGenre, type Shop, type VibePost } from "./types";

export const GENRE_FILTERS = [
  { id: "すべて", label: "すべて" },
  { id: "居酒屋", label: "🏮 居酒屋" },
  { id: "バー", label: "🍸 バー" },
  { id: "クラフトビール", label: "🍺 クラフトビール" },
  { id: "カラオケ", label: "🎤 カラオケ" },
  { id: "ライブハウス", label: "🎵 ライブハウス" },
  { id: "ダイニング", label: "🍽️ ダイニング" },
];

export const MOOD_FILTERS = [
  { id: "激熱", label: "🔥 激熱" },
  { id: "混ざり歓迎", label: "🤝 混ざり歓迎" },
  { id: "音楽あり", label: "🎵 音楽あり" },
  { id: "飲み放題", label: "🍻 飲み放題" },
  { id: "踊れる", label: "🕺 踊れる" },
];

export const AREA_FILTERS = [
  { id: "すべて", label: "📍 すべて" },
  { id: "渋谷", label: "渋谷" },
  { id: "恵比寿", label: "恵比寿" },
  { id: "新宿", label: "新宿" },
  { id: "銀座", label: "銀座" },
];

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

    if (!genres.has("すべて")) {
      const genre = formatGenre(shop.genre);
      if (!genres.has(genre)) return false;
    }

    if (!areas.has("すべて")) {
      if (![...areas].some((area) => shop.address.includes(area))) return false;
    }

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
) {
  const query = search.trim().toLowerCase();

  return shops.filter((shop) => {
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

    if (!genres.has("すべて")) {
      const genre = formatGenre(shop.genre);
      if (!genres.has(genre)) return false;
    }

    if (!areas.has("すべて")) {
      if (![...areas].some((area) => shop.address.includes(area))) return false;
    }

    if (moods.size > 0) {
      const latest = latestPostsByShop.get(shop.id);
      if (!latest?.moods?.some((mood) => moods.has(mood))) return false;
    }

    return true;
  });
}

export function countByArea(posts: VibePost[]) {
  const counts: Record<string, number> = {};
  for (const area of ["渋谷", "恵比寿", "新宿", "銀座"]) {
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
