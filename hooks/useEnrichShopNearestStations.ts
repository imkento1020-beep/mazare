"use client";

import { useEffect, useMemo, useState } from "react";
import type { Shop } from "@/lib/home/types";

export function useEnrichShopNearestStations(shops: Shop[]) {
  const [resolved, setResolved] = useState<Record<string, string>>({});

  const missingKey = useMemo(() => {
    const ids = shops
      .filter(
        (shop) =>
          !shop.nearest_station?.trim() &&
          shop.latitude != null &&
          shop.longitude != null,
      )
      .map((shop) => shop.id)
      .sort()
      .join(",");
    return ids;
  }, [shops]);

  useEffect(() => {
    if (!missingKey) return;

    const shopIds = missingKey.split(",").filter(Boolean);
    let cancelled = false;

    void fetch("/api/shops/nearest-stations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopIds }),
    })
      .then((res) => res.json())
      .then((payload: { stations?: Record<string, string> }) => {
        if (cancelled || !payload.stations) return;
        setResolved((prev) => ({ ...prev, ...payload.stations }));
      })
      .catch(() => {
        /* ignore */
      });

    return () => {
      cancelled = true;
    };
  }, [missingKey]);

  return resolved;
}

export function mergeShopNearestStations(
  shop: Shop | null | undefined,
  resolved: Record<string, string>,
): Shop | null | undefined {
  if (!shop) return shop;
  const extra = resolved[shop.id];
  if (!extra || shop.nearest_station?.trim()) return shop;
  return { ...shop, nearest_station: extra };
}
