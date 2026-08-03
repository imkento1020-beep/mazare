import { supabase } from "@/lib/supabase";

const BUCKET = "shop-images";

function dataUrlToBlob(dataUrl: string) {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
  const ext = mime.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return { blob: new Blob([bytes], { type: mime }), ext };
}

export async function uploadProfileImage(
  userId: string,
  image: string,
): Promise<{ url: string | null; error: string | null }> {
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return { url: image, error: null };
  }

  if (!image.startsWith("data:")) {
    return { url: null, error: "画像形式が不正です" };
  }

  const { blob, ext } = dataUrlToBlob(image);
  const path = `${userId}/profile-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: blob.type,
      upsert: true,
    });

  if (uploadError) {
    return {
      url: null,
      error: uploadError.message.includes("Bucket not found")
        ? "画像ストレージが未設定です。Supabase Dashboard で shop-images バケットを作成してください。"
        : `画像のアップロードに失敗しました: ${uploadError.message}`,
    };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
