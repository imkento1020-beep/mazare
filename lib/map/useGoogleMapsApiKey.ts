"use client";

import { useEffect, useState } from "react";

type GoogleMapsApiKeyState = {
  apiKey: string;
  loading: boolean;
};

export function useGoogleMapsApiKey(_initialKey = ""): GoogleMapsApiKeyState {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return { apiKey, loading };
}
