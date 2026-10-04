import { createClient } from "@supabase/supabase-js";
import {
  sendShopApplicationAdminNotification,
  sendShopApplicationAutoReply,
} from "@/lib/email/shopApplicationEmails";
import { validateShopApplicationInput } from "@/lib/owner/applyValidation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

async function getOptionalUserId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createClient(
    normalizeSupabaseUrl(supabaseUrl),
    supabaseAnonKey,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  return user?.id ?? null;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "リクエストが不正です。" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const validated = validateShopApplicationInput({
    shopName: String(raw.shopName ?? ""),
    address: String(raw.address ?? ""),
    phone: String(raw.phone ?? ""),
    contactName: String(raw.contactName ?? ""),
    email: String(raw.email ?? ""),
    instagramUrl: String(raw.instagramUrl ?? ""),
    message: String(raw.message ?? ""),
  });

  if (!validated.ok) {
    return Response.json({ message: validated.message }, { status: 400 });
  }

  const value = validated.value;
  let userId: string | null = null;

  try {
    userId = await getOptionalUserId(request);
  } catch {
    userId = null;
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return Response.json(
      { message: "サーバー設定が不完全です。しばらくしてからお試しください。" },
      { status: 503 },
    );
  }

  const { data: inserted, error: insertError } = await admin
    .from("shop_applications")
    .insert({
      shop_name: value.shopName,
      address: value.address,
      phone: value.phone,
      contact_name: value.contactName,
      email: value.email,
      instagram_url: value.instagramUrl || null,
      message: value.message || null,
      status: "pending",
      user_id: userId,
    })
    .select("id, created_at")
    .single();

  if (insertError) {
    const message = insertError.message.includes("shop_applications")
      ? "申請機能の準備ができていません。運営にお問い合わせください。"
      : insertError.message;
    return Response.json({ message }, { status: 500 });
  }

  const emailPayload = {
    shopName: value.shopName,
    address: value.address,
    phone: value.phone,
    contactName: value.contactName,
    email: value.email,
    instagramUrl: value.instagramUrl || null,
    message: value.message || null,
    createdAt: inserted.created_at as string,
  };

  try {
    await Promise.all([
      sendShopApplicationAdminNotification(emailPayload),
      sendShopApplicationAutoReply(emailPayload),
    ]);
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("SENDGRID")
        ? "申請は保存しましたが、確認メールの送信に失敗しました。運営（admin@mazare.app）までご連絡ください。"
        : "申請は保存しましたが、メール送信に失敗しました。運営（admin@mazare.app）までご連絡ください。";
    return Response.json(
      { message, applicationId: inserted.id },
      { status: 502 },
    );
  }

  return Response.json({ applicationId: inserted.id });
}
