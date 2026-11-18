"use client";

import { useCallback } from "react";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { CONTACT_REGISTRATION_PROMPT } from "@/lib/auth/contactAccessPrompt";
import { getFormalSignupPathWithReturn } from "@/lib/auth/authPaths";

export function useContactAuthPrompt() {
  const { openAuthPrompt } = useAuthPrompt();

  const promptContactLogin = useCallback(
    (returnPath: string) => {
      openAuthPrompt({
        returnPath,
        signupPath: getFormalSignupPathWithReturn(returnPath),
        title: CONTACT_REGISTRATION_PROMPT.title,
        description: CONTACT_REGISTRATION_PROMPT.description,
      });
    },
    [openAuthPrompt],
  );

  return { promptContactLogin };
}