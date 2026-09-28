export const RECENT_POSTS_WINDOW_MS = 24 * 60 * 60 * 1000;

export function getRecentPostsWindowStart(now = new Date()): Date {
  return new Date(now.getTime() - RECENT_POSTS_WINDOW_MS);
}

export function isWithinRecentPostsWindow(
  iso: string | null | undefined,
  now = new Date(),
) {
  if (!iso) return false;
  const posted = new Date(iso).getTime();
  return posted >= getRecentPostsWindowStart(now).getTime() && posted <= now.getTime();
}

export { getTonightInterestWindowJST as getTrendingTagWindowJST } from "@/lib/home/dates";
