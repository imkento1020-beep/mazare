"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  createVibePost,
  fetchManagedShop,
  fetchShopDashboardStats,
} from "@/lib/owner/api";
import type { Shop } from "@/lib/home/types";
import OwnerLayout from "@/components/layout/OwnerLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import VibePostForm from "@/components/owner/VibePostForm";

export default function OwnerPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState({ views: 0, interests: 0, checkins: 0 });
  const [shopId, setShopId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setShopId(managedShop.id);
      setStats({
        views: dashboardStats.views,
        interests: dashboardStats.interests,
        checkins: dashboardStats.checkins,
      });
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleSubmit(input: {
    moods: string[];
    comment: string;
    images: string[];
    postedAt?: string;
  }) {
    if (!shopId || submitting) return;

    setSubmitting(true);
    setError(null);

    const { error: postError } = await createVibePost({
      shopId,
      moods: input.moods,
      comment: input.comment,
      images: input.images,
      postedAt: input.postedAt,
    });

    setSubmitting(false);

    if (postError) {
      setError(postError.message);
      return;
    }

    router.replace("/owner/dashboard");
  }

  if (loading) return <LoadingScreen />;

  return (
    <OwnerLayout shop={shop} stats={stats} title="今夜の空気を発信する">
      <VibePostForm
        submitLabel="発信する"
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </OwnerLayout>
  );
}
