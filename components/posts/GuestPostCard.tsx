"use client";

import type { Ref } from "react";
import type { VibePost } from "@/lib/home/types";
import type { GeoPoint } from "@/lib/geo/haversine";
import GuestPostFeedCard from "@/components/posts/GuestPostFeedCard";

type GuestPostCardProps = {
  post: VibePost;
  tonightTotalCups?: number | null;
  interestCount?: number;
  userLocation?: GeoPoint | null;
  onInterest?: () => void;
  interestLoading?: boolean;
  interested?: boolean;
  showActions?: boolean;
  className?: string;
  trackRef?: Ref<HTMLElement>;
};

export default function GuestPostCard({
  post,
  tonightTotalCups = null,
  interestCount = 0,
  userLocation = null,
  onInterest,
  interestLoading = false,
  interested = false,
  showActions = false,
  className = "",
  trackRef,
}: GuestPostCardProps) {
  return (
    <div ref={trackRef as Ref<HTMLDivElement>} className={className}>
      <GuestPostFeedCard
        post={post}
        tonightTotalCups={tonightTotalCups}
        interestCount={interestCount}
        userLocation={userLocation}
        onInterest={onInterest}
        interestLoading={interestLoading}
        interested={interested}
        showActions={showActions}
      />
    </div>
  );
}
