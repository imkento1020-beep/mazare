/** 下部タブのルート（戻るヘッダー不要） */
export function isMainTabRoot(pathname: string): boolean {
  if (pathname === "/home" || pathname === "/map" || pathname === "/search") {
    return true;
  }
  if (pathname === "/mypage") return true;
  if (pathname === "/post" || pathname === "/checkin") return true;
  if (pathname === "/owner/dashboard" || pathname === "/owner") return true;
  if (pathname === "/owner/post") return true;
  return false;
}

export type NativeStackNav = {
  title: string;
  fallbackHref: string;
};

export function nativeStackNavForPath(pathname: string): NativeStackNav | null {
  if (isMainTabRoot(pathname)) return null;

  if (pathname.startsWith("/native/welcome")) return null;
  if (pathname.startsWith("/login")) return null;
  if (pathname.startsWith("/signup")) return null;
  if (pathname.startsWith("/auth/")) return null;

  if (pathname.startsWith("/mypage/edit")) {
    return { title: "プロフィール編集", fallbackHref: "/mypage" };
  }
  if (pathname.startsWith("/user/")) {
    return { title: "プロフィール", fallbackHref: "/home" };
  }
  if (pathname.startsWith("/shop/")) {
    return { title: "お店", fallbackHref: "/home" };
  }
  if (pathname.startsWith("/messages/")) {
    return { title: "メッセージ", fallbackHref: "/messages" };
  }
  if (pathname === "/messages") {
    return { title: "メッセージ", fallbackHref: "/home" };
  }
  if (pathname === "/notifications") {
    return { title: "通知", fallbackHref: "/home" };
  }
  if (pathname === "/favorites") {
    return { title: "お気に入り", fallbackHref: "/mypage" };
  }
  if (pathname === "/tonight") {
    return { title: "今夜の行くかも", fallbackHref: "/home" };
  }
  if (pathname === "/trending") {
    return { title: "トレンド", fallbackHref: "/home" };
  }
  if (pathname === "/nearby") {
    return { title: "近くのお店", fallbackHref: "/home" };
  }
  if (pathname.startsWith("/post/edit/")) {
    return { title: "投稿を編集", fallbackHref: "/mypage" };
  }
  if (pathname === "/onboarding") {
    return { title: "はじめに", fallbackHref: "/home" };
  }
  if (
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/faq")
  ) {
    return { title: "情報", fallbackHref: "/home" };
  }
  if (pathname.startsWith("/install")) {
    return { title: "アプリを追加", fallbackHref: "/home" };
  }
  if (pathname.startsWith("/owner/") && !pathname.startsWith("/owner/dashboard")) {
    if (pathname.startsWith("/owner/post/") && pathname.includes("/edit")) {
      return { title: "投稿を編集", fallbackHref: "/owner/dashboard" };
    }
    if (pathname === "/owner/profile" || pathname.startsWith("/owner/profile")) {
      return { title: "設定", fallbackHref: "/owner/dashboard" };
    }
    if (pathname.startsWith("/owner/history")) {
      return { title: "発信履歴", fallbackHref: "/owner/dashboard" };
    }
    if (pathname.startsWith("/owner/apply")) {
      return { title: "お店の登録", fallbackHref: "/home" };
    }
    if (pathname.startsWith("/owner/onboarding")) {
      return { title: "お店の初期設定", fallbackHref: "/owner/dashboard" };
    }
  }

  if (
    pathname.startsWith("/home") ||
    pathname.startsWith("/map") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/mypage") ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/favorites") ||
    pathname.startsWith("/tonight") ||
    pathname.startsWith("/trending") ||
    pathname.startsWith("/nearby") ||
    pathname.startsWith("/post") ||
    pathname.startsWith("/owner")
  ) {
    return { title: "mazare", fallbackHref: "/home" };
  }

  return null;
}