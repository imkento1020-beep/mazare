"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import {
  formatGuestPostBodyForDisplay,
  GUEST_POST_BODY_MAX_LENGTH,
  parseGuestPostBody,
} from "@/lib/guest-post/composeBody";
import GuestPostMetaFields from "@/components/guest-post/GuestPostMetaFields";
import GuestPostComposePreview from "@/components/guest-post/GuestPostComposePreview";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";
import { ensureAnonymousSession } from "@/lib/auth/anonymous";
import {
  fetchGuestPostForEdit,
  nightOutInputFromPost,
  updateGuestVibePost,
} from "@/lib/guest-post/updatePost";
import type { NightOutInput } from "@/lib/guest-post/nightOut";
import type { VibePost } from "@/lib/home/types";
import { formatPostedAt } from "@/lib/home/types";

type EditPostPageClientProps = {
  postId: string;
};

export default function EditPostPageClient({ postId }: EditPostPageClientProps) {
  const router = useRouter();
  const { user, ready: authReady } = useAnonymousAuth();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<VibePost | null>(null);
  const [bodyText, setBodyText] = useState("");
  const [nightOut, setNightOut] = useState<NightOutInput>({
    stopNumber: null,
    drinkName: "",
    tonightTotalCups: null,
    partySize: null,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedBody = useMemo(() => parseGuestPostBody(bodyText), [bodyText]);

  useEffect(() => {
    if (!authReady) return;

    async function load() {
      let activeUser = user;
      if (!activeUser) {
        const session = await ensureAnonymousSession();
        activeUser = session.user;
      }

      if (!activeUser) {
        setError("ログインが必要です");
        setLoading(false);
        return;
      }

      const result = await fetchGuestPostForEdit(postId, activeUser.id);
      if (result.error || !result.data) {
        setError(result.error ?? "投稿が見つかりませんでした");
        setLoading(false);
        return;
      }

      setPost(result.data);
      setBodyText(
        formatGuestPostBodyForDisplay(
          result.data.comment,
          result.data.hashtags,
        ),
      );
      setNightOut(nightOutInputFromPost(result.data));
      setLoading(false);
    }

    void load();
  }, [authReady, postId, user]);

  async function handleSave() {
    if (!post) return;
    if (nightOut.stopNumber == null) {
      setError("今夜何軒目かを選んでください");
      return;
    }

    setSubmitting(true);
    setError(null);

    let activeUser = user;
    if (!activeUser) {
      const session = await ensureAnonymousSession();
      activeUser = session.user;
    }

    if (!activeUser) {
      setSubmitting(false);
      setError("ログインが必要です");
      return;
    }

    const replaceMedia = imageFiles.length > 0 || Boolean(videoFile);

    const { comment, hashtags } = parseGuestPostBody(bodyText);

    const result = await updateGuestVibePost({
      postId: post.id,
      userId: activeUser.id,
      hashtags,
      nightOut,
      comment,
      imageFiles: videoFile ? undefined : imageFiles,
      videoFile,
      replaceMedia,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.replace("/mypage#my-posts");
  }

  if (loading) return <LoadingScreen />;

  if (!post) {
    return (
      <div className="flex min-h-dvh flex-col bg-[#080810] text-[#eeeaf4]">
        <Header />
        <main className="mx-auto max-w-lg flex-1 px-4 py-12 text-center">
          <p className="text-sm text-[#9994a8]">{error ?? "投稿が見つかりませんでした"}</p>
          <Link href="/mypage" className="mt-4 inline-block text-sm font-bold text-[#ff3d00]">
            マイページへ
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const shopName = post.shops?.name ?? "お店";

  return (
    <div className="flex min-h-dvh flex-col bg-[#080810] pb-28 text-[#eeeaf4] md:pb-8">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <Link
          href="/mypage#my-posts"
          className="text-xs font-semibold text-[#9994a8] hover:text-[#ff3d00]"
        >
          ← マイページ
        </Link>
        <h1 className="mt-4 text-2xl font-black">投稿を編集</h1>
        <p className="mt-2 text-sm text-[#9994a8]">
          {shopName}
          {post.posted_at && (
            <span className="text-[#5a5668]"> · {formatPostedAt(post.posted_at)}</span>
          )}
        </p>

        <section className="mt-8 space-y-6">
          <div className="space-y-3 rounded-[16px] border border-white/10 bg-[#111118] p-5">
            <p className="text-sm font-bold text-[#9994a8]">写真・動画を差し替え（任意）</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={Boolean(videoFile)}
              onChange={(event) => {
                setVideoFile(null);
                setImageFiles(Array.from(event.target.files ?? []).slice(0, 3));
              }}
              className="block w-full text-xs text-[#9994a8]"
            />
            <input
              type="file"
              accept="video/mp4,video/quicktime"
              disabled={imageFiles.length > 0}
              onChange={(event) => {
                setImageFiles([]);
                setVideoFile(event.target.files?.[0] ?? null);
              }}
              className="block w-full text-xs text-[#9994a8]"
            />
          </div>

          <GuestPostMetaFields
            userId={user?.id ?? null}
            value={nightOut}
            onChange={setNightOut}
            suggestStopNumber={false}
            excludePostId={post.id}
          />

          <div className="space-y-3 rounded-[16px] border border-white/10 bg-[#111118] p-5">
            <label htmlFor="edit-guest-comment" className="text-sm font-black">
              コメント（140文字）
            </label>
            <textarea
              id="edit-guest-comment"
              value={bodyText}
              onChange={(event) => setBodyText(event.target.value)}
              maxLength={GUEST_POST_BODY_MAX_LENGTH}
              rows={4}
              placeholder="今夜のひとこと… #タグもこの欄に"
              className="w-full resize-none rounded-[12px] border border-white/10 bg-[#080810] px-4 py-3 text-sm leading-relaxed outline-none focus:border-[#ff3d00]/40"
            />
            <p className="text-[10px] text-[#5a5668]">
              #から始まるタグは自動でハッシュタグとして保存されます
            </p>
          </div>

          <GuestPostComposePreview
            imageFiles={imageFiles}
            videoFile={videoFile}
            nightOut={nightOut}
            comment={parsedBody.comment}
            hashtags={parsedBody.hashtags}
            shop={post.shops}
            existingPost={post}
          />

          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSave()}
            className="w-full rounded-[14px] bg-[#ff3d00] py-4 text-base font-black text-white disabled:opacity-60"
          >
            {submitting ? "保存中…" : "変更を保存"}
          </button>
        </section>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
