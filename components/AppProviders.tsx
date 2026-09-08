"use client";

import type { ReactNode } from "react";
import { SerwistProvider } from "@serwist/turbopack/react";
import { AuthPromptProvider } from "@/components/auth/AuthPromptProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider swUrl="/serwist/sw.js" reloadOnOnline={false}>
      <AuthPromptProvider>{children}</AuthPromptProvider>
    </SerwistProvider>
  );
}
