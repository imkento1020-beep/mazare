import { supabase } from "@/lib/supabase";
import { isMissingTableError } from "@/lib/supabase/errors";
import { notifyContactRequestCreated } from "@/lib/notifications/api";

export type ContactRequestStatus = "pending" | "accepted" | "declined";

export type ContactRequestRow = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  vibe_post_id: string;
  shop_id: string;
  message: string;
  status: ContactRequestStatus;
  created_at: string;
  responded_at: string | null;
  from_display_name?: string | null;
  shop_name?: string | null;
};

export async function createContactRequest(input: {
  fromUserId: string;
  toUserId: string;
  vibePostId: string;
  shopId: string;
  message: string;
}): Promise<{ id: string | null; error: string | null }> {
  const message = input.message.trim().slice(0, 280);
  if (!message) return { id: null, error: "メッセージを入力してください" };
  if (input.fromUserId === input.toUserId) {
    return { id: null, error: "自分の投稿には連絡できません" };
  }

  const { data, error } = await supabase
    .from("contact_requests")
    .insert({
      from_user_id: input.fromUserId,
      to_user_id: input.toUserId,
      vibe_post_id: input.vibePostId,
      shop_id: input.shopId,
      message,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error.message, "contact_requests")) {
      return {
        id: null,
        error:
          "連絡機能の準備ができていません。Supabase で contact-requests.sql を実行してください。",
      };
    }
    if (error.message.includes("duplicate") || error.code === "23505") {
      return { id: null, error: "この投稿にはすでに連絡済みです" };
    }
    return { id: null, error: error.message };
  }

  if (data?.id) {
    await notifyContactRequestCreated(data.id);
  }

  return { id: data?.id ?? null, error: null };
}

export async function fetchContactRequestCountsByPostIds(
  postIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (postIds.length === 0) return map;

  const { data, error } = await supabase
    .from("contact_requests")
    .select("vibe_post_id")
    .in("vibe_post_id", postIds);

  if (error) {
    if (isMissingTableError(error.message, "contact_requests")) return map;
    return map;
  }

  for (const id of postIds) map.set(id, 0);
  for (const row of data ?? []) {
    const pid = String(row.vibe_post_id);
    map.set(pid, (map.get(pid) ?? 0) + 1);
  }
  return map;
}

export async function fetchUserContactedPostIds(
  userId: string,
  postIds: string[],
): Promise<Set<string>> {
  const set = new Set<string>();
  if (!userId || postIds.length === 0) return set;

  const { data, error } = await supabase
    .from("contact_requests")
    .select("vibe_post_id")
    .eq("from_user_id", userId)
    .in("vibe_post_id", postIds);

  if (error) {
    if (isMissingTableError(error.message, "contact_requests")) return set;
    return set;
  }

  for (const row of data ?? []) {
    set.add(String(row.vibe_post_id));
  }
  return set;
}

export async function fetchIncomingContactRequests(
  userId: string,
  limit = 30,
): Promise<{ data: ContactRequestRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("contact_requests")
    .select(
      "id, from_user_id, to_user_id, vibe_post_id, shop_id, message, status, created_at, responded_at",
    )
    .eq("to_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTableError(error.message, "contact_requests")) {
      return { data: [], error: null };
    }
    return { data: [], error: error.message };
  }

  const rows = (data ?? []) as ContactRequestRow[];
  const fromIds = [...new Set(rows.map((r) => r.from_user_id))];
  const shopIds = [...new Set(rows.map((r) => r.shop_id))];

  const [profiles, shops] = await Promise.all([
    fromIds.length
      ? supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", fromIds)
      : Promise.resolve({ data: [] as { id: string; display_name: string | null }[] }),
    shopIds.length
      ? supabase.from("shops").select("id, name").in("id", shopIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const nameById = new Map(
    (profiles.data ?? []).map((p) => [p.id, p.display_name]),
  );
  const shopById = new Map((shops.data ?? []).map((s) => [s.id, s.name]));

  return {
    data: rows.map((r) => ({
      ...r,
      from_display_name: nameById.get(r.from_user_id) ?? null,
      shop_name: shopById.get(r.shop_id) ?? null,
    })),
    error: null,
  };
}

export async function respondToContactRequest(input: {
  requestId: string;
  recipientUserId: string;
  status: "accepted" | "declined";
}): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("contact_requests")
    .update({
      status: input.status,
      responded_at: new Date().toISOString(),
    })
    .eq("id", input.requestId)
    .eq("to_user_id", input.recipientUserId);

  if (error) {
    if (isMissingTableError(error.message, "contact_requests")) {
      return { error: "連絡機能が有効化されていません" };
    }
    return { error: error.message };
  }
  return { error: null };
}
