import { supabase } from "@/lib/supabase";

const BUCKET = "post-media";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime"]);

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
    if (!IMAGE_TYPES.has(file.type)) {
      return { urls: [], error: "写真は jpg / png / webp のみ対応しています" };
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
  if (!VIDEO_TYPES.has(input.file.type)) {
    return { url: null, error: "動画は mp4 / mov のみ対応しています" };
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
