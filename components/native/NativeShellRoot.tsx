"use client";

import { useEffect, useState, type ReactNode } from "react";
import AppProviders from "@/components/AppProviders";

/**
 * Capacitor WebView: ページ本体は SSR しない。
 * サーバーと初回クライアントは同じローディングだけ描画し、mount 後にクライアント専用でアプリを起動する。
 * （React #418 / HTML hydration 致命エラーを避ける）
 */
export default function NativeShellRoot({ children }: { children: ReactNode }) {
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  if (!clientReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#080810]">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff3d00] border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  return <AppProviders nativeShell>{children}</AppProviders>;
}