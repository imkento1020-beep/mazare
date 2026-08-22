import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type StaffInvitePreview = {
  id: string;
  email: string;
  status: "pending" | "accepted" | "revoked";
  shopName: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function fetchStaffInvitePreview(
  inviteId: string,
): Promise<{ data: StaffInvitePreview | null; error: string | null }> {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("shop_staff_invites")
      .select("id, email, status, shops(name)")
      .eq("id", inviteId)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "招待が見つかりません" };
    }

    const shop = Array.isArray(data.shops) ? data.shops[0] : data.shops;

    return {
      data: {
        id: data.id,
        email: data.email,
        status: data.status as StaffInvitePreview["status"],
        shopName: shop?.name ?? "お店",
      },
      error: null,
    };
  } catch {
    return {
      data: null,
      error: "サーバー設定が不完全です。SUPABASE_SERVICE_ROLE_KEY を確認してください。",
    };
  }
}

export async function createStaffInviteRecord(input: {
  shopId: string;
  ownerId: string;
  email: string;
}): Promise<{
  inviteId: string | null;
  shopName: string | null;
  error: string | null;
}> {
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) {
    return { inviteId: null, shopName: null, error: "有効なメールアドレスを入力してください" };
  }

  try {
    const admin = createSupabaseAdminClient();

    const { data: shop, error: shopError } = await admin
      .from("shops")
      .select("id, name, owner_id")
      .eq("id", input.shopId)
      .maybeSingle();

    if (shopError) {
      return { inviteId: null, shopName: null, error: shopError.message };
    }

    if (!shop || shop.owner_id !== input.ownerId) {
      return { inviteId: null, shopName: null, error: "この店舗を管理する権限がありません" };
    }

    const { data: existingInvite } = await admin
      .from("shop_staff_invites")
      .select("id, status")
      .eq("shop_id", input.shopId)
      .ilike("email", email)
      .maybeSingle();

    if (existingInvite?.status === "accepted") {
      return {
        inviteId: null,
        shopName: null,
        error: "このメールアドレスは既にスタッフとして参加済みです",
      };
    }

    let inviteId = existingInvite?.id ?? null;

    if (existingInvite?.status === "revoked") {
      const { data, error } = await admin
        .from("shop_staff_invites")
        .update({
          status: "pending",
          invited_by: input.ownerId,
          accepted_by: null,
          accepted_at: null,
        })
        .eq("id", existingInvite.id)
        .select("id")
        .single();

      if (error) {
        return { inviteId: null, shopName: null, error: error.message };
      }

      inviteId = data?.id ?? existingInvite.id;
    } else if (existingInvite?.status === "pending") {
      inviteId = existingInvite.id;
    } else if (!existingInvite) {
      const { data, error } = await admin
        .from("shop_staff_invites")
        .insert({
          shop_id: input.shopId,
          email,
          invited_by: input.ownerId,
          status: "pending",
        })
        .select("id")
        .single();

      if (error) {
        if (error.code === "23505") {
          const { data: pendingInvite } = await admin
            .from("shop_staff_invites")
            .select("id")
            .eq("shop_id", input.shopId)
            .ilike("email", email)
            .eq("status", "pending")
            .maybeSingle();

          inviteId = pendingInvite?.id ?? null;
        } else {
          return { inviteId: null, shopName: null, error: error.message };
        }
      } else {
        inviteId = data?.id ?? null;
      }
    }

    if (!inviteId) {
      return { inviteId: null, shopName: null, error: "招待の作成に失敗しました" };
    }

    return { inviteId, shopName: shop.name, error: null };
  } catch {
    return {
      inviteId: null,
      shopName: null,
      error: "サーバー設定が不完全です。SUPABASE_SERVICE_ROLE_KEY を確認してください。",
    };
  }
}
