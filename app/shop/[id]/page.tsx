"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  fetchShopById,
  fetchShopInterestCount,
  fetchShopPosts,
  fetchUserInterestForPost,
} from "@/lib/shop/api";
import {
  formatGenre,
  formatOpenHours,
  formatPostedAt,
  parseCoverImages,
  type Shop,
  type VibePost,
} from "@/lib/home/types";
import BackButton from "@/components/layout/BackButton";
import type { User } from "@supabase/supabase-js";

function genreEmoji(genre: string) {
  if (genre.includes("居酒屋")) return "🎵";
  if (genre.includes("バー") || genre.includes("クラフト")) return "🍻";
  return "🕺";
}

function CoverGallery({ shop, posts }: { shop: Shop; posts: VibePost[] }) {
  const images = [
    ...parseCoverImages(shop.cover_image),
    ...posts.flatMap((post) => post.images ?? []),
  ].slice(0, 8);

  if (images.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center bg-gradient-to-br from-[#1a0a00] to-[#2d1200] text-6xl">
        {genreEmoji(formatGenre(shop.genre))}
      </div>
    );
  }

  return (
    <div className="flex h-[240px] snap-x snap-mandatory overflow-x-auto">
      {images.map((src, index) => (
        <div key={`${src}-${index}`} className="h-[240px] w-full shrink-0 snap-center">
          {src.startsWith("data:") || src.startsWith("http") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a0a00] to-[#2d1200] text-5xl">
              {genreEmoji(formatGenre(shop.genre))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ShopVibePostItem({ post }: { post: VibePost }) {
  const images = post.images ?? [];

  return (
    <article className="rounded-[14px] border border-white/7 border-l-2 border-l-[#ff3d00] bg-[#111118] p-4">
      <p className="text-[11px] text-[#5a5668]">{formatPostedAt(post.posted_at)}</p>
      {post.moods && post.moods.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.moods.map((mood) => (
            <span
              key={mood}
              className="rounded-[20px] bg-[#ff3d00]/10 px-2.5 py-1 text-[11px] font-medium text-[#ff3d00]"
            >
              {mood}
            </span>
          ))}
        </div>
      )}
      <p className="mt-3 text-sm leading-relaxed text-[#9994a8]">{post.comment}</p>
      {images.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#18181f]"
            >
              {src.startsWith("data:") || src.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [posts, setPosts] = useState<VibePost[]>([]);
  const [interestCount, setInterestCount] = useState(0);
  const [interested, setInterested] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const latestPost = posts[0] ?? null;

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

      const [shopResult, postsResult, count] = await Promise.all([
        fetchShopById(shopId),
        fetchShopPosts(shopId),
        fetchShopInterestCount(shopId),
      ]);

      if (shopResult.error || !shopResult.data) {
        setError(shopResult.error ?? "店舗が見つかりません");
        setLoading(false);
        return;
      }

      setShop(shopResult.data);
      setPosts(postsResult.data ?? []);
      setInterestCount(count);

      const firstPost = postsResult.data?.[0];
      if (firstPost) {
        const hasInterest = await fetchUserInterestForPost(
          session.user.id,
          firstPost.id,
        );
        setInterested(hasInterest);
      }

      setLoading(false);
    }

    load();
  }, [shopId, router]);

  async function handleInterestToggle() {
    if (!user || !latestPost || submitting) return;

    setSubmitting(true);
    setError(null);

    const { error: mutationError } = interested
      ? await supabase
          .from("interests")
          .delete()
          .eq("user_id", user.id)
          .eq("vibe_post_id", latestPost.id)
      : await supabase.from("interests").insert({
          user_id: user.id,
          shop_id: shopId,
          vibe_post_id: latestPost.id,
        });

    setSubmitting(false);

    if (mutationError) {
      setError(mutationError.message);
      return;
    }

    setInterested(!interested);
    setInterestCount((prev) => Math.max(0, prev + (interested ? -1 : 1)));
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#080810]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff3d00] border-t-transparent" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-[#080810] px-6 text-center">
        <p className="text-[#9994a8]">{error ?? "店舗が見つかりません"}</p>
        <Link href="/home" className="mt-4 text-sm text-[#ff3d00]">
          ホームへ戻る
        </Link>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`;

  return (
    <div className="min-h-full bg-[#080810] pb-10 text-[#eeeaf4]">
      <div className="sticky top-0 z-20 border-b border-white/7 bg-[#080810]/90 px-4 py-3 backdrop-blur-md">
        <BackButton href="/home" />
      </div>

      <CoverGallery shop={shop} posts={posts} />

      <div className="mx-auto max-w-lg px-4 pt-5">
        <h1 className="text-2xl font-black">{shop.name}</h1>
        <p className="mt-1 text-sm text-[#ff3d00]">{formatGenre(shop.genre)}</p>
        <p className="mt-2 text-sm text-[#9994a8]">📍 {shop.address}</p>
        <p className="mt-1 text-sm text-[#9994a8]">
          🕙 {formatOpenHours(shop.open_hours)}
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={handleInterestToggle}
            disabled={!latestPost || submitting}
            className={`w-full rounded-[13px] py-3.5 text-sm font-bold transition disabled:opacity-60 ${
              interested
                ? "border border-[#00e87a]/40 bg-[#00e87a]/12 text-[#00e87a]"
                : "bg-[#ff3d00] text-white hover:bg-[#e63600]"
            }`}
          >
            {submitting
              ? "送信中..."
              : interested
                ? "👋 行くかも ✓"
                : "👋 行くかも"}
          </button>
          <p className="mt-2 text-center text-sm text-[#9994a8]">
            {interestCount}人が行くかも
          </p>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#5a5668]">
            今夜の発信
          </h2>
          <div className="mt-3 space-y-3">
            {posts.length === 0 ? (
              <p className="rounded-[14px] border border-white/7 bg-[#111118] p-4 text-sm text-[#9994a8]">
                今夜の発信はまだありません
              </p>
            ) : (
              posts.map((post) => <ShopVibePostItem key={post.id} post={post} />)
            )}
          </div>
        </section>

        <section className="mt-8 rounded-[14px] border border-white/7 bg-[#111118] p-4">
          <h2 className="text-sm font-bold text-[#eeeaf4]">お店の基本情報</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#9994a8]">
            {shop.description ??
              `${shop.name}は${formatGenre(shop.genre)}。知らない人とも自然に混ざれる、今夜行きたい場所です。`}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#ff3d00] hover:underline"
          >
            Googleマップで開く →
          </a>
        </section>
      </div>
    </div>
  );
}
