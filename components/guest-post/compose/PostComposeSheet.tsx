"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PostComposeSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function PostComposeSheet({
  open,
  title,
  onClose,
  children,
}: PostComposeSheetProps) {
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !portalReady) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        aria-label="閉じる"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-compose-sheet-title"
        className="relative flex max-h-[min(85dvh,640px)] w-full flex-col overflow-hidden rounded-t-[20px] border border-white/10 bg-[#111118] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#111118] px-4 py-3">
          <h3 id="post-compose-sheet-title" className="text-sm font-black">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-bold text-[#ff3d00]"
          >
            完了
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}