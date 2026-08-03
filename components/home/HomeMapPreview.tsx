"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import GoogleMapView from "@/components/map/GoogleMapView";
import { getShopCoverImages, type VibePost } from "@/lib/home/types";

type HomeMapPreviewProps = {
  posts: VibePost[];
  filteredCount: number;
  googleMapsApiKey: string;
};

function shopsFromPosts(posts: VibePost[]) {
  const byId = new Map<
    string,
    { id: string; name: string; address: string; live: boolean }
  >();

  for (const post of posts) {
    if (!post.shops || byId.has(post.shop_id)) continue;
    byId.set(post.shop_id, {
      id: post.shop_id,
      name: post.shops.name,
      address: post.shops.address,
      live: true,
    });
  }

  return Array.from(byId.values());
}

function previewImages(posts: VibePost[], limit = 4): string[] {
  const images: string[] = [];

  for (const post of posts) {
    const postImage = post.images?.find(
      (src) => src.startsWith("http") || src.startsWith("data:"),
    );
    if (postImage) {
      images.push(postImage);
      if (images.length >= limit) return images;
    }

    const cover = post.shops ? getShopCoverImages(post.shops)[0] : null;
    if (cover && !images.includes(cover)) {
      images.push(cover);
      if (images.length >= limit) return images;
    }
  }

  return images;
}

function MapExploreFallback({
  posts,
  filteredCount,
}: {
  posts: VibePost[];
  filteredCount: number;
}) {
  const images = previewImages(posts);
  const liveCount = new Set(posts.map((post) => post.shop_id)).size;

  return (
    <Link
      href="/map"
      className="group block overflow-hidden rounded-2xl border border-white/7 bg-[#111118] transition hover:border-[#ff3d00]/30"
    >
      <div className="relative h-[180px] overflow-hidden">
        {images.length > 0 ? (
          <div className="grid h-full grid-cols-2 grid-rows-2 gap-0.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="relative bg-[#18181f]">
                {images[index] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={images[index]}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-lg opacity-40">
                    🍻
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#1a0a00] via-[#111118] to-[#2d1200] px-4 text-center">
            <span className="text-3xl">🗺️</span>
            <p className="mt-2 text-xs text-[#9994a8]">今夜のお店を地図で探す</p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#080810]/90 via-[#080810]/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-[11px] font-bold text-[#eeeaf4]">
            🗺️ 地図で今夜のお店を探す
          </p>
          <p className="mt-0.5 text-[10px] text-[#9994a8]">
            {liveCount > 0
              ? `${liveCount}件が発信中 · ${filteredCount}件表示中`
              : `${filteredCount}件表示中`}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <span className="text-xs text-[#9994a8]">タップして地図を開く</span>
        <span className="text-[11px] font-bold text-[#ff3d00] group-hover:underline">
          地図で開く →
        </span>
      </div>
    </Link>
  );
}

export default function HomeMapPreview({
  posts,
  filteredCount,
  googleMapsApiKey,
}: HomeMapPreviewProps) {
  const [mapFailed, setMapFailed] = useState(false);
  const shops = useMemo(() => shopsFromPosts(posts), [posts]);
  const hasApiKey = googleMapsApiKey.length > 0;

  if (!hasApiKey || mapFailed || shops.length === 0) {
    return <MapExploreFallback posts={posts} filteredCount={filteredCount} />;
  }

  return (
    <Link
      href="/map"
      className="group block overflow-hidden rounded-2xl border border-white/7 bg-[#111118] transition hover:border-[#ff3d00]/30"
    >
      <div className="relative h-[180px] overflow-hidden">
        <GoogleMapView
          apiKey={googleMapsApiKey}
          shops={shops}
          preview
          className="pointer-events-none absolute inset-0 min-h-0"
          onLoadError={() => setMapFailed(true)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080810]/80 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
          <p className="text-[11px] font-bold text-white drop-shadow">
            地図でお店を探す
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <span className="text-xs text-[#9994a8]">{filteredCount}件表示中</span>
        <span className="text-[11px] font-bold text-[#ff3d00] group-hover:underline">
          地図で開く →
        </span>
      </div>
    </Link>
  );
}
