export type PlaceSummary = {
  googlePlaceId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  types: string[];
  openHoursText: string | null;
  photoUrl: string | null;
  shopId: string | null;
};

export type CachedShopRow = {
  id: string;
  google_place_id: string;
  name: string;
  address: string;
  genre: string[] | null;
  open_hours: string | null;
  cover_image: string | null;
  latitude: number | null;
  longitude: number | null;
  cached_at: string | null;
};
