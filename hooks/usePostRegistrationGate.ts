"use client";

import { useEffect, useRef } from "react";
import { isRegisteredUser } from "@/lib/auth/anonymous";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";
import { usePostAuthPrompt } from "@/hooks/usePostAuthPrompt";

/** 未登録ユーザーは投稿系画面をブロックし、初回だけ認証ポップアップを開く */
export function usePostRegistrationGate(returnPath: string) {
  const { user, ready } = useAnonymousAuth();
  const { promptRegistration } = usePostAuthPrompt();
  const promptedRef = useRef(false);

  const blocked = ready && !isRegisteredUser(user);

  useEffect(() => {
    if (!blocked || promptedRef.current) return;
    promptedRef.current = true;
    promptRegistration(returnPath);
  }, [blocked, returnPath, promptRegistration]);

  return { ready, blocked };
}