import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  getUserRoles,
  mergeRoles,
  rolesToMetadata,
} from "@/lib/auth/roles";
import {
  isMissingTableError,
  missingTableMessage,
} from "@/lib/supabase/errors";

export type StaffInvite = {
  id: string;
  shop_id: string;
  email: string;
  status: "pending" | "accepted" | "revoked";
  created_at: string;
  accepted_at: string | null;
  shops?: { name: string } | null;
};

export type StaffMember = {
  userId: string;
  label: string;
  source: "owner" | "staff";
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createStaffInvite(input: {
  shopId: string;
  ownerId: string;
  email: string;
}): Promise<{ error: string | null }> {
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) {
    return { error: "有効なメールアドレスを入力してください" };
  }

  const { error } = await supabase.from("shop_staff_invites").insert({
    shop_id: input.shopId,
    email,
    invited_by: input.ownerId,
    status: "pending",
  });

  if (error) {
    if (isMissingTableError(error.message, "shop_staff_invites")) {
      return { error: missingTableMessage("shop_staff_invites") };
    }
    if (error.message.includes("duplicate") || error.code === "23505") {
      return { error: "このメールアドレスには既に招待を送信済みです" };
    }
    return { error: error.message };
  }

  return { error: null };
}

export async function fetchShopStaffInvites(shopId: string): Promise<{
  data: StaffInvite[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("shop_staff_invites")
    .select("id, shop_id, email, status, created_at, accepted_at")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message, "shop_staff_invites")) {
      return { data: [], error: missingTableMessage("shop_staff_invites") };
    }
    return { data: [], error: error.message };
  }

  return { data: (data ?? []) as StaffInvite[], error: null };
}

export async function revokeStaffInvite(
  inviteId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("shop_staff_invites")
    .update({ status: "revoked" })
    .eq("id", inviteId)
    .eq("status", "pending");

  if (error) {
    if (isMissingTableError(error.message, "shop_staff_invites")) {
      return { error: missingTableMessage("shop_staff_invites") };
    }
    return { error: error.message };
  }

  return { error: null };
}

export async function fetchPendingInvitesForEmail(email: string): Promise<{
  data: StaffInvite[];
  error: string | null;
}> {
  const normalized = normalizeEmail(email);
  if (!normalized) return { data: [], error: null };

  const { data, error } = await supabase
    .from("shop_staff_invites")
    .select("id, shop_id, email, status, created_at, accepted_at, shops(name)")
    .eq("status", "pending")
    .ilike("email", normalized)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message, "shop_staff_invites")) {
      return { data: [], error: null };
    }
    return { data: [], error: error.message };
  }

  const rows = (data ?? []).map((row) => {
    const shop = Array.isArray(row.shops) ? row.shops[0] : row.shops;
    return {
      id: row.id,
      shop_id: row.shop_id,
      email: row.email,
      status: row.status as StaffInvite["status"],
      created_at: row.created_at,
      accepted_at: row.accepted_at,
      shops: shop ? { name: shop.name } : null,
    };
  });

  return { data: rows, error: null };
}

export async function acceptStaffInvite(
  inviteId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("accept_staff_invite", {
    p_invite_id: inviteId,
  });

  if (error) {
    if (
      error.message.includes("Could not find the function") ||
      error.message.includes("schema cache")
    ) {
      return {
        error:
          "スタッフ招待機能の DB 設定が未完了です。supabase/checkins-staff.sql を実行してください。",
      };
    }
    return { error: error.message };
  }

  return { error: null };
}

export async function acceptStaffInviteWithRole(
  inviteId: string,
  user: User,
): Promise<{ error: string | null }> {
  const { error } = await acceptStaffInvite(inviteId);
  if (error) return { error };

  const roles = mergeRoles(getUserRoles(user), ["owner"]);
  const { error: authError } = await supabase.auth.updateUser({
    data: rolesToMetadata(roles),
  });

  if (authError) return { error: authError.message };
  return { error: null };
}

export async function removeStaffMember(input: {
  shopId: string;
  staffUserId: string;
  currentStaffIds: string[];
}): Promise<{ staffIds: string[]; error: string | null }> {
  const staffIds = input.currentStaffIds.filter((id) => id !== input.staffUserId);

  const { error } = await supabase
    .from("shops")
    .update({ staff_ids: staffIds })
    .eq("id", input.shopId);

  if (error) return { staffIds: input.currentStaffIds, error: error.message };
  return { staffIds, error: null };
}

export function buildStaffMembers(
  shop: { owner_id?: string | null; staff_ids?: string[] | null },
  ownerEmail?: string | null,
): StaffMember[] {
  const members: StaffMember[] = [];

  if (shop.owner_id) {
    members.push({
      userId: shop.owner_id,
      label: ownerEmail ? `${ownerEmail}（オーナー）` : "オーナー",
      source: "owner",
    });
  }

  for (const staffId of shop.staff_ids ?? []) {
    if (staffId === shop.owner_id) continue;
    members.push({
      userId: staffId,
      label: `スタッフ (${staffId.slice(0, 8)}…)`,
      source: "staff",
    });
  }

  return members;
}
