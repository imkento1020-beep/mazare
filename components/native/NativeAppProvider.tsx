"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Capacitor } from "@capacitor/core";
import { nativePlatform } from "@/lib/native/capacitor";

type NativeAppContextValue = {
  isNative: boolean;
  platform: "ios" | "android" | "web";
  /** ネイティブ起動時のルーティング・セッション準備が完了 */
  bootstrapReady: boolean;
  setBootstrapReady: (ready: boolean) => void;
};

const NativeAppContext = createContext<NativeAppContextValue>({
  isNative: false,
  platform: "web",
  bootstrapReady: true,
  setBootstrapReady: () => {},
});

export function NativeAppProvider({ children }: { children: ReactNode }) {
  const [bootstrapReady, setBootstrapReady] = useState(
    () => !Capacitor.isNativePlatform(),
  );

  const isNative = Capacitor.isNativePlatform();
  const platform = nativePlatform();

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
      platform,
      bootstrapReady,
      setBootstrapReady,
    }),
    [isNative, platform, bootstrapReady],
  );

  return (
    <NativeAppContext.Provider value={value}>{children}</NativeAppContext.Provider>
  );
}

export function useNativeApp() {
  return useContext(NativeAppContext);
}