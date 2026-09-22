const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export function getRecentPostsWindowStart(now = new Date()): Date {
  return new Date(now.getTime() - TWO_HOURS_MS);
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
