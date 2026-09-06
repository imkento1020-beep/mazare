"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Shop } from "@/lib/home/types";
import { checkPlatformAdminSession } from "@/lib/auth/checkPlatformAdminSession";
import { fetchShopsFromDb } from "@/lib/home/shops";
import StoryImportPrototype from "@/components/dev/StoryImportPrototype";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { pageBgClassName, primaryButtonClassName } from "@/lib/ui/styles";

export default function StoryImportPageClient() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const access = await checkPlatformAdminSession();

      if (access.status === "disabled") {
        setAccessDenied("この機能は現在利用できません。");
        setLoading(false);
        return;
      }

      if (access.status === "unauthenticated") {
        router.replace("/login?next=/dev/story-import");
        return;
      }

      if (access.status === "forbidden") {
        setAccessDenied(access.message);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await fetchShopsFromDb();
      if (fetchError) {
        setError(fetchError);
        setLoading(false);
        return;
      }

      setShops(data ?? []);
      setLoading(false);
    }

    void load();
  }, [router]);

  if (loading) return <LoadingScreen />;

  if (accessDenied) {
    return (
      <div className={pageBgClassName}>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-sm font-bold text-[#ff3d00]">アクセス制限</p>
          <h1 className="mt-3 text-xl font-black">このページは管理者専用です</h1>
          <p className="mt-4 text-sm leading-relaxed text-[#9994a8]">
            {accessDenied}
          </p>
          <button
            type="button"
            onClick={() => router.replace("/home")}
            className={`${primaryButtonClassName} mt-8`}
          >
            ホームへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={pageBgClassName}>
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff3d00]">
            Platform Admin
          </p>
          <h1 className="mt-2 text-2xl font-black md:text-3xl">
            ストーリー取り込み（代行投稿）
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#9994a8]">
            店舗のInstagramストーリー画像から、mazare投稿の下書きを素早く作る管理用UIです。
          </p>
        </header>

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            店舗一覧の取得に失敗しました: {error}
          </p>
        ) : shops.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-[#111118] px-4 py-3 text-sm text-[#9994a8]">
            登録店舗がありません。先に店舗データを作成してください。
          </p>
        ) : (
          <StoryImportPrototype shops={shops} />
        )}
      </div>
    </div>
  );
}
