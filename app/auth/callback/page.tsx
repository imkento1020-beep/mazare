"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("認証処理中...");

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const errorDescription = params.get("error_description");
      const code = params.get("code");

      if (errorDescription) {
        setMessage(decodeURIComponent(errorDescription));
        setTimeout(() => router.replace("/signup"), 4000);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(`認証に失敗しました: ${error.message}`);
          setTimeout(() => router.replace("/signup"), 4000);
          return;
        }
        router.replace("/home");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/home");
        return;
      }

      setMessage("認証に失敗しました。もう一度サインアップしてください。");
      setTimeout(() => router.replace("/signup"), 4000);
    }

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-full items-center justify-center bg-[#080810] px-6">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#ff3d00] border-t-transparent" />
        <p className="mt-4 text-sm text-[#9994a8]">{message}</p>
      </div>
    </div>
  );
}
