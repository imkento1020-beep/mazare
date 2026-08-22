const STORAGE_KEY = "mazare_pending_staff_invite";

export function storePendingStaffInvite(inviteId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, inviteId);
}

export function readPendingStaffInvite() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearPendingStaffInvite() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
