/** ネイティブで認証なしでも開けるパス */
export function isNativePublicPath(pathname: string): boolean {
  if (
    pathname === "/" ||
    pathname.startsWith("/native") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/faq") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/install") ||
    pathname.startsWith("/~offline")
  ) {
    return true;
  }
  return false;
}

export function isNativeMainAppPath(pathname: string): boolean {
  return (
    pathname.startsWith("/home") ||
    pathname.startsWith("/map") ||
    pathname.startsWith("/tonight") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/post") ||
    pathname.startsWith("/checkin") ||
    pathname.startsWith("/trending") ||
    pathname.startsWith("/nearby") ||
    pathname.startsWith("/favorites") ||
    pathname.startsWith("/mypage") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/onboarding")
  );
}