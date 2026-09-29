"use client";

import type { RecentShopFeedItem } from "@/lib/feed/recentFeed";
import type { GeoPoint } from "@/lib/geo/haversine";
import GuestPostFeedCard from "@/components/posts/GuestPostFeedCard";

type RecentShopCardProps = {
  item: RecentShopFeedItem;
  onInterest?: () => void;
  interestLoading?: boolean;
  interested?: boolean;
  tonightTotalCups?: number | null;
  interestCount?: number;
  commentCount?: number;
  userLocation?: GeoPoint | null;
};

export default function RecentShopCard({
  item,
  onInterest,
  interestLoading,
  interested,
  tonightTotalCups = null,
  interestCount = 0,
  commentCount = 0,
  userLocation = null,
}: RecentShopCardProps) {
  const post = {
    ...item.latestPost,
    shops: item.shop,
  };

  return (
    <GuestPostFeedCard
      post={post}
      tonightTotalCups={tonightTotalCups}
      interestCount={interestCount}
      commentCount={commentCount}
      userLocation={userLocation}
      onInterest={onInterest}
      interestLoading={interestLoading}
      interested={interested}
      showActions={Boolean(onInterest)}
      shopHref={`/shop/${item.shop.id}`}
    />
  );
}
