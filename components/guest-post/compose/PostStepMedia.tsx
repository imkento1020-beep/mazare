"use client";

import GuestPostMediaUpload from "@/components/guest-post/GuestPostMediaUpload";

type PostStepMediaProps = {
  shopName: string;
  imageFiles: File[];
  videoFile: File | null;
  onChange: (images: File[], video: File | null) => void;
};

export default function PostStepMedia({
  shopName,
  imageFiles,
  videoFile,
  onChange,
}: PostStepMediaProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div>
        <h2 className="text-lg font-black">今夜の1枚</h2>
        <p className="mt-1 truncate text-xs text-[#9994a8]">{shopName}</p>
      </div>

      <div className="mt-4 flex-1">
        <GuestPostMediaUpload
          imageFiles={imageFiles}
          videoFile={videoFile}
          onChange={onChange}
          layout="compose"
        />
      </div>
    </div>
  );
}
