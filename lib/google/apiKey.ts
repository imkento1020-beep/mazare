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

export function getGooglePlacesApiKey() {
  return getGoogleCloudApiKey();
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
      "「Places API (New)」を有効化してから再デプロイしてください。"
    );
  }

  return (
    "`.env.local` に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定するか、Places 専用キーを " +
    "NEXT_PUBLIC_GOOGLE_PLACES_API_KEY に設定してください。Google Cloud で " +
    "「Places API (New)」も有効化が必要です。"
  );
}
