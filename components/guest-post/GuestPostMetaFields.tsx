"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { supabase } from "@/lib/supabase";
import { getTonightWindowJST } from "@/lib/home/dates";
import type { NightOutInput } from "@/lib/guest-post/nightOut";

type GuestPostMetaFieldsProps = {
  userId: string | null;
  value: NightOutInput;
  onChange: Dispatch<SetStateAction<NightOutInput>>;
  suggestStopNumber?: boolean;
  excludePostId?: string;
};

export default function GuestPostMetaFields({
  userId,
  value,
  onChange,
  suggestStopNumber = true,
  excludePostId,
}: GuestPostMetaFieldsProps) {
  const suggestedStopRef = useRef(false);

  useEffect(() => {
    if (!suggestStopNumber || !userId || suggestedStopRef.current) return;

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
      const next = Math.min(10, (count ?? 0) + 1);
      onChange((prev) =>
        prev.stopNumber != null ? prev : { ...prev, stopNumber: next },
      );
    }

    void suggestStop();

    return () => {
      cancelled = true;
    };
  }, [suggestStopNumber, userId, onChange]);

  function setStop(n: number | null) {
    onChange({ ...value, stopNumber: n });
  }

  function adjustTotal(delta: number) {
    const current = value.tonightTotalCups ?? 0;
    const next = Math.max(1, Math.min(99, current + delta));
    onChange({ ...value, tonightTotalCups: next });
  }

  function adjustParty(delta: number) {
    const current = value.partySize ?? 0;
    const next = Math.max(1, Math.min(10, current + delta));
    onChange({ ...value, partySize: next });
  }

  return (
    <div className="space-y-5 rounded-[14px] border border-[#ff3d00]/25 bg-[#ff3d00]/[0.06] p-4">
      <div>
        <p className="text-sm font-black text-[#eeeaf4]">
          今夜何軒目？ <span className="text-[#ff3d00]">*</span>
        </p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const active = value.stopNumber === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setStop(active ? null : n)}
                className={`rounded-[10px] py-2 text-sm font-bold transition ${
                  active
                    ? "bg-[#ff3d00] text-white"
                    : "border border-white/10 bg-[#111118] text-[#9994a8] hover:border-[#ff3d00]/40"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="guest-drink-name"
          className="text-sm font-black text-[#eeeaf4]"
        >
          今飲んでいるドリンク（任意）
        </label>
        <input
          id="guest-drink-name"
          type="text"
          value={value.drinkName}
          onChange={(event) =>
            onChange({ ...value, drinkName: event.target.value.slice(0, 40) })
          }
          placeholder="ハイボール、生ビールなど"
          className="mt-2 w-full rounded-[10px] border border-white/10 bg-[#111118] px-3 py-2.5 text-sm outline-none focus:border-[#ff3d00]/40"
        />
      </div>

      <div>
        <p className="text-sm font-black text-[#eeeaf4]">今夜のトータル杯数（任意）</p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            aria-label="杯数を減らす"
            onClick={() => adjustTotal(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-[#111118] text-lg font-bold"
          >
            −
          </button>
          <span className="min-w-[4rem] text-center text-2xl font-black tabular-nums text-[#ff3d00]">
            {value.tonightTotalCups ?? "—"}
            {value.tonightTotalCups != null && (
              <span className="ml-0.5 text-sm font-bold text-[#9994a8]">杯</span>
            )}
          </span>
          <button
            type="button"
            aria-label="杯数を増やす"
            onClick={() =>
              onChange((prev) => ({
                ...prev,
                tonightTotalCups:
                  prev.tonightTotalCups == null ? 1 : prev.tonightTotalCups + 1,
              }))
            }
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-[#111118] text-lg font-bold"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-black text-[#eeeaf4]">
          一緒に飲んでいる人数（任意）
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            aria-label="人数を減らす"
            onClick={() => adjustParty(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-[#111118] text-lg font-bold"
          >
            −
          </button>
          <span className="min-w-[4rem] text-center text-2xl font-black tabular-nums text-[#00e87a]">
            {value.partySize ?? "—"}
            {value.partySize != null && (
              <span className="ml-0.5 text-sm font-bold text-[#9994a8]">人</span>
            )}
          </span>
          <button
            type="button"
            aria-label="人数を増やす"
            onClick={() =>
              onChange((prev) => ({
                ...prev,
                partySize: prev.partySize == null ? 1 : Math.min(10, prev.partySize + 1),
              }))
            }
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-[#111118] text-lg font-bold"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
