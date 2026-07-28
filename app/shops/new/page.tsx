import Link from "next/link";
import { ShopForm } from "@/components/shops/ShopForm";
import { createShopAction } from "@/lib/shops/actions";

export default function NewShopPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8 space-y-2">
        <Link
          href="/shops"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← 店舗一覧に戻る
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          お店の詳細登録
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          基本情報に加えて、お店の雰囲気や利用シーンも登録できます。
        </p>
      </div>

      <ShopForm action={createShopAction} submitLabel="店舗を登録する" />
    </div>
  );
}
