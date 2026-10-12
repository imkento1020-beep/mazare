"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import GuestPostHistorySection from "@/components/profile/GuestPostHistorySection";
import {
  fetchPublicGuestPosts,
  fetchPublicGuestProfile,
  type PublicGuestProfile,
} from "@/lib/profile/publicProfile";
import { computeGuestPostInsights } from "@/lib/profile/postInsights";
import GuestPostInsightsPanel from "@/components/profile/GuestPostInsightsPanel";
import ProfileHero from "@/components/profile/ProfileHero";
import TonightSocialMoodBadge from "@/components/profile/TonightSocialMoodBadge";
import { findTonightSocialMood } from "@/lib/profile/tonightSocialMood";
import MyPageTabBar, { type MyPageTab } from "@/components/mypage/MyPageTabBar";
import type { VibePost } from "@/lib/home/types";

type PublicProfileClientProps = {
  userId: string;
};

export default function PublicProfileClient({ userId }: PublicProfileClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PublicGuestProfile | null>(null);
  const [posts, setPosts] = useState<VibePost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [tab, setTab] = useState<MyPageTab>("posts");
  const insights = useMemo(() => computeGuestPostInsights(posts), [posts]);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setViewerId(session?.user?.id ?? null);

      const [profileResult, postsResult] = await Promise.all([
        fetchPublicGuestProfile(userId),
        fetchPublicGuestPosts(userId),
      ]);

      if (profileResult.error) setError(profileResult.error);
      if (postsResult.error) setError(postsResult.error);

      if (!profileResult.data) {
        setLoading(false);
        return;
      }

      setProfile(profileResult.data);
      setPosts(postsResult.data);
      setLoading(false);
    }

    void load();
  }, [userId]);

  if (loading) return <LoadingScreen />;

  if (!profile) {
    return (
      <GuestLayout menuOnly showFilters={false} showRightSidebar={false} showMobileSearch={false}>
        <div className="mx-auto max-w-lg py-16 text-center">
          <p className="text-sm text-[#9994a8]">プロフィールが見つかりませんでした</p>
          <Link href="/home" className="mt-4 inline-block text-sm font-bold text-[#ff3d00]">
            ホームへ
          </Link>
        </div>
      </GuestLayout>
    );
  }

  const isSelf = viewerId === profile.id;
  const moodMeta = findTonightSocialMood(profile.tonight_social_mood);
  const joinLine = profile.created_at
    ? `${new Date(profile.created_at).toLocaleDateString("ja-JP")} から mazare`
    : null;

  return (
    <GuestLayout
      mobileTitle="プロフィール"
      menuOnly
      showFilters={false}
      showRightSidebar={false}
      showMobileSearch={false}
    >
      <div className="mx-auto max-w-2xl space-y-1">
        <ProfileHero
          displayName={profile.display_name}
          avatarUrl={profile.profile_image}
          metaLine={joinLine}
          mood={profile.tonight_social_mood}
          stats={[
            { value: posts.length, label: "投稿" },
            { value: insights.tonightPostCount, label: "今夜" },
          ]}
          actions={
            isSelf ? (
              <button
                type="button"
                onClick={() => router.push("/mypage")}
                className="w-full rounded-xl bg-[#ff3d00] px-4 py-2.5 text-xs font-bold text-white"
              >
                マイページで編集
              </button>
            ) : undefined
          }
        />

        <div className="mt-2 rounded-2xl border border-white/[0.07] bg-[#111118] px-1">
          <MyPageTabBar active={tab} onChange={setTab} postCount={posts.length} />
        </div>

        {tab === "posts" && (
          <div className="mt-4">
            <GuestPostInsightsPanel insights={insights} className="mt-0 mb-4" />
            {error && (
              <p className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}
            <GuestPostHistorySection posts={posts} allowEdit={isSelf} />
          </div>
        )}

        {tab === "profile" && (
          <section className="mt-4 space-y-4 rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
            <div>
              <p className="text-base font-black text-[#eeeaf4]">今夜の気分</p>
              <p className="mt-1 text-xs text-[#9994a8]">
                このユーザーが今夜どんな飲み方を希望しているか
              </p>
            </div>
            {profile.tonight_social_mood ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-4">
                <TonightSocialMoodBadge
                  mood={profile.tonight_social_mood}
                  size="md"
                  prefix={false}
                />
                {moodMeta?.description && (
                  <p className="mt-3 text-sm leading-relaxed text-[#9994a8]">
                    {moodMeta.description}
                  </p>
                )}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 bg-[#0d0d12] p-5 text-sm text-[#5a5668]">
                まだ今夜の気分は設定されていません
              </p>
            )}
            <div className="border-t border-white/[0.06] pt-4">
              <p className="text-xs font-bold text-[#5a5668]">表示名</p>
              <p className="mt-1 text-sm font-bold text-[#eeeaf4]">
                {profile.display_name}
              </p>
            </div>
          </section>
        )}
      </div>
    </GuestLayout>
  );
}
