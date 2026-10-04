import { supabase } from "@/lib/supabase";
import {
  isMissingTableError,
  missingTableMessage,
} from "@/lib/supabase/errors";

export type ShopApplicationStatus = "pending" | "approved" | "rejected";

export type ShopApplication = {
  id: string;
  shop_name: string;
  address: string;
  phone: string;
  contact_name: string;
  email: string;
  instagram_url: string | null;
  message: string | null;
  status: ShopApplicationStatus;
  created_at: string;
  approved_at: string | null;
  user_id: string | null;
};

export async function fetchShopApplicationForUser(
  userId: string,
  email?: string | null,
): Promise<{ data: ShopApplication | null; error: string | null }> {
  const { data: byUser, error: userError } = await supabase
    .from("shop_applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (userError) {
    if (isMissingTableError(userError.message, "shop_applications")) {
      return { data: null, error: missingTableMessage("shop_applications") };
    }
    return { data: null, error: userError.message };
  }

  if (byUser) {
    return { data: byUser as ShopApplication, error: null };
  }

  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    return { data: null, error: null };
  }

  const { data: byEmail, error: emailError } = await supabase
    .from("shop_applications")
    .select("*")
    .ilike("email", normalizedEmail)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (emailError) {
    if (isMissingTableError(emailError.message, "shop_applications")) {
      return { data: null, error: missingTableMessage("shop_applications") };
    }
    return { data: null, error: emailError.message };
  }

  return { data: (byEmail as ShopApplication | null) ?? null, error: null };
}
