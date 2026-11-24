"use client";

import NotificationBell from "@/components/notifications/NotificationBell";
import MessageInboxBell from "@/components/messages/MessageInboxBell";

type NativeInboxActionsProps = {
  className?: string;
  /** 地図上など暗い背景向け */
  floating?: boolean;
};

export default function NativeInboxActions({
  className = "",
  floating = false,
}: NativeInboxActionsProps) {
  const shell = floating
    ? "flex items-center gap-1 rounded-full border border-white/15 bg-black/45 p-1 shadow-lg backdrop-blur-md"
    : "flex items-center gap-1";

  return (
    <div className={`${shell} ${className}`.trim()}>
      <MessageInboxBell />
      <NotificationBell />
    </div>
  );
}