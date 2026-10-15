export const NOTIFICATIONS_READ_EVENT = "mazare:notifications-read";

export function dispatchNotificationsRead() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOTIFICATIONS_READ_EVENT));
}
