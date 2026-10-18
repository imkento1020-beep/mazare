"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

type RouteTransitionProps = {
  children: ReactNode;
};

/** Soft enter animation on client navigations (bottom nav, links). */
export default function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="mazare-route-enter flex min-h-dvh flex-col">
      {children}
    </div>
  );
}
