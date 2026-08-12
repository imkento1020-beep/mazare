"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { extractAreaFromAddress } from "@/lib/geo/area";
import { formatOpenHours, type TodayInterestRow } from "@/lib/home/types";

type TonightInterestCardProps = {
  item: TodayInterestRow;
  onCancel?: (interestId: string) => void;
  onNoteSave?: (interestId: string, note: string | null) => Promise<string | null>;
  canceling?: boolean;
  compact?: boolean;
  showMemo?: boolean;
};

export default function TonightInterestCard({
  item,
  onCancel,
  onNoteSave,
  canceling = false,
  compact = false,
  showMemo = false,
}: TonightInterestCardProps) {
  const shop = item.vibe_posts?.shops;
  const area = extractAreaFromAddress(shop?.address);
  const [memoOpen, setMemoOpen] = useState(false);
  const [draftNote, setDraftNote] = useState(item.note ?? "");
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  useEffect(() => {
    setDraftNote(item.note ?? "");
  }, [item.note]);

  async function handleSaveNote() {
    if (!onNoteSave || savingNote) return;

    setSavingNote(true);
    setNoteError(null);

    const error = await onNoteSave(item.id, draftNote);
    setSavingNote(false);

    if (error) {
      setNoteError(error);
      return;
    }

    setMemoOpen(false);
  }

  return (
    <div
      className={`rounded-2xl border border-white/[0.07] bg-[#111118] ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/shop/${item.shop_id}`}
            className={`font-extrabold text-[#eeeaf4] hover:text-[#ff3d00] ${
              compact ? "text-base" : "text-lg"
            }`}
          >
            {shop?.name ?? "お店"}
          </Link>
          <p className="mt-1 text-sm text-[#9994a8]">
            📍 {area}
            {shop?.open_hours
              ? ` · 🕙 ${formatOpenHours(shop.open_hours)}`
              : ""}
          </p>
          {!compact && item.vibe_posts?.comment && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#9994a8]">
              {item.vibe_posts.comment}
            </p>
          )}
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={() => onCancel(item.id)}
            disabled={canceling}
            className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-[#ff3d00] disabled:opacity-60"
          >
            {canceling ? "取消中..." : "取り消す"}
          </button>
        )}
      </div>

      {showMemo && !compact && (
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          {item.note && !memoOpen && (
            <p className="mb-2 rounded-lg bg-[#18181f] px-3 py-2 text-sm text-[#eeeaf4]">
              📝 {item.note}
            </p>
          )}

          {!memoOpen ? (
            <button
              type="button"
              onClick={() => setMemoOpen(true)}
              className="text-sm font-semibold text-[#9994a8] transition hover:text-[#eeeaf4]"
            >
              📝 {item.note ? "メモを編集" : "メモを追加"}
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={draftNote}
                onChange={(event) => setDraftNote(event.target.value)}
                placeholder="例：友達と21時ごろに行く"
                rows={2}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#18181f] px-3 py-2.5 text-sm text-[#eeeaf4] placeholder:text-[#5a5668] focus:border-[#ff3d00]/40 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="rounded-lg bg-[#ff3d00] px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {savingNote ? "保存中..." : "保存"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraftNote(item.note ?? "");
                    setMemoOpen(false);
                    setNoteError(null);
                  }}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#9994a8] hover:text-[#eeeaf4]"
                >
                  キャンセル
                </button>
              </div>
              {noteError && (
                <p className="text-xs text-red-400">{noteError}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
