"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AppMode } from "@/lib/auth/mode";

type AppModeSwitcherProps = {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  compact?: boolean;
};

export default function AppModeSwitcher({
  mode,
  onModeChange,
  compact = false,
}: AppModeSwitcherProps) {
  const router = useRouter();

  function switchTo(next: AppMode) {
    if (mode === next) return;
    onModeChange(next);
    router.push(next === "owner" ? "/owner/dashboard" : "/home");
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => switchTo(mode === "owner" ? "guest" : "owner")}
        className="rounded-[10px] border border-white/12 bg-[#111118] px-3 py-1.5 text-[11px] font-semibold text-[#9994a8] transition hover:border-[#ff3d00]/30 hover:text-[#eeeaf4]"
      >
        {mode === "owner" ? "🍻 飲みに行く" : "🏪 お店を管理"}
      </button>
    );
  }

  return (
    <div className="flex rounded-lg border border-white/[0.08] bg-[#111118] p-0.5">
      <button
        type="button"
        onClick={() => switchTo("guest")}
        className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition ${
          mode === "guest"
            ? "bg-[#ff3d00] text-white"
            : "text-[#9994a8] hover:text-[#eeeaf4]"
        }`}
      >
        飲みに行く
      </button>
      <button
        type="button"
        onClick={() => switchTo("owner")}
        className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition ${
          mode === "owner"
            ? "bg-[#ff3d00] text-white"
            : "text-[#9994a8] hover:text-[#eeeaf4]"
        }`}
      >
        お店を管理
      </button>
    </div>
  );
}

export function AppModeSwitcherLink({
  mode,
  onModeChange,
}: AppModeSwitcherProps) {
  const targetMode = mode === "owner" ? "guest" : "owner";
  const href = targetMode === "owner" ? "/owner/dashboard" : "/home";
  const label = targetMode === "owner" ? "お店を管理 →" : "飲みに行く →";

  return (
    <Link
      href={href}
      onClick={() => onModeChange(targetMode)}
      className="text-xs font-semibold text-[#ff3d00] hover:underline"
    >
      {label}
    </Link>
  );
}
