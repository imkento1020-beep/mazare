import { sendEmail } from "@/lib/email/sendgrid";

export const MAZARE_ADMIN_EMAIL = "admin@mazare.app";

export type ShopApplicationEmailPayload = {
  shopName: string;
  address: string;
  phone: string;
  contactName: string;
  email: string;
  instagramUrl: string | null;
  message: string | null;
  createdAt: string;
};

function formatCreatedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  } catch {
    return iso;
  }
}

function displayOptional(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "（未入力）";
}

export async function sendShopApplicationAdminNotification(
  payload: ShopApplicationEmailPayload,
) {
  const createdAt = formatCreatedAt(payload.createdAt);
  const instagram = displayOptional(payload.instagramUrl);
  const message = displayOptional(payload.message);

  const text = `以下の店舗から申請が届きました。

店舗名：${payload.shopName}
住所：${payload.address}
電話番号：${payload.phone}
担当者名：${payload.contactName}
メールアドレス：${payload.email}
Instagram：${instagram}
メッセージ：${message}
申請日時：${createdAt}

Supabaseダッシュボードで承認してください。
承認後、お店へ承認メールを送付してください。`;

  await sendEmail({
    to: MAZARE_ADMIN_EMAIL,
    subject: "【mazare】新しい店舗申請が届きました",
    text,
    html: text.replace(/\n/g, "<br />"),
  });
}

export async function sendShopApplicationAutoReply(
  payload: ShopApplicationEmailPayload,
) {
  const text = `${payload.contactName} 様

mazareへの店舗登録申請ありがとうございます。

以下の内容で申請を受け付けました。

店舗名：${payload.shopName}
住所：${payload.address}
担当者名：${payload.contactName}

通常1〜2営業日以内に審査結果をご連絡します。
しばらくお待ちください。

mazare
admin@mazare.app`;

  await sendEmail({
    to: payload.email,
    subject: "【mazare】店舗登録申請を受け付けました",
    text,
    html: text.replace(/\n/g, "<br />"),
  });
}
