import { createClient } from "@supabase/supabase-js";
import { sendStaffInviteEmail } from "@/lib/email/staffInvite";
import { createStaffInviteRecord } from "@/lib/staff/server";

export const dynamic = "force-dynamic";

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return { user: null, error: "ログインが必要です" };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { user: null, error: "Supabase の設定が不完全です" };
  }

  const supabase = createClient(
    normalizeSupabaseUrl(supabaseUrl),
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: "ログインが必要です" };
  }

  return { user, error: null };
}

export async function POST(request: Request) {
  let body: { shopId?: string; email?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "INVALID_REQUEST", message: "リクエストが不正です。" },
      { status: 400 },
    );
  }

  const shopId = body.shopId?.trim();
  const email = body.email?.trim();

  if (!shopId || !email) {
    return Response.json(
      { error: "INVALID_INPUT", message: "店舗 ID とメールアドレスが必要です。" },
      { status: 400 },
    );
  }

  const { user, error: authError } = await getAuthenticatedUser(request);
  if (!user) {
    return Response.json(
      { error: "UNAUTHORIZED", message: authError ?? "ログインが必要です。" },
      { status: 401 },
    );
  }

  const result = await createStaffInviteRecord({
    shopId,
    ownerId: user.id,
    email,
  });

  if (result.error || !result.inviteId || !result.shopName) {
    return Response.json(
      {
        error: "INVITE_FAILED",
        message: result.error ?? "招待の作成に失敗しました。",
      },
      { status: 400 },
    );
  }

  try {
    await sendStaffInviteEmail({
      to: email.trim().toLowerCase(),
      shopName: result.shopName,
      inviteId: result.inviteId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "招待メールの送信に失敗しました。";

    return Response.json(
      {
        error: "EMAIL_FAILED",
        message: `招待は登録されましたが、メール送信に失敗しました: ${message}`,
        inviteId: result.inviteId,
      },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    inviteId: result.inviteId,
    message: "招待メールを送信しました。",
  });
}
