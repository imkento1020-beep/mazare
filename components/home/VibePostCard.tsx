"use client";

import Link from "next/link";
import { formatGenre, formatOpenHours, type VibePost } from "@/lib/home/types";

function genreEmoji(genre: string) {
  if (genre.includes("居酒屋")) return "🎵";
  if (genre.includes("バー") || genre.includes("クラフト")) return "🍻";
  return "🕺";
}

function heatLevel(moods: string[] | null) {
  if (moods?.includes("激熱")) return { filled: 5, label: "激熱🔥", color: "text-[#ffaa00]" };
  if (moods?.includes("混ざり歓迎")) return { filled: 3, label: "盛り上がり中", color: "text-[#00e87a]" };
  return { filled: 2, label: "これから", color: "text-[#a855f7]" };
}

function tagClass(mood: string) {
  if (mood === "激熱") return "border-[#ff3d00]/30 bg-[#ff3d00]/10 text-[#ff3d00]";
  if (mood === "音楽あり") return "border-[#ffaa00]/30 bg-[#ffaa00]/10 text-[#ffaa00]";
  return "border-white/10 bg-[#18181f] text-[#5a5668]";
}

type VibePostCardProps = {
  post: VibePost;
  interestCount: number;
  interested: boolean;
  isSubmitting: boolean;
  onInterest: () => void;
};

export default function VibePostCard({
  post,
  interestCount,
  interested,
  isSubmitting,
  onInterest,
}: VibePostCardProps) {
  const shop = post.shops;
  const genre = formatGenre(shop?.genre);
  const heat = heatLevel(post.moods);
  const shopHref = shop?.id ? `/shop/${shop.id}` : undefined;

  return (
    <article className="overflow-hidden rounded-2xl border border-white/7 bg-[#111118] transition hover:-translate-y-0.5 hover:border-[#ff3d00]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {shopHref ? (
        <Link href={shopHref} className="block">
          <CardVisual genre={genre} heat={heat} />
        </Link>
      ) : (
        <CardVisual genre={genre} heat={heat} />
      )}

      <div className="p-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          {shopHref ? (
            <Link href={shopHref} className="text-[15px] font-extrabold leading-tight text-[#eeeaf4] hover:text-[#ff3d00]">
              {shop?.name ?? "—"}
            </Link>
          ) : (
            <h3 className="text-[15px] font-extrabold leading-tight text-[#eeeaf4]">
              {shop?.name ?? "—"}
            </h3>
          )}
          <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-[#00e87a]/25 bg-[#00e87a]/10 px-2 py-0.5">
            <span className="text-[11px] font-extrabold text-[#00e87a]">
              {interestCount}
            </span>
            <span className="text-[10px] text-[#00e87a]/80">行くかも</span>
          </div>
        </div>

        <p className="mb-2 flex gap-2 text-[11px] text-[#5a5668]">
          <span>📍 {shop?.address ?? "—"}</span>
          <span>🕙 {formatOpenHours(shop?.open_hours)}</span>
        </p>

        <div className="mb-2 rounded-lg border-l-2 border-[#ff3d00] bg-[#18181f] px-2.5 py-2">
          <p className="mb-0.5 text-[9px] text-[#5a5668]">今夜の発信</p>
          <p className="text-[11px] leading-relaxed text-[#9994a8]">
            {post.comment}
          </p>
        </div>

        {post.moods && post.moods.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {post.moods.map((mood) => (
              <span
                key={mood}
                className={`rounded-full border px-2 py-0.5 text-[10px] ${tagClass(mood)}`}
              >
                {mood}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#5a5668]">
            👋 {interestCount}人が関心
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onInterest();
            }}
            disabled={isSubmitting}
            className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition disabled:opacity-60 ${
              interested
                ? "border-[#00e87a]/40 bg-[#00e87a]/12 text-[#00e87a] hover:border-white/20 hover:bg-[#18181f] hover:text-[#9994a8]"
                : "border-white/12 bg-[#18181f] text-[#9994a8] hover:border-[#00e87a]/40 hover:text-[#00e87a]"
            }`}
          >
            {isSubmitting
              ? "送信中..."
              : interested
                ? "👋 行くかも ✓"
                : "👋 行くかも"}
          </button>
        </div>
      </div>
    </article>
  );
}

function CardVisual({
  genre,
  heat,
}: {
  genre: string;
  heat: ReturnType<typeof heatLevel>;
}) {
  return (
    <div className="relative h-[130px] overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a0a00] to-[#2d1200] text-4xl">
        {genreEmoji(genre)}
      </div>
      <span className="absolute left-2 top-2 rounded-[5px] bg-[#ff3d00] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
        LIVE NOW
      </span>
      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-white/12 bg-[#080810]/80 px-2 py-1 backdrop-blur-sm">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`h-1 w-1 rounded-full ${
                i <= heat.filled
                  ? i === 5 && heat.filled === 5
                    ? "bg-[#ffaa00]"
                    : "bg-[#ff3d00]"
                  : "bg-white/12"
              }`}
            />
          ))}
        </div>
        <span className={`text-[10px] font-bold ${heat.color}`}>
          {heat.label}
        </span>
      </div>
    </div>
  );
}
