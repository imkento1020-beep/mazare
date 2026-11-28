"use client";

import type { ReactNode } from "react";
import { SerwistProvider } from "@serwist/turbopack/react";
import { AnonymousAuthProvider } from "@/components/auth/AnonymousAuthProvider";
import { AuthPromptProvider } from "@/components/auth/AuthPromptProvider";
import RouteTransition from "@/components/layout/RouteTransition";
import CapacitorShell from "@/components/native/CapacitorShell";
import { NativeAppProvider } from "@/components/native/NativeAppProvider";
import NativeBootstrap from "@/components/native/NativeBootstrap";
type AppProvidersProps = {
  children: ReactNode;
  /** SSR 時の UA から判定（Capacitor WebView） */
  nativeShell?: boolean;
};

export default function AppProviders({
  children,
  nativeShell = false,
}: AppProvidersProps) {
  return (
    <SerwistProvider
      swUrl="/serwist/sw.js"
      disable={nativeShell}
      register={!nativeShell}
      cacheOnNavigation={!nativeShell}
      reloadOnOnline={!nativeShell}
    >
      <NativeAppProvider>
        <AnonymousAuthProvider>
          <AuthPromptProvider>
            <CapacitorShell />
            <NativeBootstrap>
              <RouteTransition>{children}</RouteTransition>
            </NativeBootstrap>
          </AuthPromptProvider>
        </AnonymousAuthProvider>
      </NativeAppProvider>
    </SerwistProvider>
  );
}
