import type { User } from "@supabase/supabase-js";

export type AppRole = "guest" | "owner";

export function getUserRoles(user: User | null | undefined): AppRole[] {
  if (!user) return [];

  const meta = user.user_metadata ?? {};
  const rawRoles = meta.roles;

  if (Array.isArray(rawRoles)) {
    const roles = rawRoles.filter(
      (role): role is AppRole => role === "guest" || role === "owner",
    );
    if (roles.length > 0) {
      return roles.includes("owner") ? ["guest", "owner"] : roles;
    }
  }

  if (meta.user_type === "owner") return ["guest", "owner"];
  return ["guest"];
}

export function hasRole(
  user: User | null | undefined,
  role: AppRole,
): boolean {
  return getUserRoles(user).includes(role);
}

export function isDualRoleUser(user: User | null | undefined): boolean {
  const roles = getUserRoles(user);
  return roles.includes("guest") && roles.includes("owner");
}

/** サインアップ時に付与するロール（オーナーはゲスト機能も利用可能） */
export function rolesForSignup(signupType: AppRole): AppRole[] {
  return signupType === "owner" ? ["guest", "owner"] : ["guest"];
}

export function mergeRoles(
  current: AppRole[],
  additional: AppRole[],
): AppRole[] {
  const merged = new Set<AppRole>([...current, ...additional]);
  if (merged.has("owner")) merged.add("guest");
  return Array.from(merged);
}

export function rolesToMetadata(roles: AppRole[]) {
  const normalized = mergeRoles([], roles);
  return {
    roles: normalized,
    user_type: normalized.includes("owner") ? "owner" : "guest",
  };
}
