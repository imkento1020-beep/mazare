"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MapActivityGoogleMapView from "@/components/map/MapActivityGoogleMapView";
import MapActivitySheet from "@/components/map/MapActivitySheet";
import MapActivityWindowFilter from "@/components/map/MapActivityWindowFilter";
import MapActivityMetricFilter from "@/components/map/MapActivityMetricFilter";
import GoogleAttribution from "@/components/places/GoogleAttribution";
import { useGoogleMapsApiKey } from "@/lib/map/useGoogleMapsApiKey";
import {
  buildMapShopActivity,
  buildMapShopActivityFromCheckins,
  fetchRecentVibePosts,
} from "@/lib/feed/recentFeed";
import { fetchShopsFromDb } from "@/lib/home/shops";
import type { Shop, VibePost } from "@/lib/home/types";
import { fetchActiveCheckinCountsByShop } from "@/lib/checkins/api";
import {
  type MapActivityMetricId,
  mapActivityMetricLabel,
} from "@/lib/map/mapActivityMetric";
import {
  DEFAULT_MAP_ACTIVITY_WINDOW_ID,
  mapActivityWindowLabel,
  mapActivityWindowMs,
  type MapActivityWindowId,
} from "@/lib/map/mapActivityWindow";
import { notifyPostInterestCreated } from "@/lib/notifications/api";
import type { User } from "@supabase/supabase-js";
import { useUserLocation } from "@/hooks/useUserLocation";
import { getDevicePositionOnUserGesture } from "@/lib/geo/getDevicePosition";
import { getPostCardLocationLabel } from "@/lib/geo/postCardLocation";
import {
  mergeShopNearestStations,
  useEnrichShopNearestStations,
} from "@/hooks/useEnrichShopNearestStations";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { isRegisteredUser } from "@/lib/auth/anonymous";

type MapPageClientProps = {
  setupHint: string;
};

export default function MapPageClient({ setupHint }: MapPageClientProps) {
  const { openAuthPrompt } = useAuthPrompt();
  const [posts, setPosts] = useState<VibePost[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [checkinCounts, setCheckinCounts] = useState<Map<string, number>>(
    new Map(),
  );
  const [activityMetric, setActivityMetric] =
    useState<MapActivityMetricId>("posts");
  const [activityWindowId, setActivityWindowId] =
    useState<MapActivityWindowId>(DEFAULT_MAP_ACTIVITY_WINDOW_ID);
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
    useGoogleMapsApiKey();
  const { location: deviceLocation } = useUserLocation();

  const windowMs = mapActivityWindowMs(activityWindowId);
  const windowLabel = mapActivityWindowLabel(activityWindowId);

  const activities = useMemo(() => {
    if (activityMetric === "checkins") {
      return buildMapShopActivityFromCheckins(shops, checkinCounts);
    }
    return buildMapShopActivity(posts, windowMs);
  }, [activityMetric, shops, checkinCounts, posts, windowMs]);

  const reload = useCallback(async () => {
    const [postsResult, shopsResult, checkinMap] = await Promise.all([
      fetchRecentVibePosts(),
      fetchShopsFromDb(),
      fetchActiveCheckinCountsByShop(),
    ]);
    if (postsResult.error) setLoadError(postsResult.error);
    if (shopsResult.error) setLoadError(shopsResult.error);
    setPosts(postsResult.data);
    setShops(shopsResult.data ?? []);
    setCheckinCounts(checkinMap);
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

  useEffect(() => {
    if (!deviceLocation) return;
    setUserLocation({
      lat: deviceLocation.latitude,
      lng: deviceLocation.longitude,
    });
  }, [deviceLocation]);

  useEffect(() => {
    if (!selectedId) return;
    if (!activities.some((a) => a.shopId === selectedId)) {
      setSelectedId(null);
      setSheetOpen(false);
    }
  }, [activities, selectedId]);

  const mapShops = useMemo(
    () =>
      activities.map((item) => ({
        id: item.shopId,
        name: item.shop.name,
        address: item.shop.address,
        latitude: item.shop.latitude,
        longitude: item.shop.longitude,
        postCount: item.postCount,
      })),
    [activities],
  );

  const selectedActivity =
    activities.find((item) => item.shopId === selectedId) ?? null;

  const mapShopsForEnrichment = useMemo(
    () => activities.map((item) => item.shop),
    [activities],
  );
  const stationMap = useEnrichShopNearestStations(mapShopsForEnrichment);

  const selectedLocationLabel = useMemo(() => {
    if (!selectedActivity) return null;
    const shop = mergeShopNearestStations(
      selectedActivity.shop,
      stationMap,
    );
    return getPostCardLocationLabel(
      userLocation
        ? { latitude: userLocation.lat, longitude: userLocation.lng }
        : null,
      shop,
    );
  }, [selectedActivity, stationMap, userLocation]);

  async function handleInterest() {
    if (!selectedActivity?.latestPostId) return;
    if (!isRegisteredUser(user)) {
      openAuthPrompt({
        title: "ログインして「今夜行くかも」",
        description: "地図からお店に「今夜行くかも」を送るにはログインが必要です。",
        returnPath: "/map",
      });
      return;
    }

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
          metricLabel={mapActivityMetricLabel(activityMetric)}
          onSelectShop={(shopId) => {
            setSelectedId(shopId);
            setSheetOpen(true);
          }}
        />

        <div className="absolute inset-x-4 top-4 z-10 flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1 space-y-2">
            <MapActivityMetricFilter
              value={activityMetric}
              onChange={setActivityMetric}
            />
            {activityMetric === "posts" ? (
              <MapActivityWindowFilter
                value={activityWindowId}
                onChange={setActivityWindowId}
              />
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              void getDevicePositionOnUserGesture()
                .then((coords) => {
                  setUserLocation({
                    lat: coords.latitude,
                    lng: coords.longitude,
                  });
                })
                .catch(() => {
                  // 許可ダイアログまたは設定変更が必要
                });
            }}
            className="shrink-0 rounded-full border border-white/10 bg-[#111118] px-4 py-2 text-xs font-bold shadow-lg"
          >
            現在地
          </button>
        </div>

        {!mapsKeyLoading && !resolvedMapsApiKey && (
          <div className="pointer-events-none absolute inset-x-4 top-28 z-10 rounded-xl border border-[#ffaa00]/30 bg-[#ffaa00]/10 px-4 py-3 text-xs text-[#ffaa00]">
            Google Maps API キーが読み込まれていません。{setupHint}
          </div>
        )}

        {loadError && (
          <div className="absolute inset-x-4 top-28 z-10 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            {loadError}
          </div>
        )}

        <MapActivitySheet
          activity={selectedActivity}
          windowLabel={windowLabel}
          metric={activityMetric}
          locationLabel={selectedLocationLabel}
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
