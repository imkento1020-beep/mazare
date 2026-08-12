"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAppMode } from "@/hooks/useAppMode";
import {
  GUEST_BOTTOM_NAV,
  OWNER_BOTTOM_NAV,
  isActivePath,
} from "@/lib/layout/nav";

function isGuestAppPath(pathname: string) {
  return (
    pathname.startsWith("/home") ||
    pathname.startsWith("/map") ||
    pathname.startsWith("/tonight") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/favorites") ||
    pathname.startsWith("/mypage") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/shop")
  );
}

function isOwnerAppPath(pathname: string) {
  return pathname.startsWith("/owner");
}

export default function BottomNav() {
  const pathname = usePathname();
  const { mode, roles, setMode, ready } = useAppMode();

  useEffect(() => {
    if (pathname.startsWith("/owner")) setMode("owner");
    else if (
      pathname.startsWith("/home") ||
      pathname.startsWith("/map") ||
      pathname.startsWith("/tonight") ||
      pathname.startsWith("/search") ||
      pathname.startsWith("/favorites") ||
      pathname.startsWith("/mypage") ||
      pathname.startsWith("/shop")
    ) {
      setMode("guest");
    }
  }, [pathname, setMode]);

  if (!ready || roles.length === 0) return null;

  const onOwnerSection = isOwnerAppPath(pathname);
  const onGuestSection = isGuestAppPath(pathname) && !onOwnerSection;
  const onNotifications = pathname.startsWith("/notifications");

  let items = null;
  if (onOwnerSection && roles.includes("owner")) {
    items = OWNER_BOTTOM_NAV;
  } else if (onNotifications) {
    items =
      mode === "owner" && roles.includes("owner")
        ? OWNER_BOTTOM_NAV
        : GUEST_BOTTOM_NAV;
  } else if (onGuestSection && roles.includes("guest")) {
    items = GUEST_BOTTOM_NAV;
  }

  if (!items) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/[0.07] bg-[rgba(8,8,16,0.92)] pb-5 backdrop-blur-[20px] md:hidden">
      <div className="mx-auto grid h-16 max-w-[480px] grid-cols-5 px-1">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 text-[9px] font-medium transition ${
                active ? "text-[#ff3d00]" : "text-[#9994a8]"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
