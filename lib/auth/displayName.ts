export const DISPLAY_NAME_MAX_LENGTH = 32;

export function normalizeDisplayName(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}

export function validateDisplayName(raw: string): { ok: true; value: string } | { ok: false; message: string } {
  const value = normalizeDisplayName(raw);

  if (!value) {
    return { ok: false, message: "ユーザー名を入力してください。" };
  }

  if (value.length > DISPLAY_NAME_MAX_LENGTH) {
    return {
      ok: false,
      message: `ユーザー名は${DISPLAY_NAME_MAX_LENGTH}文字以内で入力してください。`,
    };
  }

  if (/[\u0000-\u001f<>]/.test(value)) {
    return { ok: false, message: "ユーザー名に使えない文字が含まれています。" };
  }

  return { ok: true, value };
}
