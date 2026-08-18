import type { User } from "@supabase/supabase-js";
import { fetchManagedShop } from "@/lib/owner/api";
import { resolveAppMode, setStoredAppMode, type AppMode } from "@/lib/auth/mode";
import { hasRole } from "@/lib/auth/roles";
import { fetchPendingInvitesForEmail } from "@/lib/staff/api";

export async function resolvePostAuthPath(
  user: User,
  preferredMode?: AppMode | null,
): Promise<string> {
  const mode = resolveAppMode(user, preferredMode);
  setStoredAppMode(mode);

  if (mode === "owner" && hasRole(user, "owner")) {
    const { data: shop } = await fetchManagedShop(user.id);
    if (!shop && !user.user_metadata?.onboarding_completed) {
      return "/owner/onboarding";
    }
    return "/owner/dashboard";
  }

  if (user.email) {
    const { data: pendingInvites } = await fetchPendingInvitesForEmail(user.email);
    if (pendingInvites.length > 0) {
      return "/mypage#staff-invites";
    }
  }

  return "/home";
}
