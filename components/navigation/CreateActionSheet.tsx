"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  CheckinOutlineIcon,
  PostOutlineIcon,
} from "@/components/icons/CreateActionIcons";

type CreateActionSheetProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateActionSheet({
  open,
  onClose,
}: CreateActionSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        aria-label="閉じる"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-action-title"
        className="absolute inset-x-0 bottom-0 rounded-t-[20px] border-t border-white/10 bg-[#111118] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_48px_rgba(0,0,0,0.55)] animate-[mazare-sheet-up_0.32s_cubic-bezier(0.32,0.72,0,1)_both]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
        <p
          id="create-action-title"
          className="text-center text-base font-black text-[#eeeaf4]"
        >
          今夜の記録
        </p>
        <p className="mt-1 text-center text-xs text-[#9994a8]">
          写真なしでも、今いるお店を残せます
        </p>

        <div className="mt-5 space-y-2.5">
          <Link
            href="/post"
            onClick={onClose}
            className="flex items-center gap-4 rounded-2xl border border-[#ff3d00]/35 bg-[#ff3d00]/10 px-4 py-4 transition active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ff3d00]/20 text-[#ff3d00]">
              <PostOutlineIcon size={26} color="#ff3d00" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-sm font-black text-[#eeeaf4]">
                投稿する
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-[#9994a8]">
                お店の写真・動画で、今夜の空気を届ける
              </span>
            </span>
          </Link>

          <Link
            href="/checkin"
            onClick={onClose}
            className="flex items-center gap-4 rounded-2xl border border-[#ffaa00]/35 bg-[#ffaa00]/10 px-4 py-4 transition active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ffaa00]/15 text-[#ffaa00]">
              <CheckinOutlineIcon size={26} color="#ffaa00" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-sm font-black text-[#eeeaf4]">
                チェックインだけする
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-[#9994a8]">
                写真なしで記録。マップに「今夜ここ」が載る
              </span>
            </span>
          </Link>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2.5 text-sm font-semibold text-[#5a5668]"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
