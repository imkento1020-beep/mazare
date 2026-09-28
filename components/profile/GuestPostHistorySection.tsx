"use client";

import { useMemo } from "react";
import Link from "next/link";
import MyGuestPostCard from "@/components/mypage/MyGuestPostCard";
import type { VibePost } from "@/lib/home/types";
import {
  computeGuestPostAllTimeInsights,
  groupGuestPostsByNight,
} from "@/lib/profile/postInsights";
import { buildTonightCumulativeCupTotals } from "@/lib/guest-post/tonightCups";

type GuestPostHistorySectionProps = {
  posts: VibePost[];
  emptyMessage?: string;
  showPostLink?: boolean;
  /** 自分のプロフィール / マイページでは true */
  allowEdit?: boolean;
};

function ChipRow({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5a5668]">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/10 bg-[#18181f] px-3 py-1 text-xs font-semibold text-[#eeeaf4]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function GuestPostHistorySection({
  posts,
  emptyMessage = "公開中の投稿はまだありません",
  showPostLink = false,
  allowEdit = false,
}: GuestPostHistorySectionProps) {
  const allTime = useMemo(
    () => computeGuestPostAllTimeInsights(posts),
    [posts],
  );
  const nightGroups = useMemo(() => groupGuestPostsByNight(posts), [posts]);
  const tonightCupTotals = useMemo(
    () => buildTonightCumulativeCupTotals(posts),
    [posts],
  );

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#5a5668]">
          今までの投稿
        </h2>
        {showPostLink && (
          <Link
            href="/post"
            className="text-xs font-semibold text-[#ff3d00] hover:underline"
          >
            投稿する →
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="mt-3 rounded-[14px] border border-white/[0.07] bg-[#111118] p-4 text-sm text-[#9994a8]">
          {emptyMessage}
        </p>
      ) : (
        <>
          <div className="mt-3 rounded-[14px] border border-white/[0.07] bg-[#111118] p-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-2xl font-black tabular-nums text-[#ff3d00]">
                  {allTime.totalPosts}
                </p>
                <p className="mt-0.5 text-[10px] text-[#5a5668]">累計投稿</p>
              </div>
              <div>
                <p className="text-2xl font-black tabular-nums text-[#ffaa00]">
                  {allTime.totalShops}
                </p>
                <p className="mt-0.5 text-[10px] text-[#5a5668]">訪れた店</p>
              </div>
            </div>
            <ChipRow label="よく飲んでいる" items={allTime.topDrinks} />
            <ChipRow label="よく出ているエリア" items={allTime.topAreas} />
          </div>

          <div className="mt-6 space-y-6">
            {nightGroups.map((group) => (
              <div key={group.nightStartIso}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#eeeaf4]">
                    {group.label}
                  </h3>
                  <p className="text-[11px] text-[#5a5668]">
                    {group.posts.length}投稿 · {group.shopCount}店
                  </p>
                </div>
                <div className="mt-2 space-y-2">
                  {group.posts.map((post) => (
                    <MyGuestPostCard
                      key={post.id}
                      post={post}
                      showEdit={allowEdit}
                      tonightTotalCups={tonightCupTotals.get(post.id) ?? null}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
