"use client";

import SegmentedTabs from "@/components/ui/SegmentedTabs";

export type PublicProfileTab = "posts" | "profile";

type PublicProfileTabBarProps = {
  active: PublicProfileTab;
  onChange: (tab: PublicProfileTab) => void;
  postCount?: number;
};

export default function PublicProfileTabBar({
  active,
  onChange,
  postCount,
}: PublicProfileTabBarProps) {
  return (
    <SegmentedTabs
      active={active}
      onChange={onChange}
      variant="underline"
      tabs={[
        {
          id: "posts",
          label: "投稿",
          badge: postCount != null && postCount > 0 ? postCount : undefined,
        },
        { id: "profile", label: "プロフィール" },
      ]}
    />
  );
}
