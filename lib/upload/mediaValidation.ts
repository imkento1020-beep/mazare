export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/quicktime"] as const;

export const MEDIA_ACCEPT = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES].join(
  ",",
);

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

const IMAGE_MIME_SET = new Set<string>(ALLOWED_IMAGE_MIMES);
const VIDEO_MIME_SET = new Set<string>(ALLOWED_VIDEO_MIMES);

async function readHeader(blob: Blob, length = 12): Promise<Uint8Array> {
  const buffer = await blob.slice(0, length).arrayBuffer();
  return new Uint8Array(buffer);
}

function bytesMatch(header: Uint8Array, offset: number, expected: number[]) {
  if (header.length < offset + expected.length) return false;
  return expected.every((byte, index) => header[offset + index] === byte);
}

function sniffImage(header: Uint8Array, mime: string): boolean {
  if (mime === "image/jpeg") {
    return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  }
  if (mime === "image/png") {
    return bytesMatch(header, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }
  if (mime === "image/webp") {
    return (
      bytesMatch(header, 0, [0x52, 0x49, 0x46, 0x46]) &&
      bytesMatch(header, 8, [0x57, 0x45, 0x42, 0x50])
    );
  }
  return false;
}

function sniffVideo(header: Uint8Array): boolean {
  return bytesMatch(header, 4, [0x66, 0x74, 0x79, 0x70]);
}

export function isAllowedImageMime(mime: string): boolean {
  return IMAGE_MIME_SET.has(mime);
}

export function isAllowedVideoMime(mime: string): boolean {
  return VIDEO_MIME_SET.has(mime);
}

export async function validateImageBlob(
  blob: Blob,
  mime: string,
): Promise<string | null> {
  if (!isAllowedImageMime(mime)) {
    return "画像は jpg / png / webp のみ対応しています";
  }
  if (blob.size > MAX_IMAGE_BYTES) {
    return "画像は10MB以内にしてください";
  }
  const header = await readHeader(blob, 12);
  if (!sniffImage(header, mime)) {
    return "画像ファイルの内容を確認できませんでした";
  }
  return null;
}

export async function validateImageFile(file: File): Promise<string | null> {
  return validateImageBlob(file, file.type);
}

export async function validateVideoFile(file: File): Promise<string | null> {
  if (!isAllowedVideoMime(file.type)) {
    return "動画は mp4 / mov のみ対応しています";
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return "動画は80MB以内にしてください";
  }
  const header = await readHeader(file, 12);
  if (!sniffVideo(header)) {
    return "動画ファイルの内容を確認できませんでした";
  }
  return null;
}
