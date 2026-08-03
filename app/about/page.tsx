import Link from "next/link";
import StaticPageLayout from "@/components/layout/StaticPageLayout";

export const metadata = {
  title: "サービスについて | mazare",
  description: "mazareが提供するサービスの概要",
};

const STEPS = [
  {
    step: "01",
    title: "お店が今夜の空気を発信",
    body: "お店オーナーがムードタグ・コメント・写真付きで「Vibe Post」を投稿。今この瞬間の盛り上がりが伝わります。",
  },
  {
    step: "02",
    title: "ユーザーが今夜行くお店を探す",
    body: "ホームフィード・地図・検索から、エリア・ジャンル・雰囲気で絞り込み。気になるお店を見つけたら「行くかも」をタップ。",
  },
  {
    step: "03",
    title: "知らない人と混ざれる夜へ",
    body: "「混ざり歓迎」のお店を選んで、新しい出会いや偶然のつながりを楽しめます。",
  },
];

export default function AboutPage() {
  return (
    <StaticPageLayout
      title="サービスについて"
      subtitle="今夜、知らない人と混ざれる場所を見つけるためのプラットフォーム"
    >
      <section className="rounded-[14px] border border-[#ff3d00]/20 bg-[#ff3d00]/[0.05] p-6">
        <p className="text-lg font-bold leading-relaxed text-[#eeeaf4]">
          mazare（マザーレ）は、お店がリアルタイムで「今夜の空気」を発信し、ユーザーがその場の雰囲気から行き先を選べるサービスです。
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[#9994a8]">
          静的な店舗情報だけでなく、今まさに混ざれるかどうかがわかる。それが mazare のコンセプトです。
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">mazareの使い方</h2>
        <div className="mt-6 space-y-4">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-5"
            >
              <p className="text-xs font-bold tracking-[0.2em] text-[#ff3d00]">
                STEP {item.step}
              </p>
              <h3 className="mt-2 font-bold text-[#eeeaf4]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#9994a8]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#00e87a]">
            For Guests
          </p>
          <h3 className="mt-2 font-bold">飲みに行く人の方へ</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#9994a8]">
            今夜の盛り上がりがわかる投稿、地図・フィルター検索、お気に入り登録、行くかも機能などで、混ざれる場所を素早く見つけられます。
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-block text-sm font-semibold text-[#ff3d00] hover:underline"
          >
            ゲストとして始める →
          </Link>
        </div>

        <div className="rounded-[14px] border border-[#ff3d00]/15 bg-[#ff3d00]/[0.03] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#ff3d00]">
            For Owners
          </p>
          <h3 className="mt-2 font-bold">お店を運営している方へ</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#9994a8]">
            今夜の空気をリアルタイム発信。行くかも数・閲覧数・来店者情報をダッシュボードで確認し、混ざりたい客を呼び込めます。
          </p>
          <Link
            href="/signup?type=owner"
            className="mt-4 inline-block text-sm font-semibold text-[#ff3d00] hover:underline"
          >
            オーナーとして登録 →
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-[14px] border border-white/[0.07] bg-[#111118] p-5">
        <h2 className="font-bold">大切にしていること</h2>
        <ul className="mt-4 space-y-3 text-sm text-[#9994a8]">
          <li className="flex gap-2">
            <span className="text-[#ff3d00]">•</span>
            <span>リアルタイム性 — 今夜の情報にフォーカス</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#ff3d00]">•</span>
            <span>混ざりやすさ — 「混ざり歓迎」のお店を見つけやすく</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#ff3d00]">•</span>
            <span>シンプルさ — お店もユーザーも、直感的に使える設計</span>
          </li>
        </ul>
      </section>
    </StaticPageLayout>
  );
}
