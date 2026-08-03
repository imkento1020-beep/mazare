"use client";

type FavoriteButtonProps = {
  favorited: boolean;
  loading?: boolean;
  onToggle: () => void;
  compact?: boolean;
};

export default function FavoriteButton({
  favorited,
  loading = false,
  onToggle,
  compact = false,
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      aria-label={favorited ? "お気に入りから外す" : "お気に入りに追加"}
      className={`inline-flex items-center justify-center rounded-xl border transition disabled:opacity-60 ${
        compact ? "h-10 w-10 text-lg" : "gap-2 px-4 py-2.5 text-sm font-semibold"
      } ${
        favorited
          ? "border-[#ff3d00]/40 bg-[#ff3d00]/10 text-[#ff3d00]"
          : "border-white/12 bg-[#111118] text-[#9994a8] hover:border-[#ff3d00]/30 hover:text-[#eeeaf4]"
      }`}
    >
      <span>{favorited ? "❤️" : "🤍"}</span>
      {!compact && (favorited ? "お気に入り済み" : "お気に入り")}
    </button>
  );
}
