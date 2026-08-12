import { extractAreaFromAddress } from "@/lib/geo/area";
import type { TodayInterestRow } from "@/lib/home/types";

const DEFAULT_SHARE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://mazare.vercel.app";

export function getTonightListShareUrl() {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return DEFAULT_SHARE_URL;
}

export function formatTonightInterestsShareText(
  items: TodayInterestRow[],
  shareUrl = getTonightListShareUrl(),
): string {
  const lines = items.map((item, index) => {
    const shop = item.vibe_posts?.shops;
    const name = shop?.name ?? "お店";
    const area = extractAreaFromAddress(shop?.address);
    return `${index + 1}. ${name}（${area}）`;
  });

  return [
    "今夜行くかもリスト🍺",
    "",
    ...lines,
    "",
    `mazareで今夜の場所を探す👉 ${shareUrl}`,
  ].join("\n");
}
