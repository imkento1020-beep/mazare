import type { PostMazaruSettings } from "@/lib/guest-post/mazaruSettings";
import { mazaruToSocialContext } from "@/lib/guest-post/mazaruSettings";
import type { TonightSocialContext, VibeScale } from "@/lib/profile/tonightSocialContext";
import type { VibePost } from "@/lib/home/types";
import { parseMazaruFromRow } from "@/lib/guest-post/mazaruSettings";
import { resolvePostAuthorSocialContext } from "@/lib/profile/tonightSocialContext";

export function partyCountToVibeScale(
  count: number | null | undefined,
): VibeScale | null {
  if (count == null || count < 1) return null;
  if (count === 1) return "solo";
  if (count <= 3) return "small";
  return "lively";
}

/** 投稿時のマザる設定と「誰と？」人数からプロフィール・スナップショット用2軸を組み立てる */
export function buildPostSocialContext(
  mazaru: PostMazaruSettings,
  partySize: number | null,
): TonightSocialContext {
  const base = mazaruToSocialContext(mazaru);
  const headcount =
    mazaru.mode === "mazaru" && mazaru.details.currentHeadcount != null
      ? mazaru.details.currentHeadcount
      : partySize;
  const vibe = partyCountToVibeScale(headcount) ?? partyCountToVibeScale(partySize);
  return {
    mergeAttitude: base.mergeAttitude,
    vibeScale: vibe ?? base.vibeScale,
  };
}

type PostContactFields = VibePost & {
  author_merge_attitude?: string | null;
  author_vibe_scale?: string | null;
  author_tonight_social_mood?: string | null;
};

/** 投稿者への連絡（マザる申請）を許可するか */
export function isPostOpenForContact(post: PostContactFields): boolean {
  const mazaru = parseMazaruFromRow(post);
  if (mazaru.mode === "mazaranai") return false;

  const ctx = resolvePostAuthorSocialContext({
    author_merge_attitude: post.author_merge_attitude,
    author_vibe_scale: post.author_vibe_scale,
    author_tonight_social_mood: post.author_tonight_social_mood,
  });
  if (ctx.mergeAttitude === "closed") return false;
  return true;
}
