"use client";

import {
  createContext,
  useContext,
  useEffect,
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
};

const AnonymousAuthContext = createContext<AnonymousAuthContextValue>({
  user: null,
  ready: false,
  isAnonymous: false,
});

export function AnonymousAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const sessionUser = await ensureAnonymousSession();
      if (!cancelled) {
        setUser(sessionUser);
        setReady(true);
      }
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
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
      }}
    >
      {children}
    </AnonymousAuthContext.Provider>
  );
}

export function useAnonymousAuth() {
  return useContext(AnonymousAuthContext);
}
