"use client";

import SegmentedTabs from "@/components/ui/SegmentedTabs";

export type SearchMode = "shops" | "posts";

type SearchModeToggleProps = {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
};

export default function SearchModeToggle({ mode, onChange }: SearchModeToggleProps) {
  return (
    <SegmentedTabs
      active={mode}
      onChange={onChange}
      variant="pill"
      tabs={[
        { id: "shops", label: "お店" },
        { id: "posts", label: "投稿" },
      ]}
    />
  );
}
