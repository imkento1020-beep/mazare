import { MOOD_OPTIONS } from "@/lib/owner/constants";

export type StoryDraft = {
  comment: string;
  presetMoods: string[];
  customMoods: string[];
  extractedText: string;
};

const MOOD_KEYWORDS: Record<string, string[]> = {
  激熱: ["激アツ", "激熱", "満席", "盛り上が", "パンパン", "込み"],
  音楽あり: ["dj", "DJ", "ライブ", "音楽", "ビート"],
  "混ざり歓迎": ["混ざ", "合流", "一人", "ソロ", "仲間", "友達"],
  飲み放題: ["飲み放題", "放題", "ハイボール", "ビール"],
  踊れる: ["踊", "ダンス", "フロア"],
  歌える: ["カラオケ", "歌", "合唱", "マイク"],
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function detectMoods(text: string): string[] {
  const normalized = text.toLowerCase();
  const matched = MOOD_OPTIONS.filter((mood) =>
    (MOOD_KEYWORDS[mood.id] ?? []).some((keyword) =>
      normalized.includes(keyword.toLowerCase()),
    ),
  ).map((mood) => mood.id);

  if (matched.length > 0) return matched.slice(0, 3);
  return ["激熱", "混ざり歓迎"].slice(0, 2);
}

function buildComment(shopName: string, hintText: string) {
  const trimmed = hintText.trim();
  if (trimmed) {
    const firstLine = trimmed.split(/\n+/)[0]?.trim() ?? trimmed;
    if (firstLine.length <= 80) return firstLine;
    return `${firstLine.slice(0, 77)}...`;
  }

  return `${shopName}、今夜も盛り上がってます！詳細は画像をチェック🔥`;
}

function mockExtractedText(hintText: string) {
  if (hintText.trim()) return hintText.trim();
  return "今夜20時から営業中\nカウンターに空きあり\n初めての方も大歓迎です";
}

export async function analyzeStoryImage(input: {
  shopName: string;
  hintText?: string;
}): Promise<StoryDraft> {
  await delay(1200 + Math.random() * 800);

  const extractedText = mockExtractedText(input.hintText ?? "");
  const presetMoods = detectMoods(extractedText);

  return {
    comment: buildComment(input.shopName, extractedText),
    presetMoods,
    customMoods: [],
    extractedText,
  };
}
