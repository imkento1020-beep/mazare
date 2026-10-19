export const GUEST_ONBOARDING_STORAGE_KEY = "mazare_guest_onboarding_v1";

export function hasCompletedGuestOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(GUEST_ONBOARDING_STORAGE_KEY) === "1";
}

export function markGuestOnboardingCompleted() {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_ONBOARDING_STORAGE_KEY, "1");
}
