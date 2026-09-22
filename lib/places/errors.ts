export function isNewPlacesApiBlocked(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("permission_denied") ||
    normalized.includes("api_key_service_blocked") ||
    normalized.includes("places.googleapis.com") ||
    normalized.includes('"code": 403') ||
    normalized.includes("403")
  );
}

export function formatPlacesApiError(raw: string) {
  if (isNewPlacesApiBlocked(raw)) {
    return (
      "Google Places API（新版）がこの API キーで使えません。従来版 API に切り替えを試みます。 " +
      "それでも失敗する場合は Google Cloud Console で「Places API」を有効化し、API キーの制限に Places API を追加してください。"
    );
  }

  if (raw.length > 280) {
    return "お店の取得に失敗しました。Google Cloud の Places API 設定を確認してください。";
  }

  return raw;
}
