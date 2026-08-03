import { supabase } from "@/lib/supabase";

const SESSION_PREFIX = "mazare:post-view:";

function sessionKey(postId: string) {
  return `${SESSION_PREFIX}${postId}`;
}

export function hasRecordedPostView(postId: string) {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(sessionKey(postId)) === "1";
}

function markPostViewRecorded(postId: string) {
  sessionStorage.setItem(sessionKey(postId), "1");
}

export async function recordPostView(postId: string) {
  if (!postId || hasRecordedPostView(postId)) return;

  markPostViewRecorded(postId);

  const { error } = await supabase.rpc("increment_vibe_post_view", {
    post_id: postId,
  });

  if (error) {
    sessionStorage.removeItem(sessionKey(postId));
    console.warn("Failed to record post view:", error.message);
  }
}
