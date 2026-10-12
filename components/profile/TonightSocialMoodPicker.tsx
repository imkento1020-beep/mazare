"use client";

import {
  TONIGHT_SOCIAL_MOODS,
  type TonightSocialMoodId,
} from "@/lib/profile/tonightSocialMood";

type TonightSocialMoodPickerProps = {
  value: TonightSocialMoodId | null;
  onChange: (value: TonightSocialMoodId | null) => void;
  disabled?: boolean;
};

export default function TonightSocialMoodPicker({
  value,
  onChange,
  disabled = false,
}: TonightSocialMoodPickerProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-base font-black text-[#eeeaf4]">今夜の気分</p>
        <p className="mt-1 text-xs leading-relaxed text-[#9994a8]">
          合流OKか、人数の希望など。ホームや探すで他のユーザーに伝わります。
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {TONIGHT_SOCIAL_MOODS.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(active ? null : option.id)}
              className={`relative rounded-2xl border px-4 py-3.5 text-left transition disabled:opacity-50 ${
                active
                  ? "border-[#ff3d00]/55 bg-gradient-to-br from-[#ff3d00]/15 to-transparent shadow-[inset_0_0_0_1px_rgba(255,61,0,0.2)]"
                  : "border-white/[0.08] bg-[#0d0d12] hover:border-white/15"
              }`}
            >
              {active && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff3d00] text-[10px] font-black text-white">
                  ✓
                </span>
              )}
              <p
                className={`pr-8 text-sm font-bold ${active ? "text-[#ff3d00]" : "text-[#eeeaf4]"}`}
              >
                {option.label}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-[#9994a8]">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
      {value && (
        <p className="text-[11px] text-[#5a5668]">
          もう一度タップすると未設定に戻せます
        </p>
      )}
    </div>
  );
}
