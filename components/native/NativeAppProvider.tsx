"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  detectNativePlatform,
  markNativeShellPersistent,
  nativePlatform,
} from "@/lib/native/capacitor";

type NativeAppContextValue = {
  isNative: boolean;
  /** UA / Capacitor 判定が一度完了した */
  nativeResolved: boolean;
  platform: "ios" | "android" | "web";
  /** ネイティブ起動時のルーティング・セッション準備が完了 */
  bootstrapReady: boolean;
  setBootstrapReady: (ready: boolean) => void;
};

const NativeAppContext = createContext<NativeAppContextValue>({
  isNative: false,
  nativeResolved: false,
  platform: "web",
  bootstrapReady: true,
  setBootstrapReady: () => {},
});

export function NativeAppProvider({ children }: { children: ReactNode }) {
  // SSR と初回クライアント描画を一致させる（UA 判定は mount 後のみ）
  const [isNative, setIsNative] = useState(false);
  const [nativeResolved, setNativeResolved] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "web">("web");
  const [bootstrapReady, setBootstrapReady] = useState(true);

  useEffect(() => {
    function refresh() {
      const native = detectNativePlatform();
      if (native) markNativeShellPersistent();
      setIsNative(native);
      if (native) {
        setPlatform(nativePlatform());
      }
      setNativeResolved(true);
    }
    refresh();
    const t1 = window.setTimeout(refresh, 50);
    const t2 = window.setTimeout(refresh, 400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (!isNative) return;
    document.documentElement.dataset.native = platform;
    document.documentElement.dataset.appShell = "native";
    return () => {
      delete document.documentElement.dataset.native;
      delete document.documentElement.dataset.appShell;
    };
  }, [isNative, platform]);

  const value = useMemo(
    () => ({
      isNative,
      nativeResolved,
      platform,
      bootstrapReady,
      setBootstrapReady,
    }),
    [isNative, nativeResolved, platform, bootstrapReady],
  );

  return (
    <NativeAppContext.Provider value={value}>{children}</NativeAppContext.Provider>
  );
}

export function useNativeApp() {
  return useContext(NativeAppContext);
}