"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GUEST_BOTTOM_NAV,
  OWNER_BOTTOM_NAV,
  isActivePath,
} from "@/lib/layout/nav";

function isOwnerPath(pathname: string) {
  return pathname.startsWith("/owner");
}

function isGuestAppPath(pathname: string) {
  return (
    pathname.startsWith("/home") ||
    pathname.startsWith("/map") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/mypage") ||
    pathname.startsWith("/shop")
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  const items = isOwnerPath(pathname)
    ? OWNER_BOTTOM_NAV
    : isGuestAppPath(pathname)
      ? GUEST_BOTTOM_NAV
      : null;

  if (!items) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/[0.07] bg-[rgba(8,8,16,0.92)] pb-5 backdrop-blur-[20px] md:hidden">
      <div className="mx-auto grid h-16 max-w-[480px] grid-cols-4 px-2">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition ${
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
