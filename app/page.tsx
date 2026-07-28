import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-20">
      <div className="space-y-4">
        <p className="text-sm font-medium text-zinc-500">Mazare</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          お店の情報を、もっと伝わる形で。
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          店舗名や住所だけでなく、お店の雰囲気や利用シーンもあわせて登録できます。
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/shops/new"
          className="rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          お店の詳細を登録する
        </Link>
        <Link
          href="/shops"
          className="rounded-lg border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          登録済みの店舗を見る
        </Link>
      </div>
    </div>
  );
}
