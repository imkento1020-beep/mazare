"use client";

import type { ReactNode } from "react";

type PostComposeActionDockProps = {
  children: ReactNode;
};

/**
 * Fixed action strip sitting flush above the mobile tab bar (no overlap with center FAB).
 */
export default function PostComposeActionDock({
  children,
}: PostComposeActionDockProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] z-[105] border-t border-white/[0.1] bg-[#080810]/98 px-4 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md max-md:rounded-t-[20px] md:bottom-0 md:rounded-none md:shadow-none"
    >
      <div className="mx-auto flex max-w-lg">{children}</div>
    </div>
  );
}
