"use client";

import {
  GENDER_MIX_OPTIONS,
  MERGE_MEETUP_OPTIONS,
  MERGE_MOOD_OPTIONS,
  defaultMazaruDetails,
  type GenderMix,
  type MazaruMode,
  type PostMazaruSettings,
} from "@/lib/guest-post/mazaruSettings";
import { MazaranaiIcon, MazaruIcon } from "@/components/icons/MazaruModeIcons";

type PostMazaruPickerProps = {
  value: PostMazaruSettings;
  onChange: (value: PostMazaruSettings) => void;
  disabled?: boolean;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#9994a8]">
      {children}
    </p>
  );
}

function Chip({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
        active
          ? "border-[#ff3d00]/55 bg-[#ff3d00]/15 text-[#ffcdbf]"
          : "border-white/10 bg-[#0d0d12] text-[#c4bfd6] hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );
}

function HeadcountPicker({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number | null;
  onChange: (n: number | null) => void;
  disabled?: boolean;
}) {
  const options = [1, 2, 3, 4, 5, 6, 7, 8, 10];
  return (
    <div>
      <p className="text-xs font-bold text-[#eeeaf4]">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((n) => (
          <Chip
            key={n}
            active={value === n}
            disabled={disabled}
            onClick={() => onChange(value === n ? null : n)}
          >
            {n}人{n === 10 ? "+" : ""}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function GenderMixPicker({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: GenderMix | null;
  onChange: (v: GenderMix | null) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-[#eeeaf4]">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {GENDER_MIX_OPTIONS.map((opt) => (
          <Chip
            key={opt.id}
            active={value === opt.id}
            disabled={disabled}
            onClick={() => onChange(value === opt.id ? null : opt.id)}
          >
            {opt.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function ModeCard({
  mode,
  active,
  disabled,
  onSelect,
}: {
  mode: MazaruMode;
  active: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  const isMazaru = mode === "mazaru";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`flex min-h-[108px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-4 text-center transition disabled:opacity-50 ${
        active
          ? isMazaru
            ? "border-[#00e87a]/50 bg-gradient-to-b from-[#00e87a]/18 to-[#00e87a]/5 shadow-[0_0_24px_rgba(0,232,122,0.12)]"
            : "border-[#9994a8]/40 bg-gradient-to-b from-white/[0.08] to-transparent"
          : "border-white/[0.08] bg-[#0d0d12] hover:border-white/15"
      }`}
    >
      <span
        className={
          isMazaru
            ? "text-[#00e87a]"
            : "text-[#9994a8]"
        }
      >
        {isMazaru ? <MazaruIcon size={32} /> : <MazaranaiIcon size={32} />}
      </span>
      <span className="text-sm font-black text-[#eeeaf4]">
        {isMazaru ? "マザる" : "マザらない"}
      </span>
      <span className="text-[10px] leading-snug text-[#9994a8]">
        {isMazaru
          ? "近くにいる人に合流できることを伝えます"
          : "今夜は内輪で飲みます（投稿のみ）"}
      </span>
    </button>
  );
}

export default function PostMazaruPicker({
  value,
  onChange,
  disabled,
}: PostMazaruPickerProps) {
  const selectMode = (mode: MazaruMode) => {
    if (value.mode === mode) return;

    onChange({
      mode,
      details:
        mode === "mazaru"
          ? value.mode === "mazaru"
            ? value.details
            : defaultMazaruDetails()
          : defaultMazaruDetails(),
    });
  };

  const patchDetails = (patch: Partial<PostMazaruSettings["details"]>) => {
    onChange({
      ...value,
      details: { ...value.details, ...patch },
    });
  };

  return (
    <div className="space-y-5">
      <p className="text-xs leading-relaxed text-[#9994a8]">
        今夜、近くの人と合流したいかどうかを選べます。左右をタップして切り替えられます。
      </p>

      <div className="grid grid-cols-2 gap-2">
        <ModeCard
          mode="mazaru"
          active={value.mode === "mazaru"}
          disabled={disabled}
          onSelect={() => selectMode("mazaru")}
        />
        <ModeCard
          mode="mazaranai"
          active={value.mode === "mazaranai"}
          disabled={disabled}
          onSelect={() => selectMode("mazaranai")}
        />
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          value.mode === "mazaru"
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-5 rounded-2xl border border-[#00e87a]/20 bg-[#00e87a]/[0.06] p-4">
            <div className="space-y-4">
              <SectionLabel>今の状況</SectionLabel>
              <HeadcountPicker
                label="いまの人数（トータル）"
                value={value.details.currentHeadcount}
                disabled={disabled}
                onChange={(n) => patchDetails({ currentHeadcount: n })}
              />
              <GenderMixPicker
                label="いまの男女比"
                value={value.details.currentGenderMix}
                disabled={disabled}
                onChange={(v) => patchDetails({ currentGenderMix: v })}
              />
            </div>

            <div className="space-y-4 border-t border-white/[0.06] pt-4">
              <SectionLabel>合流のイメージ</SectionLabel>
              <HeadcountPicker
                label="合流後の最大人数（目安）"
                value={value.details.mergeMaxHeadcount}
                disabled={disabled}
                onChange={(n) => patchDetails({ mergeMaxHeadcount: n })}
              />
              <GenderMixPicker
                label="求める男女比"
                value={value.details.mergeGenderMix}
                disabled={disabled}
                onChange={(v) => patchDetails({ mergeGenderMix: v })}
              />
              <p className="text-xs font-bold text-[#eeeaf4]">今夜の飲みの気分</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {MERGE_MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      patchDetails({
                        mergeMood:
                          value.details.mergeMood === opt.id ? null : opt.id,
                      })
                    }
                    className={`rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-50 ${
                      value.details.mergeMood === opt.id
                        ? "border-[#ff3d00]/50 bg-[#ff3d00]/12"
                        : "border-white/10 bg-[#0d0d12]"
                    }`}
                  >
                    <span className="block text-xs font-bold text-[#eeeaf4]">
                      {opt.label}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-[#9994a8]">
                      {opt.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-white/[0.06] pt-4">
              <SectionLabel>どこで合流する？</SectionLabel>
              <div className="flex flex-col gap-2">
                {MERGE_MEETUP_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.id}
                    active={value.details.mergeMeetup === opt.id}
                    disabled={disabled}
                    onClick={() =>
                      patchDetails({
                        mergeMeetup:
                          value.details.mergeMeetup === opt.id ? null : opt.id,
                      })
                    }
                  >
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
