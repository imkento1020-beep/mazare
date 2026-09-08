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
  getSignupPathWithReturn,
  prepareAuthNavigation,
} from "@/lib/auth/authPaths";
import { primaryButtonClassName } from "@/lib/ui/styles";

export type AuthPromptOptions = {
  returnPath?: string;
  title?: string;
  description?: string;
  signupPath?: string;
};

type AuthPromptContextValue = {
  openAuthPrompt: (options?: AuthPromptOptions) => void;
  closeAuthPrompt: () => void;
};

const AuthPromptContext = createContext<AuthPromptContextValue | null>(null);

const DEFAULT_TITLE = "mazareを始めましょう";
const DEFAULT_DESCRIPTION =
  "「行くかも」やチェックインを使うには、アカウントが必要です。サインアップまたはログインを選んでください。";

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<AuthPromptOptions>({});

  const closeAuthPrompt = useCallback(() => {
    setOpen(false);
  }, []);

  const openAuthPrompt = useCallback((nextOptions: AuthPromptOptions = {}) => {
    setOptions(nextOptions);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeAuthPrompt();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeAuthPrompt, open]);

  function handleSignup() {
    const returnPath = prepareAuthNavigation(options.returnPath);
    const destination =
      options.signupPath ?? getSignupPathWithReturn(returnPath);
    closeAuthPrompt();
    router.push(destination);
  }

  function handleLogin() {
    const returnPath = prepareAuthNavigation(options.returnPath);
    closeAuthPrompt();
    router.push(getLoginPathWithReturn(returnPath));
  }

  return (
    <AuthPromptContext.Provider value={{ openAuthPrompt, closeAuthPrompt }}>
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
            <p className="text-3xl">👋</p>
            <h2
              id="auth-prompt-title"
              className="mt-4 text-lg font-black text-[#eeeaf4]"
            >
              {options.title ?? DEFAULT_TITLE}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#9994a8]">
              {options.description ?? DEFAULT_DESCRIPTION}
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleSignup}
                className={primaryButtonClassName}
              >
                サインアップ
              </button>
              <button
                type="button"
                onClick={handleLogin}
                className="w-full rounded-[13px] border border-white/12 bg-[#18181f] px-4 py-3.5 text-sm font-bold text-[#eeeaf4] transition hover:border-white/20"
              >
                ログイン
              </button>
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
