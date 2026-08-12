"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchVibePosts } from "@/lib/home/api";
import type { VibePost } from "@/lib/home/types";
import {
  cancelInterest,
  fetchTonightInterests,
} from "@/lib/mypage/api";
import type { TodayInterestRow } from "@/lib/home/types";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import TonightInterestCard from "@/components/interests/TonightInterestCard";
import { isCurrentlyInTonightInterestHours } from "@/lib/home/dates";

export default function TonightPage() {
  const router = useRouter();
  const [items, setItems] = useState<TodayInterestRow[]>([]);
  const [sidebarPosts, setSidebarPosts] = useState<VibePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inTonightHours = isCurrentlyInTonightInterestHours();

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const [interestsResult, postsResult] = await Promise.all([
        fetchTonightInterests(session.user.id),
        fetchVibePosts(),
      ]);

      if (interestsResult.error) setError(interestsResult.error);

      setItems(interestsResult.data);
      setSidebarPosts(postsResult.data ?? []);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleCancel(interestId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return;

    setCancelingId(interestId);
    setError(null);

    const { error: cancelError } = await cancelInterest(
      interestId,
      session.user.id,
    );

    setCancelingId(null);

    if (cancelError) {
      setError(cancelError);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== interestId));
  }

  if (loading) return <LoadingScreen />;

  return (
    <GuestLayout
      mobileTitle="行くかも"
      menuOnly
      showFilters={false}
      showRightSidebar
      showMobileSearch={false}
      posts={sidebarPosts}
      filteredCount={sidebarPosts.length}
    >
      <div className="md:max-w-3xl">
        <h1 className="text-xl font-black">今夜の行くかも</h1>
        <p className="mt-1 text-sm text-[#9994a8]">
          17:00〜翌5:00に「行くかも」したお店のリスト
        </p>

        {!inTonightHours && (
          <p className="mt-3 rounded-xl border border-[#ffaa00]/20 bg-[#ffaa00]/10 px-4 py-3 text-xs text-[#ffaa00]">
            今は追加時間外です（17:00〜翌5:00）。下のリストは前夜分です。
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-white/7 bg-[#111118] p-8 text-center">
              <p className="text-4xl">👋</p>
              <p className="mt-4 text-sm font-bold text-[#eeeaf4]">
                今夜の行くかもはまだありません
              </p>
              <p className="mt-2 text-sm text-[#9994a8]">
                気になるお店の投稿から「行くかも」を押すと、ここに追加されます
              </p>
              <Link
                href="/home"
                className="mt-5 inline-block rounded-[13px] bg-[#ff3d00] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#e63600]"
              >
                お店を探す
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <TonightInterestCard
                key={item.id}
                item={item}
                onCancel={handleCancel}
                canceling={cancelingId === item.id}
              />
            ))
          )}
        </div>
      </div>
    </GuestLayout>
  );
}
