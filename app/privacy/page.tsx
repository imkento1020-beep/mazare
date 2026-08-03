import Link from "next/link";
import StaticPageLayout from "@/components/layout/StaticPageLayout";
import {
  LegalList,
  LegalOrderedList,
  LegalParagraph,
  LegalSection,
} from "@/components/legal/LegalContent";

export const metadata = {
  title: "プライバシーポリシー | mazare",
  description: "mazareのプライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <StaticPageLayout
      title="プライバシーポリシー"
      subtitle="制定日：2026年8月1日"
    >
      <LegalParagraph>
        mazare（以下「当サービス」）は、利用者の個人情報の保護を重要な責務と考え、以下の方針に基づき個人情報を適切に取り扱います。
      </LegalParagraph>

      <LegalSection title="第1条（取得する情報）">
        <LegalParagraph>当サービスは以下の情報を取得します。</LegalParagraph>
        <LegalOrderedList
          items={[
            "アカウント情報：メールアドレス、パスワード（暗号化して保存）、ユーザー種別（ゲスト/オーナー）",
            "お店情報：店舗名、住所、営業時間、ジャンル、カバー画像",
            "投稿情報：Vibe Postのコメント、画像、ムード情報、投稿日時",
            "行動情報：「行くかも」の履歴、閲覧履歴",
            "端末情報：IPアドレス、ブラウザの種類、アクセス日時",
          ]}
        />
      </LegalSection>

      <LegalSection title="第2条（情報の利用目的）">
        <LegalParagraph>
          取得した情報は以下の目的で利用します。
        </LegalParagraph>
        <LegalOrderedList
          items={[
            "当サービスの提供・運営・改善",
            "利用者への通知・お問い合わせ対応",
            "不正利用の検知・防止",
            "統計データの作成（個人を特定しない形での分析）",
          ]}
        />
      </LegalSection>

      <LegalSection title="第3条（第三者への提供）">
        <LegalParagraph>
          当サービスは、以下の場合を除き、利用者の個人情報を第三者に提供しません。
        </LegalParagraph>
        <LegalOrderedList
          items={[
            "利用者本人の同意がある場合",
            "法令に基づく場合",
            "人の生命・身体・財産の保護のために必要な場合",
          ]}
        />
      </LegalSection>

      <LegalSection title="第4条（外部サービスの利用）">
        <LegalParagraph>
          当サービスは以下の外部サービスを利用しています。各サービスのプライバシーポリシーもご確認ください。
        </LegalParagraph>
        <ul className="mt-4 space-y-2 text-sm text-[#9994a8]">
          <li>
            Supabase（データベース・認証）：{" "}
            <Link
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff3d00] hover:underline"
            >
              https://supabase.com/privacy
            </Link>
          </li>
          <li>
            Vercel（ホスティング）：{" "}
            <Link
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff3d00] hover:underline"
            >
              https://vercel.com/legal/privacy-policy
            </Link>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="第5条（Cookieの使用）">
        <LegalParagraph>
          当サービスはログイン状態の維持・サービス改善のためにCookieを使用します。ブラウザの設定でCookieを無効にすることができますが、一部機能が利用できなくなる場合があります。
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="第6条（個人情報の管理）">
        <LegalParagraph>
          当サービスは個人情報の漏洩・滅失・毀損の防止のため、適切なセキュリティ対策を実施します。ただし、インターネット上での完全な安全性を保証するものではありません。
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="第7条（個人情報の開示・訂正・削除）">
        <LegalParagraph>
          利用者は、当サービスが保有する自己の個人情報の開示・訂正・削除を請求することができます。請求はサービス内の設定画面またはお問い合わせフォームから行ってください。
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="第8条（未成年者の利用）">
        <LegalParagraph>
          当サービスは飲酒に関連するコンテンツを含むため、20歳未満の方の利用はお断りします。20歳未満の方が利用登録した場合、当サービスはアカウントを削除することがあります。
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="第9条（プライバシーポリシーの変更）">
        <LegalParagraph>
          当サービスは、必要に応じて本ポリシーを変更することがあります。重要な変更がある場合はサービス上でお知らせします。
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="第10条（お問い合わせ）">
        <LegalParagraph>
          個人情報の取り扱いに関するお問い合わせは、
          <Link href="/contact?type=visitor" className="text-[#ff3d00] hover:underline">
            お問い合わせフォーム
          </Link>
          よりご連絡ください。
        </LegalParagraph>
      </LegalSection>
    </StaticPageLayout>
  );
}
