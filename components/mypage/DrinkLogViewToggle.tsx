"use client";

import SegmentedTabs from "@/components/ui/SegmentedTabs";

export type DrinkLogView = "grid" | "calendar";

type DrinkLogViewToggleProps = {
  view: DrinkLogView;
  onChange: (view: DrinkLogView) => void;
};

export default function DrinkLogViewToggle({
  view,
  onChange,
}: DrinkLogViewToggleProps) {
  return (
    <SegmentedTabs
      active={view}
      onChange={onChange}
      variant="pill"
      tabs={[
        { id: "grid", label: "グリッド" },
        { id: "calendar", label: "カレンダー" },
      ]}
    />
  );
}
