export type InquirerType = "guest" | "owner" | "visitor";

export type ContactCategory =
  | "general"
  | "account"
  | "shop"
  | "report"
  | "privacy"
  | "other";

export const INQUIRER_TYPE_OPTIONS: {
  value: InquirerType;
  label: string;
  description: string;
}[] = [
  {
    value: "guest",
    label: "ゲスト（お店を探す方）",
    description: "飲みに行く人・ユーザーとしてのお問い合わせ",
  },
  {
    value: "owner",
    label: "店舗オーナー（お店を運営している方）",
    description: "掲載・発信・ダッシュボードなど店舗側のお問い合わせ",
  },
  {
    value: "visitor",
    label: "その他・未登録の方",
    description: "アカウント登録前や、サービス全般のご質問",
  },
];

export const CONTACT_CATEGORY_OPTIONS: {
  value: ContactCategory;
  label: string;
}[] = [
  { value: "general", label: "サービス全般" },
  { value: "account", label: "アカウント・ログイン" },
  { value: "shop", label: "お店掲載・オーナー機能" },
  { value: "report", label: "不適切なコンテンツの報告" },
  { value: "privacy", label: "個人情報・プライバシー" },
  { value: "other", label: "その他" },
];

export function inquirerTypeLabel(type: InquirerType) {
  return INQUIRER_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}
