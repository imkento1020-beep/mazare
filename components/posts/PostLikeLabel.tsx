import { PostLikeIcon } from "@/components/icons/FeedActionIcons";

type PostLikeLabelProps = {
  liked: boolean;
  loading?: boolean;
};

/** 投稿への「いいね」 */
export default function PostLikeLabel({ liked, loading = false }: PostLikeLabelProps) {
  if (loading) {
    return <>送信中...</>;
  }

  return (
    <span className="inline-flex items-center justify-center gap-2">
      <PostLikeIcon size={18} filled={liked} color={liked ? "#ff3d00" : "currentColor"} />
      {liked ? "いいね済み" : "いいね"}
    </span>
  );
}
