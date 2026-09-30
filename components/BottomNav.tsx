"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAppMode } from "@/hooks/useAppMode";
import BottomNavIcon from "@/components/icons/BottomNavIcon";
import CameraIcon from "@/components/icons/CameraIcon";
import {
  GUEST_BOTTOM_NAV,
  OWNER_BOTTOM_NAV,
  isActivePath,
  type BottomNavItem,
} from "@/lib/layout/nav";

const INACTIVE = "#5a5668";
const ACTIVE = "#ff3d00";

function isGuestAppPath(pathname: string) {
  return (
    pathname.startsWith("/home") ||
    pathname.startsWith("/map") ||
    pathname.startsWith("/tonight") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/post") ||
    pathname.startsWith("/trending") ||
    pathname.startsWith("/nearby") ||
    pathname.startsWith("/favorites") ||
    pathname.startsWith("/mypage") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/shop")
  );
}

function isOwnerAppPath(pathname: string) {
  return pathname.startsWith("/owner");
}

function NavItem({
  item,
  pathname,
}: {
  item: BottomNavItem;
  pathname: string;
}) {
  const active = isActivePath(pathname, item.href);
  const color = active ? ACTIVE : INACTIVE;

  if (item.center) {
    return (
      <Link
        href={item.href}
        className="flex min-w-[48px] flex-col items-center gap-1 px-1 pb-2 pt-0"
        aria-current={active ? "page" : undefined}
      >
        <span
          className={`mt-[-20px] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#ff3d00] ${
            active
              ? "shadow-[0_4px_24px_rgba(255,61,0,0.6)]"
              : "shadow-[0_4px_16px_rgba(255,61,0,0.4)]"
          }`}
        >
          <CameraIcon size={24} color="#ffffff" />
        </span>
        <span
          className={`text-[9px] leading-tight ${
            active ? "font-bold text-[#ff3d00]" : "font-medium text-[#5a5668]"
          }`}
        >
          {item.label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className="flex min-w-[48px] flex-col items-center gap-1 px-1 py-2"
      aria-current={active ? "page" : undefined}
    >
      <BottomNavIcon icon={item.icon} color={color} size={24} />
      <span
        className={`text-[9px] leading-tight ${
          active ? "font-bold text-[#ff3d00]" : "font-medium text-[#5a5668]"
        }`}
      >
        {item.label}
      </span>
    </Link>
  );
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
      pathname.startsWith("/post") ||
      pathname.startsWith("/trending") ||
      pathname.startsWith("/nearby") ||
      pathname.startsWith("/favorites") ||
      pathname.startsWith("/mypage") ||
      pathname.startsWith("/shop")
    ) {
      setMode("guest");
    }
  }, [pathname, setMode]);

  if (!ready) return null;

  const onOwnerSection = isOwnerAppPath(pathname);
  const onGuestSection = isGuestAppPath(pathname) && !onOwnerSection;
  const onNotifications = pathname.startsWith("/notifications");

  let items: BottomNavItem[] | null = null;
  if (onOwnerSection && roles.includes("owner")) {
    items = OWNER_BOTTOM_NAV;
  } else if (onNotifications) {
    items =
      mode === "owner" && roles.includes("owner")
        ? OWNER_BOTTOM_NAV
        : GUEST_BOTTOM_NAV;
  } else if (onGuestSection) {
    items = GUEST_BOTTOM_NAV;
  }

  if (!items) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/[0.07] bg-[rgba(8,8,16,0.92)] pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-[20px] md:hidden">
      <div className="mx-auto flex h-16 max-w-[480px] items-end justify-around px-1">
        {items.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </nav>
  );
}
