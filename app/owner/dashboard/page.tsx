"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  deleteVibePost,
  fetchManagedShop,
  fetchShopDashboardStats,
} from "@/lib/owner/api";
import { fetchShopTonightCheckins } from "@/lib/checkins/api";
import type { TonightCheckinVisitor } from "@/lib/checkins/api";
import { getShopCoverImages, type Shop } from "@/lib/home/types";
import { primaryButtonClassName } from "@/lib/ui/styles";
import OwnerLayout from "@/components/layout/OwnerLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import ShopCoverHero from "@/components/owner/ShopCoverHero";
import TonightVisitorsSection from "@/components/owner/TonightVisitorsSection";
import OwnerPostHistorySection, {
  type OwnerPostHistoryItem,
} from "@/components/owner/OwnerPostHistorySection";

type RecentPost = OwnerPostHistoryItem;

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState({ views: 0, interests: 0, checkins: 0 });
  const [visitors, setVisitors] = useState<TonightCheckinVisitor[]>([]);
  const [visitorsError, setVisitorsError] = useState<string | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: managedShop } = await fetchManagedShop(user.id);
      if (!managedShop) {
        router.replace("/owner/onboarding");
        return;
      }

      const [dashboardStats, checkinsResult] = await Promise.all([
        fetchShopDashboardStats(managedShop.id),
        fetchShopTonightCheckins(managedShop.id),
      ]);

      setShop(managedShop);
      setStats({
        views: dashboardStats.views,
        interests: dashboardStats.interests,
        checkins: dashboardStats.checkins,
      });
      setVisitors(checkinsResult.data);
      setVisitorsError(checkinsResult.error);
      setRecentPosts(dashboardStats.recentPosts as RecentPost[]);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleDeletePost(postId: string) {
    if (!shop || deletingId) return;

    setDeletingId(postId);
    setActionError(null);

    const { error } = await deleteVibePost(postId, shop.id);

    setDeletingId(null);
    setConfirmDeleteId(null);

    if (error) {
      setActionError(error.message);
      return;
    }

    setRecentPosts((prev) => prev.filter((post) => post.id !== postId));
  }

  if (loading) return <LoadingScreen />;

  const coverImages = getShopCoverImages(shop ?? {});

  return (
    <OwnerLayout shop={shop} stats={stats} title="ダッシュボード">
      <div className="space-y-6">
        {shop && <ShopCoverHero shop={shop} coverImages={coverImages} />}

        <div className="grid grid-cols-3 gap-2 md:hidden">
          {[
            { label: "閲覧数", value: stats.views, color: "text-[#ff3d00]" },
            { label: "行くかも", value: stats.interests, color: "text-[#00e87a]" },
            { label: "来店", value: stats.checkins, color: "text-[#ffaa00]" },
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

        <TonightVisitorsSection visitors={visitors} error={visitorsError} />

        <OwnerPostHistorySection
          posts={recentPosts}
          actionError={actionError}
          deletingId={deletingId}
          confirmDeleteId={confirmDeleteId}
          onConfirmDelete={setConfirmDeleteId}
          onCancelDelete={() => setConfirmDeleteId(null)}
          onDelete={handleDeletePost}
        />
      </div>
    </OwnerLayout>
  );
}
