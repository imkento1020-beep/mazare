import Link from "next/link";
import StaticPageLayout from "@/components/layout/StaticPageLayout";
import FaqAccordion, { type FaqEntry } from "@/components/faq/FaqAccordion";

export const metadata = {
  title: "よくある質問 | mazare",
  description: "mazareのよくある質問",
};

const FAQ_SECTIONS: { category: string; questions: FaqEntry[] }[] = [
  {
    category: "はじめての方",
    questions: [
      {
        q: "mazare（マザーレ）とは何ですか？",
        a: "お店が「今夜の空気」をリアルタイムで発信し、ユーザーがその雰囲気から行き先を選べるサービスです。静的な店舗情報ではなく、今まさに混ざれる場所がわかります。",
      },
      {
        q: "利用料金はかかりますか？",
        a: "ゲスト（お店を探す方）の利用は無料です。お店オーナーの登録・発信も、現時点では無料でご利用いただけます。",
      },
      {
        q: "誰でも登録できますか？",
        a: "20歳以上の方を対象としています。飲酒に関連するコンテンツを含むため、20歳未満の方のご利用はお断りしています。",
      },
    ],
  },
  {
    category: "ゲスト（お店を探す方）",
    questions: [
      {
        q: "「行くかも」とは何ですか？",
        a: "気になるお店の投稿に対して、関心を示すボタンです。お店側に「行くかも」の人数が届き、今夜の来店見込みの参考になります。",
      },
      {
        q: "お気に入り機能はどう使いますか？",
        a: "お店詳細ページのハートボタンから登録できます。お気に入りのお店が新しく投稿すると、通知でお知らせします。",
      },
      {
        q: "投稿の内容は信頼できますか？",
        a: "投稿は各お店が発信するリアルタイム情報です。内容の正確性はお店ごとに異なる場合があるため、訪問前に最新の投稿をご確認ください。",
      },
    ],
  },
  {
    category: "お店オーナーの方",
    questions: [
      {
        q: "Vibe Post とは何ですか？",
        a: "今夜の空気を伝えるリアルタイム投稿です。ムードタグ（激熱・混ざり歓迎など）、コメント、写真を組み合わせて、今この瞬間の盛り上がりを発信できます。",
      },
      {
        q: "ダッシュボードで何が確認できますか？",
        a: "投稿ごとの表示回数・行くかも数、来店者情報、過去の発信履歴などを確認できます。",
      },
      {
        q: "投稿は編集・削除できますか？",
        a: "はい。オーナーダッシュボードの「過去の発信履歴」から、各投稿の編集・削除が可能です。",
      },
    ],
  },
  {
    category: "アカウント・その他",
    questions: [
      {
        q: "アカウントの削除方法は？",
        a: "マイページからログアウト後、個人情報の削除をご希望の場合はお問い合わせよりご連絡ください。",
      },
      {
        q: "不適切な投稿を見つけた場合は？",
        a: "利用規約に反するコンテンツは、運営判断により削除される場合があります。お問い合わせフォームよりご報告ください。",
      },
      {
        q: "利用規約・プライバシーポリシーはどこで確認できますか？",
        a: "フッターのリンク、または以下のページからご確認いただけます。",
        links: [
          { label: "利用規約", href: "/terms" },
          { label: "プライバシーポリシー", href: "/privacy" },
        ],
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <StaticPageLayout
      title="よくある質問"
      subtitle="mazareのご利用に関するよくあるご質問"
    >
      <FaqAccordion sections={FAQ_SECTIONS} />

      <section className="mt-10 rounded-[14px] border border-white/[0.07] bg-[#111118] p-5 text-center">
        <p className="text-sm font-bold text-[#eeeaf4]">
          解決しない場合はお問い合わせください
        </p>
        <p className="mt-2 text-sm text-[#9994a8]">
          <Link href="/contact" className="font-semibold text-[#ff3d00] hover:underline">
            お問い合わせフォーム
          </Link>
          からご連絡ください。
        </p>
      </section>
    </StaticPageLayout>
  );
}
