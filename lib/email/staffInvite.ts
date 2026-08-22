import { sendEmail } from "@/lib/email/sendgrid";
import { getSignupUrl, getStaffJoinUrl } from "@/lib/site/url";

export async function sendStaffInviteEmail(input: {
  to: string;
  shopName: string;
  inviteId: string;
}) {
  const joinUrl = getStaffJoinUrl(input.inviteId);
  const signupUrl = getSignupUrl({
    invite: input.inviteId,
    email: input.to,
  });

  const subject = `【mazare】${input.shopName} からスタッフ招待`;
  const text = [
    `${input.shopName} から mazare のスタッフとして招待されました。`,
    "",
    "以下のリンクから招待を確認し、アカウントを作成またはログインしてください。",
    joinUrl,
    "",
    "アカウントをお持ちでない場合:",
    signupUrl,
    "",
    "このメールに心当たりがない場合は、破棄してください。",
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;line-height:1.6;color:#111;">
      <p><strong>${escapeHtml(input.shopName)}</strong> から mazare のスタッフとして招待されました。</p>
      <p>以下のボタンから招待を確認し、店舗管理画面へのアクセスを承認してください。</p>
      <p style="margin:24px 0;">
        <a href="${joinUrl}" style="display:inline-block;background:#ff3d00;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold;">
          招待を確認する
        </a>
      </p>
      <p style="font-size:14px;color:#555;">
        アカウントをお持ちでない場合は
        <a href="${signupUrl}">こちらからアカウント作成</a>
        してください。
      </p>
      <p style="font-size:12px;color:#888;">このメールに心当たりがない場合は、破棄してください。</p>
    </div>
  `;

  await sendEmail({
    to: input.to,
    subject,
    text,
    html,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
