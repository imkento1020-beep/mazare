import type { TonightCheckinVisitor } from "@/lib/checkins/api";

type TonightVisitorsSectionProps = {
  visitors: TonightCheckinVisitor[];
  error?: string | null;
};

export default function TonightVisitorsSection({
  visitors,
  error,
}: TonightVisitorsSectionProps) {
  return (
    <section className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-4">
      <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#5a5668]">
        今夜の来店者
      </h2>

      {error && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-3 space-y-2">
        {visitors.length === 0 ? (
          <p className="text-sm text-[#9994a8]">今夜の来店はまだありません</p>
        ) : (
          visitors.map((visitor) => (
            <div
              key={visitor.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-[#18181f] px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#eeeaf4]">
                  {visitor.name}
                </p>
                {visitor.viaMazare && (
                  <p className="text-[10px] text-[#5a5668]">mazare 経由</p>
                )}
              </div>
              <span className="shrink-0 text-xs tabular-nums text-[#9994a8]">
                {visitor.time}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
