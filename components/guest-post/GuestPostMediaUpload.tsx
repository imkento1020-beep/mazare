"use client";

import { useRef } from "react";

const MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,video/mp4,video/quicktime";

type GuestPostMediaUploadProps = {
  imageFiles: File[];
  videoFile: File | null;
  onChange: (images: File[], video: File | null) => void;
};

export default function GuestPostMediaUpload({
  imageFiles,
  videoFile,
  onChange,
}: GuestPostMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (picked.length === 0) return;

    const video = picked.find((file) => file.type.startsWith("video/"));
    if (video) {
      onChange([], video);
      return;
    }

    const images = picked
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 3);
    onChange(images, null);
  }

  const selectionLabel = videoFile
    ? "動画を選択中"
    : imageFiles.length > 0
      ? `写真 ${imageFiles.length}枚を選択中`
      : null;

  return (
    <div className="space-y-3 rounded-[16px] border border-[#ff3d00]/25 bg-[#111118] p-5">
      <h2 className="text-lg font-black">写真・動画</h2>

      <input
        ref={inputRef}
        type="file"
        accept={MEDIA_ACCEPT}
        multiple
        className="sr-only"
        onChange={handlePick}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-white/15 bg-[#080810] px-4 py-8 transition hover:border-[#ff3d00]/40 hover:bg-[#0d0d14]"
      >
        <span className="text-3xl leading-none" aria-hidden>
          📤
        </span>
        <span className="text-sm font-bold text-[#eeeaf4]">アップロード</span>
      </button>

      <p className="text-center text-[10px] leading-relaxed text-[#5a5668]">
        写真は最大3枚 · 動画は30秒まで
      </p>

      {selectionLabel && (
        <p className="text-center text-xs font-medium text-[#9994a8]">
          {selectionLabel}
        </p>
      )}
    </div>
  );
}
