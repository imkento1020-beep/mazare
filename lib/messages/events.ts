export const MESSAGES_UNREAD_CHANGED_EVENT = "mazare:messages-unread-changed";

export function dispatchMessagesUnreadChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MESSAGES_UNREAD_CHANGED_EVENT));
}