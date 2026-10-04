import Link from "next/link";
import type { ShopApplicationStatus } from "@/lib/owner/shopApplication";

type OwnerApplicationStatusScreenProps = {
  status: ShopApplicationStatus;
};

export default function OwnerApplicationStatusScreen({
  status,
}: OwnerApplicationStatusScreenProps) {
  const copy =
    status === "pending"
      ? {
          title: "審査中です",
          body: "通常1〜2営業日以内にご連絡します。",
        }
      : {
          title: "申請が承認されませんでした",
          body: "お問い合わせはadmin@mazare.appまで。",
        };

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-[480px] flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-xl font-black text-[#eeeaf4]">{copy.title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#9994a8]">{copy.body}</p>
      <Link
        href="/home"
        className="mt-10 text-sm font-semibold text-[#ff3d00]"
      >
        ホームに戻る
      </Link>
    </div>
  );
}
