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

export async function uploadShopImages(
  ownerId: string,
  images: string[],
): Promise<{ urls: string[]; error: string | null }> {
  const urls: string[] = [];

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];

    if (image.startsWith("http://") || image.startsWith("https://")) {
      urls.push(image);
      continue;
    }

    if (!image.startsWith("data:")) {
      continue;
    }

    const { blob, ext } = dataUrlToBlob(image);
    const path = `${ownerId}/${Date.now()}-${index}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, {
        contentType: blob.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        urls: [],
        error:
          uploadError.message.includes("Bucket not found")
            ? "画像ストレージ（shop-images）が未設定です。Supabase Dashboard でバケットを作成するか、画像なしで登録してください。"
            : `画像のアップロードに失敗しました: ${uploadError.message}`,
      };
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return { urls, error: null };
}
