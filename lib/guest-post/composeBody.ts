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
