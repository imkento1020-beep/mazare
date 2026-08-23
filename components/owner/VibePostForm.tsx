"use client";

import { useState } from "react";
import { isPostScheduled } from "@/lib/home/dates";
import { MOOD_OPTIONS, MAX_IMAGES } from "@/lib/owner/constants";
import {
  addCustomMood,
  MAX_CUSTOM_MOOD_LENGTH,
  MAX_MOOD_TAGS,
  mergeMoods,
  splitMoods,
} from "@/lib/owner/moods";
import {
  datetimeLocalJSTToIso,
  getDefaultScheduledPostTimeJST,
  isoToDatetimeLocalJST,
} from "@/lib/owner/scheduling";
import { readFilesAsDataUrls } from "@/lib/files";
import { inputClassName, primaryButtonClassName } from "@/lib/ui/styles";

type PublishMode = "now" | "schedule";

type VibePostFormProps = {
  initialMoods?: string[];
  initialComment?: string;
  initialImages?: string[];
  initialPostedAt?: string;
  allowSchedule?: boolean;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (input: {
    moods: string[];
    comment: string;
    images: string[];
    postedAt?: string;
  }) => void | Promise<void>;
};

export default function VibePostForm({
  initialMoods = [],
  initialComment = "",
  initialImages = [],
  initialPostedAt,
  allowSchedule = true,
  submitLabel,
  submitting,
  error,
  onSubmit,
}: VibePostFormProps) {
  const initialSplit = splitMoods(initialMoods);
  const initialScheduled =
    Boolean(initialPostedAt) && isPostScheduled(initialPostedAt);

  const [presetMoods, setPresetMoods] = useState<Set<string>>(initialSplit.preset);
  const [customMoods, setCustomMoods] = useState<string[]>(initialSplit.custom);
  const [customMoodInput, setCustomMoodInput] = useState("");
  const [comment, setComment] = useState(initialComment);
  const [images, setImages] = useState<string[]>(initialImages);
  const [publishMode, setPublishMode] = useState<PublishMode>(
    initialScheduled ? "schedule" : "now",
  );
  const [scheduledAtLocal, setScheduledAtLocal] = useState(() => {
    if (initialScheduled && initialPostedAt) {
      return isoToDatetimeLocalJST(initialPostedAt);
    }
    return isoToDatetimeLocalJST(
      getDefaultScheduledPostTimeJST().toISOString(),
    );
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const totalMoodCount = presetMoods.size + customMoods.length;

  function togglePresetMood(id: string) {
    setValidationError(null);
    setPresetMoods((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }

      if (next.size + customMoods.length >= MAX_MOOD_TAGS) {
        setValidationError(`タグは最大${MAX_MOOD_TAGS}個まで追加できます`);
        return prev;
      }

      next.add(id);
      return next;
    });
  }

  function handleAddCustomMood() {
    const result = addCustomMood(customMoodInput, presetMoods, customMoods);

    if (result.error) {
      setValidationError(result.error);
      return;
    }

    setCustomMoods(result.custom);
    setCustomMoodInput("");
    setValidationError(null);
  }

  function handleRemoveCustomMood(tag: string) {
    setCustomMoods((prev) => prev.filter((item) => item !== tag));
    setValidationError(null);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    const urls = await readFilesAsDataUrls(files.slice(0, remaining));
    setImages((prev) => [...prev, ...urls].slice(0, MAX_IMAGES));
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (!comment.trim()) {
      setValidationError("今夜の様子を入力してください");
      return;
    }

    let postedAt: string | undefined;

    if (allowSchedule && publishMode === "schedule") {
      if (!scheduledAtLocal) {
        setValidationError("予約日時を選択してください");
        return;
      }

      postedAt = datetimeLocalJSTToIso(scheduledAtLocal);

      if (new Date(postedAt).getTime() <= Date.now()) {
        setValidationError("予約日時は現在より後の時刻を選んでください");
        return;
      }
    }

    await onSubmit({
      moods: mergeMoods(presetMoods, customMoods),
      comment: comment.trim(),
      images,
      postedAt,
    });
  }

  const displayError = validationError ?? error;
  const scheduleSubmitLabel =
    publishMode === "schedule" ? "予約する" : submitLabel;

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">ムード（複数選択可）</p>
          <p className="text-xs text-[#5a5668]">
            {totalMoodCount}/{MAX_MOOD_TAGS}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-4">
          {MOOD_OPTIONS.map((mood) => {
            const selected = presetMoods.has(mood.id);
            return (
              <button
                key={mood.id}
                type="button"
                onClick={() => togglePresetMood(mood.id)}
                className={`rounded-xl border px-2 py-3 text-center text-xs font-medium transition ${
                  selected
                    ? "border-[#ff3d00]/40 bg-[#ff3d00]/12 text-[#ff3d00]"
                    : "border-white/7 bg-[#111118] text-[#9994a8]"
                }`}
              >
                <span className="block text-lg">{mood.emoji}</span>
                {mood.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="custom-mood" className="block text-sm font-medium">
          自由にタグを追加
        </label>
        <p className="mt-1 text-xs leading-relaxed text-[#9994a8]">
          お店独自のタグも追加できます（最大{MAX_CUSTOM_MOOD_LENGTH}文字）。
        </p>
        <div className="mt-3 flex gap-2">
          <input
            id="custom-mood"
            type="text"
            value={customMoodInput}
            maxLength={MAX_CUSTOM_MOOD_LENGTH}
            onChange={(e) => setCustomMoodInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomMood();
              }
            }}
            placeholder="例: カラオケ開放中"
            className={inputClassName}
          />
          <button
            type="button"
            onClick={handleAddCustomMood}
            disabled={totalMoodCount >= MAX_MOOD_TAGS}
            className="shrink-0 rounded-xl border border-[#ff3d00]/30 px-4 py-3 text-sm font-bold text-[#ff3d00] transition hover:bg-[#ff3d00]/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            追加
          </button>
        </div>

        {customMoods.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {customMoods.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#18181f] px-3 py-1.5 text-xs font-medium text-[#eeeaf4]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveCustomMood(tag)}
                  className="text-[#9994a8] transition hover:text-[#ff3d00]"
                  aria-label={`${tag} を削除`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium">
          今夜の様子を一言で
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="例: カラオケ開放中！知らない人たちと大合唱になってます🎤"
          className="mt-2 min-h-[80px] w-full resize-none rounded-xl border border-white/[0.12] bg-[#18181f] px-4 py-3 text-sm text-[#eeeaf4] outline-none placeholder:text-[#5a5668] focus:border-[#ff3d00]/50"
        />
      </div>

      <div>
        <p className="text-sm font-medium">画像（最大{MAX_IMAGES}枚）</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((src, index) => (
            <div key={index} className="relative h-16 w-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setImages((prev) => prev.filter((_, i) => i !== index))
                }
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff3d00] text-[10px] text-white"
              >
                ×
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#5a5668] text-xl text-[#5a5668] transition hover:border-[#ff3d00]/40">
              +
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>
      </div>

      {allowSchedule && (
        <div className="rounded-xl border border-white/[0.08] bg-[#111118] p-4">
          <p className="text-sm font-medium">公開タイミング</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setPublishMode("now")}
              className={`flex-1 rounded-lg border px-3 py-2.5 text-xs font-bold transition ${
                publishMode === "now"
                  ? "border-[#ff3d00]/40 bg-[#ff3d00]/12 text-[#ff3d00]"
                  : "border-white/7 text-[#9994a8]"
              }`}
            >
              今すぐ発信
            </button>
            <button
              type="button"
              onClick={() => setPublishMode("schedule")}
              className={`flex-1 rounded-lg border px-3 py-2.5 text-xs font-bold transition ${
                publishMode === "schedule"
                  ? "border-[#ff3d00]/40 bg-[#ff3d00]/12 text-[#ff3d00]"
                  : "border-white/7 text-[#9994a8]"
              }`}
            >
              予約投稿
            </button>
          </div>

          {publishMode === "schedule" && (
            <div className="mt-3">
              <label htmlFor="scheduledAt" className="block text-xs text-[#9994a8]">
                公開日時（日本時間）
              </label>
              <input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAtLocal}
                onChange={(e) => setScheduledAtLocal(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/[0.12] bg-[#18181f] px-4 py-3 text-sm text-[#eeeaf4] outline-none focus:border-[#ff3d00]/50"
              />
              <p className="mt-2 text-xs leading-relaxed text-[#5a5668]">
                17:00の営業開始に合わせて予約できます。指定時刻になると自動的に公開され、「今夜ホット」に表示されます。
              </p>
            </div>
          )}
        </div>
      )}

      {displayError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {displayError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`${primaryButtonClassName} shadow-[0_6px_24px_rgba(255,61,0,0.25)]`}
      >
        {submitting ? "保存中..." : scheduleSubmitLabel}
      </button>
    </form>
  );
}
