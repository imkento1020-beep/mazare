export type ShopLocation = {
  shopId: string;
  name: string;
  address: string;
  live: boolean;
  lat: number;
  lng: number;
};

export async function geocodeShopAddresses(
  geocoder: google.maps.Geocoder,
  shops: Array<{
    id: string;
    name: string;
    address: string;
    live: boolean;
  }>,
): Promise<ShopLocation[]> {
  const results = await Promise.all(
    shops.map(async (shop) => {
      try {
        const response = await geocoder.geocode({
          address: shop.address,
          region: "jp",
        });

        const location = response.results[0]?.geometry.location;
        if (!location) return null;

        return {
          shopId: shop.id,
          name: shop.name,
          address: shop.address,
          live: shop.live,
          lat: location.lat(),
          lng: location.lng(),
        };
      } catch {
        return null;
      }
    }),
  );

  return results.filter((item): item is ShopLocation => item !== null);
}

export function fitMapToLocations(
  map: google.maps.Map,
  locations: ShopLocation[],
) {
  if (locations.length === 0) return;

  if (locations.length === 1) {
    map.setCenter({ lat: locations[0].lat, lng: locations[0].lng });
    map.setZoom(SELECTED_SHOP_ZOOM);
    return;
  }

  const bounds = new google.maps.LatLngBounds();
  for (const location of locations) {
    bounds.extend({ lat: location.lat, lng: location.lng });
  }
  map.fitBounds(bounds, 64);
}

export const SELECTED_SHOP_ZOOM = 16;

/** 選択した店舗の位置へパンしてクローズアップ */
export function focusMapOnShop(
  map: google.maps.Map,
  location: Pick<ShopLocation, "lat" | "lng">,
  zoom = SELECTED_SHOP_ZOOM,
) {
  map.panTo({ lat: location.lat, lng: location.lng });
  map.setZoom(zoom);
}
