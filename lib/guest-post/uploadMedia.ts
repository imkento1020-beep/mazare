import { supabase } from "@/lib/supabase";
import {
  validateImageFile,
  validateVideoFile,
} from "@/lib/upload/mediaValidation";

const BUCKET = "post-media";

export async function uploadGuestPostImages(input: {
  userId: string;
  files: File[];
}): Promise<{ urls: string[]; error: string | null }> {
  if (input.files.length > 3) {
    return { urls: [], error: "写真は最大3枚までです" };
  }

  const urls: string[] = [];

  for (let index = 0; index < input.files.length; index += 1) {
    const file = input.files[index];
    const imageError = await validateImageFile(file);
    if (imageError) {
      return { urls: [], error: imageError };
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${input.userId}/${Date.now()}-${index}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      return {
        urls: [],
        error: error.message.includes("Bucket not found")
          ? "post-media バケットが未設定です。SQL マイグレーションを実行してください。"
          : error.message,
      };
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return { urls, error: null };
}

export async function uploadGuestPostVideo(input: {
  userId: string;
  file: File;
}): Promise<{ url: string | null; error: string | null }> {
  const videoError = await validateVideoFile(input.file);
  if (videoError) {
    return { url: null, error: videoError };
  }

  const durationOk = await validateVideoDuration(input.file, 30);
  if (!durationOk) {
    return { url: null, error: "動画は30秒以内にしてください" };
  }

  const ext = input.file.type === "video/quicktime" ? "mov" : "mp4";
  const path = `${input.userId}/${Date.now()}-video.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, input.file, {
    contentType: input.file.type,
    upsert: false,
  });

  if (error) {
    return {
      url: null,
      error: error.message.includes("Bucket not found")
        ? "post-media バケットが未設定です。SQL マイグレーションを実行してください。"
        : error.message,
    };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

function validateVideoDuration(file: File, maxSeconds: number) {
  return new Promise<boolean>((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration <= maxSeconds);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    video.src = url;
  });
}
