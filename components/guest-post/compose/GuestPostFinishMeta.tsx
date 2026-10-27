"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { supabase } from "@/lib/supabase";
import { getTonightWindowJST } from "@/lib/home/dates";
import type { NightOutInput } from "@/lib/guest-post/nightOut";

type GuestPostFinishMetaProps = {
  userId: string | null;
  value: NightOutInput;
  onChange: Dispatch<SetStateAction<NightOutInput>>;
  mode?: "full" | "stopOnly" | "detailsOnly";
};

export default function GuestPostFinishMeta({
  userId,
  value,
  onChange,
  mode = "full",
}: GuestPostFinishMetaProps) {
  const suggestedStopRef = useRef(false);
  const [optionalOpen, setOptionalOpen] = useState(mode === "detailsOnly");

  useEffect(() => {
    if (!userId || suggestedStopRef.current) return;

    let cancelled = false;

    void (async () => {
      const { start, end } = getTonightWindowJST();
      const { count, error } = await supabase
        .from("vibe_posts")
        .select("*", { count: "exact", head: true })
        .eq("author_id", userId)
        .eq("is_guest_post", true)
        .gte("posted_at", start.toISOString())
        .lt("posted_at", end.toISOString());

      if (cancelled || error) return;

      suggestedStopRef.current = true;
      const next = Math.min(10, (count ?? 0) + 1);
      onChange((prev) =>
        prev.stopNumber != null ? prev : { ...prev, stopNumber: next },
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, onChange]);

  const stop = value.stopNumber ?? 1;

  const stopSection = (
    <div>
      <p className="text-xs font-bold text-[#9994a8]">
        今夜何軒目？ <span className="text-[#ff3d00]">*</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const active = value.stopNumber === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...value, stopNumber: n })}
              className={`min-w-[2.5rem] rounded-full px-3 py-1.5 text-sm font-bold transition ${
                active
                  ? "bg-[#ff3d00] text-white"
                  : "border border-white/15 bg-[#111118] text-[#eeeaf4]"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-[#5a5668]">
        提案: {stop}軒目（タップで変更）
      </p>
    </div>
  );

  const detailsSection = (
    <div className="space-y-3">
          <div>
            <label
              htmlFor="finish-drink-name"
              className="text-xs font-bold text-[#eeeaf4]"
            >
              今飲んでいるドリンク
            </label>
            <input
              id="finish-drink-name"
              type="text"
              value={value.drinkName}
              onChange={(event) =>
                onChange({
                  ...value,
                  drinkName: event.target.value.slice(0, 40),
                })
              }
              placeholder="ハイボール、生ビールなど"
              className="mt-1.5 w-full rounded-[10px] border border-white/10 bg-[#111118] px-3 py-2 text-sm outline-none focus:border-[#ff3d00]/40"
            />
          </div>

          <div>
            <p className="text-xs font-bold text-[#eeeaf4]">今夜のトータル杯数</p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    tonightTotalCups: Math.max(
                      1,
                      (value.tonightTotalCups ?? 1) - 1,
                    ),
                  })
                }
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 bg-[#111118] text-lg font-bold"
              >
                −
              </button>
              <span className="min-w-[3rem] text-center text-xl font-black tabular-nums text-[#ff3d00]">
                {value.tonightTotalCups ?? "—"}
              </span>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    tonightTotalCups:
                      value.tonightTotalCups == null
                        ? 1
                        : Math.min(99, value.tonightTotalCups + 1),
                  })
                }
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 bg-[#111118] text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-[#eeeaf4]">一緒に飲んでいる人数</p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    partySize: Math.max(1, (value.partySize ?? 1) - 1),
                  })
                }
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 bg-[#111118] text-lg font-bold"
              >
                −
              </button>
              <span className="min-w-[3rem] text-center text-xl font-black tabular-nums text-[#00e87a]">
                {value.partySize ?? "—"}
              </span>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    partySize:
                      value.partySize == null
                        ? 1
                        : Math.min(10, value.partySize + 1),
                  })
                }
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 bg-[#111118] text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>
    </div>
  );

  if (mode === "stopOnly") {
    return <div className="space-y-1">{stopSection}</div>;
  }

  if (mode === "detailsOnly") {
    return detailsSection;
  }

  return (
    <div className="space-y-3">
      {stopSection}
      <button
        type="button"
        onClick={() => setOptionalOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-left text-xs font-bold text-[#9994a8]"
      >
        今夜の詳細を追加（任意）
        <span className="text-[#ff3d00]">{optionalOpen ? "−" : "+"}</span>
      </button>
      {optionalOpen ? detailsSection : null}
    </div>
  );
}
