"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";
import { isRegisteredUser } from "@/lib/auth/anonymous";
import { getLoginPathWithReturn } from "@/lib/auth/authPaths";

export function useRequireRegisteredRedirect(returnPath: string) {
  const router = useRouter();
  const { user, ready } = useAnonymousAuth();
  const allowed = ready && isRegisteredUser(user);

  useEffect(() => {
    if (!ready) return;
    if (!isRegisteredUser(user)) {
      router.replace(getLoginPathWithReturn(returnPath));
    }
  }, [ready, user, router, returnPath]);

  return { ready: allowed, user: allowed ? user : null };
}
