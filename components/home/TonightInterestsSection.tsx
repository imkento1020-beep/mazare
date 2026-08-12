"use client";

import Link from "next/link";
import type { TodayInterestRow } from "@/lib/home/types";
import TonightInterestCard from "@/components/interests/TonightInterestCard";

type TonightInterestsSectionProps = {
  items: TodayInterestRow[];
  onCancel?: (interestId: string) => void;
  cancelingId?: string | null;
  previewLimit?: number;
};

export default function TonightInterestsSection({
  items,
  onCancel,
  cancelingId = null,
  previewLimit = 3,
}: TonightInterestsSectionProps) {
  if (items.length === 0) return null;

  const preview = items.slice(0, previewLimit);
  const hasMore = items.length > previewLimit;

  return (
    <section className="mb-4 rounded-2xl border border-[#00e87a]/20 bg-[#00e87a]/8 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-[#00e87a]">
            👋 今夜の行くかも {items.length}件
          </p>
          <p className="mt-0.5 text-xs text-[#9994a8]">17:00〜翌5:00に追加したお店</p>
        </div>
        <Link
          href="/tonight"
          className="shrink-0 rounded-lg bg-[#00e87a]/15 px-3 py-1.5 text-xs font-bold text-[#00e87a] hover:bg-[#00e87a]/25"
        >
          すべて見る
        </Link>
      </div>

      <div className="space-y-2">
        {preview.map((item) => (
          <TonightInterestCard
            key={item.id}
            item={item}
            compact
            onCancel={onCancel}
            canceling={cancelingId === item.id}
          />
        ))}
      </div>

      {hasMore && (
        <Link
          href="/tonight"
          className="mt-3 block text-center text-xs font-semibold text-[#00e87a] hover:underline"
        >
          あと{items.length - previewLimit}件を見る →
        </Link>
      )}
    </section>
  );
}
