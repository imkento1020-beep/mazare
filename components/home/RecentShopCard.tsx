"use client";

import type { RecentShopFeedItem } from "@/lib/feed/recentFeed";
import type { GeoPoint } from "@/lib/geo/haversine";
import GuestPostFeedCard from "@/components/posts/GuestPostFeedCard";

type RecentShopCardProps = {
  item: RecentShopFeedItem;
  onInterest?: () => void;
  interestLoading?: boolean;
  interested?: boolean;
  onContact?: (message: string) => void | Promise<void>;
  contactLoading?: boolean;
  contacted?: boolean;
  contactCount?: number;
  viewerCanContact?: boolean;
  onContactLoginRequired?: () => void;
  authorSocialContext?: import("@/lib/profile/tonightSocialContext").TonightSocialContext | null;
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
  onContact,
  contactLoading,
  contacted,
  contactCount = 0,
  viewerCanContact = false,
  onContactLoginRequired,
  authorSocialContext = null,
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
      onContact={onContact}
      contactLoading={contactLoading}
      contacted={contacted}
      contactCount={contactCount}
      viewerCanContact={viewerCanContact}
      onContactLoginRequired={onContactLoginRequired}
      authorSocialContext={authorSocialContext}
      showActions={Boolean(onInterest || onContact)}
      shopHref={`/shop/${item.shop.id}`}
    />
  );
}
