"use client";

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col justify-end">
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
        className="relative max-h-[min(85dvh,640px)] overflow-y-auto rounded-t-[20px] border border-white/10 bg-[#111118] shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#111118] px-4 py-3">
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
        <div className="p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
