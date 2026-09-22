"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  getLoginPathWithReturn,
  getFormalSignupPathWithReturn,
  prepareAuthNavigation,
} from "@/lib/auth/authPaths";
import { startGoogleAuth } from "@/lib/auth/googleLink";
import { primaryButtonClassName } from "@/lib/ui/styles";

export type AuthPromptOptions = {
  returnPath?: string;
  title?: string;
  description?: string;
  signupPath?: string;
  /** @deprecated 匿名認証により通常アクションでは未使用 */
  legacyGuestGate?: boolean;
};

type AuthPromptContextValue = {
  openAuthPrompt: (options?: AuthPromptOptions) => void;
  openFormalRegistrationPrompt: (options?: AuthPromptOptions) => void;
  closeAuthPrompt: () => void;
};

const AuthPromptContext = createContext<AuthPromptContextValue | null>(null);

const FORMAL_TITLE = "正式登録で機能を解放";
const FORMAL_DESCRIPTION =
  "行くかも履歴の保存、通知の受け取り、投稿の継続には正式登録（Google またはメール）が必要です。これまでのデータはそのまま引き継がれます。";

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formal, setFormal] = useState(false);
  const [options, setOptions] = useState<AuthPromptOptions>({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const closeAuthPrompt = useCallback(() => {
    setOpen(false);
    setFormal(false);
    setGoogleError(null);
  }, []);

  const openAuthPrompt = useCallback((nextOptions: AuthPromptOptions = {}) => {
    setOptions(nextOptions);
    setFormal(Boolean(nextOptions.legacyGuestGate));
    setOpen(true);
  }, []);

  const openFormalRegistrationPrompt = useCallback(
    (nextOptions: AuthPromptOptions = {}) => {
      setOptions(nextOptions);
      setFormal(true);
      setOpen(true);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeAuthPrompt();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeAuthPrompt, open]);

  function handleEmailSignup() {
    const returnPath = prepareAuthNavigation(options.returnPath);
    const destination =
      options.signupPath ??
      (formal
        ? getFormalSignupPathWithReturn(returnPath)
        : getFormalSignupPathWithReturn(returnPath));
    closeAuthPrompt();
    router.push(destination);
  }

  function handleLogin() {
    const returnPath = prepareAuthNavigation(options.returnPath);
    closeAuthPrompt();
    router.push(getLoginPathWithReturn(returnPath));
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const returnPath = prepareAuthNavigation(options.returnPath);
      await startGoogleAuth(returnPath);
      closeAuthPrompt();
    } catch (error) {
      setGoogleError(
        error instanceof Error ? error.message : "Google 連携に失敗しました",
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  const title = formal
    ? (options.title ?? FORMAL_TITLE)
    : (options.title ?? "mazareを始めましょう");
  const description = formal
    ? (options.description ?? FORMAL_DESCRIPTION)
    : (options.description ??
      "サインアップまたはログインを選んでください。");

  return (
    <AuthPromptContext.Provider
      value={{ openAuthPrompt, openFormalRegistrationPrompt, closeAuthPrompt }}
    >
      {children}

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="閉じる"
            className="absolute inset-0 bg-black/70"
            onClick={closeAuthPrompt}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-prompt-title"
            className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#111118] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
          >
            <p className="text-3xl">{formal ? "✨" : "👋"}</p>
            <h2
              id="auth-prompt-title"
              className="mt-4 text-lg font-black text-[#eeeaf4]"
            >
              {title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#9994a8]">
              {description}
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                disabled={googleLoading}
                onClick={() => void handleGoogle()}
                className="w-full rounded-[13px] border border-white/12 bg-white px-4 py-3.5 text-sm font-bold text-[#111118] transition hover:bg-[#eeeaf4] disabled:opacity-60"
              >
                {googleLoading ? "Google 連携中…" : "Google で続ける"}
              </button>
              <button
                type="button"
                onClick={handleEmailSignup}
                className={primaryButtonClassName}
              >
                メールアドレスで登録
              </button>
              <button
                type="button"
                onClick={handleLogin}
                className="w-full rounded-[13px] border border-white/12 bg-[#18181f] px-4 py-3.5 text-sm font-bold text-[#eeeaf4] transition hover:border-white/20"
              >
                ログイン（既存アカウント）
              </button>
              {googleError && (
                <p className="text-xs text-red-400">{googleError}</p>
              )}
              <button
                type="button"
                onClick={closeAuthPrompt}
                className="w-full py-2 text-sm text-[#5a5668] transition hover:text-[#9994a8]"
              >
                あとで
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthPromptContext.Provider>
  );
}

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext);
  if (!context) {
    throw new Error("useAuthPrompt must be used within AuthPromptProvider");
  }
  return context;
}
