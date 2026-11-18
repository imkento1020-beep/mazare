"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MessageInboxIcon } from "@/components/icons/FeedActionIcons";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { isRegisteredUser } from "@/lib/auth/anonymous";
import { fetchUnreadContactMessageCount } from "@/lib/matching/contactThreads";
import { MESSAGES_UNREAD_CHANGED_EVENT } from "@/lib/messages/events";

type MessageInboxBellProps = {
  className?: string;
};

export default function MessageInboxBell({
  className = "",
}: MessageInboxBellProps) {
  const pathname = usePathname();
  const { user } = useAnonymousAuth();
  const { openFormalRegistrationPrompt } = useAuthPrompt();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!isRegisteredUser(user)) {
      setUnreadCount(0);
      return;
    }
    const { count } = await fetchUnreadContactMessageCount();
    setUnreadCount(count);
  }, [user]);

  useEffect(() => {
    void refreshCount();
  }, [pathname, refreshCount]);

  useEffect(() => {
    function onUnreadChanged() {
      void refreshCount();
    }
    window.addEventListener(MESSAGES_UNREAD_CHANGED_EVENT, onUnreadChanged);
    return () =>
      window.removeEventListener(MESSAGES_UNREAD_CHANGED_EVENT, onUnreadChanged);
  }, [refreshCount]);

  useEffect(() => {
    if (!isRegisteredUser(user)) return;

    const channel = supabase
      .channel(`contact-messages-unread-${user!.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "contact_messages",
        },
        () => {
          void refreshCount();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, refreshCount]);

  if (!isRegisteredUser(user)) {
    return (
      <button
        type="button"
        onClick={() =>
          openFormalRegistrationPrompt({
            returnPath: "/messages",
            title: "メッセージを使う",
            description:
              "連絡が承諾された相手とのメッセージには、ログインまたは新規登録が必要です。",
          })
        }
        aria-label="メッセージ"
        className={`relative flex h-9 w-9 items-center justify-center rounded-[10px] text-base text-[#9994a8] transition hover:bg-[#111118] hover:text-[#eeeaf4] ${className}`}
      >
        <MessageInboxIcon size={20} color="currentColor" />
      </button>
    );
  }

  return (
    <Link
      href="/messages"
      aria-label={
        unreadCount > 0
          ? `メッセージ（未読${unreadCount}件）`
          : "メッセージ"
      }
      className={`relative flex h-9 w-9 items-center justify-center rounded-[10px] text-base text-[#9994a8] transition hover:bg-[#111118] hover:text-[#eeeaf4] ${className}`}
    >
      <MessageInboxIcon size={20} color="currentColor" />
      {unreadCount > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00e87a] px-1 text-[9px] font-bold text-[#080810]">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}