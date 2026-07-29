import type { User } from "@supabase/supabase-js";
import { fetchOwnerShop } from "@/lib/owner/api";

export async function resolvePostAuthPath(user: User): Promise<string> {
  const userType = user.user_metadata?.user_type;

  if (userType === "owner") {
    const { data: shop } = await fetchOwnerShop(user.id);
    if (!shop && !user.user_metadata?.onboarding_completed) {
      return "/owner/onboarding";
    }
    return "/owner/dashboard";
  }

  return "/home";
}
