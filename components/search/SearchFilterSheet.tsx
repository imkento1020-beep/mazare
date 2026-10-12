"use client";

import type { ReactNode } from "react";

type SearchFilterSheetProps = {
  title?: string;
  children: ReactNode;
};

export function SearchFilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-[#9994a8]">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function SearchFilterChip({
  active,
  onClick,
  children,
  accent = "orange",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  accent?: "orange" | "green";
}) {
  const activeClass =
    accent === "green"
      ? "border-[#00e87a] bg-[#00e87a]/12 text-[#00e87a]"
      : "border-[#ff3d00] bg-[#ff3d00]/12 text-[#ff3d00]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${
        active ? activeClass : "border-white/10 bg-[#18181f] text-[#9994a8] hover:border-white/20 hover:text-[#eeeaf4]"
      }`}
    >
      {children}
    </button>
  );
}

export default function SearchFilterSheet({
  title = "絞り込み",
  children,
}: SearchFilterSheetProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-4">
      <p className="text-sm font-black text-[#eeeaf4]">{title}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}
