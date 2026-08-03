import { supabase } from "@/lib/supabase";
import { getTonightWindowJST } from "@/lib/home/dates";
import {
  isMissingTableError,
  missingTableMessage,
} from "@/lib/supabase/errors";

export type ShopCheckin = {
  id: string;
  user_id: string;
  shop_id: string;
  vibe_post_id: string | null;
  created_at: string;
};

export type TonightCheckinVisitor = {
  id: string;
  name: string;
  time: string;
  viaMazare: boolean;
};

function displayNameFromProfile(
  userId: string,
  profile?: { display_name?: string | null } | null,
) {
  const name = profile?.display_name?.trim();
  if (name) return name;
  return `ゲスト${userId.slice(0, 4).toUpperCase()}`;
}

export async function createShopCheckin(input: {
  userId: string;
  shopId: string;
  vibePostId?: string | null;
}): Promise<{ data: ShopCheckin | null; error: string | null }> {
  const { data, error } = await supabase
    .from("shop_checkins")
    .insert({
      user_id: input.userId,
      shop_id: input.shopId,
      vibe_post_id: input.vibePostId ?? null,
    })
    .select("id, user_id, shop_id, vibe_post_id, created_at")
    .single();

  if (error) {
    if (isMissingTableError(error.message, "shop_checkins")) {
      return { data: null, error: missingTableMessage("shop_checkins") };
    }
    return { data: null, error: error.message };
  }

  return { data: data as ShopCheckin, error: null };
}

export async function hasCheckedInTonight(
  userId: string,
  shopId: string,
): Promise<boolean> {
  const { start, end } = getTonightWindowJST();

  const { data, error } = await supabase
    .from("shop_checkins")
    .select("id")
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .limit(1);

  if (error) {
    if (isMissingTableError(error.message, "shop_checkins")) return false;
    return false;
  }

  return (data?.length ?? 0) > 0;
}

export async function countShopCheckinsTonight(shopId: string): Promise<number> {
  const { start, end } = getTonightWindowJST();

  const { count, error } = await supabase
    .from("shop_checkins")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shopId)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());

  if (error) {
    if (isMissingTableError(error.message, "shop_checkins")) return 0;
    return 0;
  }

  return count ?? 0;
}

export async function countUserVisitedShops(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("shop_checkins")
    .select("shop_id")
    .eq("user_id", userId);

  if (error) {
    if (isMissingTableError(error.message, "shop_checkins")) return 0;
    return 0;
  }

  return new Set((data ?? []).map((row) => row.shop_id)).size;
}

export async function fetchShopTonightCheckins(
  shopId: string,
  limit = 8,
): Promise<{ data: TonightCheckinVisitor[]; error: string | null }> {
  const { start, end } = getTonightWindowJST();

  const { data, error } = await supabase
    .from("shop_checkins")
    .select("id, user_id, created_at")
    .eq("shop_id", shopId)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTableError(error.message, "shop_checkins")) {
      return { data: [], error: missingTableMessage("shop_checkins") };
    }
    return { data: [], error: error.message };
  }

  const userIds = [...new Set((data ?? []).map((row) => row.user_id))];
  let profileMap = new Map<string, { display_name?: string | null }>();

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);

    profileMap = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile]),
    );
  }

  const visitors = (data ?? []).map((row) => ({
    id: row.id,
    name: displayNameFromProfile(row.user_id, profileMap.get(row.user_id)),
    time: new Date(row.created_at).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    viaMazare: true,
  }));

  return { data: visitors, error: null };
}
