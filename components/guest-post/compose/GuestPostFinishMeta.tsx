"use client";

import type { Dispatch, SetStateAction } from "react";
import type { NightOutInput } from "@/lib/guest-post/nightOut";

type GuestPostFinishMetaProps = {
  value: NightOutInput;
  onChange: Dispatch<SetStateAction<NightOutInput>>;
  mode?: "partyOnly";
};

export default function GuestPostFinishMeta({
  value,
  onChange,
  mode = "partyOnly",
}: GuestPostFinishMetaProps) {
  if (mode !== "partyOnly") {
    return null;
  }

  return (
    <div>
      <p className="text-xs leading-relaxed text-[#9994a8]">
        一緒にいる人数がわかると、雰囲気が伝わりやすくなります。未設定でも投稿できます。
      </p>
      <p className="mt-3 text-xs font-bold text-[#eeeaf4]">人数</p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            onChange({
              ...value,
              partySize:
                value.partySize == null
                  ? null
                  : Math.max(1, value.partySize - 1),
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
        {value.partySize != null ? (
          <button
            type="button"
            onClick={() => onChange({ ...value, partySize: null })}
            className="text-xs font-bold text-[#9994a8] underline"
          >
            クリア
          </button>
        ) : null}
      </div>
    </div>
  );
}
