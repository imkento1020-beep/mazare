import { guestPostCommentText } from "@/lib/guest-post/guestComment";
import { normalizeHashtagInput } from "@/lib/guest-post/createPost";

export const GUEST_POST_BODY_MAX_LENGTH = 140;

const HASHTAG_IN_TEXT = /#([^\s#]+)/g;

/** 投稿・表示用：コメント欄に #タグ を含めた1本のテキスト */
export function formatGuestPostBodyForDisplay(
  comment: string | null | undefined,
  hashtags?: string[] | null,
): string {
  const text = (guestPostCommentText(comment) ?? "").trim();
  const tags = (hashtags ?? [])
    .map((tag) => normalizeHashtagInput(String(tag)))
    .filter(Boolean);

  if (tags.length === 0) return text;

  const missing = tags.filter((tag) => !text.includes(tag));
  if (missing.length === 0) return text;

  const suffix = missing.join(" ");
  return text ? `${text} ${suffix}`.trim() : suffix;
}

export function extractHashtagsFromBody(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const match of raw.matchAll(HASHTAG_IN_TEXT)) {
    const normalized = normalizeHashtagInput(`#${match[1]}`);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    tags.push(normalized);
  }

  return tags;
}

export function parseGuestPostBody(raw: string): {
  comment: string;
  hashtags: string[];
} {
  const comment = raw.trim().slice(0, GUEST_POST_BODY_MAX_LENGTH);
  return {
    comment,
    hashtags: extractHashtagsFromBody(comment),
  };
}

/** コメント本文の末尾にタグを追加（重複・140文字超過を避ける） */
export function appendHashtagToBody(current: string, tag: string): string {
  const normalized = normalizeHashtagInput(tag);
  if (!normalized) return current;

  if (extractHashtagsFromBody(current).includes(normalized)) {
    return current;
  }

  const base = current.trim();
  const next = base ? `${base} ${normalized}` : normalized;
  return next.slice(0, GUEST_POST_BODY_MAX_LENGTH);
}
