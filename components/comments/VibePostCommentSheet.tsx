"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";
import { ensureAnonymousSession } from "@/lib/auth/anonymous";
import {
  fetchCommentsForPost,
  insertComment,
} from "@/lib/comments/api";
import type { VibePostComment } from "@/lib/comments/types";
import { formatPostedAt } from "@/lib/home/types";
import {
  getLoginPathWithReturn,
  getFormalSignupPathWithReturn,
} from "@/lib/auth/authPaths";

type VibePostCommentSheetProps = {
  vibePostId: string;
  open: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
};

function authorInitial(name: string) {
  return (name.trim().charAt(0) || "ゲ").toUpperCase();
}

function CommentAvatar({
  name,
  imageUrl,
  sizeClass,
}: {
  name: string;
  imageUrl: string | null;
  sizeClass: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#ff3d00] text-[10px] font-extrabold text-white`}
    >
      {authorInitial(name)}
    </span>
  );
}

export default function VibePostCommentSheet({
  vibePostId,
  open,
  onClose,
  onCountChange,
}: VibePostCommentSheetProps) {
  const pathname = usePathname();
  const { user, ready: authReady } = useAnonymousAuth();
  const [comments, setComments] = useState<VibePostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [viewerName, setViewerName] = useState("ゲスト");
  const listEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  const applyComments = useCallback(
    (next: VibePostComment[]) => {
      setComments(next);
      onCountChange?.(next.length);
    },
    [onCountChange],
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const result = await fetchCommentsForPost(vibePostId);
      if (cancelled) return;
      if (result.error) setError(result.error);
      applyComments(result.data);
      setLoading(false);
      scrollToBottom();
    }

    void load();

    const channel = supabase
      .channel(`comments-${vibePostId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `vibe_post_id=eq.${vibePostId}`,
        },
        () => {
          void fetchCommentsForPost(vibePostId).then((result) => {
            if (!result.error) applyComments(result.data);
            scrollToBottom();
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [open, vibePostId, applyComments, scrollToBottom]);

  useEffect(() => {
    if (!open || !authReady) return;

    async function resolveViewer() {
      let activeUser = user;
      if (!activeUser) {
        const session = await ensureAnonymousSession();
        activeUser = session.user;
      }
      if (!activeUser) return;

      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", activeUser.id)
        .maybeSingle();

      const name =
        typeof data?.display_name === "string" && data.display_name.trim()
          ? data.display_name.trim()
          : "ゲスト";
      setViewerName(name);
    }

    void resolveViewer();
  }, [open, authReady, user]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleSubmit() {
    if (!draft.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    let activeUser = user;
    if (!activeUser) {
      const session = await ensureAnonymousSession();
      activeUser = session.user;
    }

    if (!activeUser) {
      setSubmitting(false);
      return;
    }

    const result = await insertComment({
      vibePostId,
      userId: activeUser.id,
      content: draft,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setDraft("");
    if (result.data) {
      setComments((prev) => {
        if (prev.some((c) => c.id === result.data!.id)) return prev;
        const next = [...prev, result.data!];
        onCountChange?.(next.length);
        return next;
      });
      scrollToBottom();
    }
  }

  if (!open) return null;

  const returnPath = pathname || "/home";
  const loginHref = getLoginPathWithReturn(returnPath);
  const signupHref = getFormalSignupPathWithReturn(returnPath);
  const canComment = Boolean(user);

  return (
    <div className="fixed inset-0 z-[110] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="閉じる"
        onClick={onClose}
      />

      <div
        className="relative flex h-[70vh] w-full flex-col rounded-t-[16px] bg-[#111118] shadow-[0_-8px_40px_rgba(0,0,0,0.5)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="comment-sheet-title"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-4 py-3">
          <h2
            id="comment-sheet-title"
            className="text-sm font-bold text-[#eeeaf4]"
          >
            💬 コメント
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-[#9994a8] transition hover:bg-white/10 hover:text-[#eeeaf4]"
            aria-label="閉じる"
          >
            ×
          </button>
        </header>

        <div
          ref={listRef}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
        >
          {loading && (
            <p className="text-center text-sm text-[#9994a8]">読み込み中…</p>
          )}

          {!loading && comments.length === 0 && (
            <p className="py-12 text-center text-sm text-[#9994a8]">
              まだコメントがありません。最初のコメントを書いてみよう！
            </p>
          )}

          <ul className="space-y-4">
            {comments.map((item) => (
              <li key={item.id} className="flex gap-3">
                <CommentAvatar
                  name={item.author_display_name}
                  imageUrl={item.author_profile_image}
                  sizeClass="h-7 w-7"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs font-semibold text-[#eeeaf4]">
                      {item.author_display_name}
                    </span>
                    <span className="text-[10px] text-[#9994a8]">
                      {formatPostedAt(item.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-normal text-[#eeeaf4]">
                    {item.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div ref={listEndRef} />
        </div>

        {error && (
          <p className="shrink-0 px-4 pb-2 text-xs text-red-400">{error}</p>
        )}

        <footer className="shrink-0 border-t border-white/[0.07] px-4 py-3">
          {!canComment && authReady ? (
            <div className="rounded-[12px] bg-[#18181f] px-4 py-4 text-center">
              <p className="text-sm text-[#9994a8]">
                コメントするにはログインが必要です
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link
                  href={loginHref}
                  className="rounded-[12px] bg-[#ff3d00] px-4 py-2.5 text-sm font-bold text-white"
                >
                  ログイン
                </Link>
                <Link
                  href={signupHref}
                  className="rounded-[12px] border border-white/12 px-4 py-2.5 text-sm font-bold text-[#eeeaf4]"
                >
                  新規登録
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CommentAvatar
                name={viewerName}
                imageUrl={null}
                sizeClass="h-6 w-6"
              />
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 140))}
                placeholder="コメントを書く..."
                maxLength={140}
                disabled={!canComment || submitting}
                className="min-w-0 flex-1 rounded-[20px] border border-white/[0.12] bg-[#18181f] px-4 py-2.5 text-sm text-[#eeeaf4] outline-none placeholder:text-[#5a5668] focus:border-[#ff3d00]/40"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
              />
              <button
                type="button"
                disabled={!draft.trim() || submitting || !canComment}
                onClick={() => void handleSubmit()}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  draft.trim()
                    ? "bg-[#ff3d00] text-white"
                    : "bg-[#18181f] text-[#5a5668]"
                } disabled:opacity-60`}
              >
                送信
              </button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
