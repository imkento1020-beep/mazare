"use client";

import { useState } from "react";
import type { TodayInterestRow } from "@/lib/home/types";
import { formatTonightInterestsShareText } from "@/lib/interests/share";

type TonightInterestsShareButtonProps = {
  items: TodayInterestRow[];
};

export default function TonightInterestsShareButton({
  items,
}: TonightInterestsShareButtonProps) {
  const [label, setLabel] = useState("リストをシェア");
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    if (items.length === 0 || busy) return;

    const text = formatTonightInterestsShareText(items);
    setBusy(true);

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ text });
        return;
      }

      await navigator.clipboard.writeText(text);
      setLabel("✓ コピーしました");
      window.setTimeout(() => setLabel("リストをシェア"), 2000);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      try {
        await navigator.clipboard.writeText(text);
        setLabel("✓ コピーしました");
        window.setTimeout(() => setLabel("リストをシェア"), 2000);
      } catch {
        setLabel("シェアに失敗しました");
        window.setTimeout(() => setLabel("リストをシェア"), 2000);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={busy}
      className="rounded-xl border border-[#00e87a]/30 bg-[#00e87a]/10 px-4 py-2.5 text-sm font-bold text-[#00e87a] transition hover:bg-[#00e87a]/15 disabled:opacity-60"
    >
      {label}
    </button>
  );
}
