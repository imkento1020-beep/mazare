import { supabase } from "@/lib/supabase";
import {
  isMissingTableError,
  missingTableMessage,
} from "@/lib/supabase/errors";
import type { Notification } from "./types";

function mapNotification(row: Notification): Notification {
  return {
    ...row,
    metadata:
      row.metadata && typeof row.metadata === "object" ? row.metadata : {},
  };
}

export async function fetchNotifications(limit = 30): Promise<{
  data: Notification[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, type, title, body, href, metadata, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTableError(error.message, "notifications")) {
      return { data: [], error: missingTableMessage("notifications") };
    }
    return { data: [], error: error.message };
  }

  return { data: (data ?? []).map(mapNotification), error: null };
}

export async function fetchUnreadNotificationCount(): Promise<{
  count: number;
  error: string | null;
}> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);

  if (error) {
    if (isMissingTableError(error.message, "notifications")) {
      return { count: 0, error: null };
    }
    return { count: 0, error: error.message };
  }

  return { count: count ?? 0, error: null };
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function markAllNotificationsRead() {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);

  if (error) return { error: error.message };
  return { error: null };
}

async function callNotifyRpc(
  fn: string,
  params: Record<string, string>,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc(fn, params);

  if (!error) return { error: null };

  if (isMissingTableError(error.message, "notifications")) {
    return { error: null };
  }

  if (
    error.message.includes("Could not find the function") ||
    error.message.includes("schema cache")
  ) {
    return { error: null };
  }

  console.warn(`Notification RPC ${fn} failed:`, error.message);
  return { error: null };
}

export async function notifyShopPostCreated(postId: string) {
  return callNotifyRpc("notify_shop_post_created", { p_post_id: postId });
}

export async function notifyPostInterestCreated(interestId: string) {
  return callNotifyRpc("notify_post_interest_created", {
    p_interest_id: interestId,
  });
}

export async function notifyShopFavoritedCreated(favoriteId: string) {
  return callNotifyRpc("notify_shop_favorited_created", {
    p_favorite_id: favoriteId,
  });
}

export async function notifyStaffInviteCreated(inviteId: string) {
  return callNotifyRpc("notify_staff_invite_created", {
    p_invite_id: inviteId,
  });
}

export async function syncPendingStaffInviteNotifications(): Promise<{
  created: number;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc(
    "sync_pending_staff_invite_notifications",
  );

  if (!error) {
    return { created: typeof data === "number" ? data : 0, error: null };
  }

  if (isMissingTableError(error.message, "notifications")) {
    return { created: 0, error: null };
  }

  if (
    error.message.includes("Could not find the function") ||
    error.message.includes("schema cache") ||
    isMissingTableError(error.message, "shop_staff_invites")
  ) {
    return { created: 0, error: null };
  }

  console.warn(
    "Notification RPC sync_pending_staff_invite_notifications failed:",
    error.message,
  );
  return { created: 0, error: null };
}
