export function getGooglePlacesApiKey() {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.GOOGLE_PLACES_API_KEY?.trim() ||
    ""
  );
}

export const PLACES_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.regularOpeningHours",
  "places.types",
  "places.photos",
].join(",");
