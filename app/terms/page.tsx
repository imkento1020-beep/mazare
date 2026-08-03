import StaticPageLayout from "@/components/layout/StaticPageLayout";
import {
  LegalList,
  LegalOrderedList,
  LegalParagraph,
  LegalSection,
} from "@/components/legal/LegalContent";

export const metadata = {
  title: "利用規約 | mazare",
  description: "mazareの利用規約",
};

export default function TermsPage() {
  return (
    <StaticPageLayout
      title="利用規約"
      subtitle="制定日：2026年8月1日"
    >
      <LegalParagraph>
        この利用規約（以下「本規約」）は、mazare（以下「当サービス」）の利用条件を定めるものです。ユーザーおよびお店（以下総称して「利用者」）は本規約に同意の上、当サービスをご利用ください。
      </LegalParagraph>

      <LegalSection title="第1条（定義）">
        <LegalParagraph>
          本規約において使用する用語の定義は以下の通りです。
        </LegalParagraph>
        <LegalOrderedList
          items={[
            "「当サービス」とは、mazareが提供するウェブアプリケーション及び関連するサービス全般を指します。",
            "「ユーザー」とは、当サービスに登録してお店を探す目的で利用する個人を指します。",
            "「お店」とは、当サービスに登録して今夜の情報を発信する飲食店その他の事業者を指します。",
            "「Vibe Post」とは、お店が当サービスを通じて発信するリアルタイムの情報投稿を指します。",
            "「コンテンツ」とは、利用者が当サービス上に投稿・掲載する文章、画像その他の情報を指します。",
          ]}
        />
      </LegalSection>

      <LegalSection title="第2条（利用登録）">
        <LegalOrderedList
          items={[
            "当サービスの利用を希望する方は、本規約に同意の上、当サービスが定める方法により利用登録を行うものとします。",
            "利用登録の申請者が以下のいずれかに該当する場合、当サービスは登録を拒否することがあります。",
          ]}
        />
        <LegalList
          items={[
            "過去に本規約に違反したことがある者",
            "未成年者で保護者の同意を得ていない者",
            "反社会的勢力に関係する者",
            "その他当サービスが不適切と判断した者",
          ]}
        />
      </LegalSection>

      <LegalSection title="第3条（アカウントの管理）">
        <LegalOrderedList
          items={[
            "利用者は自己の責任においてアカウント情報を管理するものとします。",
            "アカウント情報の不正使用により生じた損害について、当サービスは一切の責任を負いません。",
            "利用者は第三者にアカウントを譲渡・貸与することはできません。",
          ]}
        />
      </LegalSection>

      <LegalSection title="第4条（禁止事項）">
        <LegalParagraph>
          利用者は以下の行為を行ってはなりません。
        </LegalParagraph>
        <LegalOrderedList
          items={[
            "法令または公序良俗に違反する行為",
            "虚偽の情報を登録・投稿する行為",
            "他の利用者または第三者を誹謗中傷する行為",
            "当サービスの運営を妨げる行為",
            "他の利用者のプライバシーを侵害する行為",
            "無断で第三者の画像・著作物を投稿する行為",
            "当サービスを通じたスパム行為・不当な勧誘行為",
            "その他当サービスが不適切と判断する行為",
          ]}
        />
      </LegalSection>

      <LegalSection title="第5条（コンテンツの取り扱い）">
        <LegalOrderedList
          items={[
            "利用者が投稿するコンテンツの著作権は利用者に帰属します。",
            "利用者は当サービスに対して、投稿コンテンツをサービスの運営・改善・宣伝目的で無償で使用する権利を許諾するものとします。",
            "当サービスは、投稿コンテンツが禁止事項に該当すると判断した場合、予告なく削除することができます。",
          ]}
        />
      </LegalSection>

      <LegalSection title="第6条（サービスの変更・停止）">
        <LegalOrderedList
          items={[
            "当サービスは、利用者への事前通知なしにサービスの内容を変更・停止することがあります。",
            "サービスの変更・停止によって利用者に生じた損害について、当サービスは一切の責任を負いません。",
          ]}
        />
      </LegalSection>

      <LegalSection title="第7条（免責事項）">
        <LegalOrderedList
          items={[
            "当サービスは、お店が投稿するVibe Postの内容の正確性・完全性を保証しません。",
            "当サービスを通じて行われた利用者間のやり取りについて、当サービスは一切の責任を負いません。",
            "当サービスの利用に起因して生じた損害について、当サービスの故意または重過失による場合を除き、当サービスは責任を負いません。",
          ]}
        />
      </LegalSection>

      <LegalSection title="第8条（規約の変更）">
        <LegalParagraph>
          当サービスは、必要と判断した場合に本規約を変更することができます。変更後の規約はサービス上に掲示した時点から効力を生じるものとします。
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="第9条（準拠法・管轄裁判所）">
        <LegalParagraph>
          本規約の解釈には日本法を準拠法とし、当サービスに関する紛争については東京地方裁判所を第一審の専属的合意管轄裁判所とします。
        </LegalParagraph>
      </LegalSection>
    </StaticPageLayout>
  );
}
