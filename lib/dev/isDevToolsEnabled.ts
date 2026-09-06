export function isDevToolsEnabled() {
  return process.env.NODE_ENV !== "production";
}
