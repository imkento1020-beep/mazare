"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchOwnerShop } from "@/lib/owner/api";

type UserType = "guest" | "owner" | null;

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
  const [userType, setUserType] = useState<UserType>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [localSearch, setLocalSearch] = useState(search ?? "");

  useEffect(() => {
    if (search !== undefined) setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session?.user) {
        setUserType(null);
        setShopName(null);
        setReady(true);
        return;
      }

      const type =
        session.user.user_metadata?.user_type === "owner" ? "owner" : "guest";
      setUserType(type);

      if (type === "owner") {
        const { data: shop } = await fetchOwnerShop(session.user.id);
        if (!cancelled) {
          setShopName(shop?.name ?? null);
        }
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

  if (!ready) {
    return <div className={headerShellClassName} aria-hidden />;
  }

  if (userType === null) {
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

  if (userType === "owner") {
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
            <div className="hidden md:block">
              <IconButton label="通知">🔔</IconButton>
            </div>
            <LiveStatusPill />
            <IconButton href="/owner/profile" label="プロフィール">
              👤
            </IconButton>
          </div>
        </div>
      </header>
    );
  }

  // guest
  return (
    <header className={headerShellClassName}>
      <div className="mx-auto flex h-full max-w-[1200px] items-center gap-4 px-4 md:px-6">
        <Logo href="/home" />

        <div className="relative mx-auto hidden max-w-[480px] flex-1 md:block">
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
        </div>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <div className="md:hidden">
            <IconButton href="/search" label="検索">
              🔍
            </IconButton>
          </div>
          <IconButton label="通知">🔔</IconButton>
          <div className="hidden md:contents">
            <IconButton href="/mypage" label="プロフィール">
              👤
            </IconButton>
            <Link
              href="/signup"
              className="ml-1 hidden rounded-[10px] border border-[#ff3d00]/30 bg-[#ff3d00]/10 px-4 py-2 text-[13px] font-semibold text-[#ff3d00] transition hover:bg-[#ff3d00]/20 md:inline-flex"
            >
              お店を登録
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
