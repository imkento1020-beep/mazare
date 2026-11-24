import type { CapacitorConfig } from "@capacitor/cli";

/**
 * 本番ビルドは https://www.mazare.app を WebView で表示（Next.js をそのまま利用）。
 * ※ apex (mazare.app) は Vercel で www へ 308 するため、server.url は www を指定する。
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
        url: process.env.CAPACITOR_SERVER_URL ?? "https://www.mazare.app",
        appStartPath: "/native/welcome",
        androidScheme: "https",
        allowNavigation: [
          "mazare.app",
          "www.mazare.app",
          "*.supabase.co",
          "accounts.google.com",
        ],
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