"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  fetchManagedShop,
  fetchOwnerVibePost,
  fetchShopDashboardStats,
  updateVibePost,
} from "@/lib/owner/api";
import { isPostScheduled } from "@/lib/home/dates";
import type { Shop } from "@/lib/home/types";
import OwnerLayout from "@/components/layout/OwnerLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import VibePostForm from "@/components/owner/VibePostForm";

export default function OwnerPostEditPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState({ views: 0, interests: 0, checkins: 0 });
  const [shopId, setShopId] = useState<string | null>(null);
  const [initialMoods, setInitialMoods] = useState<string[]>([]);
  const [initialComment, setInitialComment] = useState("");
  const [initialImages, setInitialImages] = useState<string[]>([]);
  const [initialPostedAt, setInitialPostedAt] = useState<string | undefined>();
  const [allowScheduleEdit, setAllowScheduleEdit] = useState(false);
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

      const [dashboardStats, postResult] = await Promise.all([
        fetchShopDashboardStats(managedShop.id),
        fetchOwnerVibePost(postId, user.id),
      ]);

      if (postResult.error || !postResult.data) {
        setError(postResult.error ?? "投稿が見つかりません");
        setLoading(false);
        return;
      }

      setShop(managedShop);
      setShopId(managedShop.id);
      setStats({
        views: dashboardStats.views,
        interests: dashboardStats.interests,
        checkins: dashboardStats.checkins,
      });
      setInitialMoods(postResult.data.moods);
      setInitialComment(postResult.data.comment);
      setInitialImages(postResult.data.images);
      setInitialPostedAt(postResult.data.posted_at);
      setAllowScheduleEdit(isPostScheduled(postResult.data.posted_at));
      setLoading(false);
    }

    load();
  }, [postId, router]);

  async function handleSubmit(input: {
    moods: string[];
    comment: string;
    images: string[];
    postedAt?: string;
  }) {
    if (!shopId || submitting) return;

    setSubmitting(true);
    setError(null);

    const { error: updateError } = await updateVibePost(postId, shopId, {
      ...input,
      postedAt: allowScheduleEdit ? input.postedAt : undefined,
    });

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.replace("/owner/dashboard");
  }

  if (loading) return <LoadingScreen />;

  if (error && !shop) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#080810] px-6 text-center">
        <p className="text-[#9994a8]">{error}</p>
        <Link href="/owner/dashboard" className="mt-4 text-sm text-[#ff3d00]">
          ダッシュボードへ戻る
        </Link>
      </div>
    );
  }

  return (
    <OwnerLayout shop={shop} stats={stats} title="投稿を編集">
      <Link
        href="/owner/dashboard"
        className="mb-4 inline-flex text-sm text-[#9994a8] transition hover:text-[#eeeaf4]"
      >
        ← ダッシュボードに戻る
      </Link>

      <VibePostForm
        key={postId}
        initialMoods={initialMoods}
        initialComment={initialComment}
        initialImages={initialImages}
        initialPostedAt={initialPostedAt}
        allowSchedule={allowScheduleEdit}
        submitLabel="変更を保存"
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </OwnerLayout>
  );
}
