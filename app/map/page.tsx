"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchAllShops, fetchLiveShopIds } from "@/lib/home/api";
import { addressToPin, type MapPin } from "@/lib/map/areas";
import { formatGenre, type Shop } from "@/lib/home/types";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function MapPage() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [liveIds, setLiveIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const [shopsResult, liveShopIds] = await Promise.all([
        fetchAllShops(),
        fetchLiveShopIds(),
      ]);

      setShops(shopsResult.data ?? []);
      setLiveIds(liveShopIds);
      if (shopsResult.data?.[0]) {
        setSelectedId(shopsResult.data[0].id);
      }
      setLoading(false);
    }

    load();
  }, [router]);

  const pins = useMemo<MapPin[]>(
    () =>
      shops.map((shop) =>
        addressToPin(shop.id, shop.name, shop.address, liveIds.has(shop.id)),
      ),
    [shops, liveIds],
  );

  const selectedShop = shops.find((shop) => shop.id === selectedId) ?? null;
  const liveShops = shops.filter((shop) => liveIds.has(shop.id));

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

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 40%, rgba(255,61,0,0.08) 0%, transparent 45%), radial-gradient(circle at 70% 60%, rgba(120,60,200,0.08) 0%, transparent 40%), linear-gradient(180deg, #0d0d18 0%, #080810 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {pins.map((pin) => (
          <button
            key={pin.shopId}
            type="button"
            onClick={() => setSelectedId(pin.shopId)}
            className="absolute -translate-x-1/2 -translate-y-full transition-transform hover:scale-110"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            aria-label={pin.name}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs shadow-lg ${
                pin.live
                  ? "border-[#ff3d00] bg-[#ff3d00] text-white"
                  : "border-[#5a5668] bg-[#18181f] text-[#9994a8]"
              } ${selectedId === pin.shopId ? "scale-125 ring-2 ring-white/30" : ""}`}
            >
              📍
            </span>
          </button>
        ))}

        {selectedShop && (
          <div className="absolute bottom-[220px] left-1/2 w-[280px] -translate-x-1/2 rounded-[14px] border border-white/7 bg-[#111118] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] md:bottom-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold">{selectedShop.name}</p>
                <p className="mt-1 text-xs text-[#9994a8]">
                  {formatGenre(selectedShop.genre)}
                </p>
              </div>
              {liveIds.has(selectedShop.id) && (
                <span className="rounded-full bg-[#ff3d00]/10 px-2 py-0.5 text-[10px] font-bold text-[#ff3d00]">
                  LIVE
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-[#5a5668]">{selectedShop.address}</p>
            <Link
              href={`/shop/${selectedShop.id}`}
              className="mt-3 inline-block text-xs font-bold text-[#ff3d00]"
            >
              詳細を見る →
            </Link>
          </div>
        )}

        <button
          type="button"
          className="absolute bottom-[220px] right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#111118] text-lg shadow-lg md:bottom-6"
          aria-label="現在地"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(() => {});
            }
          }}
        >
          📍
        </button>
      </div>

      <div className="h-[200px] shrink-0 border-t border-white/7 bg-[#080810] pb-[84px] md:pb-0">
        <p className="px-4 pt-3 text-xs font-bold uppercase tracking-[0.15em] text-[#5a5668]">
          今夜発信中
        </p>
        <div className="flex gap-3 overflow-x-auto px-4 pb-6 pt-2">
          {(liveShops.length > 0 ? liveShops : shops).map((shop) => (
            <button
              key={shop.id}
              type="button"
              onClick={() => setSelectedId(shop.id)}
              className={`w-[200px] shrink-0 rounded-[14px] border bg-[#111118] p-3 text-left transition ${
                selectedId === shop.id
                  ? "border-[#ff3d00]/40"
                  : "border-white/7"
              }`}
            >
              <p className="line-clamp-1 text-sm font-bold">{shop.name}</p>
              <p className="mt-1 text-[10px] text-[#5a5668]">
                {shop.address.split(/[都道府県市区]/).slice(0, 2).join("") ||
                  shop.address}
              </p>
              {liveIds.has(shop.id) && (
                <span className="mt-2 inline-block rounded-full bg-[#ff3d00]/10 px-2 py-0.5 text-[9px] font-bold text-[#ff3d00]">
                  発信中
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
