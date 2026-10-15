"use client";

import { useRef } from "react";
import { UploadIcon } from "@/components/icons/MazareIcons";

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
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

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
        ref={galleryRef}
        type="file"
        accept={MEDIA_ACCEPT}
        multiple
        className="sr-only"
        onChange={handlePick}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="sr-only"
        onChange={handlePick}
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-[12px] border border-white/15 bg-[#080810] px-3 py-6 transition hover:border-[#ff3d00]/40"
        >
          <UploadIcon size={28} color="#9994a8" />
          <span className="text-xs font-bold text-[#eeeaf4]">ライブラリ</span>
        </button>
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-[12px] border border-[#ff3d00]/35 bg-[#ff3d00]/10 px-3 py-6 transition hover:border-[#ff3d00]/55"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff3d00]">
            CAM
          </span>
          <span className="text-xs font-bold text-[#ff3d00]">その場で撮影</span>
        </button>
      </div>

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
