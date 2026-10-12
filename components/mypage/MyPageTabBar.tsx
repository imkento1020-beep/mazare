"use client";

import SegmentedTabs from "@/components/ui/SegmentedTabs";

export type MyPageTab = "posts" | "profile";

type MyPageTabBarProps = {
  active: MyPageTab;
  onChange: (tab: MyPageTab) => void;
  postCount?: number;
};

export default function MyPageTabBar({
  active,
  onChange,
  postCount,
}: MyPageTabBarProps) {
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
