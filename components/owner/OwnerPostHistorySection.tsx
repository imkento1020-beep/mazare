"use client";

import Link from "next/link";
import { isPostScheduled } from "@/lib/home/dates";
import { formatPostedAt } from "@/lib/home/types";

export type OwnerPostHistoryItem = {
  id: string;
  comment: string;
  posted_at: string;
  images: string[] | null;
  interestCount: number;
  viewCount: number;
};

type OwnerPostHistorySectionProps = {
  posts: OwnerPostHistoryItem[];
  actionError?: string | null;
  deletingId?: string | null;
  confirmDeleteId?: string | null;
  onConfirmDelete?: (postId: string) => void;
  onCancelDelete?: () => void;
  onDelete?: (postId: string) => void;
};

export default function OwnerPostHistorySection({
  posts,
  actionError,
  deletingId,
  confirmDeleteId,
  onConfirmDelete,
  onCancelDelete,
  onDelete,
}: OwnerPostHistorySectionProps) {
  const canDelete = Boolean(onDelete && onConfirmDelete && onCancelDelete);

  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#5a5668]">
        過去の発信履歴
      </h2>
      {actionError && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {actionError}
        </p>
      )}
      <div className="mt-3 space-y-2">
        {posts.length === 0 ? (
          <p className="rounded-[14px] bg-[#111118] p-4 text-sm text-[#9994a8]">
            発信履歴はまだありません
          </p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="rounded-[14px] border border-white/7 bg-[#111118] p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs text-[#5a5668]">
                    {formatPostedAt(post.posted_at)}
                  </p>
                  {isPostScheduled(post.posted_at) && (
                    <span className="rounded-full bg-[#ffaa00]/15 px-2 py-0.5 text-[10px] font-bold text-[#ffaa00]">
                      予約中
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-bold text-[#ff3d00]">
                    {post.viewCount} 表示
                  </span>
                  <span className="text-xs font-bold text-[#00e87a]">
                    {post.interestCount} 行くかも
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-[#9994a8]">{post.comment}</p>
              {(post.images?.length ?? 0) > 0 && (
                <div className="mt-2 flex gap-1">
                  {post.images!.slice(0, 3).map((src, index) => (
                    <div
                      key={index}
                      className="h-10 w-10 overflow-hidden rounded-md bg-[#18181f]"
                    >
                      {src.startsWith("data:") || src.startsWith("http") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/owner/post/${post.id}/edit`}
                  className="rounded-lg border border-white/12 bg-[#18181f] px-3 py-1.5 text-xs font-semibold text-[#9994a8] transition hover:border-[#ff3d00]/30 hover:text-[#eeeaf4]"
                >
                  編集
                </Link>
                {canDelete &&
                  (confirmDeleteId === post.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onDelete!(post.id)}
                        disabled={deletingId === post.id}
                        className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-60"
                      >
                        {deletingId === post.id ? "削除中..." : "本当に削除"}
                      </button>
                      <button
                        type="button"
                        onClick={onCancelDelete}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#5a5668] transition hover:text-[#9994a8]"
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onConfirmDelete!(post.id)}
                      className="rounded-lg border border-white/12 bg-[#18181f] px-3 py-1.5 text-xs font-semibold text-[#9994a8] transition hover:border-red-500/30 hover:text-red-400"
                    >
                      削除
                    </button>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
