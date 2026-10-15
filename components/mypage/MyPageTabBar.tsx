"use client";

import SegmentedTabs from "@/components/ui/SegmentedTabs";

export type MyPageTab = "drink_log" | "tonight" | "account";

type MyPageTabBarProps = {
  active: MyPageTab;
  onChange: (tab: MyPageTab) => void;
};

export default function MyPageTabBar({ active, onChange }: MyPageTabBarProps) {
  return (
    <SegmentedTabs
      active={active}
      onChange={onChange}
      variant="underline"
      tabs={[
        { id: "drink_log", label: "飲みログ" },
        { id: "tonight", label: "今夜" },
        { id: "account", label: "アカウント" },
      ]}
    />
  );
}
