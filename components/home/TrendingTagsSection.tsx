import Link from "next/link";
import type { TrendingTag } from "@/lib/feed/recentFeed";

type TrendingTagsSectionProps = {
  tags: TrendingTag[];
  title?: string;
};

export default function TrendingTagsSection({
  tags,
  title = "今夜のトレンドタグ",
}: TrendingTagsSectionProps) {
  if (tags.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-black">{title}</h2>
        <Link href="/trending" className="text-xs font-bold text-[#ff3d00]">
          すべて見る
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((item) => (
          <Link
            key={item.tag}
            href={`/trending?tag=${encodeURIComponent(item.tag)}`}
            className="rounded-full border border-[#ff3d00]/25 bg-[#ff3d00]/10 px-3 py-1.5 text-xs font-bold text-[#ff3d00]"
          >
            {item.tag}
            <span className="ml-1.5 text-[#9994a8]">{item.count}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
