"use client";

import { useEffect, useState } from "react";
import {
  dedupeShopPhotoFetch,
  getSessionCachedShopPhoto,
} from "@/lib/places/placesSessionDedupe";

/**
 * 店舗詳細専用: DB / セッションキャッシュを優先し、未保存時のみ API を1回呼ぶ。
 */
export function useShopCachedPhoto(
  shopId: string | undefined,
  initialCachedUrl: string | null | undefined,
) {
  const [cachedPhotoUrl, setCachedPhotoUrl] = useState<string | null>(
    initialCachedUrl?.trim() || null,
  );

  useEffect(() => {
    if (!shopId) return;

    const trimmed = initialCachedUrl?.trim();
    if (trimmed) {
      setCachedPhotoUrl(trimmed);
      return;
    }

    const session = getSessionCachedShopPhoto(shopId);
    if (session !== undefined) {
      setCachedPhotoUrl(session);
      return;
    }

    let cancelled = false;

    void dedupeShopPhotoFetch(shopId, async () => {
      const res = await fetch(`/api/shops/${shopId}/cached-photo`, {
        method: "POST",
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { cached_photo_url?: string | null };
      return json.cached_photo_url?.trim() || null;
    }).then((url) => {
      if (!cancelled) setCachedPhotoUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [shopId, initialCachedUrl]);

  return cachedPhotoUrl;
}
