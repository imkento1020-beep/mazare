function hostnameAllowed(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (hostname === "mazare.app" || hostname.endsWith(".mazare.app")) return true;
  if (hostname.endsWith(".vercel.app")) return true;
  return false;
}

function urlHostAllowed(url: string): boolean {
  try {
    return hostnameAllowed(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** 自サイト（または Vercel プレビュー）からの API 呼び出しのみ許可 */
export function isAllowedAppApiRequest(request: Request): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const origin = request.headers.get("origin");
  if (origin && urlHostAllowed(origin)) return true;

  const referer = request.headers.get("referer");
  if (referer && urlHostAllowed(referer)) return true;

  const host = request.headers.get("host");
  if (host) {
    const hostname = host.split(":")[0] ?? host;
    if (hostnameAllowed(hostname)) return true;
  }

  return false;
}
