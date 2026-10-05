import Link from "next/link";
import type { LandingFeedPost } from "@/lib/landing/fetchLandingPosts";

type LandingPostCardProps = {
  post: LandingFeedPost;
  className?: string;
  href?: string;
  priorityImage?: boolean;
};

export default function LandingPostCard({
  post,
  className = "",
  href = "/home",
  priorityImage = false,
}: LandingPostCardProps) {
  const hasMedia = Boolean(post.videoUrl || post.imageUrl);

  return (
    <Link
      href={href}
      className={`group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111118] transition duration-200 hover:border-[#ff3d00]/40 ${className}`}
    >
      {post.videoUrl ? (
        <video
          src={post.videoUrl}
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          muted
          playsInline
          autoPlay
          loop
          preload="metadata"
        />
      ) : post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading={priorityImage ? "eager" : "lazy"}
          fetchPriority={priorityImage ? "high" : undefined}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <span className="text-sm font-bold text-[#9994a8]">{post.shopName}</span>
        </div>
      )}

      <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[#080810]/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#ff3d00] backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff3d00]" aria-hidden />
        Live
      </span>

      {hasMedia && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 45%, rgba(8,8,16,0.92) 100%)",
          }}
        />
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="truncate text-xs font-bold text-[#eeeaf4]">{post.shopName}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-[11px] text-[#9994a8]">{post.area}</p>
          <p className="shrink-0 text-[11px] font-semibold text-[#ffaa00]">
            行くかも {post.interestCount}
          </p>
        </div>
      </div>
    </Link>
  );
}
