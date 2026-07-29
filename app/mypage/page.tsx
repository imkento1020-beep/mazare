"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  fetchUserInterestStats,
  fetchUserInterests,
} from "@/lib/mypage/api";
import { fetchVibePosts } from "@/lib/home/api";
import { formatPostedAt } from "@/lib/home/types";
import type { InterestRow, VibePost } from "@/lib/home/types";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import type { User } from "@supabase/supabase-js";

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [interests, setInterests] = useState<InterestRow[]>([]);
  const [sidebarPosts, setSidebarPosts] = useState<VibePost[]>([]);
  const [stats, setStats] = useState({ totalInterests: 0, visitedShops: 0 });
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      setUser(session.user);

      const [interestsResult, interestStats, postsResult] = await Promise.all([
        fetchUserInterests(session.user.id),
        fetchUserInterestStats(session.user.id),
        fetchVibePosts(),
      ]);

      setInterests(interestsResult.data);
      setStats(interestStats);
      setSidebarPosts(postsResult.data ?? []);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) return <LoadingScreen />;

  const displayName =
    user?.user_metadata?.display_name ??
    user?.email?.split("@")[0] ??
    "ゲスト";

  return (
    <GuestLayout
      mobileTitle="マイページ"
      menuOnly
      showFilters={false}
      showRightSidebar
      showMobileSearch={false}
      posts={sidebarPosts}
      filteredCount={sidebarPosts.length}
    >
      <section className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-5 text-center md:max-w-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#18181f] text-3xl">
          👤
        </div>
        <h2 className="mt-4 text-xl font-black">{displayName}</h2>
        <p className="mt-1 text-sm text-[#9994a8]">{user?.email}</p>
        <button
          type="button"
          className="mt-4 rounded-xl border border-white/12 bg-[#18181f] px-4 py-2 text-xs font-semibold text-[#9994a8]"
        >
          プロフィール編集
        </button>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 md:max-w-xl">
        <div className="rounded-[14px] bg-[#111118] p-4 text-center">
          <p className="text-2xl font-black text-[#ff3d00]">
            {stats.totalInterests}
          </p>
          <p className="mt-1 text-xs text-[#5a5668]">行くかもした数</p>
        </div>
        <div className="rounded-[14px] bg-[#111118] p-4 text-center">
          <p className="text-2xl font-black text-[#00e87a]">
            {stats.visitedShops}
          </p>
          <p className="mt-1 text-xs text-[#5a5668]">実際に行ったお店</p>
        </div>
      </section>

      <section className="mt-8 md:max-w-2xl">
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#5a5668]">
          行くかも履歴
        </h2>
        <div className="mt-3 space-y-2">
          {interests.length === 0 ? (
            <p className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-4 text-sm text-[#9994a8]">
              まだ行くかもしたお店はありません
            </p>
          ) : (
            interests.map((item) => (
              <Link
                key={item.id}
                href={`/shop/${item.shop_id}`}
                className="block rounded-[14px] border border-white/[0.07] bg-[#111118] p-4 transition hover:border-[#ff3d00]/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold">
                    {item.vibe_posts?.shops?.name ?? "お店"}
                  </h3>
                  <span className="shrink-0 text-[10px] text-[#5a5668]">
                    {formatPostedAt(item.created_at)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[#9994a8]">
                  {item.vibe_posts?.comment ?? "—"}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-8 w-full max-w-xl rounded-[13px] border border-[#ff3d00]/30 bg-transparent py-3.5 text-sm font-bold text-[#ff3d00] transition hover:bg-[#ff3d00]/10 disabled:opacity-60"
      >
        {loggingOut ? "ログアウト中..." : "ログアウト"}
      </button>
    </GuestLayout>
  );
}
