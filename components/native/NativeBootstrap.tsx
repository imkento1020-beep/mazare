"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isRegisteredUser } from "@/lib/auth/anonymous";
import { isNativeMainAppPath, isNativePublicPath } from "@/lib/native/routes";
import { hasNativeGuestBrowse } from "@/lib/native/guestBrowse";
import { useNativeApp } from "@/hooks/useNativeApp";
import NativeLaunchScreen from "@/components/native/NativeLaunchScreen";

export default function NativeBootstrap({ children }: { children: React.ReactNode }) {
  const { isNative, bootstrapReady, setBootstrapReady } = useNativeApp();
  const pathname = usePathname();
  const router = useRouter();
  const routingDone = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isNative) {
      setBootstrapReady(true);
      return;
    }

    setBootstrapReady(false);

    let cancelled = false;

    async function run() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      const user = session?.user ?? null;
      const registered = isRegisteredUser(user);
      const guestOk = registered || hasNativeGuestBrowse() || isAnonymousOk(user);

      if (pathname === "/" || pathname.startsWith("/?")) {
        router.replace(registered ? "/home" : "/native/welcome");
        routingDone.current = true;
        setBootstrapReady(true);
        return;
      }

      if (
        !guestOk &&
        isNativeMainAppPath(pathname) &&
        !isNativePublicPath(pathname)
      ) {
        router.replace("/native/welcome");
        routingDone.current = true;
        setBootstrapReady(true);
        return;
      }

      setBootstrapReady(true);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [isNative, pathname, router, setBootstrapReady]);

  if (mounted && isNative && !bootstrapReady) {
    return <NativeLaunchScreen />;
  }

  return children;
}

function isAnonymousOk(user: { is_anonymous?: boolean } | null | undefined) {
  return Boolean(user?.is_anonymous && hasNativeGuestBrowse());
}