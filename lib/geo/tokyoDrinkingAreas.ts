/**
 * 探す・フィルター・Google Places 検索で共有する夜エリア定義
 */

export type TokyoDrinkingArea = {
  id: string;
  label: string;
  /** Places テキスト検索の locationBias 用（駅・繁華街付近） */
  center: { latitude: number; longitude: number };
  /** 住所マッチ用（エイリアス含む） */
  matchTerms: string[];
};

export const TOKYO_DRINKING_AREAS: TokyoDrinkingArea[] = [
  {
    id: "渋谷",
    label: "渋谷",
    center: { latitude: 35.6595, longitude: 139.7005 },
    matchTerms: ["渋谷"],
  },
  {
    id: "新宿",
    label: "新宿",
    center: { latitude: 35.6896, longitude: 139.7006 },
    matchTerms: ["新宿", "歌舞伎町", "新宿三丁目"],
  },
  {
    id: "池袋",
    label: "池袋",
    center: { latitude: 35.7295, longitude: 139.7109 },
    matchTerms: ["池袋"],
  },
  {
    id: "恵比寿",
    label: "恵比寿",
    center: { latitude: 35.6467, longitude: 139.7101 },
    matchTerms: ["恵比寿", "代官山"],
  },
  {
    id: "六本木",
    label: "六本木",
    center: { latitude: 35.6628, longitude: 139.7314 },
    matchTerms: ["六本木", "麻布", "赤坂"],
  },
  {
    id: "銀座",
    label: "銀座",
    center: { latitude: 35.6717, longitude: 139.7649 },
    matchTerms: ["銀座", "有楽町"],
  },
  {
    id: "中目黒",
    label: "中目黒",
    center: { latitude: 35.6436, longitude: 139.6988 },
    matchTerms: ["中目黒", "祐天寺"],
  },
  {
    id: "新橋",
    label: "新橋",
    center: { latitude: 35.6663, longitude: 139.758 },
    matchTerms: ["新橋", "汐留", "浜松町"],
  },
  {
    id: "三軒茶屋",
    label: "三軒茶屋",
    center: { latitude: 35.6433, longitude: 139.6703 },
    matchTerms: ["三軒茶屋", "二子玉川"],
  },
  {
    id: "下北沢",
    label: "下北沢",
    center: { latitude: 35.6617, longitude: 139.6669 },
    matchTerms: ["下北沢"],
  },
  {
    id: "吉祥寺",
    label: "吉祥寺",
    center: { latitude: 35.7033, longitude: 139.5797 },
    matchTerms: ["吉祥寺"],
  },
  {
    id: "高円寺",
    label: "高円寺",
    center: { latitude: 35.7054, longitude: 139.6492 },
    matchTerms: ["高円寺", "阿佐ケ谷"],
  },
  {
    id: "上野",
    label: "上野",
    center: { latitude: 35.7141, longitude: 139.7774 },
    matchTerms: ["上野", "御徒町"],
  },
  {
    id: "浅草",
    label: "浅草",
    center: { latitude: 35.7118, longitude: 139.7967 },
    matchTerms: ["浅草", "押上"],
  },
  {
    id: "赤羽",
    label: "赤羽",
    center: { latitude: 35.7777, longitude: 139.7208 },
    matchTerms: ["赤羽", "王子"],
  },
  {
    id: "品川",
    label: "品川",
    center: { latitude: 35.6284, longitude: 139.7387 },
    matchTerms: ["品川", "大崎", "五反田"],
  },
  {
    id: "目黒",
    label: "目黒",
    center: { latitude: 35.6338, longitude: 139.7157 },
    matchTerms: ["目黒", "五反田"],
  },
  {
    id: "原宿",
    label: "原宿",
    center: { latitude: 35.6702, longitude: 139.7027 },
    matchTerms: ["原宿", "表参道", "明治神宮前"],
  },
  {
    id: "錦糸町",
    label: "錦糸町",
    center: { latitude: 35.6964, longitude: 139.8133 },
    matchTerms: ["錦糸町", "亀戸"],
  },
];

const BY_ID = new Map(TOKYO_DRINKING_AREAS.map((a) => [a.id, a]));

export const KNOWN_TOKYO_AREA_IDS = TOKYO_DRINKING_AREAS.map((a) => a.id);

export function areaMeta(areaId: string): TokyoDrinkingArea | null {
  return BY_ID.get(areaId) ?? null;
}

function haystackIncludesTerm(haystack: string, term: string): boolean {
  return haystack.includes(term);
}

/** 住所・最寄り表記がエリアフィルターに合うか（DB・投稿フィルター用） */
export function addressMatchesAreaFilters(
  address: string | null | undefined,
  derivedArea: string | null | undefined,
  areas: Set<string>,
  nearestStation?: string | null,
): boolean {
  if (areas.has("すべて") || areas.size === 0) return true;

  const haystack = `${address ?? ""} ${derivedArea ?? ""} ${nearestStation ?? ""}`.trim();
  if (!haystack) return areas.has("その他");

  const matchesId = (id: string) => {
    if (id === "すべて" || id === "その他") return false;
    const meta = areaMeta(id);
    if (!meta) return haystackIncludesTerm(haystack, id);
    return meta.matchTerms.some((term) => haystackIncludesTerm(haystack, term));
  };

  if (areas.has("その他")) {
    const knownHit = KNOWN_TOKYO_AREA_IDS.some((id) => matchesId(id));
    const selectedHit = [...areas].some((id) => id !== "その他" && matchesId(id));
    return selectedHit || !knownHit;
  }

  return [...areas].some(matchesId);
}

/** 選択エリアを Google Places の textQuery / locationBias に反映 */
export function placesSearchFromAreaFilters(
  query: string,
  areas: Set<string>,
): {
  textQuery: string;
  locationBias?: { latitude: number; longitude: number; radiusMeters: number };
} {
  const trimmed = query.trim();
  const selected = [...areas].filter(
    (id) => id !== "すべて" && id !== "その他",
  );

  if (selected.length === 0) {
    return { textQuery: trimmed };
  }

  const primary = areaMeta(selected[0]!) ?? {
    id: selected[0]!,
    label: selected[0]!,
    center: { latitude: 35.6812, longitude: 139.7671 },
    matchTerms: [selected[0]!],
  };

  const areaPhrase = selected.slice(0, 2).join(" ");
  const hasAreaInQuery = selected.some(
    (id) =>
      trimmed.includes(id) ||
      (areaMeta(id)?.matchTerms.some((t) => trimmed.includes(t)) ?? false),
  );

  const textQuery =
    trimmed.length === 0
      ? `${areaPhrase} 居酒屋`
      : hasAreaInQuery
        ? trimmed
        : `${areaPhrase} ${trimmed}`;

  return {
    textQuery,
    locationBias: {
      ...primary.center,
      radiusMeters: selected.length > 1 ? 3500 : 2800,
    },
  };
}
