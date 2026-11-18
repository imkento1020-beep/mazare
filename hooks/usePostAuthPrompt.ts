"use client";

import { useCallback } from "react";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { POST_REGISTRATION_PROMPT } from "@/lib/auth/postAccessPrompt";
import { getFormalSignupPathWithReturn } from "@/lib/auth/authPaths";

export function usePostAuthPrompt() {
  const { openAuthPrompt } = useAuthPrompt();

  const promptRegistration = useCallback(
    (returnPath: string) => {
      openAuthPrompt({
        returnPath,
        signupPath: getFormalSignupPathWithReturn(returnPath),
        title: POST_REGISTRATION_PROMPT.title,
        description: POST_REGISTRATION_PROMPT.description,
      });
    },
    [openAuthPrompt],
  );

  return { promptRegistration };
}