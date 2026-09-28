"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import MyGuestPostCard from "@/components/mypage/MyGuestPostCard";
import {
  fetchPublicGuestPosts,
  fetchPublicGuestProfile,
  type PublicGuestProfile,
} from "@/lib/profile/publicProfile";
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

  return (
    <GuestLayout
      mobileTitle="プロフィール"
      menuOnly
      showFilters={false}
      showRightSidebar={false}
      showMobileSearch={false}
    >
      <div className="mx-auto max-w-lg">
        <section className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-5 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#18181f] text-3xl">
            {profile.profile_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profile_image}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              "👤"
            )}
          </div>
          <h1 className="mt-4 text-xl font-black">{profile.display_name}</h1>
          {profile.created_at && (
            <p className="mt-1 text-xs text-[#5a5668]">
              {new Date(profile.created_at).toLocaleDateString("ja-JP")} から参加
            </p>
          )}
          {isSelf && (
            <button
              type="button"
              onClick={() => router.push("/mypage")}
              className="mt-4 inline-block rounded-xl border border-white/12 bg-[#18181f] px-4 py-2 text-xs font-semibold text-[#9994a8] transition hover:border-[#ff3d00]/30 hover:text-[#eeeaf4]"
            >
              マイページを開く
            </button>
          )}
        </section>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <section className="mt-8">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#5a5668]">
            投稿
          </h2>
          <div className="mt-3 space-y-2">
            {posts.length === 0 ? (
              <p className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-4 text-sm text-[#9994a8]">
                公開中の投稿はまだありません
              </p>
            ) : (
              posts.map((post) => <MyGuestPostCard key={post.id} post={post} />)
            )}
          </div>
        </section>
      </div>
    </GuestLayout>
  );
}
