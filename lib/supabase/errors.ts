export function isMissingTableError(message: string, tableName: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("schema cache") ||
    normalized.includes("does not exist") ||
    normalized.includes("could not find the table")
  ) && normalized.includes(tableName.toLowerCase());
}

export function missingTableMessage(tableName: string) {
  return `データベースに ${tableName} テーブルがありません。Supabase Dashboard → SQL Editor で supabase/run-migrations.sql を実行してください。`;
}

export function isJwtClockSkewError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("jwt issued at future");
}

export function isJwtExpiredError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("jwt expired") ||
    normalized.includes("token is expired") ||
    normalized.includes("session expired")
  );
}

export function isJwtAuthError(message: string) {
  const normalized = message.toLowerCase();
  return (
    isJwtClockSkewError(message) ||
    isJwtExpiredError(message) ||
    normalized.includes("invalid jwt")
  );
}

export function jwtClockSkewMessage() {
  return "認証トークンの時刻がずれています。PCの日時設定を確認し、一度ログアウトしてから再ログインしてください。";
}

export function jwtExpiredMessage() {
  return "セッションの有効期限が切れました。再度ログインしてください。";
}

export function formatSupabaseError(message: string) {
  if (isJwtClockSkewError(message)) return jwtClockSkewMessage();
  if (isJwtExpiredError(message)) return jwtExpiredMessage();
  return message;
}
