"use client";

import Link from "next/link";

type TodayInterestsBannerProps = {
  count: number;
};

export default function TodayInterestsBanner({ count }: TodayInterestsBannerProps) {
  if (count === 0) return null;

  return (
    <Link
      href="/mypage#today-interests"
      className="mb-4 block rounded-[14px] border border-[#00e87a]/20 bg-[#00e87a]/8 px-4 py-3 transition hover:border-[#00e87a]/40"
    >
      <p className="text-sm font-bold text-[#00e87a]">
        今日の行くかも {count}件
      </p>
      <p className="mt-1 text-xs text-[#9994a8]">
        タップしてリストを確認
      </p>
    </Link>
  );
}
