import { supabase } from "@/lib/supabase";

export type PlatformAdminAccess =
  | { status: "admin" }
  | { status: "unauthenticated" }
  | { status: "forbidden"; message: string }
  | { status: "disabled" };

export async function checkPlatformAdminSession(): Promise<PlatformAdminAccess> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { status: "unauthenticated" };
  }

  const response = await fetch("/api/platform/admin-check", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.status === 404) {
    return { status: "disabled" };
  }

  if (response.status === 401) {
    return { status: "unauthenticated" };
  }

  if (response.status === 403) {
    const data = (await response.json()) as { message?: string };
    return {
      status: "forbidden",
      message: data.message ?? "アクセス権限がありません",
    };
  }

  if (!response.ok) {
    return {
      status: "forbidden",
      message: "管理者権限の確認に失敗しました",
    };
  }

  return { status: "admin" };
}
