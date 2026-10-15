export default function MyPageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-4 px-1">
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111118]">
        <div className="h-24 bg-[#18181f]" />
        <div className="px-5 pb-5">
          <div className="-mt-10 h-20 w-20 rounded-full bg-[#18181f]" />
          <div className="mt-4 h-5 w-32 rounded bg-[#18181f]" />
          <div className="mt-3 flex gap-6">
            <div className="h-8 w-12 rounded bg-[#18181f]" />
            <div className="h-8 w-12 rounded bg-[#18181f]" />
            <div className="h-8 w-12 rounded bg-[#18181f]" />
          </div>
        </div>
      </div>
      <div className="h-10 rounded-2xl bg-[#111118]" />
      <div className="h-36 rounded-2xl bg-[#111118]" />
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square bg-[#111118]" />
        ))}
      </div>
    </div>
  );
}
