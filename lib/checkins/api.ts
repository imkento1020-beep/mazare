import { supabase } from "@/lib/supabase";
import {
  isMissingTableError,
  missingTableMessage,
} from "@/lib/supabase/errors";

export type Checkin = {
  id: string;
  user_id: string;
  shop_id: string;
  checked_in_at: string;
  expires_at: string;
};

export type CheckinUser = {
  userId: string;
  profileImage: string | null;
};

export type TonightCheckinVisitor = {
  id: string;
  name: string;
  time: string;
  viaMazare: boolean;
};

function nowIso() {
  return new Date().toISOString();
}

function displayNameFromProfile(
  userId: string,
  profile?: { display_name?: string | null } | null,
) {
  const name = profile?.display_name?.trim();
  if (name) return name;
  return `ゲスト${userId.slice(0, 4).toUpperCase()}`;
}

export async function createCheckin(input: {
  userId: string;
  shopId: string;
}): Promise<{ data: Checkin | null; error: string | null }> {
  const { data, error } = await supabase
    .from("checkins")
    .insert({
      user_id: input.userId,
      shop_id: input.shopId,
    })
    .select("id, user_id, shop_id, checked_in_at, expires_at")
    .single();

  if (error) {
    if (isMissingTableError(error.message, "checkins")) {
      return { data: null, error: missingTableMessage("checkins") };
    }
    return { data: null, error: error.message };
  }

  return { data: data as Checkin, error: null };
}

export async function checkout(input: {
  userId: string;
  shopId: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("checkins")
    .delete()
    .eq("user_id", input.userId)
    .eq("shop_id", input.shopId)
    .gt("expires_at", nowIso());

  if (error) {
    if (isMissingTableError(error.message, "checkins")) {
      return { error: missingTableMessage("checkins") };
    }
    return { error: error.message };
  }

  return { error: null };
}

export async function hasActiveCheckin(
  userId: string,
  shopId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("checkins")
    .select("id")
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .gt("expires_at", nowIso())
    .limit(1);

  if (error) {
    if (isMissingTableError(error.message, "checkins")) return false;
    return false;
  }

  return (data?.length ?? 0) > 0;
}

export async function countActiveCheckins(shopId: string): Promise<number> {
  const { count, error } = await supabase
    .from("checkins")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shopId)
    .gt("expires_at", nowIso());

  if (error) {
    if (isMissingTableError(error.message, "checkins")) return 0;
    return 0;
  }

  return count ?? 0;
}

export async function countUserVisitedShops(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("checkins")
    .select("shop_id")
    .eq("user_id", userId);

  if (error) {
    if (isMissingTableError(error.message, "checkins")) return 0;
    return 0;
  }

  return new Set((data ?? []).map((row) => row.shop_id)).size;
}

async function fetchProfilesForUsers(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, { display_name?: string | null; profile_image?: string | null }>();

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, profile_image")
    .in("id", userIds);

  return new Map((data ?? []).map((profile) => [profile.id, profile]));
}

export async function fetchActiveCheckinUsersForShop(
  shopId: string,
): Promise<{ data: CheckinUser[]; error: string | null }> {
  const { data, error } = await supabase
    .from("checkins")
    .select("user_id")
    .eq("shop_id", shopId)
    .gt("expires_at", nowIso())
    .order("checked_in_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message, "checkins")) {
      return { data: [], error: null };
    }
    return { data: [], error: error.message };
  }

  const userIds = [...new Set((data ?? []).map((row) => row.user_id))];
  const profileMap = await fetchProfilesForUsers(userIds);

  return {
    data: userIds.map((userId) => ({
      userId,
      profileImage: profileMap.get(userId)?.profile_image ?? null,
    })),
    error: null,
  };
}

export async function fetchActiveCheckinUsersByShopIds(
  shopIds: string[],
): Promise<Map<string, CheckinUser[]>> {
  const result = new Map<string, CheckinUser[]>();
  if (shopIds.length === 0) return result;

  const { data, error } = await supabase
    .from("checkins")
    .select("shop_id, user_id")
    .in("shop_id", shopIds)
    .gt("expires_at", nowIso())
    .order("checked_in_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message, "checkins")) return result;
    return result;
  }

  const userIds = [...new Set((data ?? []).map((row) => row.user_id))];
  const profileMap = await fetchProfilesForUsers(userIds);

  for (const shopId of shopIds) {
    result.set(shopId, []);
  }

  const seenByShop = new Map<string, Set<string>>();

  for (const row of data ?? []) {
    const seen = seenByShop.get(row.shop_id) ?? new Set<string>();
    if (seen.has(row.user_id)) continue;
    seen.add(row.user_id);
    seenByShop.set(row.shop_id, seen);

    const users = result.get(row.shop_id) ?? [];
    users.push({
      userId: row.user_id,
      profileImage: profileMap.get(row.user_id)?.profile_image ?? null,
    });
    result.set(row.shop_id, users);
  }

  return result;
}

export async function fetchShopTonightCheckins(
  shopId: string,
  limit = 8,
): Promise<{ data: TonightCheckinVisitor[]; error: string | null }> {
  const { data, error } = await supabase
    .from("checkins")
    .select("id, user_id, checked_in_at")
    .eq("shop_id", shopId)
    .gt("expires_at", nowIso())
    .order("checked_in_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTableError(error.message, "checkins")) {
      return { data: [], error: missingTableMessage("checkins") };
    }
    return { data: [], error: error.message };
  }

  const userIds = [...new Set((data ?? []).map((row) => row.user_id))];
  const profileMap = await fetchProfilesForUsers(userIds);

  const visitors = (data ?? []).map((row) => ({
    id: row.id,
    name: displayNameFromProfile(row.user_id, profileMap.get(row.user_id)),
    time: new Date(row.checked_in_at).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    viaMazare: true,
  }));

  return { data: visitors, error: null };
}

/** @deprecated createCheckin を使用 */
export async function createShopCheckin(input: {
  userId: string;
  shopId: string;
  vibePostId?: string | null;
}) {
  return createCheckin({ userId: input.userId, shopId: input.shopId });
}

/** @deprecated hasActiveCheckin を使用 */
export async function hasCheckedInTonight(userId: string, shopId: string) {
  return hasActiveCheckin(userId, shopId);
}

/** @deprecated countActiveCheckins を使用 */
export async function countShopCheckinsTonight(shopId: string) {
  return countActiveCheckins(shopId);
}
