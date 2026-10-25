"use client";

import { useEffect, useMemo, useRef } from "react";
import { UploadIcon } from "@/components/icons/MazareIcons";
import {
  ALLOWED_IMAGE_MIMES,
  isAllowedImageMime,
  isAllowedVideoMime,
  MEDIA_ACCEPT,
} from "@/lib/upload/mediaValidation";

const CAMERA_IMAGE_ACCEPT = ALLOWED_IMAGE_MIMES.join(",");

type GuestPostMediaUploadProps = {
  imageFiles: File[];
  videoFile: File | null;
  onChange: (images: File[], video: File | null) => void;
};

function useFileObjectUrls(files: File[]) {
  const urls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(() => {
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, [urls]);

  return urls;
}

export default function GuestPostMediaUpload({
  imageFiles,
  videoFile,
  onChange,
}: GuestPostMediaUploadProps) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const imagePreviewUrls = useFileObjectUrls(imageFiles);

  const videoPreviewUrl = useMemo(() => {
    if (!videoFile) return null;
    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  useEffect(() => {
    if (!videoPreviewUrl) return;
    return () => URL.revokeObjectURL(videoPreviewUrl);
  }, [videoPreviewUrl]);

  function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (picked.length === 0) return;

    const pickedVideo = picked.find((file) => isAllowedVideoMime(file.type));
    const pickedImages = picked.filter((file) => isAllowedImageMime(file.type));

    let nextVideo = videoFile;
    let nextImages = [...imageFiles];

    if (pickedVideo) {
      nextVideo = pickedVideo;
    }

    if (pickedImages.length > 0) {
      nextImages = [...nextImages, ...pickedImages].slice(0, 3);
    }

    onChange(nextImages, nextVideo);
  }

  function removeImage(index: number) {
    onChange(
      imageFiles.filter((_, i) => i !== index),
      videoFile,
    );
  }

  function removeVideo() {
    onChange(imageFiles, null);
  }

  const hasMedia = Boolean(videoFile) || imageFiles.length > 0;

  return (
    <div className="space-y-3 rounded-[16px] border border-[#ff3d00]/25 bg-[#111118] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black">写真・動画</h2>
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums ${
              videoFile
                ? "bg-[#ff3d00]/15 text-[#ff3d00]"
                : "bg-[#18181f] text-[#5a5668]"
            }`}
          >
            動画 {videoFile ? 1 : 0}/1
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums ${
              imageFiles.length > 0
                ? "bg-[#ffaa00]/15 text-[#ffaa00]"
                : "bg-[#18181f] text-[#5a5668]"
            }`}
          >
            写真 {imageFiles.length}/3
          </span>
        </div>
      </div>

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
        accept={CAMERA_IMAGE_ACCEPT}
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
        写真は最大3枚 · 動画は1本（30秒まで）· 一緒に投稿できます
      </p>

      {hasMedia ? (
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#9994a8]">選択中のメディア</p>
          <div className="flex flex-wrap gap-2">
            {videoPreviewUrl && (
              <div className="relative flex h-28 min-w-[5.5rem] max-w-[9rem] items-center justify-center overflow-hidden rounded-xl border border-[#ff3d00]/40 bg-black">
                <video
                  src={videoPreviewUrl}
                  className="max-h-28 max-w-full object-contain"
                  muted
                  playsInline
                  preload="metadata"
                />
                <span className="absolute left-1 top-1 rounded bg-[#ff3d00] px-1 py-0.5 text-[8px] font-bold text-white">
                  動画
                </span>
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] font-bold text-white"
                  aria-label="動画を削除"
                >
                  ×
                </button>
              </div>
            )}
            {imagePreviewUrls.map((url, index) => (
              <div
                key={url}
                className="relative flex h-28 min-w-[5.5rem] max-w-[9rem] items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-[#080810]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="max-h-28 max-w-full object-contain"
                />
                <span className="absolute left-1 top-1 rounded bg-[#ffaa00] px-1 py-0.5 text-[8px] font-bold text-[#080810]">
                  写真{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] font-bold text-white"
                  aria-label={`写真${index + 1}を削除`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-white/10 bg-[#080810] px-4 py-6 text-center text-xs text-[#5a5668]">
          まだメディアが選択されていません
        </p>
      )}
    </div>
  );
}
