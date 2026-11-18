"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isRegisteredUser } from "@/lib/auth/anonymous";
import { getLoginPathWithReturn } from "@/lib/auth/authPaths";
import { fetchContactThreadsForUser } from "@/lib/matching/contactThreads";
import type { ContactThreadSummary } from "@/lib/matching/contactThreads";
import {
  fetchOutgoingContactRequests,
  type ContactRequestRow,
} from "@/lib/matching/contactRequests";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import BottomNav from "@/components/BottomNav";

export default function MessagesInboxClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<ContactThreadSummary[]>([]);
  const [pendingSent, setPendingSent] = useState<ContactRequestRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user || !isRegisteredUser(user)) {
      router.replace(getLoginPathWithReturn("/messages"));
      return;
    }

    const [threadResult, outgoingResult] = await Promise.all([
      fetchContactThreadsForUser(user.id),
      fetchOutgoingContactRequests(user.id),
    ]);
    setThreads(threadResult.data);
    setPendingSent(
      outgoingResult.data.filter((row) => row.status === "pending"),
    );
    setError(threadResult.error ?? outgoingResult.error);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <LoadingScreen
        message="メッセージを読み込んでいます"
        submessage="承諾済みの会話を取得しています"
      />
    );
  }

  return (
    <>
      <GuestLayout menuOnly mobileTitle="メッセージ">
        <h1 className="text-xl font-black text-[#eeeaf4]">メッセージ</h1>
        <p className="mt-1 text-sm text-[#9994a8]">
          連絡が承諾された相手とのみやり取りできます。
        </p>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        ) : null}

        {pendingSent.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#5a5668]">
              承諾待ち
            </h2>
            <ul className="mt-2 space-y-2">
              {pendingSent.map((row) => (
                <li
                  key={row.id}
                  className="rounded-2xl border border-white/[0.07] bg-[#111118] px-4 py-3"
                >
                  <p className="text-sm font-bold text-[#eeeaf4]">
                    {row.from_display_name ?? "投稿者"}
                    <span className="font-normal text-[#9994a8]">
                      {" "}
                      · {row.shop_name ?? "お店"}
                    </span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-[#9994a8]">
                    {row.message}
                  </p>
                  <p className="mt-2 text-[10px] font-bold text-[#ffaa00]">
                    相手の承諾後にDMが開きます
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {threads.length === 0 && pendingSent.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
            <p className="text-sm font-bold text-[#eeeaf4]">
              まだ会話はありません
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#9994a8]">
              ホームで「連絡する」から申請し、相手が承諾するとここに表示されます。
            </p>
            <Link
              href="/mypage#contacts"
              className="mt-6 inline-block text-xs font-bold text-[#ff3d00]"
            >
              届いた連絡を確認 →
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-2 pb-24">
            {threads.map((thread) => (
              <li key={thread.thread_id}>
                <Link
                  href={`/messages/${thread.thread_id}`}
                  className="block rounded-2xl border border-white/[0.07] bg-[#111118] px-4 py-3.5 transition hover:border-[#00e87a]/30"
                >
                  <ThreadRowInner thread={thread} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </GuestLayout>
      <BottomNav />
    </>
  );
}

function ThreadRowInner({ thread }: { thread: ContactThreadSummary }) {
  const name = thread.other_display_name?.trim() || "ゲスト";
  const preview =
    thread.last_message_body?.trim() ||
    "メッセージを送って今夜の予定をすり合わせましょう";

  return (
    <ThreadRowContent
      name={name}
      shopName={thread.shop_name}
      preview={preview}
      time={thread.last_message_at ?? thread.thread_created_at}
    />
  );
}

function ThreadRowContent({
  name,
  shopName,
  preview,
  time,
}: {
  name: string;
  shopName: string | null;
  preview: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00e87a]/15 text-sm font-black text-[#00e87a]">
        {name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-bold text-[#eeeaf4]">{name}</p>
          <time className="shrink-0 text-[10px] text-[#5a5668]">
            {new Date(time).toLocaleString("ja-JP", {
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </div>
        {shopName ? (
          <p className="mt-0.5 truncate text-[11px] text-[#9994a8]">{shopName}</p>
        ) : null}
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#b8b3c8]">
          {preview}
        </p>
      </div>
    </div>
  );
}