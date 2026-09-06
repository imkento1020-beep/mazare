"use client";

import { useCallback, useRef, useState } from "react";
import type { Shop } from "@/lib/home/types";
import { analyzeStoryImage, type StoryDraft } from "@/lib/dev/mockStoryAnalysis";
import { readFileAsDataUrl } from "@/lib/files";
import VibePostForm from "@/components/owner/VibePostForm";
import { inputClassName, primaryButtonClassName } from "@/lib/ui/styles";

type Step = "import" | "review" | "done";

type StoryImportPrototypeProps = {
  shops: Shop[];
};

export default function StoryImportPrototype({ shops }: StoryImportPrototypeProps) {
  const [step, setStep] = useState<Step>("import");
  const [shopId, setShopId] = useState("");
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [hintText, setHintText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [draft, setDraft] = useState<StoryDraft | null>(null);
  const [draftKey, setDraftKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [lastPayload, setLastPayload] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedShop = shops.find((shop) => shop.id === shopId) ?? null;

  const handleFile = useCallback(async (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("画像ファイルを選んでください");
      return;
    }

    setError(null);
    const dataUrl = await readFileAsDataUrl(file);
    setStoryImage(dataUrl);
    setDraft(null);
    setStep("import");
  }, []);

  async function handleAnalyze() {
    if (!selectedShop) {
      setError("投稿先の店舗を選んでください");
      return;
    }
    if (!storyImage) {
      setError("ストーリー画像をアップロードしてください");
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeStoryImage({
        shopName: selectedShop.name,
        hintText,
      });
      setDraft(result);
      setDraftKey((prev) => prev + 1);
      setStep("review");
    } catch {
      setError("下書きの作成に失敗しました。もう一度お試しください。");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handlePrototypeSubmit(input: {
    moods: string[];
    comment: string;
    images: string[];
    postedAt?: string;
  }) {
    if (!selectedShop) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const payload = {
      shopId: selectedShop.id,
      shopName: selectedShop.name,
      ...input,
    };

    setLastPayload(JSON.stringify(payload, null, 2));
    setSubmitting(false);
    setStep("done");
  }

  function resetFlow() {
    setStep("import");
    setStoryImage(null);
    setHintText("");
    setDraft(null);
    setLastPayload(null);
    setError(null);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        <p className="font-bold">管理者専用プロトタイプ</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-100/80">
          プラットフォーム管理者のみアクセスできます。AI解析はモックです。投稿ボタンを押してもデータは保存されません。
        </p>
      </div>

      <ol className="flex gap-2 text-xs font-medium">
        {[
          { id: "import", label: "1. 取り込み" },
          { id: "review", label: "2. 確認・編集" },
          { id: "done", label: "3. 完了" },
        ].map((item) => {
          const active = step === item.id;
          const done =
            (item.id === "import" && (step === "review" || step === "done")) ||
            (item.id === "review" && step === "done");

          return (
            <li
              key={item.id}
              className={`flex-1 rounded-lg border px-3 py-2 text-center transition ${
                active
                  ? "border-[#ff3d00]/40 bg-[#ff3d00]/12 text-[#ff3d00]"
                  : done
                    ? "border-white/10 bg-[#18181f] text-[#eeeaf4]"
                    : "border-white/7 bg-[#111118] text-[#5a5668]"
              }`}
            >
              {item.label}
            </li>
          );
        })}
      </ol>

      {step !== "done" && (
        <section className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-5">
          <label htmlFor="shop" className="block text-sm font-medium">
            投稿先の店舗
          </label>
          <p className="mt-1 text-xs text-[#9994a8]">
            代行投稿するお店を選びます（運用初期はここで店舗を切り替え）。
          </p>
          <select
            id="shop"
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
            className={inputClassName}
          >
            <option value="">店舗を選択...</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </section>
      )}

      {step === "import" && (
        <>
          <section className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-5">
            <p className="text-sm font-medium">Instagramストーリー画像</p>
            <p className="mt-1 text-xs leading-relaxed text-[#9994a8]">
              店舗のストーリーをスクショまたは書き出しした画像をドロップしてください。
            </p>

            <div
              role="button"
              tabIndex={0}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                void handleFile(e.dataTransfer.files[0] ?? null);
              }}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`mt-4 flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${
                dragOver
                  ? "border-[#ff3d00]/50 bg-[#ff3d00]/5"
                  : "border-white/10 bg-[#080810] hover:border-[#ff3d00]/30"
              }`}
            >
              {storyImage ? (
                <div className="relative aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={storyImage}
                    alt="ストーリープレビュー"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <>
                  <span className="text-3xl">📱</span>
                  <p className="mt-3 text-sm font-medium">ここに画像をドロップ</p>
                  <p className="mt-1 text-xs text-[#5a5668]">またはクリックして選択</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {storyImage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setStoryImage(null);
                }}
                className="mt-3 text-xs text-[#9994a8] underline-offset-2 hover:text-[#ff3d00] hover:underline"
              >
                画像を取り消す
              </button>
            )}
          </section>

          <section className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-5">
            <label htmlFor="hint" className="block text-sm font-medium">
              ストーリーの文言メモ（任意）
            </label>
            <p className="mt-1 text-xs leading-relaxed text-[#9994a8]">
              画像内のテキストをコピペすると、モックAIがコメントとタグを提案します。
            </p>
            <textarea
              id="hint"
              value={hintText}
              onChange={(e) => setHintText(e.target.value)}
              rows={4}
              placeholder={"例:\n今夜20時から営業中\nカウンター空きあり\n初めての方も大歓迎🍻"}
              className="mt-3 min-h-[96px] w-full resize-none rounded-xl border border-white/[0.12] bg-[#18181f] px-4 py-3 text-sm text-[#eeeaf4] outline-none placeholder:text-[#5a5668] focus:border-[#ff3d00]/50"
            />
          </section>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="button"
            disabled={analyzing || !storyImage || !shopId}
            onClick={() => void handleAnalyze()}
            className={`${primaryButtonClassName} shadow-[0_6px_24px_rgba(255,61,0,0.25)]`}
          >
            {analyzing ? "下書きを作成中..." : "AIで下書きを作成"}
          </button>
        </>
      )}

      {step === "review" && draft && selectedShop && storyImage && (
        <div className="space-y-6">
          <section className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">AI下書き（モック）</p>
                <p className="mt-1 text-xs text-[#9994a8]">
                  {selectedShop.name} 向けに生成しました。内容は自由に編集できます。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep("import")}
                className="text-xs text-[#9994a8] underline-offset-2 hover:text-[#ff3d00] hover:underline"
              >
                取り込みに戻る
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[140px_1fr]">
              <div className="aspect-[9/16] overflow-hidden rounded-xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={storyImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-[#080810] p-4 text-xs leading-relaxed text-[#9994a8]">
                <p className="font-medium text-[#eeeaf4]">抽出テキスト（モック）</p>
                <p className="mt-2 whitespace-pre-wrap">{draft.extractedText}</p>
              </div>
            </div>
          </section>

          <VibePostForm
            key={draftKey}
            initialMoods={draft.presetMoods}
            initialComment={draft.comment}
            initialImages={[storyImage]}
            submitLabel="この内容で発信する（プロトタイプ）"
            submitting={submitting}
            error={error}
            onSubmit={handlePrototypeSubmit}
          />
        </div>
      )}

      {step === "done" && (
        <section className="rounded-[14px] border border-emerald-500/30 bg-emerald-500/10 p-5">
          <p className="text-sm font-bold text-emerald-300">プロトタイプ投稿を確認しました</p>
          <p className="mt-2 text-xs leading-relaxed text-emerald-100/80">
            本番DBには保存していません。将来はここから{" "}
            <code className="rounded bg-black/20 px-1">createVibePost</code>{" "}
            を呼び出して代行投稿できます。
          </p>

          {lastPayload && (
            <pre className="mt-4 max-h-64 overflow-auto rounded-xl border border-white/10 bg-[#080810] p-4 text-[11px] leading-relaxed text-[#9994a8]">
              {lastPayload}
            </pre>
          )}

          <button
            type="button"
            onClick={resetFlow}
            className={`${primaryButtonClassName} mt-5`}
          >
            別のストーリーを取り込む
          </button>
        </section>
      )}
    </div>
  );
}
