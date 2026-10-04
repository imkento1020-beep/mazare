import { AREA_FILTERS } from "@/lib/home/filters";

/** フィルター用の主要エリア（長い名称を先にマッチ） */
const FILTER_AREA_NAMES = AREA_FILTERS.filter(
  (area) => area.id !== "すべて" && area.id !== "その他",
)
  .map((area) => area.id)
  .sort((a, b) => b.length - a.length);

/**
 * 住所に含まれることが多いエリア名（フィルター外の表示用）
 * 例: 港区新橋 → 「新橋」を優先表示
 */
const NEIGHBORHOOD_KEYWORDS = [
  "代官山",
  "自由が丘",
  "二子玉川",
  "三軒茶屋",
  "学芸大学",
  "門前仲町",
  "西麻布",
  "阿佐ケ谷",
  "下北沢",
  "表参道",
  "神楽坂",
  "有楽町",
  "浜松町",
  "高円寺",
  "北千住",
  "錦糸町",
  "祐天寺",
  "代々木",
  "秋葉原",
  "五反田",
  "吉祥寺",
  "飯田橋",
  "大手町",
  "日本橋",
  "原宿",
  "品川",
  "新橋",
  "池袋",
  "上野",
  "浅草",
  "赤坂",
  "豊洲",
  "麻布",
  "田町",
  "高輪",
  "大崎",
  "巣鴨",
  "荻窪",
  "練馬",
  "板橋",
  "赤羽",
  "押上",
  "目黒",
  "中野",
]
  .sort((a, b) => b.length - a.length);

function extractWardLabel(address: string): string | null {
  const tokyo = address.match(/東京都([^\d\s]{2,4}?)区/);
  if (tokyo?.[1]) {
    return `${tokyo[1]}区`;
  }

  const ward = address.match(/([^\d\s都道府県]{2,4}?)区/);
  if (ward?.[1] && !ward[1].includes("地")) {
    return `${ward[1]}区`;
  }

  return null;
}

function extractCityLabel(address: string): string | null {
  const withPref = address.match(/[一-龥]{2,4}?[都道府県]([一-龥々]{2,10}?)市/);
  if (withPref?.[1]) {
    return withPref[1];
  }

  const city = address.match(/([一-龥々]{2,10}?)市/);
  if (city?.[1]) {
    return city[1];
  }

  return null;
}

function extractPrefectureLabel(address: string): string | null {
  const pref = address.match(/^([一-龥]{2,4}?[都道府県])/);
  if (!pref?.[1]) return null;
  return pref[1].replace(/[都道府県]$/, "");
}

export function extractAreaFromAddress(address: string | null | undefined): string {
  if (!address?.trim()) return "—";

  const normalized = address.trim();

  for (const area of FILTER_AREA_NAMES) {
    if (normalized.includes(area)) return area;
  }

  for (const keyword of NEIGHBORHOOD_KEYWORDS) {
    if (normalized.includes(keyword)) return keyword;
  }

  const ward = extractWardLabel(normalized);
  if (ward) {
    const short = ward.replace(/区$/, "");
    if (FILTER_AREA_NAMES.includes(short)) return short;
    return ward;
  }

  const city = extractCityLabel(normalized);
  if (city) return city;

  const pref = extractPrefectureLabel(normalized);
  if (pref) return pref;

  return "その他";
}
