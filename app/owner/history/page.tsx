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
import type { Shop } from "@/lib/home/types";
import { primaryButtonClassName } from "@/lib/ui/styles";
import OwnerLayout from "@/components/layout/OwnerLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import OwnerPostHistorySection, {
  type OwnerPostHistoryItem,
} from "@/components/owner/OwnerPostHistorySection";

export default function OwnerHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState({ views: 0, interests: 0, checkins: 0 });
  const [recentPosts, setRecentPosts] = useState<OwnerPostHistoryItem[]>([]);
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

      const dashboardStats = await fetchShopDashboardStats(managedShop.id);

      setShop(managedShop);
      setStats({
        views: dashboardStats.views,
        interests: dashboardStats.interests,
        checkins: dashboardStats.checkins,
      });
      setRecentPosts(dashboardStats.recentPosts as OwnerPostHistoryItem[]);
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

  return (
    <OwnerLayout shop={shop} stats={stats} title="発信履歴">
      <div className="space-y-6">
        <Link href="/owner/post" className={`block ${primaryButtonClassName} text-center`}>
          今夜の空気を発信する
        </Link>

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
