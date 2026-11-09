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

/** Tab bar row only (h-16). */
export const MOBILE_TAB_BAR_INSET =
  "calc(4rem + env(safe-area-inset-bottom, 0px))";

/**
 * Full stack from viewport bottom: safe area + tab row + center FAB overshoot (~20px).
 * Use this to place compose action bars above the tab bar without overlap.
 */
export const MOBILE_TAB_BAR_STACK_HEIGHT =
  "calc(5.25rem + env(safe-area-inset-bottom, 0px))";

/** Sticky compose action row (py-3 + 52px buttons). */
export const MOBILE_COMPOSE_ACTION_HEIGHT = "4.75rem";

/** Main scroll padding on /post: action dock + tab stack. */
export const MOBILE_COMPOSE_MAIN_PADDING_BOTTOM =
  "calc(5.25rem + 4.75rem + env(safe-area-inset-bottom, 0px))";

/** @deprecated use MOBILE_COMPOSE_MAIN_PADDING_BOTTOM */
export const MOBILE_COMPOSE_FOOTER_SCROLL_PADDING =
  MOBILE_COMPOSE_MAIN_PADDING_BOTTOM;

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
