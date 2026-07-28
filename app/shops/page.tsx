import Link from "next/link";
import { listShops } from "@/lib/shops/store";

export default function ShopsPage() {
  const shops = listShops();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            ← ホームに戻る
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            店舗一覧
          </h1>
        </div>
        <Link
          href="/shops/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          お店を登録する
        </Link>
      </div>

      {shops.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400">
            まだ店舗が登録されていません。
          </p>
          <Link
            href="/shops/new"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            最初のお店を登録する
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {shops.map((shop) => (
            <li key={shop.id}>
              <Link
                href={`/shops/${shop.id}`}
                className="block rounded-xl border border-zinc-200 p-5 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                      {shop.name}
                    </h2>
                    {shop.category ? (
                      <p className="mt-1 text-sm text-zinc-500">
                        {shop.category}
                      </p>
                    ) : null}
                  </div>
                  {shop.atmosphereTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {shop.atmosphereTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                {shop.atmosphere ? (
                  <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {shop.atmosphere}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
