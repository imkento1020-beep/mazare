"use client";

import type { ReactNode } from "react";
import {
  useAuthPrompt,
  type AuthPromptOptions,
} from "@/components/auth/AuthPromptProvider";
import {
  getOwnerSignupPathWithReturn,
  getSignupPathWithReturn,
} from "@/lib/auth/authPaths";

type AuthPromptTriggerProps = {
  children: ReactNode;
  className?: string;
  returnPath?: string;
  promptOptions?: Omit<AuthPromptOptions, "returnPath" | "signupPath">;
  ownerSignup?: boolean;
};

export default function AuthPromptTrigger({
  children,
  className,
  returnPath,
  promptOptions,
  ownerSignup = false,
}: AuthPromptTriggerProps) {
  const { openAuthPrompt } = useAuthPrompt();

  function handleClick() {
    const resolvedReturnPath = returnPath ?? "/home";
    openAuthPrompt({
      ...promptOptions,
      returnPath: resolvedReturnPath,
      signupPath: ownerSignup
        ? getOwnerSignupPathWithReturn(resolvedReturnPath)
        : getSignupPathWithReturn(resolvedReturnPath),
    });
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
