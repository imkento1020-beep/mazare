export const GENRE_OPTIONS = [
  "居酒屋",
  "バー",
  "クラフトビール",
  "カラオケ",
  "ライブハウス",
  "ダイニング",
  "その他",
] as const;

export const MOOD_OPTIONS = [
  { id: "激熱", emoji: "🔥", label: "激熱" },
  { id: "音楽あり", emoji: "🎵", label: "音楽あり" },
  { id: "混ざり歓迎", emoji: "🤝", label: "混ざり歓迎" },
  { id: "飲み放題", emoji: "🍻", label: "飲み放題" },
  { id: "踊れる", emoji: "🕺", label: "踊れる" },
  { id: "歌える", emoji: "🎤", label: "歌える" },
] as const;

export const MAX_IMAGES = 5;
