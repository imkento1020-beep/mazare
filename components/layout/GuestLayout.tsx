"use client";

import { useState, type ReactNode } from "react";
import FilterPanel from "@/components/home/FilterPanel";
import HomeSidebarRight from "@/components/home/HomeSidebarRight";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import type { VibePost } from "@/lib/home/types";

type GuestLayoutProps = {
  children: ReactNode;
  search?: string;
  onSearchChange?: (value: string) => void;
  genres?: Set<string>;
  moods?: Set<string>;
  areas?: Set<string>;
  onGenresChange?: (value: Set<string>) => void;
  onMoodsChange?: (value: Set<string>) => void;
  onAreasChange?: (value: Set<string>) => void;
  posts?: VibePost[];
  filteredCount?: number;
  mobileTitle?: string;
  showFilters?: boolean;
  showRightSidebar?: boolean;
  showMobileSearch?: boolean;
  menuOnly?: boolean;
  googleMapsApiKey?: string;
};

export default function GuestLayout({
  children,
  search = "",
  onSearchChange,
  genres = new Set(["すべて"]),
  moods = new Set(),
  areas = new Set(["すべて"]),
  onGenresChange,
  onMoodsChange,
  onAreasChange,
  posts = [],
  filteredCount = 0,
  showFilters = true,
  showRightSidebar = true,
  showMobileSearch = true,
  menuOnly = false,
  googleMapsApiKey = "",
}: GuestLayoutProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFilterCount =
    (genres.has("すべて") ? 0 : genres.size) +
    moods.size +
    (areas.has("すべて") ? 0 : areas.size);

  const hasFilters = Boolean(
    showFilters && onGenresChange && onMoodsChange && onAreasChange,
  );
  const showLeftSidebar = hasFilters || menuOnly;

  return (
    <div className="flex min-h-dvh flex-col bg-[#080810] text-[#eeeaf4]">
      <Header search={search} onSearchChange={onSearchChange} />

      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[480px] md:max-w-[1200px]">
          {showLeftSidebar && (
            <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[260px] shrink-0 overflow-y-auto border-r border-white/7 px-5 py-7 md:block">
              <FilterPanel
                genres={genres}
                moods={moods}
                areas={areas}
                onGenresChange={onGenresChange ?? (() => {})}
                onMoodsChange={onMoodsChange ?? (() => {})}
                onAreasChange={onAreasChange ?? (() => {})}
                menuOnly={menuOnly || !hasFilters}
              />
            </aside>
          )}

          <main className="min-w-0 flex-1 px-4 py-4 md:px-7 md:py-6">
            {hasFilters && (
              <div className="mb-3 flex items-center justify-end md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="relative rounded-lg px-3 py-1.5 text-xs font-medium text-[#9994a8] transition hover:bg-[#111118] hover:text-[#eeeaf4]"
                >
                  フィルター
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3d00] text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            )}
            {showMobileSearch && onSearchChange && (
              <div className="relative mb-4 md:hidden">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5668]">
                  🔍
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="エリア、ジャンル、雰囲気で探す..."
                  className="w-full rounded-[12px] border border-white/12 bg-[#111118] py-2.5 pl-10 pr-4 text-sm text-[#eeeaf4] outline-none placeholder:text-[#5a5668]"
                />
              </div>
            )}
            {children}
          </main>

          {showRightSidebar && (
            <HomeSidebarRight
              posts={posts}
              filteredCount={filteredCount}
              areas={areas}
              onAreasChange={onAreasChange ?? (() => {})}
              googleMapsApiKey={googleMapsApiKey}
            />
          )}
        </div>
      </div>

      <BottomNav />

      {mobileFiltersOpen &&
        hasFilters &&
        onGenresChange &&
        onMoodsChange &&
        onAreasChange && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              aria-label="閉じる"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-white/7 bg-[#111118] px-4 pb-24 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold">フィルター</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-lg px-3 py-1 text-sm text-[#9994a8]"
                >
                  閉じる
                </button>
              </div>
              <FilterPanel
                genres={genres}
                moods={moods}
                areas={areas}
                onGenresChange={onGenresChange}
                onMoodsChange={onMoodsChange}
                onAreasChange={onAreasChange}
                showMenu={false}
              />
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-4 w-full rounded-xl bg-[#ff3d00] py-3 text-sm font-bold text-white"
              >
                {filteredCount}件を表示
              </button>
            </div>
          </div>
        )}

      <div className="h-[84px] md:hidden" />
    </div>
  );
}
