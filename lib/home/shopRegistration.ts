import type { VibePost } from "./types";

export const SHOP_REGISTRATION_COMMENT = "お店を登録しました";

export function isShopRegistrationPost(
  post: Pick<VibePost, "comment">,
): boolean {
  return post.comment.trim() === SHOP_REGISTRATION_COMMENT;
}

export function excludeShopRegistrationPosts<T extends Pick<VibePost, "comment">>(
  posts: T[],
): T[] {
  return posts.filter((post) => !isShopRegistrationPost(post));
}
