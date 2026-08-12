"use client";

import { useEffect, useState } from "react";

type GoogleMapsApiKeyState = {
  apiKey: string;
  loading: boolean;
};

export function useGoogleMapsApiKey(initialKey: string): GoogleMapsApiKeyState {
  const trimmedInitial = initialKey.trim();
  const [apiKey, setApiKey] = useState(trimmedInitial);
  const [loading, setLoading] = useState(trimmedInitial.length === 0);

  useEffect(() => {
    if (trimmedInitial) {
      setApiKey(trimmedInitial);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchApiKey() {
      try {
        const response = await fetch("/api/maps/config", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as { apiKey?: string | null };
        const resolved = data.apiKey?.trim() ?? "";
        if (!cancelled && resolved) {
          setApiKey(resolved);
        }
      } catch {
        // Ignore — caller shows setup hint when key stays empty.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchApiKey();

    return () => {
      cancelled = true;
    };
  }, [trimmedInitial]);

  return { apiKey, loading };
}
