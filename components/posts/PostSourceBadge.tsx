import type { VibePost } from "@/lib/home/types";

export default function PostSourceBadge({
  post,
  className = "",
}: {
  post: Pick<VibePost, "is_guest_post">;
  className?: string;
}) {
  const guest = post.is_guest_post !== false;

  if (guest) {
    return (
      <span
        className={`inline-flex items-center rounded-md bg-[#111118] px-2 py-0.5 text-[10px] font-bold text-[#9994a8] ring-1 ring-white/10 ${className}`}
      >
        👤 来店者の投稿
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-md bg-[#ff3d00]/15 px-2 py-0.5 text-[10px] font-bold text-[#ff3d00] ${className}`}
    >
      🏮 お店からの発信
    </span>
  );
}
