"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { resolveAppMode, setStoredAppMode, type AppMode } from "@/lib/auth/mode";
import {
  getUserRoles,
  type AppRole,
} from "@/lib/auth/roles";

export function useAppMode() {
  const [mode, setModeState] = useState<AppMode>("guest");
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      const userRoles = getUserRoles(session?.user);
      setRoles(userRoles);
      setModeState(resolveAppMode(session?.user));
      setReady(true);
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const setMode = useCallback(
    (next: AppMode) => {
      if (!roles.includes(next)) return;
      setStoredAppMode(next);
      setModeState(next);
    },
    [roles],
  );

  return {
    mode,
    roles,
    setMode,
    isDualRole: roles.includes("guest") && roles.includes("owner"),
    ready,
  };
}
