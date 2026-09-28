"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { supabase } from "@/lib/supabase";
import { getTonightWindowJST } from "@/lib/home/dates";
import { DRINK_PRESETS, type NightOutInput } from "@/lib/guest-post/nightOut";

type TonightDrinkInputProps = {
  userId: string | null;
  value: NightOutInput;
  onChange: Dispatch<SetStateAction<NightOutInput>>;
};

export default function TonightDrinkInput({
  userId,
  value,
  onChange,
}: TonightDrinkInputProps) {
  const [customDrink, setCustomDrink] = useState("");
  const suggestedStopRef = useRef(false);
  const showCustom =
    value.drinkName !== "" &&
    !DRINK_PRESETS.includes(value.drinkName as (typeof DRINK_PRESETS)[number]);

  useEffect(() => {
    if (!userId || suggestedStopRef.current) return;

    let cancelled = false;

    async function suggestStop() {
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
      const next = Math.min(30, (count ?? 0) + 1);
      onChange((prev) =>
        prev.stopNumber != null ? prev : { ...prev, stopNumber: next },
      );
    }

    void suggestStop();

    return () => {
      cancelled = true;
    };
  }, [userId, onChange]);

  function setStop(n: number | null) {
    onChange({ ...value, stopNumber: n });
  }

  function setDrink(name: string) {
    onChange({
      ...value,
      drinkName: name,
      drinkCups: name ? value.drinkCups ?? 1 : null,
    });
  }

  function setCups(cups: number) {
    onChange({ ...value, drinkCups: Math.max(1, Math.min(99, cups)) });
  }

  return (
    <div className="space-y-5 rounded-[14px] border border-[#ff3d00]/25 bg-[#ff3d00]/[0.06] p-4">
      <div>
        <p className="text-sm font-black text-[#eeeaf4]">今夜何軒目？</p>
        <p className="mt-1 text-[11px] text-[#9994a8]">
          同じ時間帯の人に「今の流れ」が伝わります
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => {
            const active = value.stopNumber === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setStop(active ? null : n)}
                className={`min-w-[3rem] rounded-[10px] px-3 py-2 text-sm font-bold transition ${
                  active
                    ? "bg-[#ff3d00] text-white"
                    : "border border-white/10 bg-[#111118] text-[#9994a8] hover:border-[#ff3d00]/40"
                }`}
              >
                {n}軒目
              </button>
            );
          })}
          <button
            type="button"
            onClick={() =>
              setStop(value.stopNumber != null && value.stopNumber > 6 ? null : 7)
            }
            className={`rounded-[10px] px-3 py-2 text-sm font-bold transition ${
              value.stopNumber != null && value.stopNumber >= 7
                ? "bg-[#ff3d00] text-white"
                : "border border-white/10 bg-[#111118] text-[#9994a8]"
            }`}
          >
            7軒目+
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-black text-[#eeeaf4]">いま何を飲んでる？</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DRINK_PRESETS.map((label) => {
            const active = value.drinkName === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setDrink(active ? "" : label)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? "bg-[#ffaa00]/20 text-[#ffcc66] ring-1 ring-[#ffaa00]/50"
                    : "border border-white/10 bg-[#111118] text-[#9994a8]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={showCustom ? value.drinkName : customDrink}
          onChange={(event) => {
            const next = event.target.value;
            setCustomDrink(next);
            setDrink(next);
          }}
          placeholder="その他（例: 梅酒ソーダ）"
          maxLength={40}
          className="mt-3 w-full rounded-[10px] border border-white/10 bg-[#111118] px-3 py-2.5 text-sm outline-none focus:border-[#ff3d00]/40"
        />
      </div>

      {value.drinkName && (
        <div>
          <p className="text-sm font-black text-[#eeeaf4]">だいたい何杯目？</p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              aria-label="杯数を減らす"
              onClick={() => setCups((value.drinkCups ?? 1) - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-[#111118] text-lg font-bold text-[#eeeaf4]"
            >
              −
            </button>
            <span className="min-w-[4rem] text-center text-2xl font-black tabular-nums text-[#ff3d00]">
              {value.drinkCups ?? 1}
              <span className="ml-0.5 text-sm font-bold text-[#9994a8]">杯</span>
            </span>
            <button
              type="button"
              aria-label="杯数を増やす"
              onClick={() => setCups((value.drinkCups ?? 1) + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-[#111118] text-lg font-bold text-[#eeeaf4]"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
