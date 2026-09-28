/** ゲスト投稿で表示するコメント（空文字は非表示） */
export function guestPostCommentText(
  comment: string | null | undefined,
): string | null {
  const trimmed = (comment ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}
