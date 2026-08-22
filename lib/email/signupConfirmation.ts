import { sendEmail } from "@/lib/email/sendgrid";
import { escapeHtml } from "@/lib/email/html";

export async function sendSignupConfirmationEmail(input: {
  to: string;
  confirmUrl: string;
}) {
  const subject = "【mazare】メールアドレスの確認";
  const text = [
    "mazare へご登録ありがとうございます。",
    "",
    "以下のリンクをクリックして、メールアドレスの確認を完了してください。",
    input.confirmUrl,
    "",
    "このメールに心当たりがない場合は、破棄してください。",
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;line-height:1.6;color:#111;">
      <p>mazare へご登録ありがとうございます。</p>
      <p>以下のボタンをクリックして、メールアドレスの確認を完了してください。</p>
      <p style="margin:24px 0;">
        <a href="${escapeHtml(input.confirmUrl)}" style="display:inline-block;background:#ff3d00;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold;">
          メールアドレスを確認する
        </a>
      </p>
      <p style="font-size:12px;color:#888;">ボタンが開けない場合は、次の URL をブラウザに貼り付けてください。<br>${escapeHtml(input.confirmUrl)}</p>
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
