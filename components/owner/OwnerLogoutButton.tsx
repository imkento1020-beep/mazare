"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearStoredAppMode } from "@/lib/auth/mode";
import { supabase } from "@/lib/supabase";

type OwnerLogoutButtonProps = {
  className?: string;
  fullWidth?: boolean;
};

export default function OwnerLogoutButton({
  className = "",
  fullWidth = true,
}: OwnerLogoutButtonProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    clearStoredAppMode();
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className={`rounded-[13px] border border-[#ff3d00]/30 bg-transparent py-3 text-sm font-bold text-[#ff3d00] transition hover:bg-[#ff3d00]/10 disabled:opacity-60 ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {loggingOut ? "ログアウト中..." : "ログアウト"}
    </button>
  );
}
