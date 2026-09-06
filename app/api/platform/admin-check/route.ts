import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import {
  isPlatformAdminFeatureEnabled,
  isPlatformAdminUser,
} from "@/lib/auth/platformAdmin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isPlatformAdminFeatureEnabled()) {
    return Response.json({ admin: false }, { status: 404 });
  }

  const { user, error } = await getAuthenticatedUser(request);

  if (!user) {
    return Response.json(
      { admin: false, message: error ?? "ログインが必要です" },
      { status: 401 },
    );
  }

  if (!isPlatformAdminUser(user)) {
    return Response.json(
      { admin: false, message: "プラットフォーム管理者のみアクセスできます" },
      { status: 403 },
    );
  }

  return Response.json({ admin: true, email: user.email });
}
