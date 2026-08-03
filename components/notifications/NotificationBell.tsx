"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/api";
import {
  formatNotificationTime,
  notificationEmoji,
  type Notification,
} from "@/lib/notifications/types";

type NotificationBellProps = {
  className?: string;
};

export default function NotificationBell({ className = "" }: NotificationBellProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function loadNotifications() {
    setLoading(true);
    setError(null);

    const [listResult, countResult] = await Promise.all([
      fetchNotifications(),
      fetchUnreadNotificationCount(),
    ]);

    if (listResult.error?.includes("notifications")) {
      setError(listResult.error);
    }

    setNotifications(listResult.data);
    setUnreadCount(countResult.count);
    setLoading(false);
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) await loadNotifications();
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.read_at) {
      await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, read_at: new Date().toISOString() }
            : item,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    setOpen(false);
    if (notification.href) router.push(notification.href);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read_at: item.read_at ?? new Date().toISOString(),
      })),
    );
    setUnreadCount(0);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="通知"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-[10px] text-base text-[#9994a8] transition hover:bg-[#111118] hover:text-[#eeeaf4]"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff3d00] px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[200] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[14px] border border-white/10 bg-[#111118] shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between border-b border-white/7 px-4 py-3">
            <p className="text-sm font-bold">通知</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-[#ff3d00]"
              >
                すべて既読
              </button>
            )}
          </div>

          <div className="max-h-[min(420px,60vh)] overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-[#5a5668]">
                読み込み中...
              </p>
            ) : error ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-[#9994a8]">{error}</p>
                <p className="mt-2 text-xs text-[#5a5668]">
                  supabase/notifications.sql を SQL Editor で実行してください
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[#5a5668]">
                通知はまだありません
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex w-full gap-3 border-b border-white/5 px-4 py-3 text-left transition hover:bg-[#18181f] ${
                    notification.read_at ? "opacity-70" : ""
                  }`}
                >
                  <span className="mt-0.5 text-lg">
                    {notificationEmoji(notification.type)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold leading-snug">
                        {notification.title}
                      </span>
                      {!notification.read_at && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#ff3d00]" />
                      )}
                    </span>
                    <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-[#9994a8]">
                      {notification.body}
                    </span>
                    <span className="mt-1 block text-[10px] text-[#5a5668]">
                      {formatNotificationTime(notification.created_at)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-white/7 px-4 py-2.5 text-center">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-[#9994a8] hover:text-[#eeeaf4]"
            >
              すべて見る
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
