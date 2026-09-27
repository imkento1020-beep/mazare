"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ensureAnonymousSession, isAnonymousUser } from "@/lib/auth/anonymous";

type AnonymousAuthContextValue = {
  user: User | null;
  ready: boolean;
  isAnonymous: boolean;
  authError: string | null;
};

const AnonymousAuthContext = createContext<AnonymousAuthContextValue>({
  user: null,
  ready: false,
  isAnonymous: false,
  authError: null,
});

export function AnonymousAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const bootstrapDoneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const { user: sessionUser, error } = await ensureAnonymousSession();
      if (cancelled) return;

      bootstrapDoneRef.current = true;
      setUser(sessionUser);
      setAuthError(sessionUser ? null : error);
      setReady(true);
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!bootstrapDoneRef.current) return;
      setUser(session?.user ?? null);
      if (session?.user) setAuthError(null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AnonymousAuthContext.Provider
      value={{
        user,
        ready,
        isAnonymous: isAnonymousUser(user),
        authError,
      }}
    >
      {children}
    </AnonymousAuthContext.Provider>
  );
}

export function useAnonymousAuth() {
  return useContext(AnonymousAuthContext);
}
