import type { VibePost } from "@/lib/home/types";
import {
  parseMazaruFromRow,
  type PostMazaruSettings,
} from "@/lib/guest-post/mazaruSettings";
import { buildMazaruDetailRows } from "@/lib/guest-post/mergeDetailContent";
import {
  resolvePostAuthorSocialContext,
  type MergeAttitude,
  type TonightSocialContext,
} from "@/lib/profile/tonightSocialContext";

type PostWithSocialSnap = VibePost & {
  author_merge_attitude?: string | null;
  author_vibe_scale?: string | null;
  author_tonight_social_mood?: string | null;
};

/** DB 上 mode が空でも details があれば合流詳細として扱う */
export function effectiveMazaruOnPost(
  post: PostWithSocialSnap,
): Pick<PostMazaruSettings, "mode" | "details"> {
  const parsed = parseMazaruFromRow(post);
  if (parsed.mode) return parsed;
  if (buildMazaruDetailRows(parsed.details).length > 0) {
    return { mode: "mazaru", details: parsed.details };
  }
  return parsed;
}

/** フィード表示用（自動算出の vibeScale は出さない） */
export function resolvePostFeedSocialContext(
  post: PostWithSocialSnap,
): TonightSocialContext {
  const mazaru = effectiveMazaruOnPost(post);

  let mergeAttitude: MergeAttitude | null = null;
  if (mazaru.mode === "mazaru") mergeAttitude = "open";
  else if (mazaru.mode === "mazaranai") mergeAttitude = "closed";
  else {
    mergeAttitude = resolvePostAuthorSocialContext({
      author_merge_attitude: post.author_merge_attitude,
      author_vibe_scale: post.author_vibe_scale,
      author_tonight_social_mood: post.author_tonight_social_mood,
    }).mergeAttitude;
  }

  return { mergeAttitude, vibeScale: null };
}

export function hasPostMergeDisplayContent(
  post: PostWithSocialSnap,
): boolean {
  const mazaru = effectiveMazaruOnPost(post);
  const social = resolvePostFeedSocialContext(post);
  if (mazaru.mode) return true;
  if (social.mergeAttitude) return true;
  if (buildMazaruDetailRows(mazaru.details).length > 0) return true;
  return false;
}