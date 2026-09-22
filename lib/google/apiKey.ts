/**
 * Google Maps / Places で共通利用できる API キー。
 * 別キーがなくても NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 等にフォールバックする。
 */
export function getGoogleCloudApiKey() {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    ""
  );
}

/** サーバーから Places REST を叩くとき（Referer 制限のないキーを優先） */
export function getServerGooglePlacesApiKey() {
  return (
    process.env.GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    ""
  );
}

export function getGooglePlacesApiKey() {
  return getServerGooglePlacesApiKey();
}

export function getGooglePlacesSetupHint() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.VERCEL === "true";

  if (isProduction) {
    return (
      "Vercel の Environment Variables に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY " +
      "（または NEXT_PUBLIC_GOOGLE_PLACES_API_KEY）を設定し、Google Cloud で " +
      "「Places API」（従来版）または「Places API (New)」を有効化し、API キー制限に Places を追加してから再デプロイしてください。"
    );
  }

  return (
    "`.env.local` に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定するか、Places 専用キーを " +
    "NEXT_PUBLIC_GOOGLE_PLACES_API_KEY に設定してください。Google Cloud で " +
    "Google Cloud で「Places API」（従来版）の有効化が必要です（新版が使えない場合は従来版に自動切替）。"
  );
}
