import type { User } from "@supabase/supabase-js";
import { resolvePostAuthPath } from "@/lib/auth/routing";
import { readPendingStaffInvite } from "@/lib/staff/pendingInvite";

export async function completeAuthFlow(
  user: User,
  preferredMode?: "guest" | "owner" | null,
): Promise<string> {
  const pendingInviteId = readPendingStaffInvite();

  if (pendingInviteId && user.email) {
    return `/staff/join/${pendingInviteId}`;
  }

  return resolvePostAuthPath(user, preferredMode ?? null);
}
