export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = "/home",
) {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
