import type { VibePost } from "./types";

export const SHOP_REGISTRATION_COMMENT = "お店を登録しました";

function normalizeRegistrationComment(comment: string) {
  return comment.trim().replace(/[。．.!！\s]+$/u, "");
}

export function isShopRegistrationPost(
  post: Pick<VibePost, "comment">,
): boolean {
  const normalized = normalizeRegistrationComment(post.comment);
  return (
    normalized === SHOP_REGISTRATION_COMMENT ||
    normalized.startsWith(SHOP_REGISTRATION_COMMENT)
  );
}

export function excludeShopRegistrationPosts<T extends Pick<VibePost, "comment">>(
  posts: T[],
): T[] {
  return posts.filter((post) => !isShopRegistrationPost(post));
}
