import Link from "next/link";
import type { VibePost } from "@/lib/home/types";
import { FeedGlassIcon } from "@/components/icons/FeedActionIcons";

function gridThumb(post: VibePost): string | null {
  if (post.media_type === "video" && post.video_url) return null;
  const img = (post.images ?? []).find(
    (s) => s.startsWith("http") || s.startsWith("data:"),
  );
  return img ?? null;
}

type MyPostGridProps = {
  posts: VibePost[];
};

export default function MyPostGrid({ posts }: MyPostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#111118] px-6 py-12 text-center">
        <p className="text-sm font-bold text-[#eeeaf4]">まだ投稿がありません</p>
        <Link
          href="/post"
          className="mt-3 inline-block text-sm font-bold text-[#ff3d00]"
        >
          今夜の一杯を投稿 →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111118]">
      {posts.map((post) => {
        const thumb = gridThumb(post);
        const shopName = post.shops?.name ?? "お店";
        const href = `/post/edit/${post.id}`;

        return (
          <Link
            key={post.id}
            href={href}
            className="relative aspect-square overflow-hidden bg-[#18181f] transition hover:opacity-90"
          >
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumb}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : post.media_type === "video" && post.video_url ? (
              <div className="flex h-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#1a1520] to-[#111118] px-2 text-center">
                <span className="rounded-full bg-[#ff3d00]/20 px-2 py-0.5 text-[9px] font-bold text-[#ff3d00]">
                  VIDEO
                </span>
                <span className="line-clamp-2 text-[10px] font-bold text-[#9994a8]">
                  {shopName}
                </span>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-2 text-center">
                <FeedGlassIcon size={22} color="rgba(255,61,0,0.5)" />
                <span className="line-clamp-3 text-[10px] font-bold leading-snug text-[#eeeaf4]">
                  {shopName}
                </span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
