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
import ProfileSocialSummary from "@/components/profile/ProfileSocialSummary";
import PublicProfileTabBar, {
  type PublicProfileTab,
} from "@/components/profile/PublicProfileTabBar";
import MotionPanel from "@/components/ui/MotionPanel";
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
  const [tab, setTab] = useState<PublicProfileTab>("posts");
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
      <div className="mx-auto max-w-2xl space-y-4">
        <ProfileHero
          displayName={profile.display_name}
          avatarUrl={profile.profile_image}
          subtitle={joinLine}
          bio={profile.bio}
          socialContext={{
            mergeAttitude: profile.mergeAttitude,
            vibeScale: profile.vibeScale,
          }}
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
          <PublicProfileTabBar active={tab} onChange={setTab} postCount={posts.length} />
        </div>

        <MotionPanel panelKey={tab}>
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
          <section className="mt-4 space-y-3 rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
            <div>
              <h2 className="text-base font-black text-[#eeeaf4]">
                今夜のスタンス
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#9994a8]">
                合流の意思と、席の人数感
              </p>
            </div>
            <ProfileSocialSummary
              context={{
                mergeAttitude: profile.mergeAttitude,
                vibeScale: profile.vibeScale,
              }}
            />
          </section>
        )}
        </MotionPanel>
      </div>
    </GuestLayout>
  );
}
