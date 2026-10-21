/**
 * ブラウザ（Maps JavaScript / Places JS）用キー。
 * HTTP Referer 制限付きのキーのみ。GOOGLE_MAPS_API_KEY 等のサーバー専用キーは含めない。
 */
export function getBrowserGoogleMapsApiKey(): string {
  return (
    process.env.GOOGLE_MAPS_BROWSER_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY?.trim() ||
    ""
  );
}

export function getBrowserGoogleMapsSetupHint(): string {
  return (
    "Google Cloud で HTTP リファラ制限付きのブラウザ用キーを作成し、" +
    "Vercel に GOOGLE_MAPS_BROWSER_API_KEY（推奨）または NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定。" +
    "許可例: https://mazare.app/*, https://www.mazare.app/*, https://*.vercel.app/*"
  );
}
