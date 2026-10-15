import type { DrinkLogMonthStats } from "@/lib/profile/drinkLogStats";

type DrinkLogStatsCardProps = {
  stats: DrinkLogMonthStats;
};

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-black tabular-nums text-[#eeeaf4]">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold text-[#5a5668]">{label}</p>
    </div>
  );
}

export default function DrinkLogStatsCard({ stats }: DrinkLogStatsCardProps) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#111118] p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-black text-[#eeeaf4]">今月の飲みログ</h2>
        <span className="text-[11px] font-bold text-[#ff3d00]">
          {stats.activeDays}日外出
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 border-b border-white/[0.06] pb-4">
        <StatCell label="投稿" value={stats.postCount} />
        <StatCell label="杯数" value={stats.totalDrinks} />
        <StatCell label="訪問店" value={stats.uniqueShopCount} />
      </div>
      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-[#0d0d12] px-3 py-2.5">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-[#5a5668]">
            よく行くエリア
          </dt>
          <dd className="mt-0.5 font-bold text-[#eeeaf4]">
            {stats.topArea ?? "—"}
          </dd>
        </div>
        <div className="rounded-xl bg-[#0d0d12] px-3 py-2.5">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-[#5a5668]">
            よく飲むドリンク
          </dt>
          <dd className="mt-0.5 font-bold text-[#eeeaf4]">
            {stats.topDrink ?? "—"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
