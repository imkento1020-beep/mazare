"use client";

import {
  genderMixLabel,
  mergeMeetupLabel,
  mergeMoodLabel,
  type PostMazaruSettings,
} from "@/lib/guest-post/mazaruSettings";
import { MazaranaiIcon, MazaruIcon } from "@/components/icons/MazaruModeIcons";

type MazaruPostCardPanelProps = {
  settings: Pick<PostMazaruSettings, "mode" | "details">;
  size?: "sm" | "md";
  className?: string;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-[10px] leading-snug">
      <span className="shrink-0 text-[#5a5668]">{label}</span>
      <span className="font-semibold text-[#ddd8e8]">{value}</span>
    </div>
  );
}

export default function MazaruPostCardPanel({
  settings,
  size = "sm",
  className = "",
}: MazaruPostCardPanelProps) {
  const { mode, details } = settings;
  if (!mode) return null;

  const compact = size === "sm";

  if (mode === "mazaranai") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 ${className}`}
      >
        <span className="text-[#9994a8]">
          <MazaranaiIcon size={compact ? 14 : 18} />
        </span>
        <span className="text-[10px] font-bold text-[#c4bfd6]">マザらない</span>
        <span className="text-[9px] text-[#5a5668]">· 投稿のみ</span>
      </div>
    );
  }

  const rows: { label: string; value: string }[] = [];

  if (details.currentHeadcount != null) {
    rows.push({
      label: "いま",
      value: `${details.currentHeadcount}人${
        genderMixLabel(details.currentGenderMix)
          ? ` · ${genderMixLabel(details.currentGenderMix)}`
          : ""
      }`,
    });
  } else if (details.currentGenderMix) {
    rows.push({
      label: "いま",
      value: genderMixLabel(details.currentGenderMix) ?? "",
    });
  }

  if (details.mergeMaxHeadcount != null) {
    rows.push({
      label: "合流",
      value: `最大${details.mergeMaxHeadcount}人まで${
        genderMixLabel(details.mergeGenderMix)
          ? ` · ${genderMixLabel(details.mergeGenderMix)}`
          : ""
      }`,
    });
  }

  if (details.mergeMood) {
    rows.push({
      label: "雰囲気",
      value: mergeMoodLabel(details.mergeMood) ?? "",
    });
  }

  if (details.mergeMeetup) {
    rows.push({
      label: "場所",
      value: mergeMeetupLabel(details.mergeMeetup) ?? "",
    });
  }

  return (
    <div
      className={`rounded-xl border border-[#00e87a]/30 bg-[#00e87a]/[0.08] ${
        compact ? "px-2.5 py-2" : "px-3 py-2.5"
      } ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-[#00e87a]">
          <MazaruIcon size={compact ? 16 : 20} />
        </span>
        <span
          className={`font-black text-[#00e87a] ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          マザる
        </span>
        <span className="text-[9px] text-[#7dffb8]/80">合流ウェルカム</span>
      </div>
      {rows.length > 0 ? (
        <div className="mt-1.5 space-y-1">
          {rows.map((row) => (
            <Row key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      ) : (
        <p className="mt-1 text-[10px] text-[#9994a8]">
          合流OK · 詳細はDMやコメントで
        </p>
      )}
    </div>
  );
}
