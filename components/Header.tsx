"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchManagedShop } from "@/lib/owner/api";
import { hasRole } from "@/lib/auth/roles";
import { useAppMode } from "@/hooks/useAppMode";
import AppModeSwitcher from "@/components/auth/AppModeSwitcher";
import NotificationBell from "@/components/notifications/NotificationBell";

type HeaderProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
};

const headerShellClassName =
  "sticky top-0 z-[100] h-16 border-b border-white/[0.07] bg-[rgba(8,8,16,0.92)] backdrop-blur-[20px]";

function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="shrink-0 text-xl font-black tracking-tight md:text-2xl">
      maz<span className="text-[#ff3d00]">a</span>re
    </Link>
  );
}

function LiveStatusPill() {
  return (
    <span className="inline-flex items-center rounded-full bg-[rgba(0,232,122,0.1)] px-3 py-1 text-xs font-bold text-[#00e87a]">
      発信中
    </span>
  );
}

function IconButton({
  href,
  label,
  children,
}: {
  href?: string;
  label: string;
  children: ReactNode;
}) {
  const className =
    "flex h-9 w-9 items-center justify-center rounded-[10px] text-base text-[#9994a8] transition hover:bg-[#111118] hover:text-[#eeeaf4]";

  if (href) {
    return (
      <Link href={href} className={className} aria-label={label}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} aria-label={label}>
      {children}
    </button>
  );
}

export default function Header({ search, onSearchChange }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { mode, setMode, isDualRole, ready: modeReady } = useAppMode();
  const [loggedIn, setLoggedIn] = useState(false);
  const [shopName, setShopName] = useState<string | null>(null);
  const [hasOwnerRole, setHasOwnerRole] = useState(false);
  const [ready, setReady] = useState(false);
  const [localSearch, setLocalSearch] = useState(search ?? "");

  useEffect(() => {
    if (search !== undefined) setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    if (pathname.startsWith("/owner")) setMode("owner");
    else if (
      pathname.startsWith("/home") ||
      pathname.startsWith("/map") ||
      pathname.startsWith("/search") ||
      pathname.startsWith("/favorites") ||
      pathname.startsWith("/mypage") ||
      pathname.startsWith("/shop")
    ) {
      setMode("guest");
    }
  }, [pathname, setMode]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session?.user) {
        setLoggedIn(false);
        setShopName(null);
        setHasOwnerRole(false);
        setReady(true);
        return;
      }

      setLoggedIn(true);
      const ownerRole = hasRole(session.user, "owner");
      setHasOwnerRole(ownerRole);

      if (ownerRole) {
        const { data: shop } = await fetchManagedShop(session.user.id);
        if (!cancelled) setShopName(shop?.name ?? null);
      } else {
        setShopName(null);
      }

      if (!cancelled) setReady(true);
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  function handleSearchChange(value: string) {
    setLocalSearch(value);
    onSearchChange?.(value);
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const query = localSearch.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  if (!ready || !modeReady) {
    return <div className={headerShellClassName} aria-hidden />;
  }

  if (!loggedIn) {
    return (
      <header className={headerShellClassName}>
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Logo href="/" />
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/login"
              className="rounded-[10px] px-3 py-2 text-sm font-medium text-[#9994a8] transition hover:text-[#eeeaf4] md:px-4"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="rounded-[14px] bg-[#ff3d00] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#e63600] md:px-5 md:py-2.5"
            >
              はじめる
            </Link>
          </div>
        </div>
      </header>
    );
  }

  if (mode === "owner" && hasOwnerRole) {
    return (
      <header className={headerShellClassName}>
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
          <Logo href="/owner/dashboard" />

          <div className="hidden min-w-0 flex-1 justify-center md:flex">
            <p className="truncate text-sm font-bold text-[#eeeaf4] md:text-base">
              {shopName ?? "お店"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isDualRole && (
              <AppModeSwitcher mode={mode} onModeChange={setMode} compact />
            )}
            <NotificationBell />
            <LiveStatusPill />
            <IconButton href="/owner/profile" label="プロフィール">
              👤
            </IconButton>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={headerShellClassName}>
      <div className="mx-auto flex h-full max-w-[1200px] items-center gap-4 px-4 md:px-6">
        <Logo href="/home" />

        <form
          onSubmit={handleSearchSubmit}
          className="relative mx-auto hidden max-w-[480px] flex-1 lg:block"
        >
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a5668]">
            🔍
          </span>
          <input
            type="search"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="エリア、ジャンル、雰囲気で探す..."
            className="w-full rounded-[12px] border border-white/12 bg-[#111118] py-2.5 pl-10 pr-4 text-sm text-[#eeeaf4] outline-none placeholder:text-[#5a5668]"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <div className="lg:hidden">
            <IconButton href="/search" label="検索">
              🔍
            </IconButton>
          </div>
          {isDualRole && (
            <AppModeSwitcher mode={mode} onModeChange={setMode} compact />
          )}
          <NotificationBell />
          <div className="hidden lg:contents">
            <IconButton href="/mypage" label="プロフィール">
              👤
            </IconButton>
            {!hasOwnerRole && (
              <Link
                href="/signup?type=owner"
                className="ml-1 hidden rounded-[10px] border border-[#ff3d00]/30 bg-[#ff3d00]/10 px-4 py-2 text-[13px] font-semibold text-[#ff3d00] transition hover:bg-[#ff3d00]/20 md:inline-flex"
              >
                お店を登録
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
