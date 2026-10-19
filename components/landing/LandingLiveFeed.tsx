"use client";

import Link from "next/link";
import { useMemo } from "react";
import GuestPostFeedCard from "@/components/posts/GuestPostFeedCard";
import type { LandingGuestFeedItem } from "@/lib/landing/fetchLandingGuestFeed";
import type { Shop } from "@/lib/home/types";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  mergeShopNearestStations,
  useEnrichShopNearestStations,
} from "@/hooks/useEnrichShopNearestStations";

type LandingLiveFeedProps = {
  items: LandingGuestFeedItem[];
  outfitClassName: string;
};

export default function LandingLiveFeed({
  items,
  outfitClassName,
}: LandingLiveFeedProps) {
  const { location: userLocation } = useUserLocation();

  const shops = useMemo(
    () =>
      items
        .map((item) => item.post.shops)
        .filter((shop): shop is Shop => Boolean(shop)),
    [items],
  );
  const stationMap = useEnrichShopNearestStations(shops);

  if (items.length === 0) return null;

  return (
    <section className="border-b border-white/[0.06] bg-[#0a0910] pt-20 pb-8 sm:pb-10">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff3d00]">
              Tonight
            </p>
            <h2
              className={`mt-1 text-xl font-black text-[#eeeaf4] sm:text-2xl ${outfitClassName}`}
            >
              今夜のmazare
            </h2>
          </div>
          <Link
            href="/home"
            className="shrink-0 text-sm font-semibold text-[#9994a8] hover:text-[#eeeaf4]"
          >
            もっと見る →
          </Link>
        </div>

        <div className="scrollbar-hidden -mx-4 flex items-start gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-4 lg:gap-4">
          {items.map((item) => {
            const post = {
              ...item.post,
              shops:
                mergeShopNearestStations(item.post.shops, stationMap) ??
                item.post.shops,
            };
            return (
              <GuestPostFeedCard
                key={item.post.id}
                post={post}
                tonightTotalCups={item.tonightTotalCups}
                interestCount={item.interestCount}
                commentCount={item.commentCount}
                userLocation={userLocation}
                showActions
                shopHref={
                  post.shops?.id ? `/shop/${post.shops.id}` : undefined
                }
                className="w-[85vw] max-w-[320px] shrink-0 snap-center sm:w-auto sm:max-w-none"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
