export const GUEST_BOTTOM_NAV = [
  { label: "ホーム", href: "/home", icon: "🏠" },
  { label: "地図", href: "/map", icon: "🗺️" },
  { label: "探す", href: "/search", icon: "🔍" },
  { label: "マイページ", href: "/mypage", icon: "👤" },
] as const;

export const GUEST_SIDEBAR_NAV = [
  { label: "ホーム", href: "/home", icon: "🏠" },
  { label: "地図で探す", href: "/map", icon: "🗺️" },
  { label: "お気に入り", href: "/search", icon: "❤️" },
  { label: "履歴", href: "/mypage", icon: "🕙" },
] as const;

export const OWNER_NAV = [
  { label: "ダッシュボード", href: "/owner/dashboard", icon: "📊" },
  { label: "発信する", href: "/owner/post", icon: "📡" },
  { label: "プロフィール編集", href: "/owner/profile", icon: "⚙️" },
] as const;

export const OWNER_BOTTOM_NAV = [
  { label: "ダッシュボード", href: "/owner/dashboard", icon: "🏠" },
  { label: "発信する", href: "/owner/post", icon: "📣" },
  { label: "履歴", href: "/owner/history", icon: "📊" },
  { label: "設定", href: "/owner/profile", icon: "⚙️" },
] as const;

export function isActivePath(pathname: string, href: string) {
  if (href === "/home") return pathname === "/home";
  if (href === "/owner/dashboard") {
    return pathname === "/owner/dashboard" || pathname === "/owner";
  }
  return pathname.startsWith(href);
}
