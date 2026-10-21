export {
  getGooglePlacesApiKey,
  getGooglePlacesSetupHint,
} from "@/lib/google/apiKey";

/** 検索・一覧用（Place Photos を含めない） */
export const PLACES_SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.regularOpeningHours",
  "places.types",
].join(",");

/** @deprecated 検索では PLACES_SEARCH_FIELD_MASK を使用 */
export const PLACES_FIELD_MASK = PLACES_SEARCH_FIELD_MASK;

export const PLACES_DETAIL_BASE_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "regularOpeningHours",
  "types",
].join(",");

export const PLACES_DETAIL_FIELD_MASK = `${PLACES_DETAIL_BASE_FIELD_MASK},photos`;
