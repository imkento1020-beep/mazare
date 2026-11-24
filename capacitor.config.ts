import type { CapacitorConfig } from "@capacitor/cli";

/**
 * 本番ビルドは https://mazare.app を WebView で表示（Next.js をそのまま利用）。
 * ローカル検証: CAPACITOR_USE_LOCAL=1 npx cap sync
 */
const useLocalDev = process.env.CAPACITOR_USE_LOCAL === "1";

const config: CapacitorConfig = {
  appId: "app.mazare.mobile",
  appName: "mazare",
  webDir: "native/www",
  server: useLocalDev
    ? {
        url: process.env.CAPACITOR_DEV_URL ?? "http://localhost:3000",
        cleartext: true,
      }
    : {
        url: process.env.CAPACITOR_SERVER_URL ?? "https://mazare.app",
        androidScheme: "https",
      },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#080810",
    scheme: "mazare",
  },
  android: {
    backgroundColor: "#080810",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#080810",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#080810",
    },
  },
};

export default config;