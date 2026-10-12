export const TONIGHT_SOCIAL_MOODS = [
  {
    id: "merge_welcome",
    label: "合流歓迎",
    description: "知らない人とも一緒に楽しみたい",
  },
  {
    id: "solo",
    label: "一人でゆっくり",
    description: "今夜は自分のペースで",
  },
  {
    id: "pair_ok",
    label: "サシ〜少人数",
    description: "2〜3人くらいがいい",
  },
  {
    id: "large_ok",
    label: "大人数もOK",
    description: "にぎやかな席もアリ",
  },
] as const;

export type TonightSocialMoodId = (typeof TONIGHT_SOCIAL_MOODS)[number]["id"];

export function isTonightSocialMoodId(
  value: string | null | undefined,
): value is TonightSocialMoodId {
  return TONIGHT_SOCIAL_MOODS.some((m) => m.id === value);
}

export function labelForTonightSocialMood(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  return TONIGHT_SOCIAL_MOODS.find((m) => m.id === value)?.label ?? null;
}

export function findTonightSocialMood(value: string | null | undefined) {
  if (!value) return null;
  return TONIGHT_SOCIAL_MOODS.find((m) => m.id === value) ?? null;
}
