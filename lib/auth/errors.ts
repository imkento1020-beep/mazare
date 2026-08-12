type AuthErrorLike = {
  message: string;
  code?: string;
  status?: number;
};

function normalize(error: AuthErrorLike) {
  return {
    message: error.message.toLowerCase(),
    code: (error.code ?? "").toLowerCase(),
  };
}

function isEmailNotConfirmed(error: AuthErrorLike) {
  const { message, code } = normalize(error);
  return code === "email_not_confirmed" || message.includes("email not confirmed");
}

function isInvalidCredentials(error: AuthErrorLike) {
  const { message, code } = normalize(error);
  return (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials") ||
    message.includes("invalid email or password")
  );
}

function isRateLimited(error: AuthErrorLike) {
  const { message, code } = normalize(error);
  return (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("email rate limit")
  );
}

function isUserAlreadyRegistered(error: AuthErrorLike) {
  const { message, code } = normalize(error);
  return (
    code === "user_already_exists" ||
    message.includes("user already registered") ||
    message.includes("already been registered")
  );
}

function isWeakPassword(error: AuthErrorLike) {
  const { message } = normalize(error);
  return (
    message.includes("password should be at least") ||
    message.includes("password is too short")
  );
}

function isNetworkError(error: AuthErrorLike) {
  const { message } = normalize(error);
  return (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("networkerror")
  );
}

export function getAuthErrorMessage(
  error: AuthErrorLike | null,
  context: "login" | "signup" | "resend" | "reset" = "login",
): string {
  if (!error) {
    return "エラーが発生しました。もう一度お試しください。";
  }

  if (isEmailNotConfirmed(error)) {
    return "メールアドレスが確認されていません。確認メール内のリンクをクリックするか、下のボタンから再送してください。";
  }

  if (isInvalidCredentials(error)) {
    return "メールアドレスまたはパスワードが正しくありません。入力内容をご確認ください。";
  }

  if (isRateLimited(error)) {
    if (context === "resend") {
      return "確認メールの送信回数が上限に達しました。しばらく待ってから再度お試しください。";
    }
    return "リクエストが多すぎます。しばらく待ってから再度お試しください。";
  }

  if (isUserAlreadyRegistered(error)) {
    return "このメールアドレスは既に登録されています。ログインしてください。";
  }

  if (isWeakPassword(error)) {
    return "パスワードは6文字以上で入力してください。";
  }

  if (isNetworkError(error)) {
    return "ネットワークエラーが発生しました。接続を確認して再度お試しください。";
  }

  if (context === "login") {
    return "ログインに失敗しました。もう一度お試しください。";
  }

  if (context === "signup") {
    return "アカウントの作成に失敗しました。もう一度お試しください。";
  }

  if (context === "reset") {
    return "パスワードの再設定に失敗しました。もう一度お試しください。";
  }

  return "エラーが発生しました。もう一度お試しください。";
}

export { isEmailNotConfirmed, isInvalidCredentials };
