"use client";

import { useEffect, useState } from "react";
import PostComposeSheet from "@/components/guest-post/compose/PostComposeSheet";

const TEMPLATES = [
  "今夜同じお店で飲んでます。合流しませんか？",
  "投稿見ました。少し声かけさせてください。",
  "近くにいるので、よければご一緒しましょう。",
] as const;

type ContactPostSheetProps = {
  open: boolean;
  onClose: () => void;
  shopName: string;
  authorName: string;
  submitting?: boolean;
  onSubmit: (message: string) => void | Promise<void>;
};

export default function ContactPostSheet({
  open,
  onClose,
  shopName,
  authorName,
  submitting = false,
  onSubmit,
}: ContactPostSheetProps) {
  const [message, setMessage] = useState<string>(TEMPLATES[0]);

  useEffect(() => {
    if (open) setMessage(TEMPLATES[0]);
  }, [open]);

  return (
    <PostComposeSheet open={open} title="連絡する" onClose={onClose}>
      <p className="text-xs leading-relaxed text-[#9994a8]">
        <span className="font-bold text-[#eeeaf4]">{authorName}</span>
        さん（{shopName}）に、今夜の合流の意思を送ります。相手は通知で受け取れます。
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl}
            type="button"
            onClick={() => setMessage(tpl)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
              message === tpl
                ? "border-[#00e87a]/50 bg-[#00e87a]/10 text-[#00e87a]"
                : "border-white/10 text-[#9994a8] hover:border-white/20"
            }`}
          >
            {tpl.length > 18 ? `${tpl.slice(0, 16)}…` : tpl}
          </button>
        ))}
      </div>

      <label htmlFor="contact-message" className="mt-4 block text-xs font-bold text-[#9994a8]">
        メッセージ
      </label>
      <textarea
        id="contact-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={280}
        rows={4}
        className="mt-2 w-full resize-none rounded-[12px] border border-white/10 bg-[#080810] px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-[#00e87a]/40"
      />

      <button
        type="button"
        disabled={submitting || !message.trim()}
        onClick={() => void onSubmit(message.trim())}
        className="mt-4 w-full rounded-[14px] bg-[#00e87a] py-3.5 text-sm font-black text-[#080810] disabled:opacity-50"
      >
        {submitting ? "送信中…" : "連絡を送る"}
      </button>
    </PostComposeSheet>
  );
}
