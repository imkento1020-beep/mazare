"use client";

import type { ReactNode } from "react";
import { MazaranaiIcon, MazaruIcon } from "@/components/icons/MazaruModeIcons";
import {
  MERGE_ATTITUDES,
  VIBE_SCALES,
  type MergeAttitude,
  type TonightSocialContext,
  type VibeScale,
} from "@/lib/profile/tonightSocialContext";

const MERGE_OPTION_ICON: Record<MergeAttitude, ReactNode> = {
  open: <MazaruIcon size={30} />,
  closed: <MazaranaiIcon size={30} />,
};

type TonightSocialContextPickerProps = {
  value: TonightSocialContext;
  onChange: (value: TonightSocialContext) => void;
  disabled?: boolean;
};

function OptionButton({
  active,
  disabled,
  onClick,
  title,
  description,
  icon,
  iconTone = "neutral",
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  description: string;
  icon?: ReactNode;
  iconTone?: "mazaru" | "mazaranai" | "neutral";
}) {
  const iconColor =
    iconTone === "mazaru"
      ? "text-[#00e87a]"
      : iconTone === "mazaranai"
        ? "text-[#9994a8]"
        : "text-[#eeeaf4]";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative rounded-2xl border px-4 py-3.5 text-left transition disabled:opacity-50 ${
        active
          ? iconTone === "mazaru"
            ? "border-[#00e87a]/50 bg-gradient-to-br from-[#00e87a]/15 to-transparent"
            : iconTone === "mazaranai"
              ? "border-white/20 bg-gradient-to-br from-white/[0.08] to-transparent"
              : "border-[#ff3d00]/55 bg-gradient-to-br from-[#ff3d00]/15 to-transparent"
          : "border-white/[0.08] bg-[#0d0d12] hover:border-white/15"
      }`}
    >
      {active && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff3d00] text-[10px] font-black text-white">
          ✓
        </span>
      )}
      <div className="flex items-start gap-3 pr-6">
        {icon ? (
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-black/25 ${iconColor}`}
          >
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-bold ${
              active
                ? iconTone === "mazaru"
                  ? "text-[#00e87a]"
                  : iconTone === "mazaranai"
                    ? "text-[#eeeaf4]"
                    : "text-[#ff3d00]"
                : "text-[#eeeaf4]"
            }`}
          >
            {title}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-[#9994a8]">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function TonightSocialContextPicker({
  value,
  onChange,
  disabled = false,
}: TonightSocialContextPickerProps) {
  function setMerge(next: MergeAttitude | null) {
    onChange({
      ...value,
      mergeAttitude: value.mergeAttitude === next ? null : next,
    });
  }

  function setVibe(next: VibeScale | null) {
    onChange({
      ...value,
      vibeScale: value.vibeScale === next ? null : next,
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <p className="text-base font-black text-[#eeeaf4]">合流・声かけ</p>
          <p className="mt-1 text-xs leading-relaxed text-[#9994a8]">
            知らない人から連絡や合流を受け入れるかどうか。フィードで目立つ情報です。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          {MERGE_ATTITUDES.map((option) => (
            <OptionButton
              key={option.id}
              active={value.mergeAttitude === option.id}
              disabled={disabled}
              onClick={() => setMerge(option.id)}
              title={option.label}
              description={option.description}
              icon={MERGE_OPTION_ICON[option.id]}
              iconTone={option.id === "open" ? "mazaru" : "mazaranai"}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-base font-black text-[#eeeaf4]">席の人数感（任意）</p>
          <p className="mt-1 text-xs leading-relaxed text-[#9994a8]">
            合流 OK かどうかとは別です。今夜の雰囲気が伝わります。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {VIBE_SCALES.map((option) => (
            <OptionButton
              key={option.id}
              active={value.vibeScale === option.id}
              disabled={disabled}
              onClick={() => setVibe(option.id)}
              title={option.label}
              description={option.description}
            />
          ))}
        </div>
      </div>

      <p className="text-[11px] text-[#5a5668]">
        もう一度タップすると未設定に戻せます。どちらも空でも投稿できます。
      </p>
    </div>
  );
}
