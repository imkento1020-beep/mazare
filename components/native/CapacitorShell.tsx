"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isNativeApp } from "@/lib/native/capacitor";

/** ネイティブシェル起動時のステータスバー・スプラッシュ・Android 戻るボタン */
export default function CapacitorShell() {
  useEffect(() => {
    if (!isNativeApp()) return;

    void (async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#080810" });
      } catch {
        /* iOS は backgroundColor 非対応のことがある */
      }
      try {
        await new Promise((r) => setTimeout(r, 400));
        await SplashScreen.hide();
      } catch {
        /* ignore */
      }
    })();

    const backSub = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        void App.minimizeApp();
      }
    });

    return () => {
      void backSub.then((h) => h.remove());
    };
  }, []);

  return null;
}