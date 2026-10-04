import Link from "next/link";
import type { LandingFeedPost } from "@/lib/landing/fetchLandingPosts";

type LandingPostCardProps = {
  post: LandingFeedPost;
};

export default function LandingPostCard({ post }: LandingPostCardProps) {
  const hasMedia = Boolean(post.videoUrl || post.imageUrl);

  return (
    <Link
      href="/home"
      className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-[#111118]"
    >
      {post.videoUrl ? (
        <video
          src={post.videoUrl}
          className="absolute inset-0 h-full w-full object-cover"
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
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <span className="text-sm font-bold text-[#9994a8]">{post.shopName}</span>
        </div>
      )}

      {hasMedia && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 50%, rgba(8,8,16,0.9) 100%)",
          }}
        />
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-xs font-bold text-[#eeeaf4]">{post.shopName}</p>
        <p className="mt-0.5 text-[11px] text-[#9994a8]">{post.area}</p>
        <p className="mt-1 text-[11px] text-[#eeeaf4]">
          👋 {post.interestCount}
        </p>
      </div>
    </Link>
  );
}
