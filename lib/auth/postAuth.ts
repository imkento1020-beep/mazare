import type { User } from "@supabase/supabase-js";
import { setStoredAppMode } from "@/lib/auth/mode";
import { resolvePostAuthPath } from "@/lib/auth/routing";
import { acceptStaffInviteWithRole } from "@/lib/staff/api";
import {
  clearPendingStaffInvite,
  readPendingStaffInvite,
} from "@/lib/staff/pendingInvite";

export async function completeAuthFlow(
  user: User,
  preferredMode?: "guest" | "owner" | null,
): Promise<string> {
  const pendingInviteId = readPendingStaffInvite();

  if (pendingInviteId && user.email) {
    const { error } = await acceptStaffInviteWithRole(pendingInviteId, user);
    clearPendingStaffInvite();

    if (!error) {
      setStoredAppMode("owner");
      return "/owner/dashboard";
    }
  }

  return resolvePostAuthPath(user, preferredMode ?? null);
}
