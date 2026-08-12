/** サーバーコンポーネント / Route Handler 専用 — 本番は Vercel Environment Variables から読み込む */
export function getServerGoogleMapsApiKey() {
  const serverKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (serverKey) return serverKey;

  const publicKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (publicKey) return publicKey;

  return "";
}

export function getGoogleMapsSetupHint() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.VERCEL === "true";

  if (isProduction) {
    return "Vercel の Project Settings → Environment Variables に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY（または GOOGLE_MAPS_API_KEY）を Production 環境へ設定し、再デプロイしてください。";
  }

  return "`.env.local` に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定後、開発サーバーを再起動してください。";
}

export function isGoogleMapsConfiguredOnServer() {
  return getServerGoogleMapsApiKey().length > 0;
}
