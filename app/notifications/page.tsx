"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  syncPendingStaffInviteNotifications,
} from "@/lib/notifications/api";
import {
  formatNotificationTime,
  notificationEmoji,
  type Notification,
} from "@/lib/notifications/types";
import { useAppMode } from "@/hooks/useAppMode";
import GuestLayout from "@/components/layout/GuestLayout";
import OwnerLayout from "@/components/layout/OwnerLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { fetchManagedShop } from "@/lib/owner/api";

export default function NotificationsPage() {
  const router = useRouter();
  const { mode, ready: modeReady } = useAppMode();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      await syncPendingStaffInviteNotifications();

      const { data, error: fetchError } = await fetchNotifications(50);
      setNotifications(data);
      if (fetchError) setError(fetchError);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleClick(notification: Notification) {
    if (!notification.read_at) {
      await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, read_at: new Date().toISOString() }
            : item,
        ),
      );
    }

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
  }

  if (loading || !modeReady) return <LoadingScreen />;

  const content = (
    <div className="md:max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">通知</h1>
          <p className="mt-1 text-sm text-[#9994a8]">
            お店やゲストに関する最新情報
          </p>
        </div>
        {notifications.some((item) => !item.read_at) && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-[#ff3d00]"
          >
            すべて既読
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-2">
        {notifications.length === 0 ? (
          <div className="rounded-[14px] border border-white/7 bg-[#111118] p-8 text-center">
            <p className="text-4xl">🔔</p>
            <p className="mt-4 text-sm font-bold">通知はまだありません</p>
            <p className="mt-2 text-sm text-[#9994a8]">
              お気に入りのお店の発信や、お店への反応がここに表示されます
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => handleClick(notification)}
              className={`flex w-full gap-3 rounded-[14px] border border-white/7 bg-[#111118] p-4 text-left transition hover:border-[#ff3d00]/30 ${
                notification.read_at ? "opacity-70" : ""
              }`}
            >
              <span className="text-2xl">{notificationEmoji(notification.type)}</span>
              <span className="min-w-0 flex-1">
                <span className="font-bold">{notification.title}</span>
                <span className="mt-1 block text-sm text-[#9994a8]">
                  {notification.body}
                </span>
                <span className="mt-2 block text-xs text-[#5a5668]">
                  {formatNotificationTime(notification.created_at)}
                </span>
              </span>
            </button>
          ))
        )}
      </div>

      <Link
        href={mode === "owner" ? "/owner/dashboard" : "/home"}
        className="mt-6 inline-block text-sm text-[#9994a8] hover:text-[#eeeaf4]"
      >
        ← 戻る
      </Link>
    </div>
  );

  if (mode === "owner") {
    return <OwnerNotificationsShell>{content}</OwnerNotificationsShell>;
  }

  return (
    <GuestLayout
      mobileTitle="通知"
      menuOnly
      showFilters={false}
      showRightSidebar={false}
      showMobileSearch={false}
    >
      {content}
    </GuestLayout>
  );
}

function OwnerNotificationsShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [shop, setShop] = useState<Awaited<ReturnType<typeof fetchManagedShop>>["data"]>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await fetchManagedShop(user.id);
        setShop(data);
      }
      setReady(true);
    }
    load();
  }, []);

  if (!ready) return <LoadingScreen />;

  return (
    <OwnerLayout shop={shop}>
      {children}
    </OwnerLayout>
  );
}
