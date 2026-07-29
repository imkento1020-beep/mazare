"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OWNER_NAV, isActivePath } from "@/lib/layout/nav";
import type { Shop } from "@/lib/home/types";

type OwnerSidebarProps = {
  shop?: Shop | null;
  stats?: { views: number; interests: number; checkins: number };
  isOnboarding?: boolean;
};

export default function OwnerSidebar({
  shop,
  stats,
  isOnboarding = false,
}: OwnerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-white/7 md:block">
      <div className="sticky top-0 px-5 py-7">
        <div className="mb-6 rounded-[14px] border border-white/7 bg-[#111118] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#18181f] text-xl">
              {isOnboarding ? "🏪" : "🍻"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#eeeaf4]">
                {isOnboarding ? "新規登録中" : (shop?.name ?? "お店")}
              </p>
              <p className="text-[11px] text-[#5a5668]">
                {isOnboarding ? "オーナー登録" : "オーナー"}
              </p>
            </div>
          </div>
        </div>

        {!isOnboarding && stats && (
          <div className="mb-6 grid grid-cols-3 gap-2">
            {[
              { label: "閲覧", value: stats.views, color: "text-[#ff3d00]" },
              { label: "行くかも", value: stats.interests, color: "text-[#00e87a]" },
              { label: "来店", value: stats.checkins, color: "text-[#ffaa00]" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[10px] border border-white/[0.07] bg-[#111118] p-2 text-center"
              >
                <p className={`text-lg font-black leading-none ${item.color}`}>
                  {item.value}
                </p>
                <p className="mt-1 text-[9px] text-[#5a5668]">{item.label}</p>
              </div>
            ))}
          </div>
        )}

        {!isOnboarding && (
          <nav className="space-y-1">
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5a5668]">
              メニュー
            </p>
            {OWNER_NAV.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
                    active
                      ? "bg-[#ff3d00]/10 text-[#ff3d00]"
                      : "text-[#9994a8] hover:bg-[#18181f] hover:text-[#eeeaf4]"
                  }`}
                >
                  <span className="w-[22px] text-center text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {isOnboarding && (
          <div className="rounded-[14px] border border-[#ff3d00]/20 bg-[#ff3d00]/5 p-4">
            <p className="text-sm font-bold text-[#ff3d00]">STEP 1〜4</p>
            <p className="mt-2 text-xs leading-relaxed text-[#9994a8]">
              お店の基本情報を登録して、mazareで集客を始めましょう。
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
