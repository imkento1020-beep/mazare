import Link from "next/link";
import type { GuestPostInsights } from "@/lib/profile/postInsights";
import { formatPostedAt } from "@/lib/home/types";

type GuestPostInsightsPanelProps = {
  insights: GuestPostInsights;
};

function ChipRow({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5a5668]">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/10 bg-[#18181f] px-3 py-1 text-xs font-semibold text-[#eeeaf4]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function GuestPostInsightsPanel({
  insights,
}: GuestPostInsightsPanelProps) {
  const hasTonight =
    insights.tonightPostCount > 0 ||
    insights.topDrinks.length > 0 ||
    insights.topAreas.length > 0;

  if (!hasTonight) {
    return (
      <section className="mt-4 rounded-[14px] border border-white/[0.07] bg-[#111118] p-4">
        <p className="text-sm font-bold text-[#eeeaf4]">今夜の記録</p>
        <p className="mt-2 text-sm text-[#9994a8]">
          今夜（17:00〜翌5:00）の投稿がまだありません
        </p>
      </section>
    );
  }

  return (
    <section className="mt-4 space-y-4 rounded-[14px] border border-[#ff3d00]/20 bg-[#ff3d00]/[0.04] p-4">
      <div>
        <p className="text-sm font-black text-[#eeeaf4]">今夜の記録</p>
        {insights.latestSummary && (
          <p className="mt-1 text-xs text-[#ffcc66]">
            いま: {insights.latestSummary}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-[10px] bg-[#111118] px-2 py-3">
          <p className="text-xl font-black tabular-nums text-[#ff3d00]">
            {insights.tonightShopCount}
          </p>
          <p className="mt-0.5 text-[10px] text-[#5a5668]">店舗</p>
        </div>
        <div className="rounded-[10px] bg-[#111118] px-2 py-3">
          <p className="text-xl font-black tabular-nums text-[#ff3d00]">
            {insights.tonightPostCount}
          </p>
          <p className="mt-0.5 text-[10px] text-[#5a5668]">投稿</p>
        </div>
        <div className="rounded-[10px] bg-[#111118] px-2 py-3">
          <p className="text-xl font-black tabular-nums text-[#ff3d00]">
            {insights.maxStopTonight ?? "—"}
          </p>
          <p className="mt-0.5 text-[10px] text-[#5a5668]">最大軒数</p>
        </div>
      </div>

      <ChipRow label="よく飲んでいる" items={insights.topDrinks} />
      <ChipRow label="よく出ているエリア" items={insights.topAreas} />

      {insights.tonightTimeline.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5a5668]">
            今夜の流れ
          </p>
          <ol className="mt-2 space-y-2">
            {insights.tonightTimeline.map(({ post, summary }) => (
              <li key={post.id}>
                <Link
                  href={`/shop/${post.shop_id}`}
                  className="flex items-start gap-3 rounded-[10px] border border-white/10 bg-[#111118] px-3 py-2.5 transition hover:border-[#ff3d00]/30"
                >
                  <span className="mt-0.5 text-[10px] tabular-nums text-[#5a5668]">
                    {formatPostedAt(post.posted_at)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#eeeaf4]">
                      {post.shops?.name ?? "お店"}
                    </p>
                    {summary && (
                      <p className="mt-0.5 text-xs text-[#9994a8]">{summary}</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
