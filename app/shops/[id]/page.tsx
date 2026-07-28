import Link from "next/link";
import { notFound } from "next/navigation";
import { getShop } from "@/lib/shops/store";

type ShopDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ShopDetailPage({ params }: ShopDetailPageProps) {
  const { id } = await params;
  const shop = getShop(id);

  if (!shop) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8 space-y-2">
        <Link
          href="/shops"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← 店舗一覧に戻る
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {shop.name}
            </h1>
            {shop.category ? (
              <p className="mt-1 text-sm text-zinc-500">{shop.category}</p>
            ) : null}
          </div>
          <Link
            href={`/shops/${shop.id}/edit`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            編集する
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {shop.description ? (
          <section className="space-y-2">
            <h2 className="text-sm font-medium text-zinc-500">説明</h2>
            <p className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
              {shop.description}
            </p>
          </section>
        ) : null}

        <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            お店の雰囲気
          </h2>
          {shop.atmosphere ? (
            <p className="mt-3 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
              {shop.atmosphere}
            </p>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">
              雰囲気の説明はまだ登録されていません。
            </p>
          )}
          {shop.atmosphereTags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {shop.atmosphereTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-900 px-3 py-1 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-medium text-zinc-500">住所</h2>
            <p className="mt-1 text-zinc-800 dark:text-zinc-200">
              {shop.address || "未登録"}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-zinc-500">電話番号</h2>
            <p className="mt-1 text-zinc-800 dark:text-zinc-200">
              {shop.phone || "未登録"}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
