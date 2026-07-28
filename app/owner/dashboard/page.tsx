"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  fetchOwnerShop,
  fetchShopDashboardStats,
  fetchShopInterestsForFeed,
} from "@/lib/owner/api";
import { formatPostedAt, parseCoverImages, type Shop } from "@/lib/home/types";
import { primaryButtonClassName } from "@/lib/ui/styles";

type Visitor = {
  id: string;
  name: string;
  time: string;
  viaMazare: boolean;
};

type RecentPost = {
  id: string;
  comment: string;
  posted_at: string;
  images: string[] | null;
  interestCount: number;
};

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState({ views: 0, interests: 0, checkins: 0 });
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: ownerShop } = await fetchOwnerShop(user.id);
      if (!ownerShop) {
        router.replace("/owner/onboarding");
        return;
      }

      const [dashboardStats, feed] = await Promise.all([
        fetchShopDashboardStats(ownerShop.id),
        fetchShopInterestsForFeed(ownerShop.id),
      ]);

      setShop(ownerShop);
      setStats({
        views: dashboardStats.views,
        interests: dashboardStats.interests,
        checkins: dashboardStats.checkins,
      });
      setVisitors(feed);
      setRecentPosts(dashboardStats.recentPosts as RecentPost[]);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#080810]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff3d00] border-t-transparent" />
      </div>
    );
  }

  const coverImages = parseCoverImages(shop?.cover_image);

  return (
    <div className="min-h-full bg-[#080810] pb-10 text-[#eeeaf4]">
      <header className="border-b border-white/7 px-4 py-4">
        <div className="mx-auto flex max-w-[480px] items-center justify-between">
          <div>
            <p className="text-xs text-[#5a5668]">オーナーダッシュボード</p>
            <h1 className="text-xl font-black">{shop?.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3d00] opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-[#ff3d00]" />
            </span>
            <span className="text-xs font-bold text-[#ff3d00]">発信中</span>
          </div>
        </div>
        <div className="mx-auto mt-3 flex max-w-[480px] gap-2">
          <Link
            href="/owner/profile"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#9994a8]"
          >
            プロフィール
          </Link>
          <Link
            href="/owner/post"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#9994a8]"
          >
            発信する
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[480px] space-y-6 px-4 pt-6">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "閲覧数", value: stats.views, color: "text-[#ff3d00]" },
            { label: "行くかも", value: stats.interests, color: "text-[#00e87a]" },
            { label: "チェックイン", value: stats.checkins, color: "text-[#ffaa00]" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-3 text-center"
            >
              <p className={`text-[26px] font-black leading-none ${item.color}`}>
                {item.value}
              </p>
              <p className="mt-1 text-[10px] text-[#5a5668]">{item.label}</p>
            </div>
          ))}
        </div>

        <Link href="/owner/post" className={`block ${primaryButtonClassName} text-center`}>
          今夜の空気を発信する
        </Link>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#5a5668]">
            今夜の来店者
          </h2>
          <div className="mt-3 space-y-2">
            {visitors.length === 0 ? (
              <p className="rounded-[14px] bg-[#111118] p-4 text-sm text-[#9994a8]">
                まだ来店者はいません
              </p>
            ) : (
              visitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="flex items-center gap-3 rounded-[14px] bg-[#111118] p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#18181f] text-lg">
                    👤
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{visitor.name}</p>
                    <p className="text-xs text-[#5a5668]">{visitor.time} 来店</p>
                  </div>
                  {visitor.viaMazare && (
                    <span className="shrink-0 rounded-full bg-[#ff3d00]/10 px-2 py-0.5 text-[10px] font-bold text-[#ff3d00]">
                      mazare経由
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#5a5668]">
            過去の発信履歴
          </h2>
          <div className="mt-3 space-y-2">
            {recentPosts.length === 0 ? (
              <p className="rounded-[14px] bg-[#111118] p-4 text-sm text-[#9994a8]">
                発信履歴はまだありません
              </p>
            ) : (
              recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-[14px] border border-white/7 bg-[#111118] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-[#5a5668]">
                      {formatPostedAt(post.posted_at)}
                    </p>
                    <span className="text-xs font-bold text-[#00e87a]">
                      {post.interestCount} 行くかも
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#9994a8]">{post.comment}</p>
                  {(post.images?.length ?? 0) > 0 && (
                    <div className="mt-2 flex gap-1">
                      {post.images!.slice(0, 3).map((src, index) => (
                        <div
                          key={index}
                          className="h-10 w-10 overflow-hidden rounded-md bg-[#18181f]"
                        >
                          {src.startsWith("data:") || src.startsWith("http") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={src} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {coverImages[0] && (
          <div className="overflow-hidden rounded-[14px] border border-white/7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImages[0]}
              alt=""
              className="h-32 w-full object-cover opacity-80"
            />
          </div>
        )}
      </main>
    </div>
  );
}
