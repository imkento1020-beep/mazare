"use client";

import type { ReactNode } from "react";
import { SerwistProvider } from "@serwist/turbopack/react";
import { AnonymousAuthProvider } from "@/components/auth/AnonymousAuthProvider";
import { AuthPromptProvider } from "@/components/auth/AuthPromptProvider";
import RouteTransition from "@/components/layout/RouteTransition";
import CapacitorShell from "@/components/native/CapacitorShell";
import { NativeAppProvider } from "@/components/native/NativeAppProvider";
import NativeBootstrap from "@/components/native/NativeBootstrap";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider swUrl="/serwist/sw.js" reloadOnOnline={false}>
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
