export {
  getGooglePlacesApiKey,
  getGooglePlacesSetupHint,
} from "@/lib/google/apiKey";

export const PLACES_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.regularOpeningHours",
  "places.types",
  "places.photos",
].join(",");
