"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isRegisteredUser } from "@/lib/auth/anonymous";
import { getLoginPathWithReturn } from "@/lib/auth/authPaths";
import {
  fetchContactMessages,
  fetchContactThreadDetail,
  markContactThreadRead,
  sendContactMessage,
  type ContactMessageRow,
  type ContactThreadDetail,
} from "@/lib/matching/contactThreads";
import ContactMessageBubble from "@/components/messages/ContactMessageBubble";
import LoadingScreen from "@/components/layout/LoadingScreen";
import AppScreenHeader from "@/components/layout/AppScreenHeader";
import BottomNav from "@/components/BottomNav";
import { MOBILE_TAB_BAR_STACK_HEIGHT } from "@/lib/layout/nav";

type ContactThreadClientProps = {
  threadId: string;
};

export default function ContactThreadClient({
  threadId,
}: ContactThreadClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ContactThreadDetail | null>(null);
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = useCallback(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const load = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user || !isRegisteredUser(user)) {
      router.replace(getLoginPathWithReturn(`/messages/${threadId}`));
      return;
    }
    setViewerId(user.id);

    const [detailResult, msgResult] = await Promise.all([
      fetchContactThreadDetail(threadId, user.id),
      fetchContactMessages(threadId),
    ]);

    if (detailResult.error || !detailResult.data) {
      setError(detailResult.error ?? "会話を開けませんでした");
      setLoading(false);
      return;
    }

    setDetail(detailResult.data);
    setMessages(msgResult.data);
    setError(msgResult.error);
    await markContactThreadRead(threadId, user.id);
    setLoading(false);
  }, [router, threadId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!loading) scrollToEnd();
  }, [loading, messages.length, scrollToEnd]);

  useEffect(() => {
    if (!viewerId) return;

    const channel = supabase
      .channel(`contact-thread-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "contact_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const row = payload.new as ContactMessageRow;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row];
          });
          if (row.sender_user_id !== viewerId) {
            void markContactThreadRead(threadId, viewerId);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [threadId, viewerId]);

  async function handleSend() {
    if (!viewerId || !detail?.can_message || sending) return;
    const text = draft.trim();
    if (!text) return;

    setSending(true);
    const { id, error: sendError } = await sendContactMessage({
      threadId,
      senderUserId: viewerId,
      body: text,
    });
    setSending(false);

    if (sendError) {
      setError(sendError);
      return;
    }

    setDraft("");
    setError(null);

    if (id) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === id)) return prev;
        return [
          ...prev,
          {
            id,
            thread_id: threadId,
            sender_user_id: viewerId,
            body: text,
            created_at: new Date().toISOString(),
          },
        ];
      });
    }
  }

  if (loading) {
    return (
      <LoadingScreen
        message="会話を開いています"
        submessage="メッセージ履歴を読み込んでいます"
      />
    );
  }

  if (!detail) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#080810] px-6 text-center">
        <p className="text-sm text-red-400">{error ?? "会話が見つかりません"}</p>
        <Link
          href="/messages"
          className="mt-4 text-sm font-bold text-[#ff3d00]"
        >
          メッセージ一覧へ
        </Link>
      </div>
    );
  }

  const otherName = detail.other_display_name?.trim() || "ゲスト";

  return (
    <div className="flex min-h-dvh flex-col bg-[#080810] text-[#eeeaf4]">
      <AppScreenHeader
        title={otherName}
        fallbackHref="/messages"
        forceShow
        rightSlot={
          <Link
            href={`/user/${detail.other_user_id}`}
            className="rounded-lg px-2 py-1 text-[11px] font-bold text-[#ff3d00]"
          >
            プロフィール
          </Link>
        }
      />

      {error ? (
        <p className="mx-4 mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-400">
          {error}
        </p>
      ) : null}

      <ThreadMessageList
        messages={messages}
        viewerId={viewerId}
        listEndRef={listEndRef}
      />

      <footer
        className="sticky bottom-0 border-t border-white/[0.07] bg-[#111118] px-4 py-3"
        style={{ paddingBottom: MOBILE_TAB_BAR_STACK_HEIGHT }}
      >
        <div className="mx-auto flex max-w-lg gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={1}
            maxLength={2000}
            placeholder="メッセージを入力"
            className="max-h-28 min-h-[44px] flex-1 resize-y rounded-xl border border-white/10 bg-[#080810] px-3 py-2.5 text-sm text-[#eeeaf4] outline-none focus:border-[#00e87a]/50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
          <button
            type="button"
            disabled={sending || !draft.trim()}
            onClick={() => void handleSend()}
            className="shrink-0 rounded-xl bg-[#00e87a] px-4 text-sm font-black text-[#080810] disabled:opacity-40"
          >
            送信
          </button>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}

function ThreadMessageList({
  messages,
  viewerId,
  listEndRef,
}: {
  messages: ContactMessageRow[];
  viewerId: string | null;
  listEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <main
      className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
      style={{ paddingBottom: "1rem" }}
    >
      {messages.length === 0 ? (
        <p className="py-8 text-center text-xs text-[#9994a8]">
          最初のメッセージを送ってください
        </p>
      ) : (
        messages.map((msg) => (
          <ContactMessageBubble
            key={msg.id}
            body={msg.body}
            createdAt={msg.created_at}
            isMine={viewerId === msg.sender_user_id}
            senderLabel={msg.sender_display_name}
          />
        ))
      )}
      <div ref={listEndRef} />
    </main>
  );
}