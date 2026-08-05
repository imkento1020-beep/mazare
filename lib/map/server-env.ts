/** サーバーコンポーネント専用 — 本番ではホスティングの Environment Variables から読み込む */
export function getServerGoogleMapsApiKey() {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    ""
  );
}

export function getGoogleMapsSetupHint() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.VERCEL === "true";

  if (isProduction) {
    return "ホスティング（Vercel 等）の Environment Variables に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定し、再デプロイしてください。";
  }

  return "`.env.local` に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定後、開発サーバーを再起動してください。";
}

export function isGoogleMapsConfiguredOnServer() {
  return getServerGoogleMapsApiKey().length > 0;
}
