"use client";

import type { PlaceSummary } from "@/lib/places/types";
import GeolocationPermissionHelp from "@/components/geo/GeolocationPermissionHelp";
import { FeedPinIcon } from "@/components/icons/FeedActionIcons";

type PostStepShopProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: (event: React.FormEvent) => void;
  onLoadNearby: () => void;
  loadingPlaces: boolean;
  mapsKeyReady: boolean;
  locationDenied: boolean;
  places: PlaceSummary[];
  selectedShopId: string | null;
  onSelectShop: (shopId: string) => void;
  checkinShop: { shopId: string; name: string } | null;
  onUseCheckinShop: () => void;
};

export default function PostStepShop({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  onLoadNearby,
  loadingPlaces,
  mapsKeyReady,
  locationDenied,
  places,
  selectedShopId,
  onSelectShop,
  checkinShop,
  onUseCheckinShop,
}: PostStepShopProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black">どこのお店？</h2>
        <p className="mt-1 text-xs text-[#9994a8]">
          今夜シェアするお店を選んでください
        </p>
      </div>

      {checkinShop && checkinShop.shopId !== selectedShopId ? (
        <button
          type="button"
          onClick={onUseCheckinShop}
          className="w-full rounded-[12px] border border-[#00e87a]/35 bg-[#00e87a]/10 px-4 py-3 text-left text-sm font-bold text-[#00e87a]"
        >
          チェックイン中: {checkinShop.name}
          <span className="mt-0.5 block text-xs font-semibold text-[#9994a8]">
            タップしてこの店で続ける
          </span>
        </button>
      ) : null}

      <form onSubmit={onSearchSubmit} className="flex gap-2">
        <input
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="お店名・エリアで検索"
          className="flex-1 rounded-[12px] border border-white/10 bg-[#111118] px-4 py-3 text-sm outline-none focus:border-[#ff3d00]/40"
        />
        <button
          type="submit"
          className="rounded-[12px] bg-[#111118] px-4 text-sm font-bold text-[#ff3d00]"
        >
          検索
        </button>
      </form>

      <button
        type="button"
        disabled={loadingPlaces || !mapsKeyReady}
        onClick={onLoadNearby}
        className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#ff3d00]/35 bg-[#ff3d00]/10 py-3.5 text-sm font-bold text-[#eeeaf4] transition hover:bg-[#ff3d00]/15 disabled:opacity-50"
      >
        <FeedPinIcon size={16} color="currentColor" />
        現在地から近くのお店
      </button>

      {locationDenied ? <GeolocationPermissionHelp className="mt-1" /> : null}

      <div className="space-y-2">
        {loadingPlaces ? (
          <p className="text-xs text-[#9994a8]">お店を読み込み中…</p>
        ) : null}
        {places.map((place) => {
          const active = place.shopId === selectedShopId;
          return (
            <button
              key={place.googlePlaceId}
              type="button"
              disabled={!place.shopId}
              onClick={() => place.shopId && onSelectShop(place.shopId)}
              className={`w-full rounded-[12px] border p-4 text-left transition ${
                active
                  ? "border-[#ff3d00]/50 bg-[#ff3d00]/10"
                  : "border-white/10 bg-[#111118]"
              }`}
            >
              <p className="font-bold">{place.name}</p>
              <p className="mt-1 text-xs text-[#9994a8]">{place.address}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
