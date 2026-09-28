const IGNORED_PLACE_TYPES = new Set([
  "point_of_interest",
  "establishment",
  "food",
  "place",
  "geocode",
  "premise",
  "locality",
  "political",
  "store",
]);

const GOOGLE_PLACE_TYPE_LABELS: Record<string, string> = {
  restaurant: "レストラン",
  bar: "バー",
  cafe: "カフェ",
  night_club: "クラブ",
  pub: "パブ",
  izakaya: "居酒屋",
  japanese_restaurant: "和食",
  chinese_restaurant: "中華",
  korean_restaurant: "韓国料理",
  italian_restaurant: "イタリアン",
  french_restaurant: "フレンチ",
  indian_restaurant: "インド料理",
  thai_restaurant: "タイ料理",
  sushi_restaurant: "寿司",
  ramen_restaurant: "ラーメン",
  yakiniku_restaurant: "焼肉",
  barbecue_restaurant: "バーベキュー",
  steak_house: "ステーキ",
  seafood_restaurant: "シーフード",
  pizza_restaurant: "ピザ",
  hamburger_restaurant: "ハンバーガー",
  fast_food_restaurant: "ファストフード",
  meal_takeaway: "テイクアウト",
  meal_delivery: "デリバリー",
  bakery: "ベーカリー",
  wine_bar: "ワインバー",
  cocktail_bar: "カクテルバー",
  sports_bar: "スポーツバー",
  karaoke: "カラオケ",
  live_music_venue: "ライブハウス",
  event_venue: "イベント会場",
  bowling_alley: "ボウリング",
  amusement_center: "アミューズメント",
  diner: "ダイナー",
  brunch_restaurant: "ブランチ",
  buffet_restaurant: "ビュッフェ",
  vegan_restaurant: "ヴィーガン",
  vegetarian_restaurant: "ベジタリアン",
  coffee_shop: "コーヒーショップ",
  tea_house: "茶房",
  dessert_shop: "デザート",
  ice_cream_shop: "アイス",
  food_court: "フードコート",
  cafeteria: "食堂",
  fine_dining_restaurant: "ファインダイニング",
  tapas_restaurant: "タパス",
  greek_restaurant: "ギリシャ料理",
  mexican_restaurant: "メキシコ料理",
  spanish_restaurant: "スペイン料理",
  american_restaurant: "アメリカ料理",
  asian_restaurant: "アジア料理",
};

function normalizeTypeKey(token: string) {
  return token.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function translateToken(token: string): string | null {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const key = normalizeTypeKey(trimmed);
  if (IGNORED_PLACE_TYPES.has(key)) return null;

  const mapped = GOOGLE_PLACE_TYPE_LABELS[key];
  if (mapped) return mapped;

  if (/[\u3040-\u30ff\u4e00-\u9fff]/.test(trimmed)) {
    return trimmed;
  }

  if (/^[a-z0-9_\s-]+$/i.test(trimmed)) {
    return null;
  }

  return trimmed;
}

function rawGenreTokens(genre: string | string[] | null | undefined): string[] {
  if (!genre) return [];
  if (Array.isArray(genre)) return genre.flatMap((item) => String(item).split(/[,·]/).map((s) => s.trim()));
  return String(genre)
    .split(/[,·]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 表示用ジャンル（最大2件、日本語化） */
export function formatShopGenreLabels(
  genre: string | string[] | null | undefined,
  max = 2,
): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];

  for (const token of rawGenreTokens(genre)) {
    const translated = translateToken(token);
    if (!translated || seen.has(translated)) continue;
    seen.add(translated);
    labels.push(translated);
    if (labels.length >= max) break;
  }

  return labels;
}

export function formatShopGenreDisplay(
  genre: string | string[] | null | undefined,
): string {
  const labels = formatShopGenreLabels(genre, 2);
  if (labels.length === 0) return "飲食店";
  return labels.join(" · ");
}

/** Google Places の types 配列 → 日本語ジャンル（キャッシュ保存用） */
export function labelsFromGooglePlaceTypes(
  types: string[] | undefined,
  max = 3,
): string[] {
  const labels = formatShopGenreLabels(types, max);
  return labels.length > 0 ? labels : ["飲食店"];
}

export function genreDisplayEmoji(label: string): string {
  if (label.includes("居酒屋")) return "🏮";
  if (label.includes("バー") || label.includes("パブ") || label.includes("クラブ")) return "🍸";
  if (label.includes("カフェ")) return "☕";
  if (label.includes("カラオケ")) return "🎤";
  if (label.includes("ライブ")) return "🎵";
  if (label.includes("ラーメン") || label.includes("寿司") || label.includes("和食")) return "🍜";
  return "🍽️";
}
