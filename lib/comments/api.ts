import { supabase } from "@/lib/supabase";
import {
  isMissingTableError,
  missingTableMessage,
} from "@/lib/supabase/errors";
import type { VibePostComment } from "./types";

function mapCommentRow(row: Record<string, unknown>): VibePostComment {
  const profileRaw = row.profiles;
  const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;
  const profileObj =
    profile && typeof profile === "object"
      ? (profile as Record<string, unknown>)
      : null;

  const displayName =
    typeof profileObj?.display_name === "string" &&
    profileObj.display_name.trim()
      ? profileObj.display_name.trim()
      : "ゲスト";

  return {
    id: String(row.id),
    vibe_post_id: String(row.vibe_post_id),
    user_id: String(row.user_id),
    content: String(row.content),
    created_at: String(row.created_at),
    author_display_name: displayName,
    author_profile_image:
      typeof profileObj?.profile_image === "string"
        ? profileObj.profile_image
        : null,
  };
}

const COMMENT_SELECT = `
  id,
  vibe_post_id,
  user_id,
  content,
  created_at,
  profiles ( display_name, profile_image )
`;

export async function fetchCommentsForPost(vibePostId: string): Promise<{
  data: VibePostComment[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("comments")
    .select(COMMENT_SELECT)
    .eq("vibe_post_id", vibePostId)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error.message, "comments")) {
      return { data: [], error: missingTableMessage("comments") };
    }
    return { data: [], error: error.message };
  }

  return {
    data: (data ?? []).map((row) =>
      mapCommentRow(row as Record<string, unknown>),
    ),
    error: null,
  };
}

export async function insertComment(input: {
  vibePostId: string;
  userId: string;
  content: string;
}): Promise<{ data: VibePostComment | null; error: string | null }> {
  const trimmed = input.content.trim().slice(0, 140);
  if (!trimmed) {
    return { data: null, error: "コメントを入力してください" };
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      vibe_post_id: input.vibePostId,
      user_id: input.userId,
      content: trimmed,
    })
    .select(COMMENT_SELECT)
    .single();

  if (error) {
    if (isMissingTableError(error.message, "comments")) {
      return { data: null, error: missingTableMessage("comments") };
    }
    return { data: null, error: error.message };
  }

  return {
    data: mapCommentRow(data as Record<string, unknown>),
    error: null,
  };
}

export async function fetchCommentCountsByPostIds(
  postIds: string[],
): Promise<Map<string, number>> {
  const ids = [...new Set(postIds.filter(Boolean))];
  const map = new Map<string, number>();
  if (ids.length === 0) return map;

  const { data, error } = await supabase
    .from("comments")
    .select("vibe_post_id")
    .in("vibe_post_id", ids);

  if (error) return map;

  for (const row of data ?? []) {
    const id = row.vibe_post_id as string;
    map.set(id, (map.get(id) ?? 0) + 1);
  }

  return map;
}
