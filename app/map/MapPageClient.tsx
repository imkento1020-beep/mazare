"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MapActivityGoogleMapView from "@/components/map/MapActivityGoogleMapView";
import MapActivitySheet from "@/components/map/MapActivitySheet";
import GoogleAttribution from "@/components/places/GoogleAttribution";
import { useGoogleMapsApiKey } from "@/lib/map/useGoogleMapsApiKey";
import {
  buildMapShopActivity,
  fetchRecentVibePosts,
  type MapShopActivity,
} from "@/lib/feed/recentFeed";
import { notifyPostInterestCreated } from "@/lib/notifications/api";
import type { User } from "@supabase/supabase-js";

type MapPageClientProps = {
  googleMapsApiKey: string;
  setupHint: string;
};

export default function MapPageClient({
  googleMapsApiKey,
  setupHint,
}: MapPageClientProps) {
  const [activities, setActivities] = useState<MapShopActivity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [interestedPostIds, setInterestedPostIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { apiKey: resolvedMapsApiKey, loading: mapsKeyLoading } =
    useGoogleMapsApiKey(googleMapsApiKey);

  const reload = useCallback(async () => {
    const { data, error } = await fetchRecentVibePosts();
    if (error) setLoadError(error);
    setActivities(buildMapShopActivity(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (!activeUser) return;
      const { data } = await supabase
        .from("interests")
        .select("vibe_post_id")
        .eq("user_id", activeUser.id);
      setInterestedPostIds(new Set((data ?? []).map((row) => row.vibe_post_id)));
    });

    const channel = supabase
      .channel("map-vibe-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "vibe_posts" },
        () => {
          void reload();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [reload]);

  const mapShops = useMemo(
    () =>
      activities.map((item) => ({
        id: item.shopId,
        name: item.shop.name,
        address: item.shop.address,
        latitude: item.shop.latitude,
        longitude: item.shop.longitude,
        uniquePosterCount: item.uniquePosterCount,
      })),
    [activities],
  );

  const selectedActivity =
    activities.find((item) => item.shopId === selectedId) ?? null;

  async function handleInterest() {
    if (!selectedActivity) return;
    if (!user) return;

    const postId = selectedActivity.latestPostId;
    const interested = interestedPostIds.has(postId);
    setSubmitting(true);

    if (interested) {
      await supabase
        .from("interests")
        .delete()
        .eq("user_id", user.id)
        .eq("vibe_post_id", postId);
      setInterestedPostIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    } else {
      const { data, error } = await supabase
        .from("interests")
        .insert({
          user_id: user.id,
          shop_id: selectedActivity.shopId,
          vibe_post_id: postId,
        })
        .select("id")
        .single();

      if (!error && data?.id) {
        await notifyPostInterestCreated(data.id);
        setInterestedPostIds((prev) => new Set(prev).add(postId));
      }
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#080810]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff3d00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#080810] text-[#eeeaf4]">
      <Header />

      <div className="relative min-h-0 flex-1 basis-0">
        <MapActivityGoogleMapView
          apiKey={resolvedMapsApiKey}
          shops={mapShops}
          selectedId={selectedId}
          focusLocation={userLocation}
          onSelectShop={(shopId) => {
            setSelectedId(shopId);
            setSheetOpen(true);
          }}
        />

        {!mapsKeyLoading && !resolvedMapsApiKey && (
          <div className="pointer-events-none absolute inset-x-4 top-4 z-10 rounded-xl border border-[#ffaa00]/30 bg-[#ffaa00]/10 px-4 py-3 text-xs text-[#ffaa00]">
            Google Maps API キーが読み込まれていません。{setupHint}
          </div>
        )}

        {loadError && (
          <div className="absolute inset-x-4 top-4 z-10 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            {loadError}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            navigator.geolocation.getCurrentPosition((position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            });
          }}
          className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-[#111118] px-4 py-2 text-xs font-bold"
        >
          現在地
        </button>

        <MapActivitySheet
          activity={selectedActivity}
          open={sheetOpen}
          interested={
            selectedActivity
              ? interestedPostIds.has(selectedActivity.latestPostId)
              : false
          }
          interestLoading={submitting}
          onClose={() => setSheetOpen(false)}
          onInterest={() => void handleInterest()}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-20 z-10 flex justify-center md:bottom-4">
          <GoogleAttribution />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
