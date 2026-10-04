import OwnerApplyPageClient from "./OwnerApplyPageClient";

export const metadata = {
  title: "店舗登録の申請 | mazare",
  description: "mazareの店舗オーナー登録を申請する",
};

export default function OwnerApplyPage() {
  return (
    <div className="min-h-dvh bg-[#080810] text-[#eeeaf4]">
      <OwnerApplyPageClient />
    </div>
  );
}
