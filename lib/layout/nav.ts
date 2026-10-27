export type BottomNavIconId =
  | "home"
  | "map"
  | "camera"
  | "search"
  | "shop"
  | "user"
  | "bell";

export type BottomNavItem = {
  label: string;
  href: string;
  icon: BottomNavIconId;
  center?: boolean;
  /** Opens post / check-in sheet instead of navigating directly */
  opensCreateSheet?: boolean;
};

export type GuestSidebarIconId =
  | "home"
  | "map"
  | "wave"
  | "heart"
  | "history";

export type OwnerNavIconId = "chart" | "broadcast" | "history" | "settings";

export const GUEST_BOTTOM_NAV: BottomNavItem[] = [
  { label: "ホーム", href: "/home", icon: "home" },
  { label: "地図", href: "/map", icon: "map" },
  {
    label: "投稿",
    href: "/post",
    icon: "camera",
    center: true,
    opensCreateSheet: true,
  },
  { label: "探す", href: "/search", icon: "search" },
  { label: "マイページ", href: "/mypage", icon: "user" },
];

export const GUEST_SIDEBAR_NAV: {
  label: string;
  href: string;
  icon: GuestSidebarIconId;
}[] = [
  { label: "ホーム", href: "/home", icon: "home" },
  { label: "地図で探す", href: "/map", icon: "map" },
  { label: "今夜の行くかも", href: "/tonight", icon: "wave" },
  { label: "お気に入り", href: "/favorites", icon: "heart" },
  { label: "履歴", href: "/mypage", icon: "history" },
];

export const OWNER_NAV: {
  label: string;
  href: string;
  icon: OwnerNavIconId;
}[] = [
  { label: "ダッシュボード", href: "/owner/dashboard", icon: "chart" },
  { label: "発信する", href: "/owner/post", icon: "broadcast" },
  { label: "発信履歴", href: "/owner/history", icon: "history" },
  { label: "プロフィール編集", href: "/owner/profile", icon: "settings" },
];

export const OWNER_BOTTOM_NAV: BottomNavItem[] = [
  { label: "ホーム", href: "/owner/dashboard", icon: "home" },
  { label: "発信", href: "/owner/post", icon: "camera", center: true },
  { label: "設定", href: "/owner/profile", icon: "user" },
];

/** Matches mobile BottomNav: h-16 row + safe-area padding on the nav element. */
export const MOBILE_TAB_BAR_INSET =
  "calc(4rem + env(safe-area-inset-bottom, 0px))";

/** Fixed compose footer (次へ) + tab bar — scroll padding for step 1–2. */
export const MOBILE_COMPOSE_FOOTER_SCROLL_PADDING =
  "calc(7.5rem + env(safe-area-inset-bottom, 0px))";

export function isActivePath(pathname: string, href: string) {
  if (href === "/home") return pathname === "/home";
  if (href === "/mypage") return pathname.startsWith("/mypage");
  if (href === "/tonight") return pathname.startsWith("/tonight");
  if (href === "/post") {
    return pathname.startsWith("/post") || pathname.startsWith("/checkin");
  }
  if (href === "/owner/post") return pathname.startsWith("/owner/post");
  if (href === "/trending") return pathname.startsWith("/trending");
  if (href === "/nearby") return pathname.startsWith("/nearby");
  if (href === "/favorites") return pathname.startsWith("/favorites");
  if (href === "/search") return pathname.startsWith("/search");
  if (href === "/owner/dashboard") {
    return pathname === "/owner/dashboard" || pathname === "/owner";
  }
  if (href === "/owner/profile") return pathname.startsWith("/owner/profile");
  return pathname.startsWith(href);
}
