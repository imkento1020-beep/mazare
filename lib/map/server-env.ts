/**
 * Places REST 等、サーバー専用。クライアントコンポーネントへ渡さないこと。
 * ブラウザ用は getBrowserGoogleMapsApiKey + /api/maps/config。
 */
export function getServerGoogleMapsApiKey() {
  const serverKey =
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (serverKey) return serverKey;

  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || "";
}

export function getGoogleMapsSetupHint() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.VERCEL === "true";

  if (isProduction) {
    return (
      "Vercel に GOOGLE_MAPS_BROWSER_API_KEY（Referer 制限）と GOOGLE_MAPS_API_KEY（サーバー用）を設定し、" +
      "Google Cloud Console で HTTP リファラに https://mazare.app/* 等を追加してください。"
    );
  }

  return "`.env.local` に GOOGLE_MAPS_BROWSER_API_KEY または NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定後、開発サーバーを再起動してください。";
}

export function isGoogleMapsConfiguredOnServer() {
  return getServerGoogleMapsApiKey().length > 0;
}
