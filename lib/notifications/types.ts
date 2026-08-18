export type NotificationType =
  | "favorite_shop_posted"
  | "shop_reposted"
  | "post_interest"
  | "shop_favorited"
  | "staff_invite";

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType | string;
  title: string;
  body: string;
  href: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export function notificationEmoji(type: string) {
  switch (type) {
    case "favorite_shop_posted":
      return "❤️";
    case "shop_reposted":
      return "👋";
    case "post_interest":
      return "🔥";
    case "shop_favorited":
      return "⭐";
    case "staff_invite":
      return "🏪";
    default:
      return "🔔";
  }
}

export function formatNotificationTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;

  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
